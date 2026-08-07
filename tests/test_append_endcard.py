import struct
import wave

import pytest
from PIL import Image

from scripts.append_endcard import (
    H,
    LEFT_VIDEO_ZONE,
    RIGHT_VIDEO_ZONE,
    W,
    validate_card,
    write_music_bed,
)


def test_end_screen_video_zones_are_two_exact_16_by_9_regions():
    for left, top, right, bottom in (LEFT_VIDEO_ZONE, RIGHT_VIDEO_ZONE):
        assert (right - left, bottom - top) == (640, 360)
        assert 0 <= left < right <= W
        assert 0 <= top < bottom <= H
    assert LEFT_VIDEO_ZONE[2] < RIGHT_VIDEO_ZONE[0]


def test_validate_card_requires_exact_1080p(tmp_path):
    good = tmp_path / "good.png"
    bad = tmp_path / "bad.png"
    Image.new("RGB", (W, H)).save(good)
    Image.new("RGB", (1280, 720)).save(bad)

    validate_card(good)
    with pytest.raises(ValueError, match="1920x1080"):
        validate_card(bad)


def test_generated_music_is_stereo_48k_and_fades_to_zero(tmp_path):
    output = tmp_path / "bed.wav"
    write_music_bed(output, duration=0.2)

    with wave.open(str(output), "rb") as audio:
        assert audio.getframerate() == 48000
        assert audio.getnchannels() == 2
        assert audio.getsampwidth() == 2
        assert audio.getnframes() == 9600
        first = struct.unpack("<hh", audio.readframes(1))
        audio.setpos(audio.getnframes() - 1)
        last = struct.unpack("<hh", audio.readframes(1))
    assert max(map(abs, first)) <= 1
    assert max(map(abs, last)) <= 1
