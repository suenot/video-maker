# Order types video package

The replacement package reuses the existing NotebookLM audio/PDF and video-maker
flow recovered from the August sessions. The four previous Blueprint videos
remain rejected. The 2026-10-01 final-frame audit supersedes the replacement
package's general visual-pass claims: both Shorts fail composition, phone-size
legibility and pacing. Desktop source labels and editorial checks need review.
Technical media checks remain valid. The package requires revision.

See [the quality audit](QUALITY-AUDIT-2026-10-01.md) and
[current quality state](quality-audit.flow.json). Human listening and quality
approval remain pending; these files are current audit evidence, not accepted
final production.

## Current replacement delivery

| Language | Format | Duration | Current MP4 |
| --- | --- | --- | --- |
| EN | Desktop, eleven slides | 252.800 s | [EN desktop](../../output/algotrading-order-types/flow-v3/en/algotrading-order-types-en-desktop.mp4) |
| RU | Desktop, eleven slides | 268.067 s | [RU desktop](../../output/algotrading-order-types/flow-v4/ru/algotrading-order-types-ru-desktop.mp4) |
| EN | Standalone native portrait IOC/FOK Short | 97.133 s | [EN Short](../../output/algotrading-order-types/flow-v3/en/ioc-fok-short/algotrading-order-types-en-short.mp4) |
| RU | Standalone native portrait IOC/FOK Short | 122.533 s | [RU Short](../../output/algotrading-order-types/flow-v4/ru/ioc-fok-short/algotrading-order-types-ru-short.mp4) |

Each duration includes a silent ten-second contacts card. Desktop output is
1920x1080; Shorts are 1080x1920. All four are H.264, constant 30 fps, with AAC
48 kHz stereo and separate SRT files. No replacement has been uploaded.

- Reviewed NotebookLM decks: EN v3 and RU v4, eleven pages each. Corrections were
  made through NotebookLM native per-page revision; unchanged pages were reused
  with exact PNG hash comparisons.
- Both desktop sets contain all eleven actual NotebookLM pages restyled through
  image edits. Source/output hashes and per-page visual/OCR reviews are recorded
  in [EN desktop edits](notebooklm-image-edits.en-desktop.json) and
  [RU desktop edits](notebooklm-image-edits.ru-desktop.json). EN page 1 reuses the
  separately reviewed style proof.
- Desktop narration uses separate NotebookLM Deep Dive artifacts, generated
  with the saved Gaia Camoufox profile for poebyte@gmail.com. Complete ASR review
  covers all eleven topics. The [EN audio edit](audio-edit.en-flow.json) and
  [RU audio edit](audio-edit.ru-flow.json) retain original audio and document
  source-fragment edits, production WAV hashes, cues and final render checks.
  The RU final checklist contains the general time-in-force check and retains
  the complete no-guarantees ending.
- Shorts independently explain the IOC/FOK example from source page 4, with
  separate NotebookLM Brief audio and native portrait image edits. See
  [EN selection](short-selection.en-flow.json),
  [RU selection](short-selection.ru-flow.json),
  [EN portrait edits](notebooklm-image-edits.en-short.json) and
  [RU portrait edits](notebooklm-image-edits.ru-short.json). All other deck pages
  are outside the current Short scope; page 1 portrait proofs remain reusable
  style evidence.
- Final MP4 geometry checks found diagrams, numbers and footnotes inside the
  hard Short safe zone. That narrow check failed to establish visual quality:
  the current audit rejects the small left poster and static pacing. Native
  input PNG placement failures and exact placement transforms remain recorded.
- Earlier Brief attempts are preserved as rejected narration. They are not
  current production selections.

[artifact-inventory.flow.json](artifact-inventory.flow.json) records current
paths, hashes, source pages, original and render frames, media properties and
metadata. [render-validation.flow.json](render-validation.flow.json) records
zero-start contiguous timelines, complete WAV coverage, subtitle bounds, all
desktop scene transitions, Short safe zones and final audio tails, with the
new visual failure recorded separately. All four
files fully decode, begin at video PTS zero and retain the full production WAV
before their contacts cards. Technical success does not pass composition or
legibility. Human listening and quality approval remain pending.

The existing renderer needed temporary input normalization for EN desktop
page 1, whose original dimensions differ from the remaining pages. Use the
manifest's `render_frames` directory when resuming this render. Original edits
are retained. The final body is padded to the next 30-fps frame boundary before
the contacts card, preventing truncated narration. These are recorded assembly
workarounds; the canonical pipeline was not rewritten.

See [production-manifest.json](production-manifest.json), specifically
`sources`, `artifacts` and `flow_progress`, for selected PDFs, audio artifact IDs
and current delivery. Original Blueprint sources, artifacts, style and QA are
preserved under `rejected_blueprint_package`; they do not approve the replacement.

[metadata.flow.json](metadata.flow.json) contains distinct desktop/Short
metadata, chapters derived from the current timelines and article URLs checked
with HTTP 200 on 2026-10-01. New thumbnails, human quality acceptance and target
channel verification are required before Private upload and Studio checks.
The existing native goal was observed as `blocked`; automatic continuation
requires resuming that goal in Codex. No replacement loop was created.

## Rejected Blueprint package evidence

| Language | Desktop | Native Short | Narrated body | Silent contacts card |
| --- | --- | --- | --- | --- |
| EN | 1920x1080 | 1080x1920 | 92.16 s | 10 s |
| RU | 1920x1080 | 1080x1920 | 133.588912 s | 10 s |

[artifact-inventory.json](artifact-inventory.json),
[render-validation.json](render-validation.json), and [audio-edit.ru.json](audio-edit.ru.json)
preserve the rejected package's historical files and checks. Those checks do not
supersede the user's rejection of its flow and visual content.

## Historical reproduction of the rejected native frames

The commands below reproduce the rejected package only. Do not use them to
resume production. The existing flow is documented in [README.md](../../README.md)
and implemented in [run_pipeline.sh](../../scripts/run_pipeline.sh): separate
NotebookLM audio and PDF deck, PDF pages to PNG, OCR and Whisper, slide alignment,
then video assembly. The August 2 Claude session records eight completed videos
using this flow. The August 20 Codex instructions require any Ink Theater
restyling to edit the actual NotebookLM slides while retaining their content.

Use Codex `load_workspace_dependencies` to obtain the current dependency root
and bundled Node executable. Set `ORDER_TYPES_RUNTIME_ROOT` to that root and
run the package sources with the bundled Node executable:

```text
node storyboards/algotrading-order-types/render-native-frames.en.mjs en
node storyboards/algotrading-order-types/render-native-frames.ru.mjs ru
```

`ORDER_TYPES_OUTPUT_ROOT` and `ORDER_TYPES_EVIDENCE_ROOT` optionally direct a
reproduction check to separate ignored directories. The sources read the
accepted semantic contracts and Noto Sans fonts from the bundled runtime. All
54 PNGs, including covers, end cards and thumbnails, reproduced with exact
SHA-256 matches during delivery. A changed runtime, source, contract or frame
requires checking the affected outputs before rendering.

The rejected renders used these aspect-matched frames with the language audio and
timeline from the manifest. Cover images do not consume narration. Use the
canonical video maker and pre-rendered contacts-only cards; keep final video
timing at constant 30 fps. The delivered files include a CFR normalization of
the held-frame gap produced by canonical end-card concatenation. This renderer
finding is queued for the pipeline audit; it did not change narration or cues.

Publication follows [the article workflow](../article-video-workflow.md):
human quality approval, explicit channel verification, Private upload, Studio
checks and then verified Public state. Do not rebuild sources or retry an upload
based only on a process exit code. Existing source media and per-artifact state
must be inspected first.
