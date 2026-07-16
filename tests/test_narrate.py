import pytest

from selfmade import narrate

pytestmark = pytest.mark.network  # edge-tts calls Microsoft's endpoint


def test_synthesize_writes_audio_and_returns_word_timings(tmp_path):
    out = tmp_path / "t.mp3"
    words = narrate.synthesize("Coverage is ninety percent.", "en-US-AndrewNeural", out)

    assert out.exists() and out.stat().st_size > 1000
    assert [w["word"] for w in words][:2] == ["Coverage", "is"]
    assert words[0]["start"] < words[-1]["start"]
    assert all(w["end"] > w["start"] for w in words)


def test_probe_duration_matches_audio(tmp_path):
    out = tmp_path / "t.mp3"
    narrate.synthesize("One two three four five.", "en-US-AndrewNeural", out)
    d = narrate.probe_duration(out)
    assert 1.0 < d < 6.0
