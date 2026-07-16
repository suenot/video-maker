# Self-Authored Conformal Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 15–20 minute English video for `conformal-prediction-trading` with our own script, our own synthesized narration, and our own animated frames — no NotebookLM.

**Architecture:** A four-stage pipeline joined by files on disk: `script.json` (content) → edge-tts (narration + word timings) → matplotlib (data animation as PNG sequences) → Fusion comps → FCPXML → Resolve render. Each stage is runnable and inspectable alone. Timing flows one way: TTS decides scene durations, everything else follows.

**Tech Stack:** Python 3.9+, edge-tts, matplotlib, ffmpeg, DaVinci Resolve Studio 21 via MCP.

## Global Constraints

- Work inside `/Users/suenot/projects/trading/marketmaker/video_maker` (git repo, remote `git@github.com:suenot/video-maker.git`, branch `main`).
- Python is `$PROJECT_DIR/venv/bin/python3` — the convention `scripts/run_pipeline.sh:16` already uses. Never call bare `python3` in committed scripts.
- **Every on-screen number is read at render time from `arxiv_paper_conformal/results/results.json`.** Never hardcode a statistic in `script.json` or in a comp. A number typed by hand is a number that silently goes stale.
- Brand palette (from `marketmaker-cc-landing/src/styles/globals.css`): background `#0d0f14`, text `#e0e6ed`, muted `#8ba1b3`, blue `#b4d3ff`, green `#c3ef94`, amber `#ffd8a8`.
- Video format: 1920×1080, 30fps, H.264/AAC.
- Slug: `conformal-prediction-trading`. Language: `en`. Voice: `en-US-AndrewNeural`.
- Data path root: `/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json`.
- Run tests with `$PROJECT_DIR/venv/bin/python3 -m pytest tests/ -v`.

## File Structure

```
video_maker/
  selfmade/
    __init__.py          # package marker
    palette.py           # brand colors, one source of truth
    schema.py            # script.json load + validation, data-ref resolution
    narrate.py           # edge-tts -> mp3 + word timings
    anim.py              # matplotlib -> PNG sequences (one function per visual)
    comps.py             # .comp file generation from templates
    layout.py            # scene durations -> FCPXML
  content/
    conformal-prediction-trading.en.json   # the script (tracked in git)
  tests/
    test_schema.py
    test_narrate.py
    test_anim.py
    test_comps.py
    test_layout.py
  build/                 # generated, gitignored
    audio/ anim/ comps/ timeline.fcpxml
```

Responsibilities are split so each file holds one idea: `palette` knows colors, `schema` knows the script's shape, `narrate` knows speech, `anim` knows plots, `comps` knows Fusion's file format, `layout` knows the timeline. Assembly into Resolve is done by the agent over MCP (Task 7) — the Resolve session is interactive state, not a pure function, so it does not get a script.

---

### Task 1: Bootstrap the package, palette, and script schema

**Files:**
- Create: `selfmade/__init__.py`, `selfmade/palette.py`, `selfmade/schema.py`
- Create: `tests/test_schema.py`
- Modify: `.gitignore` (add `build/`, `venv/`)
- Create: `requirements-selfmade.txt`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `palette.BG, FG, MUTED, BLUE, GREEN, AMBER` (hex strings)
  - `schema.load_script(path) -> dict` — raises `ValueError` on invalid script
  - `schema.resolve_data_ref(ref: str, results: dict) -> float` — `"marginal_coverage.iid.split_abs.coverage"` → `0.900685...`
  - `schema.Scene` keys: `id, title, narration, visual, data_refs` (dict of name → ref string)

- [ ] **Step 1: Create the venv and install dependencies**

```bash
cd /Users/suenot/projects/trading/marketmaker/video_maker
python3 -m venv venv
./venv/bin/pip install -q edge-tts matplotlib pytest
./venv/bin/python3 -c "import edge_tts, matplotlib; print('deps ok')"
```

Expected output: `deps ok`

Then write `requirements-selfmade.txt`:

```
edge-tts>=6.1.0
matplotlib>=3.7.0
pytest>=7.0.0
```

- [ ] **Step 2: Write the failing test**

Create `tests/test_schema.py`:

```python
import json
import pytest
from selfmade import schema


def test_resolve_data_ref_reads_nested_value():
    results = {"marginal_coverage": {"iid": {"split_abs": {"coverage": 0.9007}}}}
    assert schema.resolve_data_ref("marginal_coverage.iid.split_abs.coverage", results) == 0.9007


def test_resolve_data_ref_rejects_missing_path():
    with pytest.raises(KeyError):
        schema.resolve_data_ref("marginal_coverage.nope.split_abs.coverage", {"marginal_coverage": {}})


def test_load_script_accepts_valid(tmp_path):
    p = tmp_path / "s.json"
    p.write_text(json.dumps({
        "slug": "x", "lang": "en", "voice": "en-US-AndrewNeural",
        "scenes": [{"id": "01_hook", "title": "T", "narration": "Words here.",
                    "visual": "title_card", "data_refs": {}}],
    }))
    assert schema.load_script(p)["scenes"][0]["id"] == "01_hook"


def test_load_script_rejects_duplicate_scene_ids(tmp_path):
    p = tmp_path / "s.json"
    p.write_text(json.dumps({
        "slug": "x", "lang": "en", "voice": "v",
        "scenes": [
            {"id": "dup", "title": "A", "narration": "a", "visual": "title_card", "data_refs": {}},
            {"id": "dup", "title": "B", "narration": "b", "visual": "title_card", "data_refs": {}},
        ],
    }))
    with pytest.raises(ValueError, match="duplicate"):
        schema.load_script(p)


def test_load_script_rejects_empty_narration(tmp_path):
    p = tmp_path / "s.json"
    p.write_text(json.dumps({
        "slug": "x", "lang": "en", "voice": "v",
        "scenes": [{"id": "a", "title": "A", "narration": "  ", "visual": "title_card", "data_refs": {}}],
    }))
    with pytest.raises(ValueError, match="narration"):
        schema.load_script(p)
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `./venv/bin/python3 -m pytest tests/test_schema.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'selfmade'`

- [ ] **Step 4: Write the implementation**

Create `selfmade/__init__.py` (empty file).

Create `selfmade/palette.py`:

```python
"""Brand colors, mirrored from marketmaker-cc-landing/src/styles/globals.css."""

BG = "#0d0f14"
FG = "#e0e6ed"
MUTED = "#8ba1b3"
BLUE = "#b4d3ff"
GREEN = "#c3ef94"
AMBER = "#ffd8a8"

# Semantic aliases used by the animations.
NOMINAL = MUTED      # the 90% line you asked for
COVERED = GREEN      # coverage that holds
MISSED = AMBER       # coverage that does not
HIGHLIGHT = BLUE
```

Create `selfmade/schema.py`:

```python
"""Load and validate a video script, and resolve its references into results.json."""

import json
from pathlib import Path

VISUALS = {
    "title_card",
    "coverage_bars",
    "tercile_drift",
    "break_trajectory",
    "residual_quantile",
    "width_scatter",
    "bullets",
}

REQUIRED_SCENE_KEYS = {"id", "title", "narration", "visual", "data_refs"}


def resolve_data_ref(ref, results):
    """Resolve a dotted path into results.json. Raises KeyError if it does not exist."""
    node = results
    for part in ref.split("."):
        if not isinstance(node, dict) or part not in node:
            raise KeyError(f"data_ref {ref!r} does not resolve: missing {part!r}")
        node = node[part]
    return node


def load_script(path):
    """Load a script file, validating its shape. Raises ValueError on any problem."""
    data = json.loads(Path(path).read_text())

    for key in ("slug", "lang", "voice", "scenes"):
        if key not in data:
            raise ValueError(f"script missing top-level key {key!r}")
    if not data["scenes"]:
        raise ValueError("script has no scenes")

    seen = set()
    for i, scene in enumerate(data["scenes"]):
        missing = REQUIRED_SCENE_KEYS - set(scene)
        if missing:
            raise ValueError(f"scene {i} missing keys: {sorted(missing)}")
        if scene["id"] in seen:
            raise ValueError(f"duplicate scene id {scene['id']!r}")
        seen.add(scene["id"])
        if not scene["narration"].strip():
            raise ValueError(f"scene {scene['id']!r} has empty narration")
        if scene["visual"] not in VISUALS:
            raise ValueError(f"scene {scene['id']!r} has unknown visual {scene['visual']!r}")

    return data


def validate_data_refs(script, results):
    """Every data_ref in the script must resolve. Returns the number checked."""
    n = 0
    for scene in script["scenes"]:
        for name, ref in scene["data_refs"].items():
            resolve_data_ref(ref, results)
            n += 1
    return n
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `./venv/bin/python3 -m pytest tests/test_schema.py -v`
Expected: PASS — 5 passed

- [ ] **Step 6: Update .gitignore**

Append to `.gitignore`:

```
# Self-authored video pipeline
venv/
build/
selfmade/__pycache__/
```

- [ ] **Step 7: Commit**

```bash
git add selfmade/ tests/test_schema.py requirements-selfmade.txt .gitignore
git commit -m "feat: script schema and brand palette for the self-authored video path"
```

---

### Task 2: Author the script

**Files:**
- Create: `content/conformal-prediction-trading.en.json`
- Create: `tests/test_content.py`

**Interfaces:**
- Consumes: `schema.load_script`, `schema.validate_data_refs`
- Produces: the script file every later task reads. Scene ids are ordered `01_hook` … `15_outro` and are used as filename stems throughout (`build/audio/01_hook.mp3`, `build/anim/01_hook/`, `build/comps/01_hook.comp`).

- [ ] **Step 1: Write the failing test**

Create `tests/test_content.py`:

```python
import json
from pathlib import Path

from selfmade import schema

SCRIPT = Path(__file__).parent.parent / "content" / "conformal-prediction-trading.en.json"
RESULTS = Path("/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json")


def test_script_is_valid():
    script = schema.load_script(SCRIPT)
    assert script["slug"] == "conformal-prediction-trading"
    assert script["lang"] == "en"


def test_every_data_ref_resolves():
    script = schema.load_script(SCRIPT)
    results = json.loads(RESULTS.read_text())
    assert schema.validate_data_refs(script, results) > 0


def test_runtime_is_in_the_15_to_20_minute_range():
    """At ~150 words/min, the script must land in the target runtime."""
    script = schema.load_script(SCRIPT)
    words = sum(len(s["narration"].split()) for s in script["scenes"])
    minutes = words / 150
    assert 14 <= minutes <= 21, f"{words} words = {minutes:.1f} min, outside the 15-20 min target"


def test_scene_ids_are_ordered_and_filename_safe():
    script = schema.load_script(SCRIPT)
    ids = [s["id"] for s in script["scenes"]]
    assert ids == sorted(ids), "scene ids must sort into playback order"
    for sid in ids:
        assert sid.replace("_", "").isalnum(), f"{sid!r} is not filename-safe"
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./venv/bin/python3 -m pytest tests/test_content.py -v`
Expected: FAIL — `FileNotFoundError` for the content file

- [ ] **Step 3: Write the script**

Create `content/conformal-prediction-trading.en.json`. Read
`marketmaker-cc-landing/src/content/blog/conformal-prediction-trading.en.md` and
`arxiv_paper_conformal/paper/main.tex` first — the narration must reflect what
they actually claim.

Follow the 15-scene narrative from the spec. Rules for the prose:

- Write for the ear: short sentences, one idea each. No bullet-speak.
- Never say a number the animation is not showing.
- Put every statistic in `data_refs`, and phrase the narration so the value is
  spoken by the animation, not baked into the text. Where the narration must
  say a number aloud, it stays a word ("eighty-two percent") and the ref is the
  authority for what is drawn.
- Target ~2500 words total; scene 7 through 12 (the results) carry the weight.

The skeleton, with the real refs (verified to resolve):

```json
{
  "slug": "conformal-prediction-trading",
  "lang": "en",
  "voice": "en-US-AndrewNeural",
  "scenes": [
    {
      "id": "01_hook",
      "title": "You asked for 90%",
      "visual": "title_card",
      "narration": "You asked your model for a ninety percent prediction interval. ...",
      "data_refs": {}
    },
    {
      "id": "07_marginal",
      "title": "Marginal coverage holds",
      "visual": "coverage_bars",
      "narration": "Start with the good news. ...",
      "data_refs": {
        "iid": "marginal_coverage.iid.split_abs.coverage",
        "ar1": "marginal_coverage.ar1.split_abs.coverage",
        "garch": "marginal_coverage.garch.split_abs.coverage",
        "break": "marginal_coverage.break.split_abs.coverage",
        "aci_garch": "marginal_coverage.garch.aci_abs_g0.05.coverage"
      }
    },
    {
      "id": "08_conditional",
      "title": "Conditional coverage breaks",
      "visual": "tercile_drift",
      "narration": "Now the bad news. ...",
      "data_refs": {
        "low": "conditional_coverage_garch.methods.split_abs.cov_vol_low",
        "mid": "conditional_coverage_garch.methods.split_abs.cov_vol_mid",
        "high": "conditional_coverage_garch.methods.split_abs.cov_vol_high.mean",
        "spread": "conditional_coverage_garch.methods.split_abs.vol_cov_spread.mean"
      }
    },
    {
      "id": "09_normalize",
      "title": "Normalize the score",
      "visual": "tercile_drift",
      "narration": "The fix is small. ...",
      "data_refs": {
        "low": "conditional_coverage_garch.methods.split_norm.cov_vol_low",
        "mid": "conditional_coverage_garch.methods.split_norm.cov_vol_mid",
        "high": "conditional_coverage_garch.methods.split_norm.cov_vol_high.mean",
        "spread": "conditional_coverage_garch.methods.split_norm.vol_cov_spread.mean"
      }
    }
  ]
}
```

Fill in all 15 scenes: `01_hook`, `02_why_sizing`, `03_nonconformity`
(`residual_quantile`), `04_split_conformal` (`bullets`), `05_why_it_works`
(`bullets`), `06_experiment` (`bullets`), `07_marginal`, `08_conditional`,
`09_normalize`, `10_break` (`break_trajectory`), `11_aci` (`break_trajectory`),
`12_width` (`width_scatter`), `13_folklore` (`bullets`), `14_recipe`
(`bullets`), `15_outro` (`title_card`).

Verify each new ref resolves before moving on:

```bash
./venv/bin/python3 -c "
import json
from selfmade import schema
s = schema.load_script('content/conformal-prediction-trading.en.json')
r = json.load(open('/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json'))
print('refs ok:', schema.validate_data_refs(s, r))
print('words:', sum(len(x['narration'].split()) for x in s['scenes']))
"
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `./venv/bin/python3 -m pytest tests/test_content.py -v`
Expected: PASS — 4 passed

- [ ] **Step 5: Commit**

```bash
git add content/ tests/test_content.py
git commit -m "content: script for the conformal prediction video"
```

---

### Task 3: Narration and timings

**Files:**
- Create: `selfmade/narrate.py`
- Create: `tests/test_narrate.py`

**Interfaces:**
- Consumes: `schema.load_script`
- Produces:
  - `narrate.synthesize(text, voice, out_mp3) -> list[dict]` — each `{"word": str, "start": float, "end": float}` in seconds. Writes the mp3.
  - `narrate.narrate_script(script, out_dir) -> dict` — writes `out_dir/<scene_id>.mp3` per scene and returns `{scene_id: {"duration": float, "words": [...]}}`, also written to `out_dir/timings.json`.
  - Durations are measured from the audio via ffprobe, never estimated.

- [ ] **Step 1: Write the failing test**

Create `tests/test_narrate.py`:

```python
import pytest

from selfmade import narrate

pytestmark = pytest.mark.network  # edge-tts calls Microsoft's endpoint


def test_synthesize_writes_audio_and_returns_word_timings(tmp_path):
    out = tmp_path / "t.mp3"
    words = narrate.synthesize("Coverage is ninety percent.", "en-US-AndrewNeural", out)

    assert out.exists() and out.stat().st_size > 1000
    assert [w["word"] for w in words][:2] == ["Coverage", "is"]
    assert words[0]["start"] < words[-1]["start"]
    assert all(w["end"] > w["start"] for w in words)


def test_probe_duration_matches_audio(tmp_path):
    out = tmp_path / "t.mp3"
    narrate.synthesize("One two three four five.", "en-US-AndrewNeural", out)
    d = narrate.probe_duration(out)
    assert 1.0 < d < 6.0
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./venv/bin/python3 -m pytest tests/test_narrate.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'selfmade.narrate'`

- [ ] **Step 3: Write the implementation**

Create `selfmade/narrate.py`:

```python
"""Synthesize narration with edge-tts and recover per-word timings.

The word timings are the reason this stage exists: they let text land on the
word it belongs to, and they set each scene's exact duration.
"""

import asyncio
import json
import subprocess
from pathlib import Path

import edge_tts

TICKS_PER_SECOND = 10_000_000  # edge-tts reports offsets in 100ns ticks


async def _stream(text, voice, out_mp3):
    communicate = edge_tts.Communicate(text, voice)
    words = []
    with open(out_mp3, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS_PER_SECOND
                words.append({
                    "word": chunk["text"],
                    "start": start,
                    "end": start + chunk["duration"] / TICKS_PER_SECOND,
                })
    return words


def synthesize(text, voice, out_mp3):
    """Write narration audio and return [{word, start, end}] in seconds."""
    out_mp3 = Path(out_mp3)
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    return asyncio.run(_stream(text, voice, out_mp3))


def probe_duration(path):
    """Exact audio duration in seconds, measured rather than guessed."""
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def narrate_script(script, out_dir):
    """Narrate every scene. Returns {scene_id: {duration, words}}."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    timings = {}
    for scene in script["scenes"]:
        mp3 = out_dir / f"{scene['id']}.mp3"
        words = synthesize(scene["narration"], script["voice"], mp3)
        timings[scene["id"]] = {"duration": probe_duration(mp3), "words": words}
        print(f"  {scene['id']}: {timings[scene['id']]['duration']:.2f}s, {len(words)} words")

    (out_dir / "timings.json").write_text(json.dumps(timings, indent=2))
    return timings
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `./venv/bin/python3 -m pytest tests/test_narrate.py -v`
Expected: PASS — 2 passed

- [ ] **Step 5: Narrate the whole script**

```bash
./venv/bin/python3 -c "
from selfmade import schema, narrate
s = schema.load_script('content/conformal-prediction-trading.en.json')
t = narrate.narrate_script(s, 'build/audio')
total = sum(v['duration'] for v in t.values())
print(f'TOTAL {total/60:.1f} min')
"
```

Expected: a per-scene list and a total between 14 and 21 minutes. **If the total
is outside that range, fix the script in Task 2 and re-run — do not proceed.**

- [ ] **Step 6: Listen to one scene before trusting the voice**

```bash
afplay build/audio/01_hook.mp3
```

Confirm it is intelligible and correctly pronounces "conformal". If a term is
mangled, fix it in `script.json` with respelling and re-narrate that scene.

- [ ] **Step 7: Commit**

```bash
git add selfmade/narrate.py tests/test_narrate.py
git commit -m "feat: edge-tts narration with per-word timings"
```

---

### Task 4: Data animation

**Files:**
- Create: `selfmade/anim.py`
- Create: `tests/test_anim.py`

**Interfaces:**
- Consumes: `palette`, `schema.resolve_data_ref`
- Produces:
  - `anim.render_scene(scene, results, duration, out_dir, fps=30) -> int` — writes `out_dir/frame_%05d.png` and returns the frame count, which always equals `round(duration * fps)`.
  - One private renderer per visual: `_coverage_bars`, `_tercile_drift`, `_break_trajectory`, `_residual_quantile`, `_width_scatter`, `_title_card`, `_bullets`. Each takes `(ax, values, t)` where `t` runs 0→1 across the scene.

- [ ] **Step 1: Write the failing test**

Create `tests/test_anim.py`:

```python
import json
from pathlib import Path

import pytest

from selfmade import anim

RESULTS = json.loads(Path(
    "/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json"
).read_text())


def test_frame_count_matches_duration_exactly(tmp_path):
    scene = {"id": "t", "title": "T", "visual": "coverage_bars",
             "narration": "x", "data_refs": {
                 "iid": "marginal_coverage.iid.split_abs.coverage",
                 "garch": "marginal_coverage.garch.split_abs.coverage"}}
    n = anim.render_scene(scene, RESULTS, duration=2.0, out_dir=tmp_path, fps=30)
    assert n == 60
    assert len(list(tmp_path.glob("frame_*.png"))) == 60


def test_frames_are_1920x1080(tmp_path):
    from PIL import Image
    scene = {"id": "t", "title": "T", "visual": "title_card",
             "narration": "x", "data_refs": {}}
    anim.render_scene(scene, RESULTS, duration=0.2, out_dir=tmp_path, fps=30)
    with Image.open(sorted(tmp_path.glob("frame_*.png"))[0]) as im:
        assert im.size == (1920, 1080)


def test_values_come_from_results_not_literals(tmp_path):
    """The renderer must read the ref, so a changed results dict changes the output."""
    scene = {"id": "t", "title": "T", "visual": "coverage_bars",
             "narration": "x", "data_refs": {"iid": "marginal_coverage.iid.split_abs.coverage"}}
    vals = anim.scene_values(scene, RESULTS)
    assert vals["iid"] == RESULTS["marginal_coverage"]["iid"]["split_abs"]["coverage"]


def test_unknown_visual_is_rejected(tmp_path):
    scene = {"id": "t", "title": "T", "visual": "nope", "narration": "x", "data_refs": {}}
    with pytest.raises(ValueError, match="nope"):
        anim.render_scene(scene, RESULTS, duration=0.1, out_dir=tmp_path)
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./venv/bin/python3 -m pytest tests/test_anim.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'selfmade.anim'`

- [ ] **Step 3: Write the implementation**

Create `selfmade/anim.py`. This is the file that carries the explanation, so
the animation must express the claim, not decorate it:

- `coverage_bars` — bars grow to their coverage, with the nominal 0.90 line drawn first. Bars that reach the line are `COVERED`, the break bar falls short in `MISSED`.
- `tercile_drift` — three bars (low/mid/high volatility) with the 0.90 line; the high-vol bar sinking to 0.820 is the point of the scene. The spread is annotated as it opens.
- `break_trajectory` — coverage vs `rel_time` from `break_trajectory`, the break at t=0 marked, the hole after it filling in; ACI's curve climbing back.
- `residual_quantile` — a histogram of residuals with the quantile line sweeping to the 90th percentile.
- `width_scatter` — width vs coverage, the matched-coverage band shaded, each method a point; the parametric one sits narrow but left of the line.

```python
"""Render a scene's data animation to a PNG sequence.

Numbers are read from results.json through the scene's data_refs. Nothing here
may hardcode a statistic — if a value is not in the data, it does not go on
screen.
"""

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np

from . import palette
from .schema import resolve_data_ref

W, H, DPI = 1920, 1080, 100


def scene_values(scene, results):
    """Resolve every data_ref for a scene into concrete numbers."""
    return {name: resolve_data_ref(ref, results) for name, ref in scene["data_refs"].items()}


def _new_fig():
    fig = plt.figure(figsize=(W / DPI, H / DPI), dpi=DPI, facecolor=palette.BG)
    ax = fig.add_subplot(111, facecolor=palette.BG)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(palette.MUTED)
    ax.tick_params(colors=palette.MUTED, labelsize=14)
    return fig, ax


def _ease(t):
    """Ease-out cubic: motion that settles rather than stops."""
    return 1 - (1 - t) ** 3


def _title_card(ax, scene, values, t):
    ax.axis("off")
    alpha = min(1.0, _ease(t) * 1.5)
    ax.text(0.5, 0.55, scene["title"], color=palette.FG, fontsize=54, ha="center",
            va="center", weight="bold", alpha=alpha, transform=ax.transAxes)


def _bullets(ax, scene, values, t):
    ax.axis("off")
    ax.text(0.08, 0.85, scene["title"], color=palette.FG, fontsize=44,
            weight="bold", transform=ax.transAxes)
    lines = scene.get("lines", [])
    for i, line in enumerate(lines):
        # each line fades in over its own slice of the scene
        share = (i + 1) / max(len(lines), 1)
        alpha = float(np.clip((t - share * 0.6) * 6, 0, 1))
        ax.text(0.10, 0.68 - i * 0.11, line, color=palette.FG, fontsize=30,
                alpha=alpha, transform=ax.transAxes)


def _coverage_bars(ax, scene, values, t):
    labels = list(values)
    heights = [values[k] * _ease(t) for k in labels]
    colors = [palette.COVERED if values[k] >= 0.895 else palette.MISSED for k in labels]
    ax.bar(labels, heights, color=colors, width=0.55)
    ax.axhline(0.90, color=palette.NOMINAL, linestyle="--", linewidth=2)
    ax.text(len(labels) - 0.4, 0.903, "nominal 90%", color=palette.NOMINAL, fontsize=16)
    ax.set_ylim(0.80, 0.95)
    ax.set_ylabel("coverage", color=palette.FG, fontsize=20)
    ax.set_title(scene["title"], color=palette.FG, fontsize=40, weight="bold", pad=30)
    for i, k in enumerate(labels):
        if _ease(t) > 0.9:
            ax.text(i, values[k] + 0.002, f"{values[k]:.3f}", ha="center",
                    color=palette.FG, fontsize=18)


def _tercile_drift(ax, scene, values, t):
    order = ["low", "mid", "high"]
    present = [k for k in order if k in values]
    heights = [values[k] * _ease(t) for k in present]
    colors = [palette.COVERED if values[k] >= 0.895 else palette.MISSED for k in present]
    ax.bar([f"{k} vol" for k in present], heights, color=colors, width=0.5)
    ax.axhline(0.90, color=palette.NOMINAL, linestyle="--", linewidth=2)
    ax.set_ylim(0.78, 0.98)
    ax.set_ylabel("coverage", color=palette.FG, fontsize=20)
    ax.set_title(scene["title"], color=palette.FG, fontsize=40, weight="bold", pad=30)
    for i, k in enumerate(present):
        if _ease(t) > 0.9:
            ax.text(i, values[k] + 0.004, f"{values[k]:.3f}", ha="center",
                    color=palette.FG, fontsize=18)
    if "spread" in values and t > 0.75:
        ax.text(0.5, 0.06, f"spread {values['spread']:.3f}", transform=ax.transAxes,
                ha="center", color=palette.HIGHLIGHT, fontsize=24)


def _break_trajectory(ax, scene, values, t):
    rel = np.array(values["rel_time"])
    cov = np.array(values["coverage"])
    n = max(2, int(len(rel) * _ease(t)))
    ax.plot(rel[:n], cov[:n], color=palette.HIGHLIGHT, linewidth=2.5)
    ax.axhline(0.90, color=palette.NOMINAL, linestyle="--", linewidth=2)
    ax.axvline(0, color=palette.MISSED, linewidth=2)
    ax.text(6, 0.62, "break", color=palette.MISSED, fontsize=18)
    ax.set_xlim(rel[0], rel[-1])
    ax.set_ylim(0.5, 1.0)
    ax.set_xlabel("steps relative to the break", color=palette.FG, fontsize=18)
    ax.set_ylabel("rolling coverage", color=palette.FG, fontsize=20)
    ax.set_title(scene["title"], color=palette.FG, fontsize=40, weight="bold", pad=30)


def _residual_quantile(ax, scene, values, t):
    rng = np.random.default_rng(7)  # fixed seed: the illustration must not flicker between runs
    r = np.abs(rng.standard_normal(4000))
    ax.hist(r, bins=60, color=palette.HIGHLIGHT, alpha=0.55)
    q = np.quantile(r, 0.9 * _ease(t))
    ax.axvline(q, color=palette.AMBER, linewidth=3)
    ax.text(q + 0.05, ax.get_ylim()[1] * 0.85, "90th percentile\nof residuals",
            color=palette.AMBER, fontsize=20)
    ax.set_xlabel("|residual|", color=palette.FG, fontsize=18)
    ax.set_yticks([])
    ax.set_title(scene["title"], color=palette.FG, fontsize=40, weight="bold", pad=30)


def _width_scatter(ax, scene, values, t):
    alpha = _ease(t)
    for name, point in values.items():
        if not isinstance(point, dict):
            continue
        ax.scatter(point["coverage"], point["width_vs_oracle"],
                   s=260, alpha=alpha,
                   color=palette.COVERED if point.get("in_band") else palette.MISSED)
        ax.annotate(name, (point["coverage"], point["width_vs_oracle"]),
                    color=palette.FG, fontsize=15, xytext=(8, 8),
                    textcoords="offset points", alpha=alpha)
    ax.axvspan(0.885, 0.915, color=palette.MUTED, alpha=0.15)
    ax.axvline(0.90, color=palette.NOMINAL, linestyle="--", linewidth=2)
    ax.set_xlabel("coverage", color=palette.FG, fontsize=18)
    ax.set_ylabel("width vs oracle", color=palette.FG, fontsize=20)
    ax.set_title(scene["title"], color=palette.FG, fontsize=40, weight="bold", pad=30)


_RENDERERS = {
    "title_card": _title_card,
    "bullets": _bullets,
    "coverage_bars": _coverage_bars,
    "tercile_drift": _tercile_drift,
    "break_trajectory": _break_trajectory,
    "residual_quantile": _residual_quantile,
    "width_scatter": _width_scatter,
}


def render_scene(scene, results, duration, out_dir, fps=30):
    """Render a scene to out_dir/frame_%05d.png. Returns the frame count."""
    visual = scene["visual"]
    if visual not in _RENDERERS:
        raise ValueError(f"unknown visual {visual!r}")

    from pathlib import Path
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    values = scene_values(scene, results)
    n_frames = round(duration * fps)
    render = _RENDERERS[visual]

    for i in range(n_frames):
        t = (i + 1) / n_frames
        fig, ax = _new_fig()
        render(ax, scene, values, t)
        fig.savefig(out_dir / f"frame_{i:05d}.png", facecolor=palette.BG)
        plt.close(fig)

    return n_frames
```

Note for `break_trajectory` scenes: `rel_time` and `coverage` are long arrays,
so reference them as whole nodes in `data_refs`
(`"rel_time": "break_trajectory.rel_time"`, `"coverage": "break_trajectory.coverage.split_abs"`)
— confirm the exact method key under `break_trajectory.coverage` with:

```bash
./venv/bin/python3 -c "
import json; d=json.load(open('/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json'))
print(list(d['break_trajectory']['coverage'])[:14])"
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `./venv/bin/python3 -m pytest tests/test_anim.py -v`
Expected: PASS — 4 passed

- [ ] **Step 5: Look at a frame before trusting the design**

```bash
./venv/bin/python3 -c "
import json
from selfmade import anim, schema
r = json.load(open('/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json'))
s = schema.load_script('content/conformal-prediction-trading.en.json')
scene = [x for x in s['scenes'] if x['id'] == '08_conditional'][0]
anim.render_scene(scene, r, duration=1.0, out_dir='build/preview', fps=2)
print('wrote build/preview')
"
open build/preview/frame_00001.png
```

The high-vol bar must read as the problem: below the nominal line, in the
`MISSED` color, labelled 0.820. If it does not communicate that at a glance,
fix the renderer now — this frame is the video's central claim.

- [ ] **Step 6: Commit**

```bash
git add selfmade/anim.py tests/test_anim.py
git commit -m "feat: data animations driven by the experiment records"
```

---

### Task 5: Fusion comp generation

**Files:**
- Create: `selfmade/comps.py`
- Create: `tests/test_comps.py`

**Interfaces:**
- Consumes: `palette`
- Produces:
  - `comps.build_comp(scene, png_dir, n_frames, timings) -> str` — the `.comp` file text.
  - `comps.write_comp(scene, png_dir, n_frames, timings, out_path) -> Path`
  - Comps contain `Loader1` (the PNG sequence), `Bg`, `Title` (TextPlus), `Mrg1`, `Mrg2`, `MediaOut1`, plus a `BezierSpline` fading the title in over the first 0.5s.

The format below is copied from a comp exported out of Resolve (verified: a
modified export re-imports with its text and keyframes intact), not from
documentation.

- [ ] **Step 1: Write the failing test**

Create `tests/test_comps.py`:

```python
from selfmade import comps

SCENE = {"id": "07_marginal", "title": "Marginal coverage holds",
         "visual": "coverage_bars", "narration": "x", "data_refs": {}}


def test_comp_contains_required_nodes():
    text = comps.build_comp(SCENE, "/tmp/anim/07_marginal", n_frames=120, timings=None)
    for node in ("Loader1", "Bg", "Title", "Mrg1", "MediaOut1"):
        assert f"{node} = " in text or f"{node} =" in text


def test_comp_points_loader_at_the_sequence():
    text = comps.build_comp(SCENE, "/tmp/anim/07_marginal", n_frames=120, timings=None)
    assert "/tmp/anim/07_marginal/frame_00000.png" in text


def test_comp_declares_the_scene_length():
    text = comps.build_comp(SCENE, "/tmp/anim/x", n_frames=137, timings=None)
    assert "RenderRangeEnd = 136" in text


def test_title_fade_keyframes_are_present():
    text = comps.build_comp(SCENE, "/tmp/anim/x", n_frames=120, timings=None)
    assert "BezierSpline" in text
    assert "[0] = { 0" in text


def test_write_comp_creates_file(tmp_path):
    p = comps.write_comp(SCENE, "/tmp/anim/x", 120, None, tmp_path / "s.comp")
    assert p.exists() and p.read_text().startswith("{")
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./venv/bin/python3 -m pytest tests/test_comps.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'selfmade.comps'`

- [ ] **Step 3: Write the implementation**

Create `selfmade/comps.py`:

```python
"""Generate Fusion .comp files.

The structure mirrors a comp exported from Resolve: a Lua table of tools, with
animated inputs pointing at BezierSpline operators. Fusion composites the
matplotlib sequence and owns the motion graphics on top of it.
"""

from pathlib import Path

from . import palette


def _rgb(hex_color):
    h = hex_color.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


COMP_TEMPLATE = """{{
    Tools = ordered() {{
        Loader1 = Loader {{
            Clips = {{
                Clip {{
                    ID = "Clip1",
                    Filename = "{first_frame}",
                    FormatID = "PNGFormat",
                    StartFrame = 0,
                    LengthSetManually = true,
                    TrimIn = 0,
                    TrimOut = {last_frame},
                    Length = {n_frames},
                }}
            }},
            Inputs = {{
                ["Gamut.SLogVersion"] = Input {{ Value = FuID {{ "SLog2" }}, }},
                GlobalOut = Input {{ Value = {last_frame}, }},
                Loop = Input {{ Value = 1, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ -220, 0 }} }},
        }},
        Bg = Background {{
            Inputs = {{
                GlobalOut = Input {{ Value = {last_frame}, }},
                Width = Input {{ Value = 1920, }},
                Height = Input {{ Value = 1080, }},
                TopLeftRed = Input {{ Value = {bg_r}, }},
                TopLeftGreen = Input {{ Value = {bg_g}, }},
                TopLeftBlue = Input {{ Value = {bg_b}, }},
                TopLeftAlpha = Input {{ Value = 1, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ -220, -60 }} }},
        }},
        Mrg1 = Merge {{
            Inputs = {{
                Background = Input {{ SourceOp = "Bg", Source = "Output", }},
                Foreground = Input {{ SourceOp = "Loader1", Source = "Output", }},
                PerformDepthMerge = Input {{ Value = 0, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ -60, 0 }} }},
        }},
        Title = TextPlus {{
            Inputs = {{
                GlobalOut = Input {{ Value = {last_frame}, }},
                Width = Input {{ Value = 1920, }},
                Height = Input {{ Value = 1080, }},
                Font = Input {{ Value = "Open Sans", }},
                Style = Input {{ Value = "Bold", }},
                StyledText = Input {{ Value = "{lower_third}", }},
                Size = Input {{ Value = 0.035, }},
                Red1 = Input {{ Value = {fg_r}, }},
                Green1 = Input {{ Value = {fg_g}, }},
                Blue1 = Input {{ Value = {fg_b}, }},
                Opacity1 = Input {{ SourceOp = "TitleFade", Source = "Value", }},
                VerticalJustificationNew = Input {{ Value = 3, }},
                HorizontalJustificationNew = Input {{ Value = 3, }},
                Center = Input {{ Value = {{ 0.5, 0.08 }}, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ -60, -60 }} }},
        }},
        TitleFade = BezierSpline {{
            SplineColor = {{ Red = 225, Green = 0, Blue = 225 }},
            NameSet = true,
            KeyFrames = {{
                [0] = {{ 0, RH = {{ {fade_rh}, 0.333 }}, Flags = {{ Linear = true }} }},
                [{fade_end}] = {{ 1, LH = {{ {fade_lh}, 0.667 }}, Flags = {{ Linear = true }} }}
            }}
        }},
        Mrg2 = Merge {{
            Inputs = {{
                Background = Input {{ SourceOp = "Mrg1", Source = "Output", }},
                Foreground = Input {{ SourceOp = "Title", Source = "Output", }},
                PerformDepthMerge = Input {{ Value = 0, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ 110, 0 }} }},
        }},
        MediaOut1 = MediaOut {{
            Inputs = {{
                Index = Input {{ Value = "0", }},
                Input = Input {{ SourceOp = "Mrg2", Source = "Output", }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ 280, 0 }} }},
        }},
    }},
    ActiveTool = "MediaOut1",
    RenderRange = {{ 0, {last_frame} }},
    RenderRangeStart = 0,
    RenderRangeEnd = {last_frame},
}}"""


def build_comp(scene, png_dir, n_frames, timings, lower_third=None):
    """Return the .comp text for a scene.

    png_dir holds the matplotlib sequence; Fusion's Loader reads it directly, so
    the frames never need to enter the media pool.
    """
    bg_r, bg_g, bg_b = _rgb(palette.BG)
    fg_r, fg_g, fg_b = _rgb(palette.FG)
    fade_end = min(15, max(1, n_frames - 1))  # ~0.5s at 30fps

    return COMP_TEMPLATE.format(
        first_frame=str(Path(png_dir) / "frame_00000.png"),
        n_frames=n_frames,
        last_frame=n_frames - 1,
        bg_r=bg_r, bg_g=bg_g, bg_b=bg_b,
        fg_r=fg_r, fg_g=fg_g, fg_b=fg_b,
        lower_third=(lower_third or scene["title"]).replace('"', "'"),
        fade_end=fade_end,
        fade_rh=fade_end / 3,
        fade_lh=fade_end * 2 / 3,
    )


def write_comp(scene, png_dir, n_frames, timings, out_path):
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(build_comp(scene, png_dir, n_frames, timings))
    return out_path
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `./venv/bin/python3 -m pytest tests/test_comps.py -v`
Expected: PASS — 5 passed

- [ ] **Step 5: Commit**

```bash
git add selfmade/comps.py tests/test_comps.py
git commit -m "feat: generate Fusion comps from templates"
```

---

### Task 6: Timeline layout (FCPXML)

**Files:**
- Create: `selfmade/layout.py`
- Create: `tests/test_layout.py`

**Interfaces:**
- Consumes: `narrate` timings
- Produces:
  - `layout.build_fcpxml(script, timings, anim_root, audio_root, out_path, fps=30) -> dict` — writes the FCPXML and returns `{"total_frames": int, "scenes": [{"id", "offset", "frames"}]}`.
  - Each scene is one `<video>` referencing that scene's **first PNG** as a still of exact duration; its narration mp3 is a connected `<audio>` at the scene's offset. The still is a placeholder — Task 7 attaches the Fusion comp that actually renders the animation.

This reuses the finding already committed in `scripts/build_fcpxml.py`: Resolve
ignores a requested still duration through the scripting API, but honors an
FCPXML one.

- [ ] **Step 1: Write the failing test**

Create `tests/test_layout.py`:

```python
import xml.dom.minidom as minidom

from selfmade import layout

SCRIPT = {"slug": "s", "lang": "en", "voice": "v", "scenes": [
    {"id": "01_a", "title": "A", "visual": "title_card", "narration": "a", "data_refs": {}},
    {"id": "02_b", "title": "B", "visual": "title_card", "narration": "b", "data_refs": {}},
]}
TIMINGS = {"01_a": {"duration": 2.0, "words": []}, "02_b": {"duration": 3.0, "words": []}}


def test_scenes_are_laid_end_to_end_with_exact_frames(tmp_path):
    out = tmp_path / "t.fcpxml"
    info = layout.build_fcpxml(SCRIPT, TIMINGS, "/tmp/anim", "/tmp/audio", out, fps=30)
    assert info["scenes"][0] == {"id": "01_a", "offset": 0, "frames": 60}
    assert info["scenes"][1] == {"id": "02_b", "offset": 60, "frames": 90}
    assert info["total_frames"] == 150


def test_fcpxml_parses_and_has_one_video_per_scene(tmp_path):
    out = tmp_path / "t.fcpxml"
    layout.build_fcpxml(SCRIPT, TIMINGS, "/tmp/anim", "/tmp/audio", out, fps=30)
    doc = minidom.parse(str(out))
    assert len(doc.getElementsByTagName("video")) == 2
    assert len(doc.getElementsByTagName("audio")) == 2


def test_durations_reach_the_xml(tmp_path):
    out = tmp_path / "t.fcpxml"
    layout.build_fcpxml(SCRIPT, TIMINGS, "/tmp/anim", "/tmp/audio", out, fps=30)
    doc = minidom.parse(str(out))
    vids = doc.getElementsByTagName("video")
    assert vids[0].getAttribute("duration") == "60/30s"
    assert vids[1].getAttribute("offset") == "60/30s"
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./venv/bin/python3 -m pytest tests/test_layout.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'selfmade.layout'`

- [ ] **Step 3: Write the implementation**

Create `selfmade/layout.py`:

```python
"""Lay scenes onto a timeline as FCPXML.

Resolve's API cannot give a clip an explicit duration and offers no trim;
FCPXML can. Durations come from the measured narration, so the picture cannot
drift from the voice.
"""

from pathlib import Path
from urllib.request import pathname2url


def _url(p):
    return "file://" + pathname2url(str(p))


def build_fcpxml(script, timings, anim_root, audio_root, out_path, fps=30):
    assets, spine, scenes = [], [], []
    offset = 0

    for i, scene in enumerate(script["scenes"]):
        sid = scene["id"]
        frames = round(timings[sid]["duration"] * fps)

        still = Path(anim_root) / sid / "frame_00000.png"
        mp3 = Path(audio_root) / f"{sid}.mp3"
        vid, aud = f"v{i + 1}", f"a{i + 1}"

        assets.append(
            f'<asset id="{vid}" name="{sid}" src="{_url(still)}" start="0s" '
            f'duration="0s" hasVideo="1" format="r1"/>'
        )
        assets.append(
            f'<asset id="{aud}" name="{sid}_audio" src="{_url(mp3)}" start="0s" '
            f'duration="{frames}/{fps}s" hasAudio="1" audioSources="1" '
            f'audioChannels="1" audioRate="24000"/>'
        )
        spine.append(
            f'<video ref="{vid}" offset="{offset}/{fps}s" duration="{frames}/{fps}s" start="0s">'
            f'<audio ref="{aud}" lane="-1" offset="{offset}/{fps}s" '
            f'duration="{frames}/{fps}s" start="0s"/>'
            f'</video>'
        )

        scenes.append({"id": sid, "offset": offset, "frames": frames})
        offset += frames

    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
  <resources>
    <format id="r1" name="FFVideoFormat1080p{fps}" frameDuration="1/{fps}s" width="1920" height="1080" colorSpace="1-1-1 (Rec. 709)"/>
    {"".join(assets)}
  </resources>
  <library>
    <event name="{script['slug']}">
      <project name="{script['slug']}_{script['lang']}">
        <sequence format="r1" duration="{offset}/{fps}s" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
            {"".join(spine)}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>'''

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(xml)
    return {"total_frames": offset, "scenes": scenes}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `./venv/bin/python3 -m pytest tests/test_layout.py -v`
Expected: PASS — 3 passed

- [ ] **Step 5: Commit**

```bash
git add selfmade/layout.py tests/test_layout.py
git commit -m "feat: FCPXML layout from measured narration timings"
```

---

### Task 7: Scene-1 end-to-end probe — GATE

**Files:**
- Create: `docs/fusion-comp-on-still.md` (record what the probe establishes)

**Interfaces:**
- Consumes: everything above.
- Produces: a verified answer to the plan's load-bearing question — **does a Fusion comp attached to an FCPXML still render for the clip's full duration?**

Do not build fifteen scenes on an unverified assumption. Build one.

- [ ] **Step 1: Render the assets for two scenes only**

```bash
cd /Users/suenot/projects/trading/marketmaker/video_maker
./venv/bin/python3 -c "
import json
from selfmade import schema, narrate, anim, comps, layout

script = schema.load_script('content/conformal-prediction-trading.en.json')
results = json.load(open('/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json'))
script['scenes'] = script['scenes'][:2]

timings = json.load(open('build/audio/timings.json'))
timings = {s['id']: timings[s['id']] for s in script['scenes']}

for s in script['scenes']:
    n = anim.render_scene(s, results, timings[s['id']]['duration'], f\"build/anim/{s['id']}\")
    comps.write_comp(s, f\"build/anim/{s['id']}\", n, timings[s['id']], f\"build/comps/{s['id']}.comp\")
    print(s['id'], n, 'frames')

info = layout.build_fcpxml(script, timings, 'build/anim', 'build/audio', 'build/probe.fcpxml')
print(info)
"
```

Expected: two scenes, frame counts equal to `round(duration * 30)`, and a
written `build/probe.fcpxml`.

- [ ] **Step 2: Import into Resolve (agent, over MCP)**

The agent performs these MCP calls — a script cannot, since the Resolve session
is interactive state:

1. `project_manager.create` → `ConformalVideo_Probe`
2. `project_settings.set_setting` → `timelineFrameRate=30`, `timelineResolutionWidth=1920`, `timelineResolutionHeight=1080`
3. `timeline.import_timeline_checked` → `build/probe.fcpxml`
4. `timeline.probe_timeline_structure`

Expected: `media.offline == 0`, two video items whose `duration` matches the
frame counts from Step 1, and `timeline.detect_gaps_overlaps` reporting zero gaps.

- [ ] **Step 3: Attach the comps — the actual question**

For each item (`item_index` 0 and 1):

1. `timeline_item_fusion.add_comp` with `track_type="video", track_index=1, item_index=<i>`
2. `timeline_item_fusion.import_comp` with `path=build/comps/<scene_id>.comp`
3. `fusion_comp.get_tool_list` — confirm `Loader1`, `Title`, `MediaOut1` are present
4. `fusion_comp.get_input` on `Loader1` / `Clip1` — confirm it points at the PNG sequence

- [ ] **Step 4: Render and verify — the gate**

Render via `render.set_format_and_codec` (mp4/H264),
`render.safe_set_render_settings` with `TargetDir=build`, `CustomName=probe`,
then `add_job` / `start`, polling `get_job_status` until `Complete`.

Then check, and believe only the output:

```bash
ffprobe -v error -show_entries format=duration -show_entries stream=nb_frames,width,height \
  -of default=noprint_wrappers=0 build/probe.mp4
# Extract a frame from the MIDDLE and END of scene 1, not just the start:
ffmpeg -v error -ss 1 -i build/probe.mp4 -frames:v 1 -vf scale=480:-1 build/probe_mid.png -y
ffmpeg -v error -sseof -1 -i build/probe.mp4 -frames:v 1 -vf scale=480:-1 build/probe_end.png -y
```

**The gate:** open both frames. The animation must be *progressing* — a
mid-scene frame must differ from the first frame. If every frame after the
first is identical, the comp is rendering one frame of the sequence and
holding; the Loader's `Length`/`GlobalOut`/`Loop` handling is wrong.

If the gate fails, try in order, re-rendering after each:
1. Set `Loop = Input { Value = 0 }` and confirm `TrimOut`/`Length` match `n_frames`.
2. Give `Loader1` an explicit `GlobalIn = 0` alongside `GlobalOut = n_frames - 1`.
3. Fall back: skip Fusion for data scenes — encode each PNG sequence to a scene
   `.mov` with ffmpeg (`-framerate 30 -i frame_%05d.png`), reference those movs
   from the FCPXML instead of stills, and keep comps only for title/bullet
   scenes. Record the fallback in the doc and move on; the data animation is the
   value, Fusion is not.

- [ ] **Step 5: Write down what the probe established**

Create `docs/fusion-comp-on-still.md` stating plainly: whether a comp attached
to an FCPXML still renders across the clip, the exact Loader settings that
worked, and the fallback if it did not. Include the ffprobe output as evidence.

- [ ] **Step 6: Commit**

```bash
git add docs/fusion-comp-on-still.md
git commit -m "docs: what a Fusion comp attached to an FCPXML still actually does"
```

---

### Task 8: Build, render, and verify the full video

**Files:**
- Create: `selfmade/build.py`
- Create: `tests/test_build.py`

**Interfaces:**
- Consumes: every module above.
- Produces: `build.build_all(script_path, results_path, out_root) -> dict` — narrates, animates, writes comps and the FCPXML for all 15 scenes; returns the layout info. Rendering stays with the agent over MCP.

- [ ] **Step 1: Write the failing test**

Create `tests/test_build.py`:

```python
import json
from pathlib import Path

from selfmade import build


def test_build_all_is_consistent_across_stages(tmp_path, monkeypatch):
    """Frame counts, comps, and the FCPXML must agree — a mismatch here is drift."""
    script = {"slug": "s", "lang": "en", "voice": "en-US-AndrewNeural", "scenes": [
        {"id": "01_a", "title": "A", "visual": "title_card", "narration": "One two.", "data_refs": {}},
    ]}
    sp = tmp_path / "s.json"
    sp.write_text(json.dumps(script))
    rp = tmp_path / "r.json"
    rp.write_text(json.dumps({}))

    info = build.build_all(sp, rp, tmp_path / "out")

    sid = info["scenes"][0]["id"]
    frames = info["scenes"][0]["frames"]
    pngs = list((tmp_path / "out" / "anim" / sid).glob("frame_*.png"))
    assert len(pngs) == frames, "animation frames must match the layout"
    assert (tmp_path / "out" / "comps" / f"{sid}.comp").exists()
    assert (tmp_path / "out" / "timeline.fcpxml").exists()
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./venv/bin/python3 -m pytest tests/test_build.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'selfmade.build'`

- [ ] **Step 3: Write the implementation**

Create `selfmade/build.py`:

```python
"""Run every stage that produces a file, in order.

Rendering is not here on purpose: it needs an interactive Resolve session,
driven by the agent over MCP.
"""

import json
from pathlib import Path

from . import anim, comps, layout, narrate, schema


def build_all(script_path, results_path, out_root):
    out_root = Path(out_root)
    script = schema.load_script(script_path)
    results = json.loads(Path(results_path).read_text())
    schema.validate_data_refs(script, results)

    print("narrating...")
    timings = narrate.narrate_script(script, out_root / "audio")

    print("animating...")
    for scene in script["scenes"]:
        sid = scene["id"]
        n = anim.render_scene(scene, results, timings[sid]["duration"], out_root / "anim" / sid)
        comps.write_comp(scene, out_root / "anim" / sid, n, timings[sid],
                         out_root / "comps" / f"{sid}.comp")
        print(f"  {sid}: {n} frames")

    info = layout.build_fcpxml(script, timings, out_root / "anim", out_root / "audio",
                               out_root / "timeline.fcpxml")
    print(f"total {info['total_frames']} frames = {info['total_frames'] / 30 / 60:.1f} min")
    return info
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `./venv/bin/python3 -m pytest tests/ -v`
Expected: PASS — every test in the suite

- [ ] **Step 5: Build all the assets**

```bash
./venv/bin/python3 -c "
from selfmade import build
build.build_all('content/conformal-prediction-trading.en.json',
                '/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json',
                'build')
"
```

Expected: 15 scenes, a total between 14 and 21 minutes. This renders ~30,000
PNGs and takes a while.

- [ ] **Step 6: Assemble and render (agent, over MCP)**

Repeat Task 7's Steps 2–4 against `build/timeline.fcpxml` in a project named
`ConformalVideo_EN`, attaching all 15 comps. Set the render bitrate explicitly —
today's 15-minute render came to 879 MB because `VideoQuality` was ignored:

```
render.safe_set_render_settings with:
  TargetDir = output_davinci
  CustomName = conformal-prediction-trading_en_davinci
  FormatWidth = 1920, FormatHeight = 1080, FrameRate = "30"
  VideoQuality = 0            # verify it applied; if not, use the restricted bitrate below
  EncodingProfile = "Main"
  RestrictToBitrate = true
  BitrateKb = 6000
  AudioCodec = "aac", AudioSampleRate = 48000, ExportAudio = true
```

- [ ] **Step 7: Verify the output — evidence, not assertion**

```bash
V=output_davinci/conformal-prediction-trading_en_davinci.mp4
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,nb_frames -of default=noprint_wrappers=0 "$V"
```

Check every one of these, and state each in the report:
- `nb_frames` equals the layout's `total_frames`
- duration is within 15–20 minutes and matches the narration total
- both an h264 video stream and an aac audio stream exist
- size is under ~400 MB (if not, the bitrate setting did not apply)

Then sample a frame from the middle of at least four scenes, including
`08_conditional`, and confirm each shows the right visual with the animation
progressed:

```bash
for t in 60 300 600 900; do
  ffmpeg -v error -ss $t -i "$V" -frames:v 1 -vf scale=480:-1 "build/check_${t}s.png" -y
done
```

Open all four. Do not claim the video is done until you have looked at them.

- [ ] **Step 8: Commit**

```bash
git add selfmade/build.py tests/test_build.py
git commit -m "feat: build the full self-authored video from script to timeline"
git push origin main
```

---

## Self-Review

**Spec coverage:**
- Source material → Task 2 reads article + paper; Global Constraints pin `results.json` as the number authority.
- Narrative (15 scenes) → Task 2, with ids fixed for downstream filenames.
- `script.json` SSOT → Tasks 1–2.
- edge-tts narration + timings → Task 3.
- matplotlib data animation → Task 4.
- Fusion comps from templates → Task 5.
- FCPXML assembly → Task 6, reusing today's committed finding.
- Risk "comp may not render across the clip" → Task 7, a gate with a named fallback.
- Risk "VideoQuality ignored / 879 MB" → Task 8 Step 6 sets an explicit bitrate; Step 7 checks the size.
- Risk "numbers drift from the paper" → refs resolved in Task 2's test, read at render time in Task 4.
- Verification → each task ends by checking its own output; Tasks 7 and 8 require looking at frames.
- Out of scope (RU, upload) → no tasks, as intended.

**Placeholder scan:** no TBDs; every code step carries its code; the one
lookup left to the implementer (`break_trajectory.coverage`'s method key) ships
with the exact command that answers it.

**Type consistency:** `render_scene(scene, results, duration, out_dir, fps)`
returns the frame count used by `write_comp(scene, png_dir, n_frames, timings,
out_path)`; `narrate_script` returns `{id: {duration, words}}`, which is what
`build_fcpxml(script, timings, ...)` indexes by `timings[sid]["duration"]`;
scene ids are the filename stem in all four directories.
