# Order-types final video quality audit

Audited on 2026-10-01 after the user rejected the appearance of the RU Short.
This audit supersedes the previous general visual-pass claims. It does not erase
the completed technical checks or alter the source media.

## Result

| Artifact | Visual result | Concrete finding |
| --- | --- | --- |
| RU Short | Failed; revision required | Narrow left poster, excessive blank area, unreadable small copy at phone size, incidental Panel labels, one image for 112.524 seconds. |
| EN Short | Failed; revision required | Dense copy, large unused right/bottom area, small qualifiers at phone size, one image for 87.121 seconds. |
| RU desktop | Revision and final review required | Source-inherited Panel labels on pages 2, 3, 4 and 5; dense explanatory text needs a viewing-size review. |
| EN desktop | Final visual/editorial review required | Eleven complete scenes retained; dense qualifiers/checklist need a viewing-size review; edited opening starts with the dependent phrase "because our mission today...". |

None of these results grants human quality acceptance. The two desktop videos
do not exhibit the Short's extreme left-panel reduction. No new semantic loss
or crop was identified in the inspected desktop frames; this is narrower than
a claim that they are publication-ready.

## Evidence and method

The root extracted a fresh frame at 5 seconds from each current final MP4.
It reviewed all eleven scenes in each desktop contact sheet, compared the RU
IOC/FOK frame with the original NotebookLM PDF page, read the full narration
transcripts and current timelines, and compared the design with the historical
Ink Theater reference. A separate reviewer inspected the final extracted
frames independently. Human listening was not completed and remains pending.

Ignored local evidence is under
`temp/algotrading-order-types/quality-audit-2026-10-01/`:

- `user-rejected-ru-short.png`: original attached screenshot.
- `ru_short-actual-5s.png`, `en_short-actual-5s.png`,
  `ru_desktop-actual-5s.png`, `en_desktop-actual-5s.png`: fresh final-video frames.
- `shorts-phone-preview.png`: both actual Short frames at 360x640, without zoom.
- `phone-text-measurements.json`: OCR word boxes and approximate glyph heights
  at that preview width. OCR readings are measurements, not copy approval.

Full desktop evidence remains in
`temp/algotrading-order-types/flow-v3/en/audio-deep-dive/contact-sheet.png` and
`temp/algotrading-order-types/flow-v4/ru/audio-production-v2/final-desktop-contact.jpg`,
with their full-size extracted frames. Original and final hashes remain in
[artifact-inventory.flow.json](artifact-inventory.flow.json).

## Findings

1. **P1: Shorts failed the composition and reading test.** The RU poster's
   approximate outer bounds are x121..705 and y172..1438 on a 1080x1920 canvas.
   Its bounding rectangle uses about 35.7% of the canvas; about 35% of the width
   to its right and 25% of the height below it are empty. EN has a larger panel,
   but still leaves roughly x790..1080 and y1445..1920 unused. In the 360-wide
   preview, many explanatory glyphs measure only about 5..10 pixels high.
   These are approximate visible-glyph measurements, not CSS font sizes.
   Meeting a safe-zone rectangle did not make the content comfortably readable.
2. **P1: Both Shorts hold one poster for almost the entire narration.** The
   timelines contain exactly one scene: 87.121271 seconds in EN and 112.523917
   seconds in RU, followed by a ten-second card. There is no visual progression
   between the 100/60 setup, IOC's 60/40 result, FOK's 0/100 result and the
   general rules. The brief repeats these ideas while the picture is unchanged.
   Desktop review also found dense pages held for about 31..36 seconds,
   including RU page 4 at 73.82..109.62. These are pacing review points, not
   proof that a source-slide presentation must be replaced with animation.
3. **P2: Incidental source labels survived as production copy.** Panel 1/2/3
   already appear in the actual RU NotebookLM page 4. They were not invented
   during restyling. The RU Short prompt explicitly required their preservation;
   RU desktop pages 2, 3 and 5 also retain Panel tags. The source-review stage
   should have rejected or revised these labels before freezing exact copy.
4. **P1: The layout prompt encoded the failed result.**
   [RU portrait edits](notebooklm-image-edits.ru-short.json) demand a "compact
   engraved upper-left panel" with semantics inside x140..790/y210..1390 and
   prohibit enlarging it. The subsequent video transform scales the already
   native portrait to 908x1614 and places it on a 1080x1920 canvas. This brought
   content inside the safe zone while making the picture smaller. It was a
   geometry workaround, not a successful composition revision.
5. **P2: Narration checks were factual, not a listening/editorial pass.** The
   EN production EDL starts at raw 5.48 seconds, removing the documentation
   preamble; the edited ASR begins "because our mission today...". That is a
   weak standalone opening and needs a sentence-level edit and listening.
   The RU introduction asserts that bots fail despite perfect prediction;
   this framing is absent from the selected eleven-paragraph source script
   and is broader than its stated execution distinctions. Full audio tails and
   the EN final no-guarantees statement are present; the problem is not a
   newly discovered truncated ending.
6. **P2: Article coverage was never an explicit acceptance criterion.** The
   current desktop scripts summarize eleven execution topics. The underlying
   article also covers trailing/iceberg orders, GTC/GTD, time-based orders,
   implementation examples, if-then logic, hidden/pegged orders and bulk
   management. A concise execution overview can be useful, but checking all
   eleven script paragraphs is not proof of complete article coverage. Freeze
   the intended article-to-video coverage before generating another source.

## Cause of the incorrect pass

The prior gate checked complete visible text, number/arrow relationships,
watermark absence, safe-zone containment, timeline coverage and media
integrity. It then described this as a general visual pass. The process lacked
a separate phone-size legibility/composition gate and a narration-driven pacing
review. Independent review repeated the same narrow contract, so it did not
catch the contract's bad layout decision.

The first portrait proof's narrow upper-left layout was reused as a template
for a much denser page. Exact-copy requirements also promoted incidental
NotebookLM labels to mandatory production text. More schema machinery would
not correct these editorial choices.

## Correction order

1. Keep the current videos, raw PDF/audio, source IDs, hashes and technical QA
   as evidence; change their quality state so they cannot advance to publication.
2. Revise only the affected source copy/portrait contracts. Separate technical
   labels from incidental Panel badges before freezing exact text. Preserve
   the original NotebookLM factual relationships and diagram meaning.
3. Recompose the actual page 4 groups into readable native portrait scenes with
   the existing audio-alignment stage: setup, IOC result, FOK result, then the
   general rule. Use the usable width and clear hierarchy; do not solve dense
   copy by shrinking the whole poster. Do not author replacement facts or
   unrelated diagrams.
4. Review a representative dense final frame at 360x640, without zoom, before
   expanding the revision. Review its timing against the corresponding audio.
   A readable, balanced source-derived composition is required in addition
   to OCR, relationship and safe-zone checks.
5. Review desktop Panel labels, viewing-size legibility, narrative opening and
   actual article coverage. Listen to the edited joins and complete opening/tail
   before claiming audio quality.
6. Rerender only rejected stages, repeat affected checks, then return the
   package to human quality review. Continue the queued renderer/recovery audit
   and next article only after this package's revised delivery.

The interrupted renderer-fix draft is preserved locally as
`unfinished-renderer-fixes.patch` in the ignored audit directory. It is not
tested, committed or active. This audit makes no claim that the videos have
already been repaired.
