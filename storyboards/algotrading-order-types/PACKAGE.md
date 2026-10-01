# Order types video package

The replacement package reuses the existing NotebookLM audio/PDF and video-maker
flow recovered from the August sessions. The four previous Blueprint videos
remain rejected. Publication is blocked pending replacement QA and human review.

## Current replacement progress

- Reviewed NotebookLM decks: EN v3 and RU v4, eleven pages each. Corrections were
  made through NotebookLM native per-page revision; unchanged pages were reused
  with exact PNG hash comparisons.
- Both desktop sets contain all eleven actual NotebookLM pages restyled through
  image edits. Source/output hashes and per-page visual/OCR reviews are recorded
  in [EN desktop edits](notebooklm-image-edits.en-desktop.json) and
  [RU desktop edits](notebooklm-image-edits.ru-desktop.json). EN page 1 reuses the
  separately reviewed style proof.
- EN native vertical page 1 passes exact-text, relationship and safe-zone review.
  The remaining EN vertical pages are being generated; RU vertical pages remain
  pending. The [vertical proof record](notebooklm-image-edits.json) preserves all
  attempted prompts and identifies the accepted v4 proof.
- New designated-account NotebookLM audio was downloaded for both languages,
  transcribed completely and rejected during narration review. EN needs an
  unambiguous acceptance/execution negation and qualified post-only wording; RU
  omits the TWAP/VWAP distinction and full final checklist. Corrected concise
  eleven-paragraph source scripts are being ingested. These audio attempts are
  preserved and are not final-production selections.
- No replacement MP4 has been rendered. Human listening and quality approval
  remain pending.

See [production-manifest.json](production-manifest.json), specifically
`flow_progress`, for selected PDFs, hashes, source IDs, rejected narration IDs
and current stage. The older `artifacts`, `style` and `qa` records describe the
rejected Blueprint package and do not approve the replacement.

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
