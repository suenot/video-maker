# Continuous article video production

User authorization: 2026-09-30. Keep producing videos for Marketmaker articles
without videos through Google NotebookLM. The active Goal belongs to Codex chat
`01a0f224-5110-7581-ae55-6d7346a5bada`. Heartbeat automation `marketmaker`
checks this same chat every 30 minutes; it is a continuation check, not a second
browser worker.

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

1. Finish `algotrading-order-types` EN/RU first. The user rejected its four
   Blueprint renders on 2026-10-01; they do not complete this task. Original
   flow discovery is complete, and production must reuse the existing stages.
2. Complete the user-requested pipeline audit and justified efficiency
   improvements. Delegate bounded audit scopes to `gpt-6.1-sol` with `ultra`
   reasoning; keep the parent chat on its configured model and effort. Audit
   SOP/DoD, workflow transitions, duplicate prevention, artifact reuse,
   recovery, and possible Pydantic/pydantic-ai use before choosing changes.
   Verify and commit/push the changes before starting another article.
3. Continue with funding-rate arbitrage, statistical arbitrage, order-flow
   imbalance, and TWAP/VWAP/POV, following the previous priority audit.
4. Reconcile the remaining candidates against existing videos before choosing
   the next article. Prefer published articles to drafts. Do not produce a
   second video merely because an article lacks its YouTube field.

For this creation Goal, a package is delivered when its requested EN/RU desktop
and native vertical videos have passed QA, their manifests are complete, and
the reusable documents/prompts/code have been committed and pushed. Preserve
the quality-review gate before YouTube publication. Place a delivered package
awaiting review in `ready_for_quality_review`, then continue to the next
article. Publication and embedding remain separate approval-dependent stages.
Do not label an unfinished render as delivered to advance the queue.

## Sources and browser ownership

- Use Gaia at `/Users/suenot/projects/sdvg/gaia` to operate Google NotebookLM.
- Use only Camoufox with its own existing saved session. Never launch Firefox
  or bootstrap from Firefox cookies.
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

Before creating a notebook, inspect the article frontmatter, source/run and
production manifests, generated media, upload records, and actual channel
Studio state. Check EN and RU separately. Reuse verified completed sources and
renders, and resume only missing stages. An old, rejected, or merely existing
MP4 does not establish completion. The priority audit found an English
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
