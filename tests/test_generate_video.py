from pathlib import Path

import pytest

from scripts.generate_video import _build_segments


def write_slide(slides_dir: Path, index: int) -> None:
    (slides_dir / f"slide_{index:03d}.png").write_bytes(b"png")


def test_cover_replaces_timeline_start_without_extending_runtime(tmp_path):
    slides = tmp_path / "slides"
    slides.mkdir()
    write_slide(slides, 1)
    write_slide(slides, 2)
    cover = tmp_path / "cover.png"
    cover.write_bytes(b"png")
    timeline = [
        {"slide": 0, "start": 0.0, "end": 10.0},
        {"slide": 1, "start": 10.0, "end": 20.0},
    ]

    segments = _build_segments(timeline, str(slides), str(cover), 3.5)

    assert [round(duration, 2) for _, duration in segments] == [3.5, 6.5, 10.0]
    assert sum(duration for _, duration in segments) == pytest.approx(20.0)


def test_cover_may_replace_whole_early_slide(tmp_path):
    slides = tmp_path / "slides"
    slides.mkdir()
    write_slide(slides, 1)
    write_slide(slides, 2)
    cover = tmp_path / "cover.png"
    cover.write_bytes(b"png")
    timeline = [
        {"slide": 0, "start": 0.0, "end": 2.0},
        {"slide": 1, "start": 2.0, "end": 8.0},
    ]

    segments = _build_segments(timeline, str(slides), str(cover), 3.0)

    assert [round(duration, 2) for _, duration in segments] == [3.0, 5.0]
    assert segments[-1][0].endswith("slide_002.png")


@pytest.mark.parametrize("duration", [-1.0, 0.0])
def test_cover_duration_must_be_positive(tmp_path, duration):
    slides = tmp_path / "slides"
    slides.mkdir()
    write_slide(slides, 1)
    cover = tmp_path / "cover.png"
    cover.write_bytes(b"png")

    with pytest.raises(ValueError):
        _build_segments(
            [{"slide": 0, "start": 0.0, "end": 2.0}],
            str(slides), str(cover), duration,
        )
