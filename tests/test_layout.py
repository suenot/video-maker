import json
import xml.dom.minidom as minidom
from pathlib import Path
from urllib.parse import urlparse

from selfmade import layout

SCRIPT = {"slug": "s", "lang": "en", "voice": "v", "scenes": [
    {"id": "01_a", "title": "A", "visual": "title_card", "narration": "a", "data_refs": {}},
    {"id": "02_b", "title": "B", "visual": "title_card", "narration": "b", "data_refs": {}},
]}
TIMINGS = {"01_a": {"duration": 2.0, "words": []}, "02_b": {"duration": 3.0, "words": []}}

REPO_ROOT = Path(__file__).resolve().parent.parent
REAL_TIMINGS_PATH = REPO_ROOT / "build" / "audio" / "timings.json"
REAL_SCRIPT_PATH = REPO_ROOT / "content" / "conformal-prediction-trading.en.json"


def test_scenes_are_laid_end_to_end_with_exact_frames(tmp_path):
    out = tmp_path / "t.fcpxml"
    info = layout.build_fcpxml(SCRIPT, TIMINGS, "/tmp/anim", "/tmp/audio", out, fps=30)
    assert info["scenes"][0] == {"id": "01_a", "offset": 0, "frames": 60}
    assert info["scenes"][1] == {"id": "02_b", "offset": 60, "frames": 90}
    assert info["total_frames"] == 150


def test_fcpxml_parses_and_has_one_video_per_scene(tmp_path):
    out = tmp_path / "t.fcpxml"
    layout.build_fcpxml(SCRIPT, TIMINGS, "/tmp/anim", "/tmp/audio", out, fps=30)
    doc = minidom.parse(str(out))
    assert len(doc.getElementsByTagName("video")) == 2
    assert len(doc.getElementsByTagName("audio")) == 2


def test_durations_reach_the_xml(tmp_path):
    out = tmp_path / "t.fcpxml"
    layout.build_fcpxml(SCRIPT, TIMINGS, "/tmp/anim", "/tmp/audio", out, fps=30)
    doc = minidom.parse(str(out))
    vids = doc.getElementsByTagName("video")
    assert vids[0].getAttribute("duration") == "60/30s"
    assert vids[1].getAttribute("offset") == "60/30s"


def test_no_drift_gap_or_overlap_against_real_timings(tmp_path):
    """Total frames must equal the sum of per-scene frames, and each scene's
    offset must equal the sum of all previous frames."""
    assert REAL_TIMINGS_PATH.exists(), f"missing fixture: {REAL_TIMINGS_PATH}"
    assert REAL_SCRIPT_PATH.exists(), f"missing fixture: {REAL_SCRIPT_PATH}"

    script = json.loads(REAL_SCRIPT_PATH.read_text())
    timings = json.loads(REAL_TIMINGS_PATH.read_text())

    out = tmp_path / "real.fcpxml"
    info = layout.build_fcpxml(script, timings, "/tmp/anim", "/tmp/audio", out, fps=30)

    fps = 30
    expected_frames = [round(timings[s["id"]]["duration"] * fps) for s in script["scenes"]]
    assert [sc["frames"] for sc in info["scenes"]] == expected_frames
    assert info["total_frames"] == sum(expected_frames)

    running = 0
    for sc, frames in zip(info["scenes"], expected_frames):
        assert sc["offset"] == running
        running += frames
    assert running == info["total_frames"]


def test_xml_parses_and_every_src_is_a_wellformed_file_url(tmp_path):
    out = tmp_path / "t.fcpxml"
    layout.build_fcpxml(SCRIPT, TIMINGS, "/tmp/anim", "/tmp/audio", out, fps=30)

    doc = minidom.parse(str(out))
    assets = doc.getElementsByTagName("asset")
    assert len(assets) == 4  # 2 scenes * (still + audio)

    for asset in assets:
        src = asset.getAttribute("src")
        assert src, "asset missing src"
        parsed = urlparse(src)
        assert parsed.scheme == "file", f"not a file:// URL: {src}"
        assert parsed.path, f"file:// URL has no path: {src}"
        assert " " not in src, f"unescaped space in URL: {src}"


def test_paths_with_spaces_and_unicode_produce_wellformed_urls(tmp_path):
    """A silently malformed URL shows up as 'offline media' in Resolve --
    make sure spaces and unicode in the anim/audio roots are percent-encoded,
    not just paths without spaces (which happen to work today)."""
    anim_root = tmp_path / "anim dir with spaces" / "é中文"
    audio_root = tmp_path / "audio root" / "é中文"
    out = tmp_path / "weird.fcpxml"

    layout.build_fcpxml(SCRIPT, TIMINGS, str(anim_root), str(audio_root), out, fps=30)

    doc = minidom.parse(str(out))
    for asset in doc.getElementsByTagName("asset"):
        src = asset.getAttribute("src")
        parsed = urlparse(src)
        assert parsed.scheme == "file"
        assert " " not in src
        # round-trip: the unquoted path must land back on the real filesystem path
        from urllib.parse import unquote
        assert "anim dir with spaces" in unquote(parsed.path) or "audio root" in unquote(parsed.path)
