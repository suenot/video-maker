"""Lay scenes onto a timeline as FCPXML.

Resolve's API cannot give a clip an explicit duration and offers no trim;
FCPXML can. Durations come from the measured narration, so the picture cannot
drift from the voice.

The narration mp3s are edge-tts output at 24000 Hz mono (verified with
ffprobe on build/audio/01_hook.mp3), so audioRate/audioChannels reflect that,
not the 48000/2 defaults used for a real audio track elsewhere in this repo.
"""

import os
from pathlib import Path


def _url(p):
    """Return a well-formed file:// URL for a path, absolute or relative.

    Uses Path.as_uri() (not "file://" + pathname2url(...)): in Python 3.14
    pathname2url changed to prepend an extra "//" to the root of an absolute
    path (intended for use with add_scheme=True), which produces a malformed
    file://///... URL (5 slashes) when manually concatenated with "file://"
    as the older idiom does. as_uri() has been stable across Python versions
    and correctly percent-encodes spaces/unicode, so it does not regress on
    a future interpreter either.
    """
    p = Path(p)
    if not p.is_absolute():
        p = Path(os.path.abspath(str(p)))
    return p.as_uri()


def build_fcpxml(script, timings, anim_root, audio_root, out_path, fps=30):
    assets, spine, scenes = [], [], []
    offset = 0

    for i, scene in enumerate(script["scenes"]):
        sid = scene["id"]
        frames = round(timings[sid]["duration"] * fps)

        still = Path(anim_root) / sid / "frame_00000.png"
        mp3 = Path(audio_root) / f"{sid}.mp3"
        vid, aud = f"v{i + 1}", f"a{i + 1}"

        assets.append(
            f'<asset id="{vid}" name="{sid}" src="{_url(still)}" start="0s" '
            f'duration="0s" hasVideo="1" format="r1"/>'
        )
        assets.append(
            f'<asset id="{aud}" name="{sid}_audio" src="{_url(mp3)}" start="0s" '
            f'duration="{frames}/{fps}s" hasAudio="1" audioSources="1" '
            f'audioChannels="1" audioRate="24000"/>'
        )
        spine.append(
            f'<video ref="{vid}" offset="{offset}/{fps}s" duration="{frames}/{fps}s" start="0s">'
            f'<audio ref="{aud}" lane="-1" offset="{offset}/{fps}s" '
            f'duration="{frames}/{fps}s" start="0s"/>'
            f'</video>'
        )

        scenes.append({"id": sid, "offset": offset, "frames": frames})
        offset += frames

    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
  <resources>
    <format id="r1" name="FFVideoFormat1080p{fps}" frameDuration="1/{fps}s" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>
    {"".join(assets)}
  </resources>
  <library>
    <event name="{script['slug']}">
      <project name="{script['slug']}_{script['lang']}">
        <sequence format="r1" duration="{offset}/{fps}s" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
            {"".join(spine)}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>'''

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(xml)
    return {"total_frames": offset, "scenes": scenes}
