import json
from pathlib import Path

import pytest
from PIL import Image

from scripts.build_visual_variants import HEIGHT, PALETTES, WIDTH, build


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "storyboards/last30days-research-agent/variant-manifest.json"


def test_manifest_covers_audio_without_gaps():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    scenes = manifest["scenes"]

    assert scenes[0]["start"] == 0.0
    assert scenes[-1]["end"] == manifest["runtime"]
    assert all(left["end"] == right["start"] for left, right in zip(scenes, scenes[1:]))
    assert 2.5 <= manifest["cover_duration"] <= scenes[0]["end"]


@pytest.mark.parametrize("style, slide_count", [("midnight", 5), ("threeblue", 6)])
def test_builder_emits_exact_1080p_assets(tmp_path, style, slide_count):
    build(MANIFEST, tmp_path / "build", tmp_path / "previews", [style])
    out = tmp_path / f"build/{style}"

    with Image.open(out / "cover.png") as cover:
        assert cover.size == (WIDTH, HEIGHT)
    for slide in sorted((out / "slides").glob("*.png")):
        with Image.open(slide) as image:
            assert image.size == (WIDTH, HEIGHT)
    assert len(list((out / "slides").glob("*.png"))) == slide_count
    assert (tmp_path / f"previews/{style}-sheet.jpg").exists()
    if style == "threeblue":
        with Image.open(out / "endcard.png") as endcard:
            assert endcard.size == (WIDTH, HEIGHT)


def test_threeblue_manifest_is_current_russian_copy():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    spec = manifest["styles"]["threeblue"]
    copy = json.dumps(spec, ensure_ascii=False)

    assert spec["lang"] == "ru"
    assert spec["voice"].startswith("ru-RU-")
    assert len(spec["scenes"]) == 6
    assert all(scene["narration"].strip() for scene in spec["scenes"])
    assert "57 597" in copy
    assert "кросс-источниковая кластеризация есть" in copy
    assert "ё" not in copy
    assert set(manifest["styles"]) == set(PALETTES)
