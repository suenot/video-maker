# Episode prep brief (shared by all prep agents)

Goal: for one article + language, produce the analysis inputs so scene builders can re-animate the NotebookLM episode as a cartoon drawn entirely in code.
**User rule: NotebookLM slide images are NEVER shown in the final video.** They are only a content reference; every frame is redrawn in code in the collection style.

Reference example (done, follow its format exactly): `complex-arbitrage-rust/episodes/complex-arbitrage-graph-algorithms/en/prep/` (SCENES.md, slide_starts.json, timeline.json, subtitles.json, slides_text.json, audio_info.txt).

Inputs
- Audio + slides: `video_maker/input/notebooklm-sources/<slug>/<lang>/{audio.m4a,slides.pdf}`
- Article: `/Users/suenot/projects/trading/marketmaker/marketmaker-cc-landing/src/content/blog/<slug>.<en|ru>.md` (zh: use en article for fact checks)
- Existing scripts (reuse, don't rewrite): `video_maker/scripts/pdf_to_images.py`, `extract_pdf_text.py`, `extract_subtitles.py`, `sync_slides.py`. Python env is `video_maker/.venv/bin/python3` (NOT venv/).

Output dir: `video_maker/collections/<collection>/episodes/<slug>/<lang>/prep/`

Steps
1. pdf_to_images (dpi 200) → prep/slides/; OCR (eng/rus/chi_sim/chi_tra) → slides_text.json; Whisper `small` with word timestamps → subtitles.json (language en/ru/zh); audio_info.txt (ffprobe duration).
2. Slide timing: run sync_slides, but expect it to fail (it fell back to an even split last time). Set boundaries by hand from the transcript (hosts often read section headings aloud) → slide_starts.json + timeline.json; note confidence per boundary.
3. Look at every slide PNG (Read tool). Write SCENES.md: per slide: time range, FULL content (titles, bullets, exact numbers, formulas, code, tables, diagram layout/labels — exact enough to redraw), narration beats with timestamps for animation triggers. Split slides longer than ~90 s into sub-scenes by topic. Cross-check facts against the article; flag NotebookLM errors/hallucinations and state the corrected version to use.
4. Commit SCENES.md, slide_starts.json, timeline.json, slides_text.json, audio_info.txt, subtitles.json (if <2 MB) — not PNG/PDF/audio. `git pull --rebase --autostash && git push`. Never touch channels/marketmaker.json, scripts/run_pipeline.sh, or other agents' files.
Whisper is CPU-heavy and several agents run in parallel; it's fine to be slow. Do not stop to wait on a monitor without checking back; poll the process.

## Machine load rule (12 CPUs, shared by ~20 agents)
Run every Whisper call through the global slot limiter (max 2 at once, 4 threads each):
`collections/tools/heavy_slot.sh whisper .venv/bin/python3 scripts/extract_subtitles.py ...`
Run sequentially within your own batch — never start several Whisper jobs yourself.
