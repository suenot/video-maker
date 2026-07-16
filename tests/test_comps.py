import re

from selfmade import comps

SCENE = {"id": "07_marginal", "title": "Marginal coverage holds",
         "visual": "coverage_bars", "narration": "x", "data_refs": {}}


def test_comp_contains_required_nodes():
    text = comps.build_comp(SCENE, "/tmp/anim/07_marginal", n_frames=120, timings=None)
    for node in ("Loader1", "Bg", "Title", "Mrg1", "Mrg2", "MediaOut1"):
        assert f"{node} = " in text or f"{node} =" in text


def test_comp_points_loader_at_the_sequence():
    text = comps.build_comp(SCENE, "/tmp/anim/07_marginal", n_frames=120, timings=None)
    assert "/tmp/anim/07_marginal/frame_00000.png" in text


def test_comp_declares_the_scene_length():
    text = comps.build_comp(SCENE, "/tmp/anim/x", n_frames=137, timings=None)
    assert "RenderRangeEnd = 136" in text


def test_title_fade_keyframes_are_present():
    text = comps.build_comp(SCENE, "/tmp/anim/x", n_frames=120, timings=None)
    assert "BezierSpline" in text
    assert "[0] = { 0" in text


def test_write_comp_creates_file(tmp_path):
    p = comps.write_comp(SCENE, "/tmp/anim/x", 120, None, tmp_path / "s.comp")
    # Ground truth (resolve_export.comp, exported from Resolve today) wraps the
    # whole file in `Composition { ... }`, not a bare `{ ... }` — the brief's
    # assumed top-level shape was wrong along with the MediaOut/Saver bug, so
    # this assertion is adapted to match the verified export format.
    assert p.exists() and p.read_text().startswith("Composition {")


def test_output_node_is_a_saver_not_a_mediaout():
    """The brief's template used `MediaOut1 = MediaOut { ... }`, which is not
    how Fusion actually serializes the output node. A real export (verified
    against Resolve today) shows `MediaOut1 = Saver { ... }`. Generating
    `MediaOut` would silently fail to import."""
    text = comps.build_comp(SCENE, "/tmp/anim/x", n_frames=120, timings=None)
    assert "MediaOut1 = Saver {" in text
    assert "MediaOut1 = MediaOut {" not in text


def test_comp_is_balanced_and_nodes_are_top_level_tools():
    """A substring check like `"Loader1 = " in text` passes on malformed
    output (e.g. truncated files, or a name appearing only in a comment or an
    unrelated string). This test additionally verifies every brace closes,
    and that each required node name is declared as a top-level key inside
    the `Tools = { ... }` table specifically."""
    text = comps.build_comp(SCENE, "/tmp/anim/07_marginal", n_frames=120, timings=None)

    assert text.count("{") == text.count("}")

    tools_start = text.index("Tools = {")
    # Walk from the opening brace of the Tools table to find its matching close.
    depth = 0
    i = text.index("{", tools_start)
    start = i
    for j in range(i, len(text)):
        if text[j] == "{":
            depth += 1
        elif text[j] == "}":
            depth -= 1
            if depth == 0:
                end = j
                break
    else:
        raise AssertionError("Tools table never closes")

    tools_body = text[start:end]
    for node in ("Loader1", "Bg", "Mrg1", "Title", "TitleFade", "Mrg2", "MediaOut1"):
        assert re.search(rf"^\s*{node} = \w+ {{", tools_body, re.MULTILINE), (
            f"{node} is not declared as a top-level key under Tools"
        )
