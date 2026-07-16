# What Resolve actually does with FCPXML, PNG sequences, and Fusion comps

Verified on DaVinci Resolve Studio 21.0.2.4, macOS, 2026-07-16, driven over the
scripting API. Every claim here was tested end-to-end by rendering and looking at
the frames — not read from documentation.

## 1. A Fusion comp imported onto a timeline clip loses its media binding

`timeline_item_fusion.import_comp` succeeds and the nodes arrive intact — but the
`Loader` you wrote is silently converted to a `MediaIn`, and that MediaIn has no
valid binding. The whole frame renders as Resolve's red **Media Offline** card.

Resolve reports no problem at all: `detect_missing_media` returns
`missing_count: 0`, the timeline reports every clip `Online`, and the import
reports `linked: 4, offline: 0`. The failure is inside the comp.

**Do not author a comp with its own Loader and import it onto a clip.** If you
need Fusion, build the graph on the comp Resolve creates (which already has a
bound `MediaIn`) via `fusion_comp.add_tool` / `connect`.

## 2. A PNG sequence on the timeline renders frozen

Resolve *does* auto-detect a numbered sequence: an FCPXML `<video>` referencing
`frame_00000.png` imports as a media pool item named `frame_[00000-01345].png`
with the correct 1346-frame duration, `Online`, no gaps. It looks right in every
readout.

It does not play. The render holds one early frame for the clip's whole length.

Measured (the render vs. the source frames it claims to show):

| | t=46s | t=60s | t=80s | t=100s |
|---|---|---|---|---|
| rendered ink | 3.25% | 3.26% | 3.25% | 3.25% |

| | frame 0 | 300 | 900 | 1700 |
|---|---|---|---|---|
| source ink | 2.04% | 6.91% | 12.78% | 14.21% |

Constant against a source that grows monotonically. The picture is frozen.

**Encode each scene's PNG sequence to an mp4 with ffmpeg and reference the mp4.**
It plays correctly, and it is cheap: static-ish 1080p30 graphics compress to
~250-850 KB per scene at CRF 18.

## 3. A connected clip's `offset` is relative to its parent, not the timeline

This one is a silent, compounding desync.

```xml
<!-- WRONG: audio lands at 2692 when the clip starts at 1346 -->
<asset-clip ref="v2" offset="1346/30s" duration="1719/30s" start="0s">
  <audio ref="a2" lane="-1" offset="1346/30s" .../>
</asset-clip>

<!-- RIGHT: the child's offset matches the parent's `start` -->
<asset-clip ref="v2" offset="1346/30s" duration="1719/30s" start="0s">
  <audio ref="a2" lane="-1" offset="0/30s" .../>
</asset-clip>
```

Resolve adds the child's offset to the parent's position. With absolute offsets,
scene N's narration lands at roughly N× its intended position — by the last
scene of a 15-scene video the audio is minutes adrift.

`scripts/build_fcpxml.py` does not hit this only by luck: it puts one audio clip
for the whole timeline at offset 0 on a parent that also starts at 0, so
`0 + 0 = 0`.

## 4. Resolve's API still cannot give a still an explicit duration

Unchanged from the earlier finding: `AppendToTimeline` ignores the requested
source range and applies the "Standard still duration" preference; the API
exposes no razor/trim (`edit_kernel_capabilities` →
`razor_or_partial_lift: unsupported`). FCPXML remains the only way to place a
clip at an exact duration.

## 5. The lesson that cost the most

The first gate compared frame hashes: five frames, five different MD5s, "the
animation progresses." Every one of those frames was the red Media Offline card.

A byte comparison cannot tell *rendered correctly* from *rendered wrong*. The
same day, a 94-test suite stayed green while a chart's axis label rendered 48px
outside the canvas. **Look at the frames.** Where looking doesn't scale, measure
something semantic — the ink test above (does the drawn content grow the way the
source does?) is what actually caught the freeze.
