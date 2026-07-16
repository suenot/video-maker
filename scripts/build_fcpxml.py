#!/usr/bin/env python3
"""Build an FCPXML timeline (slides + narration) for import into DaVinci Resolve.

Why FCPXML instead of the Resolve scripting API: AppendToTimeline always gives a
still the "Standard still duration" from user preferences and ignores the
requested source range, and the API exposes no razor/trim primitive. FCPXML is
the only path that carries an exact per-slide duration into Resolve.

Usage:
    python3 scripts/build_fcpxml.py <slug> [--lang ru|en] [--fps 30] [-o out.fcpxml]

Then, in Resolve: import the .fcpxml as a timeline and render.
"""
import argparse
import json
import os
import sys
from urllib.request import pathname2url

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def build(slug, lang, fps, out_path):
    temp = os.path.join(BASE, "temp", f"{slug}_{lang}")
    audio = os.path.join(BASE, "input", slug, f"audio_{lang}.m4a")
    timeline_json = os.path.join(temp, "timeline.json")

    for p in (timeline_json, audio):
        if not os.path.exists(p):
            sys.exit(f"missing: {p}")

    segments = json.load(open(timeline_json))["timeline"]
    total = int(round(segments[-1]["end"] * fps))

    def url(p):
        return "file://" + pathname2url(p)

    assets, spine = [], []
    for i, seg in enumerate(segments):
        png = os.path.join(temp, "slides", f"slide_{seg['slide'] + 1:03d}.png")
        if not os.path.exists(png):
            sys.exit(f"missing slide: {png}")
        aid = f"a{i + 1}"
        assets.append(
            f'<asset id="{aid}" name="slide_{seg["slide"] + 1:03d}" src="{url(png)}" '
            f'start="0s" duration="0s" hasVideo="1" format="r1"/>'
        )
        off = int(round(seg["start"] * fps))
        dur = int(round(seg["end"] * fps)) - off
        # narration rides as a connected clip on the first slide
        inner = (
            f'<audio ref="aud" lane="-1" offset="0/{fps}s" duration="{total}/{fps}s" start="0s"/>'
            if i == 0
            else ""
        )
        spine.append(
            f'<video ref="{aid}" offset="{off}/{fps}s" duration="{dur}/{fps}s" start="0s">{inner}</video>'
            if inner
            else f'<video ref="{aid}" offset="{off}/{fps}s" duration="{dur}/{fps}s" start="0s"/>'
        )

    assets.append(
        f'<asset id="aud" name="audio_{lang}" src="{url(audio)}" start="0s" '
        f'duration="{total}/{fps}s" hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000"/>'
    )

    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
  <resources>
    <format id="r1" name="FFVideoFormat1080p{fps}" frameDuration="1/{fps}s" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>
    {"".join(assets)}
  </resources>
  <library>
    <event name="{slug}">
      <project name="{slug}_{lang}">
        <sequence format="r1" duration="{total}/{fps}s" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
            {"".join(spine)}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>'''

    with open(out_path, "w") as f:
        f.write(xml)
    print(f"{out_path}\n{len(segments)} slides, {total} frames ({total / fps:.1f}s @ {fps}fps)")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--lang", default="ru", choices=["ru", "en"])
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("-o", "--output")
    a = ap.parse_args()
    build(a.slug, a.lang, a.fps, a.output or f"{a.slug}_{a.lang}.fcpxml")
