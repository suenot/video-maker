import json
from pathlib import Path

from PIL import Image

from scripts.build_visual_variants import HEIGHT, WIDTH, build


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "storyboards/last30days-research-agent/variant-manifest.json"


def test_manifest_covers_audio_without_gaps():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    scenes = manifest["scenes"]

    assert scenes[0]["start"] == 0.0
    assert scenes[-1]["end"] == manifest["runtime"]
    assert all(left["end"] == right["start"] for left, right in zip(scenes, scenes[1:]))
    assert 2.5 <= manifest["cover_duration"] <= scenes[0]["end"]


def test_builder_emits_exact_1080p_assets(tmp_path):
    build(MANIFEST, tmp_path / "build", tmp_path / "previews", ["midnight"])
    out = tmp_path / "build/midnight"

    with Image.open(out / "cover.png") as cover:
        assert cover.size == (WIDTH, HEIGHT)
    for slide in sorted((out / "slides").glob("*.png")):
        with Image.open(slide) as image:
            assert image.size == (WIDTH, HEIGHT)
    assert len(list((out / "slides").glob("*.png"))) == 5
    assert (tmp_path / "previews/midnight-sheet.jpg").exists()
