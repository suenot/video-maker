# Collection intro brief (shared by all intro builders)

Approved reference: `complex-arbitrage-rust/` (crab captain mascot). Read its `style/STYLE.md`, `style/kit/README.md`, `intro/REVIEW.md`, `intro/src/*.js`, and look at `intro/snapshots/contact-sheet.jpg` + `intro/renders/intro_en.mp4` before starting.

Each collection = its own cartoon world + a MASCOT that tells the story (user loved the mascot-narrator idea). The mascot will later narrate full episodes (15-25 min) in which every NotebookLM slide is redrawn as a cartoon scene, so the kit must include explainer primitives (graphs, charts, tables, formula boards, code, bullet boards) drawn in THIS world's style.

Rules
- Everything in code: HyperFrames + GSAP + SVG/Canvas. No image/video generation. Deterministic (no Math.random/Date.now; seeded RNG). 12 fps line boil, camera/text on continuous time, export 1920x1080 30 fps.
- Copy the crab kit's ARCHITECTURE (core/time/rng/spline/boil, beat grid with measured `K.G.BARS`, build.py, explainer primitive API) into `<slug>/style/kit/`, but give it a distinct art direction: own palette, line treatment, fonts (Cyrillic + CJK support, local woff2), world, mascot rig. It must not look like a recolored crab world.
- Mascot: appealing, expressive (blinks, squash & stretch, IK arms, gestures), not a stiff puppet.
- Song: `<slug>/intro/song_raw.mp4` (~60 s, Gemini). Cut a 20 s version `song_20s.m4a`: beat-track with librosa (python venv: /private/tmp/claude-501/-Users-suenot-projects-trading-marketmaker/b11d219e-9df0-4524-9925-115de491a952/scratchpad/au/bin/python, has librosa), use `lyrics.srt` (coarse 4 s windows; rolling 3 lines, last line = newly started) to locate the chorus. Typical cut: instrumental intro (2 bars) + full chorus (8 bars) spliced on downbeats with 30 ms crossfade, 0.8 s fade out, loudnorm I=-14 TP=-1.5. Example command used for the crab:
  `ffmpeg -i song_raw.mp4 -filter_complex "[0:a]atrim=0:4.43,asetpts=PTS-STARTPTS[a];[0:a]atrim=17.58:33.19,asetpts=PTS-STARTPTS,afade=t=out:st=14.81:d=0.8[b];[a][b]acrossfade=d=0.03:c1=tri:c2=tri,loudnorm=I=-14:TP=-1.5:LRA=11[o]" -map "[o]" -ar 48000 -c:a aac -b:a 192k song_20s.m4a`
  If no lyrics.srt exists, find sections by energy/novelty and choose the most hooky 20 s. Write the measured downbeats into the kit beat grid; land every major move on a downbeat and illustrate the sung lines.
- Final 4-5 s: title card with collection title; render en/ru/zh-CN/zh-TW (titles below), song muxed, plus silent copies. Renders in `intro/renders/` (git-ignored).
- QA: `npx hyperframes lint` + `check` pass; contact sheet 1 frame/s at `intro/snapshots/contact-sheet.jpg`; LOOK at it (Read tool) and do >=3 critique/fix rounds (readability, no text overlap, no empty frames, motion not stiff, on-beat). Log in `intro/REVIEW.md`. Integrated loudness about -14 LUFS.
- Git: repo is video_maker. Commit only your own `<slug>/` sources with clear messages, then `git pull --rebase` and `git push` (other agents push in parallel; retry on conflict). Never touch other collections, channels/marketmaker.json, scripts/run_pipeline.sh. No mp4/m4a in git.
- Renders are CPU heavy and other agents render in parallel: if a render fails from load/timeouts, wait and retry, don't give up.

Report (<250 words): mascot/world summary, second-by-second outline, paths, known weaknesses.
