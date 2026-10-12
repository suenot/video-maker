# Episode engine: cartoon episodes drawn in code

This engine turns a prepped NotebookLM episode (`prep/SCENES.md`, `subtitles.json`, the audio) into a fully animated cartoon:
- Every collection has its own style kit and mascot.
- The mascot is the on-screen storyteller and talks in sync with the narration.
- Everything is drawn in code with HyperFrames, GSAP and canvas. No image or video generation is used.

Final order: `intro_<lang>.mp4` → the episode scenes with the narration → `endcard_<lang>.mp4`, at 1920x1080, 30 fps, H.264 + AAC, -14 LUFS.

The reference implementation is the pilot in `complex-arbitrage-rust/episodes/complex-arbitrage-graph-algorithms/en/episode/`, with its collection layer in `complex-arbitrage-rust/style/episode/`. Read its scenes before writing yours: s01a is the side set with weather, s01b is a title, s02a is the chart set with callouts, s02c is the formula board.

## 1. Layout

```
collections/
  _episode/                       THIS ENGINE (collection-agnostic, shared by every episode)
    lib/60_narration.js           NR: word cues, talk/accent/who from the sync data
    lib/68_transitions.js         TR: generic wave / iris halves (a collection may replace it)
    lib/69_runtime.js             RUN(draw): timeline, transitions, error-to-canvas, grain, debug strip
    template/src/50_scene.js      generic scene template (used if the collection has none)
    tools/init_episode.py         create episode/ from prep/: sync data + scenes.json (+ split long slides)
    tools/build_sync.py           narration sync: loudness envelope, speaker per frame (pitch), words
    tools/build_scene.py          kit + header + engine lib + collection lib + scene src -> scenes/<id>/index.html
    tools/new_scene.sh            copy the scene template
    tools/snap.sh                 debug build + snapshots + sheet.jpg
    tools/render_scene.sh         silent render through heavy_slot.sh (max 3 renders machine-wide)
    tools/assemble.py             intro + scenes + narration + end card -> renders/episode_<lang>.mp4
  <collection>/style/kit/         the collection's drawing kit (namespace CK/AK/SK/..., auto-detected)
  <collection>/style/episode/     COLLECTION LAYER (once per collection): HOST (mascot actors), signs,
                                  sets, optional 68_transitions.js override, template/50_scene.js
  <collection>/episodes/<slug>/<lang>/
    prep/                         SCENES.md (content + beats, the source of truth), subtitles.json, slides/
    episode/                      scenes.json, data/sync.json, scenes/<id>/src/*.js, REVIEW.md, renders/ (ignored)
```

How the code is assembled:
- `build_scene.py` concatenates the files inside one IIFE in this order: kit `*.js`, the generated header (`K`, `P`, `SCENE`, `SYNC`), the lib files, then `scenes/<id>/src/*.js`.
- The lib files merge `_episode/lib` with `<collection>/style/episode` by file name. A collection file with the same name replaces the engine file.
- Every scene is its own HyperFrames project. Scenes render silent, and `assemble.py` adds the audio.

Time is **episode-global**: `draw(g)` gets the audio second `g`, the same numbers as SCENES.md. `K.now` is `g` too, so the line boil continues across scene cuts.

## 2. Roles and order of work

1. **Collection layer (one agent per collection, before any scene).** Write `<collection>/style/episode/`, with the crab's `complex-arbitrage-rust/style/episode/` as the model:
   - `65_host.js`, which **must** expose the same API as the crab one:
     - `HOST.duo(ctx, g, o)` draws the mascot (host A) plus the sidekick (host B) in screen space. The options are `x, y, s, side, point, pointAmt, ppoint, ppointAmt, reacts, preacts, carryR/carryL, a`.
     - `HOST.crabPose`-style pose functions that drive the kit mascot from `NR.talk`, `NR.accent` and `NR.who`.
     - Host B: use the kit's second character if it has one (cat + penguin, hamster + bot). Otherwise add a small sidekick to the kit, like the crab's parrot `K.parrot`. Keep it additive and rebuild the gallery.
   - `66_signs.js`: `SIGN.chapter`, `SIGN.note`, `SIGN.stamp` in the collection's materials (paper, slate, neon...).
   - Optional `67_*.js` sets (a horizon or a stage, like the crab's `SIDE`), optional `68_transitions.js` (the collection's own wipe), and `template/50_scene.js`.
   - Smoke test: run `init_episode.py` on one episode, put the template in one scene, run `snap.sh` and look at it. Commit.
2. **Episode init (seconds):** `python3 collections/_episode/tools/init_episode.py <collection>/episodes/<slug>/<lang>`. It builds `data/sync.json` and `scenes.json`.
   - Check the `scenes.json` split points and transitions.
   - If the wrong voice ended up as host A, rerun `build_sync.py` with `--host-a low|high`. Host A is the explainer (the mascot); `more`, the default, picks the voice with more words.
3. **Scene builders (many in parallel).** Each owns a set of scene ids and writes **only** `episode/scenes/<id>/` (src, REVIEW.md, snapshots/sheet.jpg). They never edit the kit, `lib`, `scenes.json`, tools or other scenes; a missing helper goes in their own scene file. The lead commits.
   - Give each builder whole slides, or consecutive sub-scenes of one slide, so that "cut" boundaries stay inside one builder.
   - When a cut crosses builders, write the shared last/first frame into both prompts: camera, object positions and seeds, duo placement.
4. **Assembly (lead):** `assemble.py` once all scenes are rendered. Watch the result, then log it in REVIEW.md.

## 3. Per-scene workflow (a builder)

```bash
EP=collections/<collection>/episodes/<slug>/<lang>/episode;  T=collections/_episode/tools
$T/new_scene.sh $EP <scene_id>              # copies the collection template into scenes/<id>/src/50_scene.js
$EDITOR $EP/scenes/<scene_id>/src/50_scene.js
$T/snap.sh $EP <scene_id> 2.5               # frame every 2.5 s -> scenes/<id>/snapshots/sheet.jpg (+ full PNGs)
$T/snap.sh $EP <scene_id> "601.2,606,612.5" # or exact GLOBAL seconds
$T/render_scene.sh $EP <scene_id>           # silent render -> renders/scenes/<id>.mp4, via heavy_slot.sh
python3 $T/assemble.py $EP --only <scene_id> # that scene with its narration (to listen to sync)
```

Scene ids come from `scenes.json`, for example `s04_bellman_ford_rust`, or `s01b_...` for the second part of slide 1. A prefix such as `s04` works in every tool.

A scene file has four parts. Copy the template:
1. `TXT`: every string the viewer reads, copied exactly from SCENES.md, with its corrections applied.
2. `B`: the beats, taken from words. `NR.cue("vertices", 197)` returns the start of the first word "vertices" at or after 197 s. Pass `after` about 1 s before the SCENES.md time, and use the transcript's spelling (SCENES.md lists the Whisper mis-hearings). `NR.cueEnd` gives the word end. Never hard-code a guessed second when there is a word to hang the beat on.
3. Camera: a `K.mkTrack` keyed on beats, in world coordinates, moving through the world.
4. `draw(g)`: the world, then the explainer objects, then screen-space signs, then `HOST.duo(...)`. End the file with `RUN(draw);`.

Runtime helpers: `pop(g, g0, d=0.4)` gives 0 to 1 starting at g0, `span(g, g0, g1)` gives 0 to 1 over a range, and `hold(g, g0, g1, fade=0.3)` gives 0, then 1, then 0.

## 4. The mascot is the storyteller (hard rules)

- **Size.** The hosts are big: the `HOST.duo` default is s 1.55, about 30 % of the frame height. Go smaller only for a deliberate wide shot, and never below s 1.2 for more than a few seconds. Close-ups (s 2 or more, the mascot filling half the frame) are welcome on jokes, questions and caveats.
- **Involvement.** At least one deliberate action every 10 to 15 s, and the hosts react to every reveal:
  - point at what is being explained (`point` / `ppoint` with `pointAmt: hold(...)`);
  - **carry props** (`carryR/L`: hold up the coin, the tag, the plank, the lantern, the scroll being discussed, then hand it over or drop it into the scene);
  - react with `reacts` / `preacts`;
  - walk or hop to the object (animate `x`), or ride the ship or vehicle through the world.
- **Mouths and gestures** come automatically from the sync data. Host A is the voice chosen at init (the explainer) and host B is the other voice. Only animate `talk` by hand if you draw a host outside `HOST.duo`.
- **Placement.** The hosts own one bottom corner: `duo` default bottom-left, or `side: -1` with x about 1590 for bottom-right. Switch corners when the content needs the other side. Content goes in the rest of the frame.

## 5. Layout, type, pacing, content (hard rules)

- **Safe area** is 64 px. At most 2 explainer objects in focus at once.
- **Text** is at least **28 px** on screen (world size times camera zoom). Titles are 44 to 62 px, code 28 to 32 px, formulas 48 px or more. Text sits on a carrier: paper, slate, wood, a screen. It never sits on a busy background, and it never boils.
- **Faithful content:** every number, formula, code line, table cell and caveat in SCENES.md appears legibly, for at least `max(3 s, words / 3)` seconds, and with SCENES.md's corrections applied. Never invent data. Illustrative values must be labelled or plainly decorative.
  - A formula is written in time with the words that read it.
  - Code is typed into the code carrier, and the line under discussion is highlighted.
  - A slide's title, subtitle and tagline appear with `SIGN.chapter` on the heading cue, for 4 to 6 s.
- **Pacing:** something meaningful changes every 3 to 6 s (a reveal, a camera move, a host action, a highlight). No static slides. Camera moves land on beats, and push-ins are at most 1.2x over 4 s or more.
- **Transitions** come from `scenes.json` `out` (`wave`, `iris`, `cut`). The runtime draws both halves. Keep key content out of the first and last 0.6 s next to a wave or iris.
- **Determinism:** no `Math.random`, `Date.now` or `performance.now`, and no state carried between frames. Use the kit's `hash` / `mulberry`.

## 6. QA loop (3 rounds or more per scene, logged)

1. Run `snap.sh` and look at `sheet.jpg`, then at the full PNGs at key beats. The debug strip shows `g`, the speaker (a/b), the loudness and the current word, so check that every reveal lands on its word.
2. Check:
   - readability (28 px or more, contrast, no overlap, nothing clipped at the edges);
   - faithful content (compare with SCENES.md and `prep/slides/slide_NNN.png`);
   - hosts that are big, involved, and acting to the speech;
   - something changing every 3 to 6 s, with no dead or empty frames.
3. Fix and snapshot again. Then render, and check frames from the mp4 too: `ffmpeg -ss <t> -i renders/scenes/<id>.mp4 -frames:v 1 x.png`.
4. Write `scenes/<id>/REVIEW.md` with the concrete defects found and fixed, per round.

## 7. Machine load

- **Every render and whisper call goes through `collections/tools/heavy_slot.sh render|whisper <cmd>`.** It allows at most 3 renders and 2 whispers machine-wide. `render_scene.sh` already does this.
- Render your scenes **one after another**, never in parallel. Use `WORKERS=3` (the default), or 2 when the machine is busy.
- On a failure from load, the script waits and retries. Do not kill other agents' processes.
- Snapshots (`snap.sh`) are light and need no slot.

## 8. Assembly

```bash
python3 collections/_episode/tools/assemble.py $EP            # full: intro + all scenes + end card -> renders/episode_<lang>.mp4
python3 collections/_episode/tools/assemble.py $EP --preview  # intro + the rendered prefix (no end card) -> renders/preview_<lang>.mp4
  --intro PATH|none     default <collection>/intro/renders/intro_<lang>.mp4 (any length)
  --endcard PATH|none   default collections/_endcard/renders/endcard_<lang>.mp4
```

What the assembler does:
- It checks every scene duration against `scenes.json`, then concatenates the scenes.
- It joins intro → body → end card with 0.6 s wavy foam wipes.
- The narration starts when the intro wipe starts. The intro song and the end-card audio fade at the joins.
- It runs a two-pass loudnorm to -14 LUFS and writes a contact sheet next to the output.

Renders and audio are never committed.
