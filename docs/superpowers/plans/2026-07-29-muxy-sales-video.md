# Muxy Sales Video and Short Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce one locally reviewable English desktop video and exactly one English Short that sell Muxy as a lightweight macOS workspace for multi-project, multi-agent work, without publishing either asset.

**Architecture:** Use the existing Muxy English article plus a focused sales brief as NotebookLM sources. Generate the desktop narration and slide deck, assemble them with `video_maker`, then generate one independent NotebookLM Short from the same sales brief. Keep publication out of the workflow and verify the rendered files locally.

**Tech Stack:** NotebookLM automation via `/Users/suenot/projects/sdvg/gaia/notebooklm_gen.py`, Camoufox persistent session, `video_maker` shell/Python/FFmpeg pipeline, Whisper subtitles, existing Muxy screenshots and hero image.

## Global Constraints

- Language: English.
- Channel target: `@suenot`.
- Desktop duration target: 90-120 seconds.
- Short count: exactly one for this topic.
- Short duration target: 30-45 seconds.
- Sales arc: recognizable multi-project focus pain first, Muxy solution second.
- Product boundary: Muxy organizes and launches workspaces; it does not provide SSH hosts, Docker, harness accounts, or agents.
- Platform limitation: state that Muxy is macOS-only.
- Publication: do not call `publish.py`, YouTube Studio, or any upload flow.
- No invented Muxy features in copy, captions, slides, or metadata.

---

### Task 1: Update the Shorts policy in the content-pipeline SSOT

**Files:**
- Modify: `/Users/suenot/projects/sdvg/suenot/CONTENT_PIPELINE.md` in the Shorts section.

**Interfaces:**
- Consumes: the approved policy in `docs/superpowers/specs/2026-07-29-muxy-sales-video-design.md`.
- Produces: a rule that creates only as many Shorts as the topic supports, with one independent problem-solution moment per Short.

- [ ] **Step 1: Replace the fixed-count sentence**

Replace the current fixed-count guidance with:

```markdown
Create only as many Shorts as the topic supports. Every Short must contain one independent, interesting problem-solution moment. A narrow topic may produce one Short; a broader topic may produce several.
```

- [ ] **Step 2: Verify the policy has no fixed-count requirement**

Run:

```bash
rg -n -i "fixed number|only as many Shorts|narrow topic may produce one Short" /Users/suenot/projects/sdvg/suenot/CONTENT_PIPELINE.md
```

Expected: the topic-based wording is present and no fixed-count wording remains in the Shorts section.

### Task 2: Prepare the Muxy sales brief and visual sources

**Files:**
- Create: `/Users/suenot/projects/trading/marketmaker/video_maker/input/muxy-terminal-focus/muxy-sales-brief.md`.
- Read: `/Users/suenot/projects/sdvg/suenot/suenot.github.io/src/content/blog/en/muxy-terminal-focus.md`.
- Read: `/Users/suenot/projects/sdvg/suenot/suenot.github.io/public/images/blog/muxy-terminal-hero.png`.
- Use: user-provided Muxy screenshots from the conversation as visual references.

**Interfaces:**
- Consumes: the existing English article and the approved narrative beats.
- Produces: a concise source document for NotebookLM with exact sales framing and factual guardrails.

- [ ] **Step 1: Write the brief with the approved copy**

The brief must include these sections and facts:

```markdown
# Muxy sales brief

Audience: Mac developers running multiple AI coding agents.

Pain: four or more active projects, parked projects, and several terminal-based harness sessions make context and focus hard to maintain.

Solution: Muxy is a lightweight native macOS terminal workspace for organizing and launching project workspaces.

Proof workflows: switch projects, separate active and parked work, open a configured SSH or local Ubuntu Docker project.

Boundary: Muxy does not provide the remote server, Docker environment, harness account, or agent. Those are configured by the developer.

Limitation: macOS only.

CTA: If you work across multiple coding projects on a Mac, try Muxy.
```

- [ ] **Step 2: Check the brief for unsupported claims**

Run:

```bash
rg -n -i "guarantee|secure|faster|reliable|all agents|cross-platform|provides.*(server|account|agent)" input/muxy-terminal-focus/muxy-sales-brief.md
```

Expected: no matches.

### Task 3: Generate the desktop narration and slide deck

**Files:**
- Input: `input/muxy-terminal-focus/muxy-sales-brief.md`.
- Source: `/Users/suenot/projects/sdvg/suenot/suenot.github.io/src/content/blog/en/muxy-terminal-focus.md`.
- Output: `/Users/suenot/projects/sdvg/gaia/output/` NotebookLM audio and slide artifacts.

**Interfaces:**
- Consumes: the article and sales brief.
- Produces: English Brief/Short audio and an English slide deck for the landscape video.

- [ ] **Step 1: Run NotebookLM for audio and slides**

Run from `/Users/suenot/projects/sdvg/gaia`:

```bash
venv/bin/python notebooklm_gen.py \
  --title "Muxy — Keep Your Focus Across Multiple Coding Projects" \
  --source-file /Users/suenot/projects/sdvg/suenot/suenot.github.io/src/content/blog/en/muxy-terminal-focus.md \
  --source-file /Users/suenot/projects/trading/marketmaker/video_maker/input/muxy-terminal-focus/muxy-sales-brief.md \
  --discover "Muxy terminal macOS project workspace remote projects AI coding agents" \
  --audio --audio-format Brief --audio-length Short \
  --instructions "Create a sales-first English explainer. Start with the pain of juggling multiple projects and AI coding agents, then show Muxy as a lightweight macOS workspace. Demonstrate active versus parked projects and configured remote workspaces. Explicitly say Muxy does not provide the server, Docker environment, harness account, or agent. End with one clear CTA. Do not make a feature list." \
  --slides \
  --slides-prompt "Create a concise sales deck for a 90-120 second English product explainer. Visual order: chaotic multi-project terminal work, active versus parked projects, Muxy project navigation, configured SSH or local Ubuntu Docker remote workspace, macOS-only limitation, CTA. Use readable UI-oriented visuals and keep copy sparse. Do not invent controls or claims." \
  --language English --headless --debug --timeout 1800
```

- [ ] **Step 2: Identify the generated artifacts**

Run:

```bash
find /Users/suenot/projects/sdvg/gaia/output -maxdepth 1 -type f -mmin -30 -print | sort
```

Expected: one English audio file and one slide-deck PDF created by this run.

### Task 4: Assemble and inspect the desktop MP4

**Files:**
- Create: `input/muxy-terminal-focus/audio_en.m4a`.
- Create: `input/muxy-terminal-focus/slides_en.pdf`.
- Create: `output/muxy-terminal-focus/muxy-terminal-focus.mp4`.
- Create: matching `.srt`, metadata JSON/TXT, thumbnail, and temporary render files.

**Interfaces:**
- Consumes: the audio and PDF from Task 3.
- Produces: a locally reviewable landscape MP4 and metadata; no upload.

- [ ] **Step 1: Stage the newest NotebookLM artifacts**

Run from `/Users/suenot/projects/sdvg/gaia` after the generation command:

```bash
latest_audio=$(find output -maxdepth 1 -type f -name '*.m4a' -print0 | xargs -0 ls -t | head -1)
latest_slides=$(find output -maxdepth 1 -type f -name '*.pdf' -print0 | xargs -0 ls -t | head -1)
test -s "$latest_audio"
test -s "$latest_slides"
cp "$latest_audio" /Users/suenot/projects/trading/marketmaker/video_maker/input/muxy-terminal-focus/audio_en.m4a
cp "$latest_slides" /Users/suenot/projects/trading/marketmaker/video_maker/input/muxy-terminal-focus/slides_en.pdf
```

Expected: both staged files exist and are non-empty.

- [ ] **Step 2: Build with the suenot branding config**

Run:

```bash
CHANNEL=suenot SEED_KEYWORDS="muxy terminal,macOS terminal,AI coding agents,developer productivity,remote development" \
  scripts/run_pipeline.sh en muxy-terminal-focus
```

- [ ] **Step 3: Verify the landscape asset**

Run:

```bash
ffprobe -v error -show_entries format=duration:stream=width,height,codec_name \
  -of default=noprint_wrappers=1 output/muxy-terminal-focus/muxy-terminal-focus.mp4
```

Expected: a playable MP4, 16:9 dimensions, duration near the 90-120 second target, and an AAC audio stream.

- [ ] **Step 4: Inspect the thumbnail and representative frames**

Run:

```bash
mkdir -p output/muxy-terminal-focus/review
for review_stamp in 00:03 00:30 01:00 01:25; do
  safe_stamp=${review_stamp//:/-}
  ffmpeg -y -ss "$review_stamp" -i output/muxy-terminal-focus/muxy-terminal-focus.mp4 \
    -frames:v 1 -q:v 2 "output/muxy-terminal-focus/review/frame_${safe_stamp}.jpg"
done
```

Inspect the generated JPGs and thumbnail. Confirm the opening frame communicates multi-project pain, the middle frames show project/remote workflows, and the final frame contains a readable CTA and macOS limitation.

### Task 5: Generate exactly one English Short

**Files:**
- Create: one new NotebookLM Short MP4 under `/Users/suenot/projects/sdvg/gaia/output/`.

**Interfaces:**
- Consumes: the same article and sales brief as the desktop video.
- Produces: exactly one locally reviewable vertical English Short; no upload.

- [ ] **Step 1: Generate the single Short**

Run from `/Users/suenot/projects/sdvg/gaia`:

```bash
venv/bin/python notebooklm_gen.py \
  --title "Muxy — Keep Every AI Coding Project One Shortcut Away" \
  --source-file /Users/suenot/projects/sdvg/suenot/suenot.github.io/src/content/blog/en/muxy-terminal-focus.md \
  --source-file /Users/suenot/projects/trading/marketmaker/video_maker/input/muxy-terminal-focus/muxy-sales-brief.md \
  --video --video-format Short --language English \
  --video-prompt "Make one focused 30-45 second sales Short. Hook: working on several projects with different AI coding agents makes focus and context hard to maintain. Show the before/after of active and parked projects plus one configured remote workspace. Position Muxy as a lightweight macOS terminal workspace. Say that the remote server, Docker environment, account, and agent are configured by the developer, not provided by Muxy. End with: Muxy for Mac. If you work this way, it is worth trying." \
  --headless --debug --timeout 1800
```

- [ ] **Step 2: Verify there is exactly one new Short artifact**

Run:

```bash
find /Users/suenot/projects/sdvg/gaia/output -maxdepth 1 -type f -mmin -30 -name '*.mp4' -print | sort
```

Expected: one new Short MP4 from this task, and no second Short generation.

- [ ] **Step 3: Verify vertical format and duration**

Run:

```bash
ffprobe -v error -show_entries format=duration:stream=width,height,codec_name \
  -of default=noprint_wrappers=1 /absolute/path/to/the/new/short.mp4
```

Confirm portrait dimensions, a duration between 30 and 45 seconds when the generator permits it, and a valid audio stream. Replace the path with the single MP4 identified in Step 2.

### Task 6: Final local review and handoff

**Files:**
- Review: `output/muxy-terminal-focus/muxy-terminal-focus.mp4` and its generated metadata/thumbnail.
- Review: the single NotebookLM Short MP4.
- Do not modify: YouTube or publication state.

**Interfaces:**
- Consumes: outputs from Tasks 4 and 5.
- Produces: a concise review package with absolute file paths, durations, dimensions, and any factual or visual issues found.

- [ ] **Step 1: Check copy and visuals against acceptance criteria**

Confirm the first ten seconds lead with the multi-project focus pain, Muxy appears as the solution, active/parked projects and remote workflow are visible, macOS-only is stated, the CTA is readable, and no claim says Muxy provides servers, Docker, accounts, or agents.

- [ ] **Step 2: Confirm no publication occurred**

Run:

```bash
rg -n "publish.py|youtube.com|studio.youtube.com" /Users/suenot/projects/trading/marketmaker/video_maker/input/muxy-terminal-focus /Users/suenot/projects/trading/marketmaker/video_maker/output/muxy-terminal-focus 2>/dev/null || true
```

Expected: no upload command or YouTube Studio action was run for this task.

- [ ] **Step 3: Hand off the files for user review**

Report the exact local paths and a short note for each asset. Do not call any publisher, CRM publication endpoint, or upload loop until the user explicitly approves the rendered result.
