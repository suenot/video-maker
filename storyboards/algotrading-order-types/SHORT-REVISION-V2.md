# IOC/FOK Shorts v2

The rejected single-poster Shorts are preserved. Their replacements split the
actual NotebookLM page 4 into four native portrait views: request 100 / available
60, IOC fills 60 and cancels 40, FOK fills 0 and cancels 100, and the general
time-in-force rules. The existing selected NotebookLM narration is unchanged.

The [frame timeline](short-revision-v2.json) aligns 12 EN and 13 RU scenes with
the narration, including return visits during qualifications and the recap.
EN is 97.2 seconds including the ten-second silent end card; RU is 122.6
seconds. The longest body hold is 11.83 seconds EN and 20.3 seconds RU. This is
a composition correction of the existing audio, not a shorter narration cut.

Files are in `output/algotrading-order-types/short-revision-v2/{en,ru}/`, with
MP4, unchanged-timing SRT and updated metadata sidecars. Generated media stays
ignored. The [production manifest](production-manifest.json) records them as
`short_revision_v2`, retaining the failed previous artifacts for provenance.

The [image provenance](short-revision-v2/image-provenance.json) records built-in
image edits of the actual source page. The [render QA](short-revision-v2/render-qa.json)
records final-MP4 phone-size frames, full decode, exact CFR geometry, complete
audio tail and silent end card. Lead checks also verified final/source/frame
hashes, contiguous scene coverage and subtitle cues within the unchanged audio.
Readability and the 100/60/40/0/100 relationships were inspected in actual MP4
samples. Human listening and quality acceptance remain pending.

Desktop review findings from [the earlier audit](QUALITY-AUDIT-2026-10-01.md)
remain open. Neither desktop review nor Short acceptance blocks the independent
NotebookLM source queue.
