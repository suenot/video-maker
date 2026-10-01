# Continuous article video production

User authorization: 2026-09-30. Keep producing videos for Marketmaker articles
without videos through Google NotebookLM. The production Goal belongs to Codex
chat `01a0f224-5110-7581-ae55-6d7346a5bada`. After the user removed the old loop,
the same-chat automation `marketmaker-notebooklm` was created and verified
ACTIVE on 2026-10-01. It checks the source queue every 15 minutes; any
continuation check must not start a second browser worker. The Codex app and
the local Mac must be running for these scheduled passes.

The existing NotebookLM production flow is described in
[README.md](../README.md) and implemented by
[run_pipeline.sh](../scripts/run_pipeline.sh). It already performs PDF page
extraction, OCR, Whisper transcription, slide/audio alignment and video assembly.
Reuse these stages; do not recreate the pipeline or replace the NotebookLM deck
with agent-authored diagrams. The August 2 Claude session records eight completed
videos through this flow. Apply the additional
[YouTube content pipeline](../.agents/skills/youtube-content-pipeline/SKILL.md)
contracts within the user's requested flow.
The queue is [article-video-queue.json](article-video-queue.json). Individual
`storyboards/<slug>/production-manifest.json` files remain authoritative for
source provenance, actual progress, QA, approvals, and publication records.

## Order and completion

On 2026-10-01 the user prioritized continuous NotebookLM source drafting:
separate EN/RU slide PDFs and Deep Dive audio for articles without videos.
Prepare funding-rate arbitrage, statistical arbitrage, order-flow imbalance,
then TWAP/VWAP/POV. This source stage runs independently of the rejected
`algotrading-order-types` Shorts revision and final video acceptance; see
[the quality report](algotrading-order-types/QUALITY-AUDIT-2026-10-01.md).
The pipeline audit may proceed separately and must not block source drafting.
Reconcile further candidates against existing videos, preferring published
articles to drafts. A missing YouTube field alone never proves video absence.

For source drafting, freeze the complete article bytes and hash in an EN/RU
brief; generate one NotebookLM slides PDF and one separate Deep Dive audio per
language. Download both original artifacts exactly, verify file integrity and
record source/job provenance and hashes. Mark each as an editorial draft pending
primary fact review, especially mutable financial examples. This stage ends
before scene design, rendering, final video QA, human acceptance or publication.
Use [the source queue SOP](notebooklm-source-queue/README.md) for handoffs and
recovery. Reconcile target-channel duplicates before final render or publish.

For optional montage exploration, the user's
[33-second vertical reference](references/next-group-9zpOJmEzYQ4.md) records
alternating focal shots, supporting inserts and sparse large text. Adapt its
editing structure to the actual selected NotebookLM audio and source-slide
meaning; it does not replace source drafting or the existing renderer stages.

For this creation Goal, a package is delivered when its requested EN/RU desktop
and native vertical videos have passed QA, their manifests are complete, and
the reusable documents/prompts/code have been committed and pushed. Preserve
separate semantic, safe-zone, media and intended-viewing-size visual gates.
Readable composition and narration pacing must pass; a user quality rejection
supersedes an earlier general pass. Preserve
the quality-review gate before YouTube publication. Place a delivered package
awaiting review in `ready_for_quality_review`, then continue to the next
article. Publication and embedding remain separate approval-dependent stages.
Do not label an unfinished render as delivered to advance the queue.

## Sources and browser ownership

- Use Gaia at `/Users/suenot/projects/sdvg/gaia` to operate Google NotebookLM.
- Use only Camoufox with its own existing saved session. Never launch Firefox
  or bootstrap from Firefox cookies.
- Open Camoufox at the display's full usable work-area size. Use 1920x1080
  only as a fallback when display geometry cannot be read; on a smaller
  display use its full work area. Never use a miniature window or a fixed
  1280x720 viewport. Record and verify actual outer/inner dimensions before
  work. With a saved Camoufox fingerprint, `window=` alone can be ignored:
  apply launch geometry explicitly and use `no_viewport=True` so Playwright
  does not force a conflicting miniature viewport.
- NotebookLM uses Gaia's `.camoufox_profile/` and `.camoufox_fp.pkl`, with
  the user-designated Google identity recorded in ignored local session
  settings. Do not substitute the YouTube publisher profile. Verify the
  active account before creating a notebook, adding sources, or generating.
- Allow one owner of the shared Camoufox profile at a time. Inspect live
  processes before opening the profile or attempting recovery.
- While an account-login process owns the Gaia profile, leave generation
  stopped until sign-in and the expected account are verified. Reconcile
  notebooks in that account before starting a watcher or new source jobs;
  retain previous-session jobs and accepted media with their actual provenance.
- Generate separate narration and slide-deck artifacts in NotebookLM. Preserve
  the original audio/PDF and hashes; audit technical claims before accepting
  them. Do not replace this source stage with locally authored TTS or slides.
- Generated media, profiles, screenshots, and download logs stay in ignored
  `input/`, `output/`, and `temp/` paths.

## Deduplication

The initial queue covers 197 slugs and 340 EN/RU article files. It found 26 slugs
with article video links in every available language, 12 with local video
artifacts requiring inspection, 158 unverified candidates, and the active
order-types article. This is an inventory snapshot, not proof that each
candidate lacks a published video.

Before creating a source draft, inspect the article frontmatter, local source/run
and production manifests, generated media, and upload records. Check EN and RU
separately. Reconcile the target channel's Studio state before final render or
publication. Reuse verified completed sources and renders, and resume only
missing stages. An old, rejected, or merely existing MP4 does not establish
completion. The priority audit found an English
Distance Approach video at `https://www.youtube.com/watch?v=ClQn7Xp6F9Q` despite
its missing article link; reconcile it instead of generating a duplicate.

## Progress checks and recovery

At each heartbeat, compare the current manifest with fresh process, log,
artifact, and NotebookLM-card evidence. A finished local script does not stop
a server-side generation job. Do not restart a healthy worker or repeat a
submitted job while it is generating or scheduled.

Honor the exact quota-reset time shown by NotebookLM. While waiting, perform
useful work on the current package where possible. After reset, inspect the
existing jobs before retrying a failed one. Confirm a generating/scheduled
artifact card after submission; a clicked Generate button is insufficient.

If a local worker exits unexpectedly or stops progressing, inspect its last
logs, current browser state, and saved outputs, then resume from the last
verified stage. Do not use profile locks, long server waits, or stale PIDs as
sole proof of a hang. Keep retry evidence and next actions in the manifest.

Keep unchanged waits and routine healthy checks quiet. Notify the user about
a completed video package, a material failure, or an action they must take.
An explicit user pause or stop takes precedence over scheduled continuation.

## Rendering and review

The August 20 Codex instructions require Ink Theater restyling to edit each
actual NotebookLM slide through Codex GPT Image, preserving its text, diagrams
and explanatory structure. Do not substitute newly invented diagrams or posters.
Follow the canonical style-proof gate before full restyling. Keep source
meaning separate from visual examples, and preserve the requested NotebookLM
production flow. Build independent 1920x1080 desktop and 1080x1920 vertical
frames, exact semantic timelines, and correctly timed subtitles. Complete
frame/text/safe-zone checks, full media decode, and codec/duration checks.
Never publish failed QA. Keep review and publication approval states explicit.
