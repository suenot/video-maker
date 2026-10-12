/* ============================================================
   SCENE TEMPLATE. Copy with tools/new_scene.sh <id>. Read SCENE_GUIDE.md first.
   Everything in this file uses EPISODE-GLOBAL seconds g (as in SCENES.md).
   Available: K (kit), P (palette), SCENE {id,start,end,in,out}, NR (narration),
   HOST (crab + parrot), TR (transitions), ctx, DUR, pop / span / hold, RUN.
   ============================================================ */

/* 1. Text the viewer reads (keep every string here; numbers exactly as in SCENES.md). */
const TXT = {
  formula: "w = -ln(R)",
};

/* 2. Beats: tie reveals to WORDS, not to guessed seconds. NR.cue(word, after) returns
      the global start of the first matching word at/after `after` (SCENES.md time - 1 s). */
const B = {
  nodes: NR.cue("vertices", SCENE.start),
  formula: NR.cue("logarithms", SCENE.start),
};

/* 3. Camera: one monotone track in WORLD coordinates (chart set), keyed on beats. */
const CAM = K.mkTrack([
  [SCENE.start, { x: 960, y: 540, z: 0.8 }],
  [B.formula, { x: 1100, y: 500, z: 1.0 }],
  [SCENE.end, { x: 1140, y: 480, z: 1.05 }],
]);

/* 4. One frame. Order: world (camera) -> explainer objects -> screen-space hosts. */
function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 5 });
  K.node(ctx, 700, 520, 0.8, { label: "BTC", color: P.BTC, a: pop(g, B.nodes), seed: 23 });
  K.slate(ctx, 1300, 420, 620, 160, [TXT.formula], { a: pop(g, B.formula), write: span(g, B.formula, B.formula + 1.2), size: 60 });
  K.screen(ctx);
  HOST.duo(ctx, g, { x: 280, y: 1000, s: 1.1, point: K.toScreen(1300, 420), pointAmt: hold(g, B.formula, B.formula + 3) });
}

RUN(draw);
