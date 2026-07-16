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

import pytest

from selfmade import anim, schema

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
    scene = {"id": "t", "title": "T", "visual": "bullets", "narration": "x", "data_refs": {}}
    with pytest.raises(KeyError):
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
