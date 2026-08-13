import struct
import wave

import pytest
from PIL import Image

from scripts.append_endcard import (
    H,
    LEFT_VIDEO_ZONE,
    RIGHT_VIDEO_ZONE,
    SHORT_H,
    SHORT_W,
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


def test_validate_card_accepts_native_desktop_and_short_sizes(tmp_path):
    desktop = tmp_path / "desktop.png"
    short = tmp_path / "short.png"
    bad = tmp_path / "bad.png"
    Image.new("RGB", (W, H)).save(desktop)
    Image.new("RGB", (SHORT_W, SHORT_H)).save(short)
    Image.new("RGB", (1280, 720)).save(bad)

    assert validate_card(desktop) == (W, H)
    assert validate_card(short) == (SHORT_W, SHORT_H)
    with pytest.raises(ValueError, match="1080x1920.*1920x1080"):
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
