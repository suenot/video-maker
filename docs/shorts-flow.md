# Cutting Shorts from a finished video

A video always comes first; Shorts are cut from it afterwards. One video yields
several Shorts, each carrying a *different* idea from it — not the same clip
trimmed twice, and not a vertical copy of the whole video.

Why several: the slide deck routinely says more than the narration covers. A
Brief audio over a ten-slide deck leaves half the deck unused, and that unused
material is exactly what a second and third Short are made of.

## Choosing the ideas

Read the deck and the SRT, then list the ideas that stand on their own — each
must make sense to someone who has not seen the video. A useful set for a
technical piece is: the mechanism, the counter-intuitive consequence, the
number that decides it, and the defence. Four ideas, four Shorts.

## English channels: NotebookLM

`Short Video Overview` renders Latin script only, so this path is for English.
Give it a storyboard for ONE idea, not a summary of the whole video:

```
cd ~/projects/sdvg/gaia
venv/bin/python notebooklm_gen.py \
  --notebook "<the notebook the video came from>" \
  --video --video-format Short --language English \
  --video-prompt "Vertical short, 5 beats, punchy and concrete.
1) HOOK: ...
2) PAIN: ...
3) MECHANICS: ...
4) DEFENSE: ...
5) TAKEAWAY: ...
English only, large legible on-screen text, no dense paragraphs."
```

Reuse the notebook that produced the video — the sources are already there.

## Russian and Chinese channels: our own renderer

NotebookLM turns Cyrillic and CJK subtitles into tofu squares and puts English
headings in frame, so those Shorts are rendered locally from the finished video
and its SRT:

```
venv/bin/python scripts/make_short.py \
  --video output/<slug>/<slug>_zh.mp4 \
  --srt   output/<slug>/<slug>_zh.srt \
  --lang zh --start 7.6 --end 46.4 \
  --title "<hook line, pinned at the top>" \
  --out output/<slug>-short-zh/<slug>-short-zh.mp4
```

Pick the window around one idea, and write a hook title that is not the video's
title. Check one rendered frame before uploading — the font fallback is the
thing that breaks silently.

## Publishing

Same publisher as any video; the title carries `#Shorts`:

```
cd ~/projects/trading/marketmaker/video_youtube_publish
venv/bin/python publish.py --video <short.mp4> --metadata <meta.json> \
  --channel-handle @marketmaker-zh --visibility public --debug
```

`publish.py` refuses to upload a title the channel already has (exit 10) and
aborts if the channel switch did not land (exit 5) — so a retry after a failure
is safe. Set the video language afterwards with `edit_details.py --language`.

Finally record each Short in the CRM against its parent video, with a note of
which idea it carries.
