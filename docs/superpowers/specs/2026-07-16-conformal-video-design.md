# Self-authored video: conformal-prediction-trading

Date: 2026-07-16
Status: approved (design)

## Goal

Produce a 15–20 minute English video for `conformal-prediction-trading` — an
article that has no video — **without NotebookLM**. We write the script, we
synthesize the narration, and we build every frame ourselves.

This is the first video on a pipeline we own end to end. NotebookLM gives us a
podcast-style read and generic slides; it cannot show a coverage interval
missing a return. The reason to build this path is that the data animation is
the explanation.

## Source material

| Input | Path |
|---|---|
| Article (EN, 4806 words) | `marketmaker-cc-landing/src/content/blog/conformal-prediction-trading.en.md` |
| Paper (LaTeX, real numbers) | `arxiv_paper_conformal/paper/main.tex` |
| Experiment records | `arxiv_paper_conformal/results/records.csv`, `results.json` |
| Existing figures | `arxiv_paper_conformal/paper/figures/*.pdf` |

The paper is the spine: 180 experiments, 14 interval methods, nominal 90%, over
iid / AR(1) / GARCH(1,1) / regime-break processes where the true conditional
quantiles are known. Every number on screen must come from `results.json` or
the paper — never from the model's memory.

## Narrative

The paper's verdict splits, and that split is the story:

1. Cold open — you asked for 90%. Do you get it?
2. Why position sizing needs uncertainty (Kelly, mean-variance, VaR all assume)
3. Nonconformity scores: the residual distribution and its quantile
4. Split conformal, five steps
5. Why it works: rank uniformity (no distributional assumption)
6. The experiment: 180 runs, 14 methods, 4 processes
7. **Marginal coverage survives** — 0.901 / 0.901 / 0.895 (iid/AR(1)/GARCH), 0.877 on breaks; ACI 0.900 everywhere
8. **Conditional coverage breaks** — GARCH volatility terciles: 0.952 / 0.915 / 0.820. Under-covers by 8 points exactly where a sizer needs honesty
9. **The fix** — normalize the score by EWMA volatility: spread 0.134 → 0.040
10. **Breaks** — first 60 steps after a break: 0.562 coverage
11. **ACI repairs it** — 0.700–0.875, monotone in learning rate, at 1.12–1.14× oracle width
12. **Honesty costs width** — Gaussian–EWMA is narrowest (0.99–1.03×) but quietly under-covers (0.878–0.888)
13. **Folklore correction** — at 90%, fat tails make a correctly-scaled Gaussian *over*-cover
14. The recipe: normalize by a vol proxy, add ACI when breaks matter, treat parametric narrowness as a liability
15. Outro — article + paper links

~15 scenes, ~2500 words of narration.

## Architecture

Four stages, each independently runnable and inspectable. The interface between
stages is a file on disk, so any stage can be re-run without the others.

```
script.json ──> tts_narrate.py ──> audio/scene_NN.mp3 + timings.json
                                          │
                                          ├──> render_data_anim.py ──> anim/scene_NN/frame_%05d.png
                                          │
                                          └──> build_comps.py ──> comps/scene_NN.comp
                                                     │
                                          build_fcpxml.py ──> timeline.fcpxml
                                                     │
                                                assemble.py (MCP) ──> Resolve ──> mp4
```

### 1. `script.json` — the single source of truth

Hand-authored (by Claude, reviewed by the user). One entry per scene:

```json
{
  "id": "07_marginal",
  "narration": "Marginal coverage survives stationary dependence...",
  "visual": "coverage_bars",
  "data": {"iid": 0.901, "ar1": 0.901, "garch": 0.895, "break": 0.877},
  "title": "Marginal coverage holds"
}
```

Durations are absent by design — they are an *output* of TTS, not an input.

### 2. `tts_narrate.py` — narration and, more importantly, timing

edge-tts (`en-US-AndrewNeural`), free, no API key, verified working. Per scene it
emits an mp3 plus word-boundary timings. Those timings are what let text appear
on the word it belongs to, and they set each scene's exact frame count.

### 3. `render_data_anim.py` — the data animation

matplotlib reads `results.json` / `records.csv` and writes a PNG sequence per
animated scene at 30fps, on the brand palette. This is where the explanation
lives: the quantile sweeping the residual distribution, the interval band
breathing with volatility, the coverage counter drifting to 0.820, ACI clawing
back after a break.

matplotlib rather than Fusion because these curves are computed from real
experiment data; hand-placing them as Fusion spline points would be both
laborious and a lie.

### 4. `build_comps.py` — Fusion motion graphics

Generates a `.comp` per scene from templates. The format is a plain Lua table
(`Background`, `TextPlus`, `Merge`, `BezierSpline` keyframes) — verified by
exporting a comp built through MCP. A `Loader` node pulls the PNG sequence for
data scenes, so Fusion composites the animation with titles, callouts and
kinetic text keyed to the TTS word timings.

### 5. Assembly — the part we already proved

Today's finding stands: Resolve's API cannot give a still an explicit duration
and exposes no trim, but FCPXML carries exact durations. So:

1. `build_fcpxml.py` (already committed) lays out N scenes as stills of exact
   TTS-derived duration + the narration track, and Resolve imports it.
2. For each timeline item, attach the scene's comp via
   `timeline_item_fusion.add_comp` + `import_comp`. **The comp inherits the
   clip's duration from the FCPXML layout** — this is how we dodge the
   150-frame generator default that bit us.
3. Render the timeline to mp4.

## Risks

| Risk | Mitigation |
|---|---|
| A comp attached to a still may not render across the clip's full duration | Probe scene 1 end-to-end before building all 15. This is the load-bearing assumption. |
| Fusion `Loader` may not resolve a PNG sequence path | Fall back to importing the sequence to the media pool and compositing it on a second video track. |
| `VideoQuality` was ignored on today's render (879 MB for 15 min) | Set an explicit bitrate and verify the output size before calling it done. |
| Script drifts from the paper's numbers | Every on-screen number is read from `results.json` by the render script, not typed into the script by hand. |

## Verification

- Each stage is checked on its own output: TTS durations sum to the expected runtime; animation frame counts match TTS durations exactly; the FCPXML import reports zero offline media and zero gaps.
- Scene 1 is rendered and viewed before the remaining scenes are built.
- The final mp4 is probed (frames, duration, codec) and sampled visually at each scene boundary — the same check that caught nothing today only because it was run.
- No claim of "done" without the probe output.

## Out of scope

- The RU version (rebuild with the same comps and a `ru-RU` track once EN is approved)
- YouTube upload (the existing `video_youtube_publish` handles it)
- Reworking the NotebookLM path for the other 84 videoless articles
