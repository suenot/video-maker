import pytest

from scripts.build_variant_narration import build_timeline, caption_chunks, render_srt


def test_build_timeline_is_contiguous_and_matches_encoded_audio():
    timeline = build_timeline([2.0, 3.0, 5.0], total_duration=10.2)

    assert timeline[0]["start"] == 0.0
    assert timeline[-1]["end"] == 10.2
    assert all(left["end"] == right["start"] for left, right in zip(timeline, timeline[1:]))


def test_caption_chunks_preserve_exact_russian_copy():
    text = "Сначала работает локальный путь, затем включается запасной сервис. Расходы видны заранее."
    chunks = caption_chunks(text, max_words=7)

    assert " ".join(chunks) == text
    assert all(len(chunk.split()) <= 7 for chunk in chunks)


def test_render_srt_offsets_later_scenes_and_keeps_punctuation():
    scenes = [
        {"narration": "Первая сцена закончилась."},
        {"narration": "Вторая сцена началась."},
    ]
    timings = [
        {
            "duration": 2.0,
            "words": [
                {"word": "Первая", "start": 0.1, "end": 0.5},
                {"word": "сцена", "start": 0.6, "end": 1.0},
                {"word": "закончилась", "start": 1.1, "end": 1.8},
            ],
        },
        {
            "duration": 2.0,
            "words": [
                {"word": "Вторая", "start": 0.1, "end": 0.5},
                {"word": "сцена", "start": 0.6, "end": 1.0},
                {"word": "началась", "start": 1.1, "end": 1.8},
            ],
        },
    ]
    timeline = [
        {"slide": 0, "start": 0.0, "end": 2.0},
        {"slide": 1, "start": 2.0, "end": 4.0},
    ]

    srt = render_srt(scenes, timings, timeline)

    assert "Первая сцена закончилась." in srt
    assert "Вторая сцена началась." in srt
    assert "00:00:02,100" in srt


@pytest.mark.parametrize("durations", [[], [1.0, 0.0], [-1.0]])
def test_build_timeline_rejects_invalid_durations(durations):
    with pytest.raises(ValueError):
        build_timeline(durations)
