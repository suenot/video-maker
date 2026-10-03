# NotebookLM article source queue

Trigger: a published article lacks a linked video and local source,
render, manifest, and upload records show no completed package for that
language. The 2026-10-01 priority order is funding-rate arbitrage, statistical
arbitrage, order-flow imbalance, then TWAP/VWAP/POV. Source drafting proceeds
while the separate order-types Shorts revision awaits visual acceptance.

The 2026-10-02 language scope is EN, RU, Mainland Chinese (`zh-CN`, Simplified)
and Taiwan Chinese (`zh-TW`, Traditional). Each locale has its own notebook,
frozen brief, PDF and Deep Dive audio. Use the full published `.zh.md` article
for `zh-CN` and `.zh-Hant.md` for `zh-TW`, recording the article language
separately from the output locale. Preserve regional financial terminology;
audio is Mandarin with Mainland or Taiwan usage, with pronunciation and
regional consistency pending editorial listening review. An existing legacy
`zh` source or publication needs variant reconciliation before another Chinese
generation. Chinese is not an automatic relabeling of an EN/RU source draft.
For a later article without a published localized text, freeze the full EN
article with explicit source-language/translation provenance before generation.

Each `briefs/<priority>-<slug>/<lang>/brief.json` fixes the article path,
SHA-256, title, source text, and separate slide and audio prompts, including
immutable SHA-256s for all three input files. The worker rejects changed
inputs. Never edit a brief while its job is active; record a deliberate input
revision before a new generation. The source
text begins with the deterministic `source_title` and then contains the full
article bytes. Prompts preserve section order, technical details and risks;
financial figures and mutable facts remain article claims pending editorial
and primary-source review. Do not use older NotebookLM text copies in place of
the hash-matched article snapshot.

The source worker owns one Camoufox session using Gaia's saved profile and
verified expected account. Its reusable state is `state.json`; runtime and
download logs stay in ignored `temp/notebooklm-source-queue/`. With the
documented local session settings, run from `video_maker`:

```bash
/Users/suenot/projects/sdvg/gaia/venv/bin/python scripts/notebooklm_source_queue.py run --settings temp/notebooklm-source-queue/session-settings.json --max-new-jobs 2 --max-active 8
/Users/suenot/projects/sdvg/gaia/venv/bin/python scripts/notebooklm_source_queue.py status
```

Camoufox must use the full usable display size, verified before work. The
current Mac reports approximately a 1977–1979x1290 work area. The factory reads this at each
launch, explicitly applies window/screen geometry and uses
`no_viewport=True`; `window=` alone is insufficient with a saved fingerprint.
Never open a small window or force a fixed 1280x720 viewport. The 1920x1080
fallback is used only when display geometry cannot be read. Store measured
outer/inner dimensions in state; use the same factory for standalone helpers.
The factory also preserves a backup of the saved profile's native window
bounds before updating only its `main-window` geometry. It refuses this
change while another process owns the profile. The fingerprint file remains
unchanged; native viewport dimensions are measured, not hard-coded.

Submit one slides job and one separate Deep Dive audio job per language.
Record notebook identity, source identity, job/card state and artifact links.
After completion, download exact originals to
`input/notebooklm-sources/<slug>/<lang>/slides.pdf` and `audio.<downloaded extension>`; verify
type/integrity, provenance and SHA-256 before marking a source draft complete.
If a quota or browser interruption occurs, inspect existing cards/state and
resume the missing job or download; do not resubmit a generating job. One
worker owns the saved browser profile at a time.

The active same-chat automation `marketmaker-notebooklm` runs every 15 minutes.
It performs a bounded pass, downloads completed jobs, then admits up to two
new article/language jobs with at most eight unresolved or server-active
artifacts. A file lock prevents another pass from opening a second browser.
Every pass reconciles saved jobs before admitting new locales, preserving
article priority within each group.
NotebookLM server generation continues between local checks. Local scheduled
checks require the Codex app and this Mac to be running.

Notebook creation records its dispatch state before the single action. A saved
failure before dispatch can resume only when the hash-matched notebook-ID
baseline is unchanged; an uncertain dispatch or changed baseline still blocks
creation and retains candidates for reconciliation.
The `/notebook/creating` route is temporary. Require a permanent notebook UUID
before binding, navigation or source insertion; an unfinished creation retains
its dispatch intent and must be reconciled against the saved notebook-ID baseline.

Before a submission, save the source-ID and artifact-ID baselines. Source
names may be shortened by NotebookLM: bind a uniquely added source ID and
select that exact ID, rather than relying on its displayed title. Bind a new
source only by its permanent ID. A `pending_upload_doc_id_` is a processing
placeholder that can briefly overlap its replacement; preserve the insertion
intent and reconcile the sole permanent addition without uploading again.
Wait for the expected customize dialog's prompt to become visible, then
verify its language, selected source and audio format/length before Generate.
An evidenced source failure before dispatch may resume only after binding its
permanent notebook ID and verifying the exact current URL, unchanged source-ID
baseline, frozen input hash and saved diagnostic hashes. Save an uncertain
dispatch state before the one insertion attempt; unknown or processing intents
still prohibit another insertion.
Chinese selection must explicitly identify Simplified or Traditional; a generic
"Chinese" or "中文" label does not establish the variant and blocks submission.
Bind a new
artifact only immediately after the observed Generate click. An interrupted
submission without a saved artifact ID, ambiguous cards, an unknown account,
or a title-only notebook match require evidence-based reconciliation before
more generation. Never resubmit them blindly. Preserve quota notices and use
the reset time shown by NotebookLM; `scheduled` is an existing job.
If the customize dialog itself offers only an enabled `Generate later`, save
the displayed quota/reset text and browser time zone, then schedule that exact
prepared request once. Validate the submission control before writing a
submission intent. After any Generate click, poll for the new artifact ID
without repeating the click; a direct scheduled request must not be clicked
a second time during reconciliation.
Dispatch the verified Generate control once without waiting for native button
animation. A pre-click failure may be resumed only with retained evidence that
no action was dispatched and no artifact appeared; require the current card
IDs to match that saved baseline before submitting. A changed baseline or an
uncertain dispatch still requires identity reconciliation.
If NotebookLM reports that **all features** are unavailable, record the exact
displayed reset and browser time zone as `quota.not_before` in state. Until
that time, every pass checks downloaded originals locally and returns before
loading browser helpers, reading profile settings or opening Camoufox. Do not
open the browser merely to poll `scheduled` jobs or refresh the quota notice.
After a paired slides/audio request is scheduled, a visible "almost at your
AI usage limit" notice with an exact reset also starts this local-only wait.
Record that notice unchanged, finish the current pair, then close the browser;
do not reopen it just to poll the scheduled pair before the displayed reset.
Preserve all notebook/source/artifact IDs and pending insertion intents.
After the reset, reconcile existing bound jobs, download ready originals and
resume missing stages using the same notebook and frozen inputs. Source-helper calls
have a 120-second deadline; a timeout preserves the insertion intent for review.
If a job's saved failure includes `retry_not_before`, skip that job until its
deadline while allowing other eligible source jobs to proceed. Preserve its
failure evidence and all bound identities during this wait.

| State | Next action |
| --- | --- |
| `source_processing` | Reconcile the submitted source's permanent ID; do not upload again. |
| `quota_wait` | Keep frozen inputs and resume the missing source stage after the recorded reset. |
| `not_submitted` | Configure and verify the exact frozen request, then submit once if capacity permits. |
| `submitting` / `submission_unknown` | Inspect saved intent and request evidence; never resubmit blindly. |
| `generating` / `scheduled` | Observe the bound artifact ID and wait for server completion. |
| `ready` | Download and validate the bound original artifact. |
| `downloaded_pending_editorial_review` | Verify local SHA-256 and retain provenance; source stage complete. |
| `failed` | Inspect the bound card and preserve failure evidence before choosing a deliberate recovery. |
| Ambiguous, missing or wrong-kind binding | Stop mutations and reconcile identity from evidence. |

Validate downloaded bytes in a temporary file before promoting them to the
source directory. `pdfinfo` must confirm at least one page; audio must contain
an audio stream, positive duration and a passing full FFmpeg decode. Save
original artifact ID, source ID, bytes, SHA-256, page count or audio duration.
Open only the exact bound artifact's unique, visible and enabled menu control;
dispatch it once without native pointer interception by Studio hover tooltips.
Continue to require the unique matching PDF/audio download menu item, wait for
its visibility and verify it is still connected and enabled before dispatching
it once without native pointer-click waits. Retain the download-event wait and
original-byte integrity checks before saving bytes.
On later passes, verify completed artifact hashes and skip their generation
checks. A subsequent article edit or attached video must not block unfinished
jobs elsewhere in the queue; completed jobs retain their frozen input evidence.

When every prepared brief has both artifact IDs bound or both originals
downloaded, freeze the next small batch from `../article-video-queue.json`:
published language, absent article video link, no matching local completed
package or source draft. Existing generation may continue while the next
briefs are prepared locally; admission still respects the active-artifact cap.
Do not extend the batch while a source or submission identity is unresolved.
Check existing NotebookLM notebooks and source jobs before creating one.
Freeze the exact current article bytes, section order and input hashes in the
same brief format; record unverified external notebook/channel duplicates and
factual review as pending before submission or final production respectively.

Source completion means both original artifacts and their evidence are present
and editorial review is pending. Final scene design, rendering, video QA,
human acceptance, Studio duplicate reconciliation, upload and article embed
are separate later gates under the [video workflow](../article-video-workflow.md).
