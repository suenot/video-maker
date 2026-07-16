"""Tests for the scene animations.

The load-bearing test here is `test_every_ref_changes_the_rendered_frame`: it renders
a real scene twice, mutating one data_ref between renders, and asserts the PNG bytes
differ. A renderer that ignores, skips, or hardcodes a value fails it. Checking only
`scene_values` (as the brief did) would not catch a renderer that resolves a ref and
then silently drops it on the floor.
"""

import copy
import json
from pathlib import Path

import matplotlib
import pytest

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402

from selfmade import anim, palette, schema  # noqa: E402

RESULTS_PATH = Path(
    "/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json"
)
SCRIPT_PATH = Path(__file__).resolve().parents[1] / "content" / "conformal-prediction-trading.en.json"

RESULTS = json.loads(RESULTS_PATH.read_text())
SCRIPT = schema.load_script(SCRIPT_PATH)
SCENES = {s["id"]: s for s in SCRIPT["scenes"]}

# Every scene that carries data. These are the ones whose refs must reach the canvas.
SCENES_WITH_REFS = [s for s in SCRIPT["scenes"] if s["data_refs"]]


# --- the brief's four ----------------------------------------------------------------


def test_frame_count_matches_duration_exactly(tmp_path):
    scene = {"id": "t", "title": "T", "visual": "coverage_bars",
             "narration": "x", "data_refs": {
                 "iid": "marginal_coverage.iid.split_abs.coverage",
                 "garch": "marginal_coverage.garch.split_abs.coverage"}}
    n = anim.render_scene(scene, RESULTS, duration=2.0, out_dir=tmp_path, fps=30)
    assert n == 60
    assert len(list(tmp_path.glob("frame_*.png"))) == 60


def test_frames_are_1920x1080(tmp_path):
    from PIL import Image
    scene = {"id": "t", "title": "T", "visual": "title_card",
             "narration": "x", "data_refs": {}}
    anim.render_scene(scene, RESULTS, duration=0.2, out_dir=tmp_path, fps=30)
    with Image.open(sorted(tmp_path.glob("frame_*.png"))[0]) as im:
        assert im.size == (1920, 1080)


def test_values_come_from_results_not_literals(tmp_path):
    scene = {"id": "t", "title": "T", "visual": "coverage_bars",
             "narration": "x", "data_refs": {"iid": "marginal_coverage.iid.split_abs.coverage"}}
    vals = anim.scene_values(scene, RESULTS)
    assert vals["iid"] == RESULTS["marginal_coverage"]["iid"]["split_abs"]["coverage"]


def test_unknown_visual_is_rejected(tmp_path):
    scene = {"id": "t", "title": "T", "visual": "nope", "narration": "x", "data_refs": {}}
    with pytest.raises(ValueError, match="nope"):
        anim.render_scene(scene, RESULTS, duration=0.1, out_dir=tmp_path)


# --- every real scene renders --------------------------------------------------------


@pytest.mark.parametrize("scene_id", list(SCENES))
def test_every_script_scene_renders(scene_id, tmp_path):
    """Every scene in the real script must render without raising."""
    n = anim.render_scene(SCENES[scene_id], RESULTS, duration=1.0, out_dir=tmp_path, fps=1)
    assert n == 1
    assert (tmp_path / "frame_00000.png").exists()


# --- the ref-reaches-the-canvas test -------------------------------------------------


def _set_data_ref(results, ref, value):
    """Write a value at a data_ref path (mirror of schema.resolve_data_ref)."""
    parts = ref.split(".") if isinstance(ref, str) else list(ref)
    node = results
    for part in parts[:-1]:
        node = node[part]
    node[parts[-1]] = value


def _mutate(value):
    """Materially change a value while keeping its type."""
    if isinstance(value, list):
        return [x * 0.9 - 0.03 for x in value]
    return value * 0.9 - 0.03


def _render_bytes(scene, results, tmp_path, tag):
    out = tmp_path / tag
    anim.render_scene(scene, results, duration=1.0, out_dir=out, fps=1)
    return (out / "frame_00000.png").read_bytes()


@pytest.fixture(scope="module")
def baselines(tmp_path_factory):
    """One baseline frame per data-carrying scene, rendered from the real results."""
    root = tmp_path_factory.mktemp("baselines")
    return {
        scene["id"]: _render_bytes(scene, RESULTS, root, scene["id"])
        for scene in SCENES_WITH_REFS
    }


@pytest.mark.parametrize(
    "scene_id,ref_name",
    [(s["id"], name) for s in SCENES_WITH_REFS for name in s["data_refs"]],
)
def test_every_ref_changes_the_rendered_frame(scene_id, ref_name, baselines, tmp_path):
    """Mutating any data_ref must change the rendered PNG.

    If this fails, the renderer resolved the ref and then ignored it -- the number is
    spoken in the narration but never drawn, or worse, drawn from a literal.
    """
    scene = SCENES[scene_id]
    mutated = copy.deepcopy(RESULTS)
    ref = scene["data_refs"][ref_name]
    _set_data_ref(mutated, ref, _mutate(schema.resolve_data_ref(ref, RESULTS)))

    after = _render_bytes(scene, mutated, tmp_path, f"{scene_id}_{ref_name}")
    assert after != baselines[scene_id], (
        f"{scene_id}: ref {ref_name!r} does not affect the rendered frame -- "
        "the renderer is ignoring it"
    )


# --- text must land on the canvas ----------------------------------------------------
#
# `test_every_ref_changes_the_rendered_frame` proves a ref reaches the canvas, but not
# that it reaches the *viewer*: bytes change identically whether a label lands in the
# middle of the chart or 48px past its right edge. The whole suite was green while
# 09_normalize's "nominal 90%" label was drawn at x=2.58 against an xlim of (-0.5, 2.5),
# i.e. absent from every frame. These tests close that hole.

# Scenes that carry data, over which text placement is load-bearing.
LEGIBILITY_SCENES = ["07_marginal", "08_conditional", "09_normalize", "10_break",
                     "11_aci", "12_width", "14_recipe", "15_outro"]

# Sampled across the timeline: text fades in at staggered thresholds, so a single
# frame would miss most of the artists (callouts, notes, panels arrive late).
LEGIBILITY_TIMES = [0.25, 0.5, 0.75, 1.0]


def _render_fig(scene, t):
    """Render one frame of a scene into a live figure (not saved, not closed)."""
    values = anim.scene_values(scene, RESULTS)
    fig, ax = anim._new_fig()
    anim._RENDERERS[scene["visual"]](ax, scene, values, t)
    fig.canvas.draw()
    return fig


def _unpainted_ticklabels(fig):
    """ids of tick labels matplotlib will not paint because their tick is out of view.

    Matplotlib keeps a Text object for every tick the locator proposes, including
    ones outside the axes' view interval, and never draws them -- verified against
    the rendered pixels. Counting them as on-screen text would be a false positive.
    """
    skip = set()
    for ax in fig.findobj(matplotlib.axes.Axes):
        for axis in (ax.xaxis, ax.yaxis):
            lo, hi = sorted(axis.get_view_interval())
            for tick in list(axis.get_major_ticks()) + list(axis.get_minor_ticks()):
                if not (lo - 1e-9) <= tick.get_loc() <= (hi + 1e-9):
                    skip.update((id(tick.label1), id(tick.label2)))
    return skip


def _visible_texts(fig):
    """Every Text artist with a non-empty string that is actually painted."""
    skip = _unpainted_ticklabels(fig)
    out = []
    for artist in fig.findobj(matplotlib.text.Text):
        if not artist.get_visible() or not artist.get_text().strip():
            continue
        if artist.get_alpha() is not None and artist.get_alpha() <= 0.01:
            continue  # faded out entirely; not on screen yet
        if id(artist) in skip:
            continue
        out.append(artist)
    return out


@pytest.mark.parametrize("scene_id", LEGIBILITY_SCENES)
@pytest.mark.parametrize("t", LEGIBILITY_TIMES)
def test_no_text_is_drawn_outside_the_figure(scene_id, t):
    """Every drawn string must lie inside the figure's pixel bbox.

    A label placed past the axes limits is not clipped-but-mostly-readable; it is
    simply not in the frame. The viewer is then told nothing, and the narration
    refers to a thing that is not on screen.
    """
    fig = _render_fig(SCENES[scene_id], t)
    try:
        renderer = fig.canvas.get_renderer()
        page = fig.bbox
        offenders = []
        for artist in _visible_texts(fig):
            bb = artist.get_window_extent(renderer=renderer)
            if (bb.x0 < -0.5 or bb.y0 < -0.5
                    or bb.x1 > page.x1 + 0.5 or bb.y1 > page.y1 + 0.5):
                offenders.append(
                    f"{artist.get_text()!r} at pixel bbox "
                    f"({bb.x0:.0f},{bb.y0:.0f})-({bb.x1:.0f},{bb.y1:.0f}) "
                    f"escapes the figure (0,0)-({page.x1:.0f},{page.y1:.0f})"
                )
        assert not offenders, (
            f"{scene_id} at t={t}: text drawn outside the frame:\n  "
            + "\n  ".join(offenders)
        )
    finally:
        plt.close(fig)


@pytest.mark.parametrize("scene_id", ["07_marginal", "09_normalize"])
def test_the_footnote_never_overlaps_the_bars(scene_id):
    """The note is a caption, not an overlay.

    Placed in axes-fraction coords it landed inside the plot box, striking through
    the bars it was supposed to caption. It belongs below the plot area entirely.
    """
    fig = _render_fig(SCENES[scene_id], 1.0)
    try:
        renderer = fig.canvas.get_renderer()
        ax = fig.axes[0]
        notes = [a for a in _visible_texts(fig)
                 if a.get_text().startswith(("measured against", "CQR spread"))]
        assert notes, f"{scene_id}: expected a footnote to be drawn at t=1.0"
        bars = [p for p in ax.patches if p.get_window_extent(renderer=renderer).height > 1]
        assert bars, f"{scene_id}: expected bars to be drawn"
        for note in notes:
            nb = note.get_window_extent(renderer=renderer)
            for bar in bars:
                bb = bar.get_window_extent(renderer=renderer)
                assert not nb.overlaps(bb), (
                    f"{scene_id}: footnote {note.get_text()!r} overlaps a bar"
                )
    finally:
        plt.close(fig)


# --- the colour of a bar is a claim --------------------------------------------------
#
# _coverage_color's tolerance leaves little slack: 07's `break` (.8775) is MISSED by
# .0025 and 08's `mid` (.9150) is COVERED by .005. If a rerun of the experiments nudges
# a value across the line, the frame silently changes what it asserts about a method.
# Pin the intended colour so that flips a test instead.

EXPECTED_BAR_COLORS = {
    "07_marginal": {"iid": "COVERED", "ar1": "COVERED", "garch": "COVERED",
                    "break": "MISSED", "aci_garch": "COVERED"},
    "08_conditional": {"low": "HIGHLIGHT", "mid": "COVERED", "high": "MISSED"},
    "09_normalize": {"low": "COVERED", "mid": "COVERED", "high": "COVERED"},
}


@pytest.mark.parametrize(
    "scene_id,key,expected",
    [(s, k, v) for s, m in EXPECTED_BAR_COLORS.items() for k, v in m.items()],
)
def test_bar_colour_says_what_it_is_meant_to_say(scene_id, key, expected):
    value = anim.scene_values(SCENES[scene_id], RESULTS)[key]
    assert anim._coverage_color(value) == getattr(palette, expected), (
        f"{scene_id}: {key}={value:.4f} now renders as a different colour than "
        f"{expected} -- the frame's claim about this method changed silently"
    )


# --- the placeholder rule ------------------------------------------------------------


def test_bullet_lines_are_formatted_with_values(tmp_path):
    """A line may carry {placeholders}; they are filled from the scene's refs."""
    scene = {"id": "t", "title": "T", "visual": "bullets",
             "narration": "x", "lines": ["spread {spread:.3f}", "no placeholder here"],
             "data_refs": {"spread": "conditional_coverage_garch.methods.split_abs.vol_cov_spread.mean"}}
    lines = anim.format_lines(scene, anim.scene_values(scene, RESULTS))
    assert lines[0] == "spread 0.134"
    assert lines[1] == "no placeholder here"


def test_script_lines_do_not_hardcode_numbers_that_exist_as_refs():
    """A number that arrives as a ref must not also be typed into a line as text.

    Two sources of truth for one number is how a chart silently drifts from the paper.
    """
    offenders = []
    for scene in SCRIPT["scenes"]:
        if scene.get("source_note"):
            continue  # constants explicitly waived from the data_ref rule
        values = anim.scene_values(scene, RESULTS)
        for line in scene.get("lines", []):
            for name, value in values.items():
                if not isinstance(value, float):
                    continue
                for text in (f"{value:.2f}", f"{value:.3f}"):
                    if text in line:
                        offenders.append(f"{scene['id']}: {name}={text} hardcoded in {line!r}")
    assert not offenders, "\n".join(offenders)


def test_bullets_requires_lines(tmp_path):
    """A malformed scene is a validation failure, like an unknown visual next to it."""
    scene = {"id": "t", "title": "T", "visual": "bullets", "narration": "x", "data_refs": {}}
    with pytest.raises(ValueError, match="bullets"):
        anim.render_scene(scene, RESULTS, duration=0.1, out_dir=tmp_path, fps=1)


# --- the 10_break annotation hazard --------------------------------------------------


def test_hole_depth_is_not_presented_as_the_curve_minimum():
    """hole_depth is a mean of per-experiment minima; the drawn curve bottoms elsewhere.

    Guard the fact that motivates the separate annotation: if these ever coincided, a
    future editor might reasonably label the curve's minimum with the hole depth.
    """
    scene = SCENES["10_break"]
    values = anim.scene_values(scene, RESULTS)
    assert min(values["split_abs"]) != pytest.approx(values["split_abs_hole_depth"], abs=0.05)
    assert min(values["oracle"]) != pytest.approx(values["oracle_hole_depth"], abs=0.02)
