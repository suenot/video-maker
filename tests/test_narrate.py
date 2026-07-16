import pytest

from selfmade import narrate

# The two tests below hit the real edge-tts/Microsoft endpoint and are marked
# individually (not module-wide) so the offline regression test further down
# stays hermetic. The default `pytest` run excludes network tests (see
# pytest.ini's `addopts = -m "not network"`); run them deliberately with
# `./venv/bin/python3 -m pytest -m network -v`.


@pytest.mark.network
def test_synthesize_writes_audio_and_returns_word_timings(tmp_path):
    out = tmp_path / "t.mp3"
    words = narrate.synthesize("Coverage is ninety percent.", "en-US-AndrewNeural", out)

    assert out.exists() and out.stat().st_size > 1000
    assert [w["word"] for w in words][:2] == ["Coverage", "is"]
    assert words[0]["start"] < words[-1]["start"]
    assert all(w["end"] > w["start"] for w in words)


@pytest.mark.network
def test_probe_duration_matches_audio(tmp_path):
    out = tmp_path / "t.mp3"
    narrate.synthesize("One two three four five.", "en-US-AndrewNeural", out)
    d = narrate.probe_duration(out)
    assert 1.0 < d < 6.0


class _AudioOnlyCommunicate:
    """Fakes edge-tts producing audio but zero WordBoundary events - the
    exact failure mode hit in production when boundary defaults to
    'SentenceBoundary'."""

    def __init__(self, text, voice, **kwargs):
        pass

    async def stream(self):
        yield {"type": "audio", "data": b"fake-mp3-bytes"}
        yield {"type": "audio", "data": b"more-fake-bytes"}


def test_synthesize_raises_on_empty_word_boundaries(tmp_path, monkeypatch):
    """Regression test for the bug that shipped silently: a stream with
    audio but no WordBoundary events must raise, not return words=[]."""
    monkeypatch.setattr(narrate.edge_tts, "Communicate", _AudioOnlyCommunicate)

    out = tmp_path / "t.mp3"
    with pytest.raises(RuntimeError, match="WordBoundary"):
        narrate.synthesize("Coverage is ninety percent.", "en-US-AndrewNeural", out, attempts=1)

    # no partial mp3 left behind at the destination
    assert not out.exists()
