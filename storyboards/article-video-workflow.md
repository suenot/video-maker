# Continuous article video production

User authorization: 2026-09-30. Keep producing videos for Marketmaker articles
without videos through Google NotebookLM. The active Goal belongs to Codex chat
`01a0f224-5110-7581-ae55-6d7346a5bada`. Heartbeat automation `marketmaker`
checks this same chat every 30 minutes; it is a continuation check, not a second
browser worker.

Use the canonical [YouTube content pipeline](../.agents/skills/youtube-content-pipeline/SKILL.md).
The queue is [article-video-queue.json](article-video-queue.json). Individual
`storyboards/<slug>/production-manifest.json` files remain authoritative for
source provenance, actual progress, QA, approvals, and publication records.

## Order and completion

1. Finish `algotrading-order-types` EN/RU first.
2. Continue with funding-rate arbitrage, statistical arbitrage, order-flow
   imbalance, and TWAP/VWAP/POV, following the previous priority audit.
3. Reconcile the remaining candidates against existing videos before choosing
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
- Allow one owner of the shared Camoufox profile at a time. Inspect live
  processes before opening the profile or attempting recovery.
- Generate narration and the semantic slide reference in NotebookLM. Preserve
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

Follow the canonical style-proof gate before full restyling. Keep source
meaning separate from visual examples, and preserve the requested NotebookLM
production flow. Build independent 1920x1080 desktop and 1080x1920 vertical
frames, exact semantic timelines, and correctly timed subtitles. Complete
frame/text/safe-zone checks, full media decode, and codec/duration checks.
Never publish failed QA. Keep review and publication approval states explicit.
