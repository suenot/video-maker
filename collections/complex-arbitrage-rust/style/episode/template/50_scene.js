/* ============================================================
   SCENE TEMPLATE (Arbitrage Crab). Copied by new_scene.sh. Read collections/_episode/README.md.
   Times are EPISODE-GLOBAL seconds g (as in prep/SCENES.md).
   Available: K (kit), P (palette), SCENE {id,start,end,in,out}, NR (narration), HOST (crab + parrot),
   SIGN (chapter / note / stamp), SIDE (horizon set), TR (transitions), ctx, DUR, pop / span / hold, RUN.
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */

/* 1. Every string the viewer reads, copied exactly from SCENES.md (with its corrections). */
const TXT = {
  chapter: ["1.2 From Multiplication to Addition", "", "Converting multi-leg profit calculations from heavy multiplication to rapid addition."],
  formula: "w = -ln(R)",
};

/* 2. Beats hang on WORDS: NR.cue(word, after) = global start of the first matching word at/after
      `after` (use the SCENES.md time - 1 s). Use the transcript spelling (see SCENES.md quirks). */
const B = {
  heading: NR.cue("three", SCENE.start - 0.5),
  logs: NR.cue("logarithms", SCENE.start),
  formula: NR.cue("minus", SCENE.start + 90),
};

/* 3. Camera: one monotone track in WORLD coordinates (chart set), keys on beats. */
const CAM = K.mkTrack([
  [SCENE.start, { x: 960, y: 520, z: 0.8 }],
  [B.logs, { x: 1100, y: 500, z: 0.95 }],
  [SCENE.end, { x: 1140, y: 480, z: 1.0 }],
]);

/* 4. One frame: world (camera) -> explainer objects -> screen-space signs -> hosts on top. */
function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  K.chartSea(ctx, { seed: 5 });
  K.node(ctx, 760, 420, 0.8, { label: "BTC", color: P.BTC, a: pop(g, B.logs - 2), seed: 23 });
  K.slate(ctx, 1400, 380, 640, 170, [TXT.formula], { a: pop(g, B.formula), write: span(g, B.formula, B.formula + 1.4), size: 64 });
  K.screen(ctx);
  SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: TXT.chapter.filter(Boolean) });
  /* the hosts are the storytellers: big (s 1.55), pointing at what is explained, carrying props, reacting */
  HOST.duo(ctx, g, {
    point: K.toScreen(1400, 380), pointAmt: hold(g, B.formula, B.formula + 3),
    carryL: g > B.logs && g < B.formula ? (c, x, y) => K.tag(c, x, y - 30, "ln", { size: 44, seed: 3 }) : null,
    reacts: [{ at: B.logs, kind: "think", dur: 1.6 }, { at: B.formula + 1.5, kind: "thumbs", dur: 1.6 }],
    preacts: [{ at: B.formula, kind: "surprise", dur: 1.2 }],
  });
}

RUN(draw);
