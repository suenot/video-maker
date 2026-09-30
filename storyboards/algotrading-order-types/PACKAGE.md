# Order types video package

The user rejected all four local Blueprint videos because the existing
NotebookLM slide-and-audio flow was replaced with agent-authored diagrams.
They are retained as rejected artifacts, not as an accepted production package.
The production manifest is authoritative; publication is blocked.
English narration is the previously accepted NotebookLM source, with
its original account provenance retained. Both new PDFs and the Russian source
were generated through the designated Gaia Camoufox account.

| Language | Desktop | Native Short | Narrated body | Silent contacts card |
| --- | --- | --- | --- | --- |
| EN | 1920x1080 | 1080x1920 | 92.16 s | 10 s |
| RU | 1920x1080 | 1080x1920 | 133.588912 s | 10 s |

See [production-manifest.json](production-manifest.json),
[artifact-inventory.json](artifact-inventory.json), and
[render-validation.json](render-validation.json) for concrete files and hashes.
The final EN cuts run 102.166667 seconds; the RU cuts run 143.6 seconds. All are
H.264, constant 30 fps, with AAC 48 kHz stereo. All scene boundaries and both
end-card edges were matched to accepted frames; full decode, subtitle timing,
native geometry, safe-zone masks and independent factual/frame review passed.

The original Russian narration remains intact. A separate production audio
removes the unsupported universal queue-priority-loss clause. The
[audio edit](audio-edit.ru.json) records source timing, crossfade, the 3.85-second
duration change, source/production hashes and repeated transcription. Human
review should include pronunciation and the audio join. Captions use written
order-type acronyms; caption normalization is not an audio correction.

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
