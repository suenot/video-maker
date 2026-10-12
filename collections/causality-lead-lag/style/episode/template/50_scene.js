/* ============================================================
   SCENE TEMPLATE (Inspector Vulpes). Copied by new_scene.sh. Read collections/_episode/README.md.
   Times are EPISODE-GLOBAL seconds g (as in prep/SCENES.md).
   Available: K (kit), P (palette), SCENE {id,start,end,in,out}, NR (narration), HOST (fox + hound),
   SIGN (chapter / note / stamp), SET (street / room), TR (transitions), ctx, DUR, pop / span / hold, RUN.
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */

/* 1. Every string the viewer reads, copied exactly from SCENES.md (with its corrections). */
const TXT = {
  chapter: ["Causal forests", "Heterogeneous treatment effects", "Estimating tau(x) over mu(x)"],
  formula: "tau(x) = E[Y(1) - Y(0) | X = x]",
};

/* 2. Beats hang on WORDS: NR.cue(word, after) = global start of the first matching word at/after
      `after` (use the SCENES.md time - 1 s). Use the transcript spelling (see SCENES.md quirks). */
const B = {
  heading: SCENE.start + 0.5,
  board: SCENE.start + 6,
  formula: SCENE.start + 10,
};

/* 3. Camera: one monotone track in WORLD coordinates (street set), keys on beats. */
const CAM = K.mkTrack([
  [SCENE.start, { x: 960, y: 540, z: 1 }],
  [B.board, { x: 1000, y: 540, z: 1.04 }],
  [SCENE.end, { x: 1060, y: 540, z: 1.1 }],
]);

/* 4. One frame: world (camera) -> explainer objects -> screen-space signs -> hosts on top. */
function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  SET.street(ctx, g, { dim: 0.45 });
  K.applyCam(ctx, 1);
  K.corkboard(ctx, 1160, 340, 1180, 480, { a: pop(g, B.board) });
  K.node(ctx, 900, 290, 0.75, { label: "BTC", color: P.BTC, a: pop(g, B.board + 0.6), seed: 23 });
  K.node(ctx, 1200, 290, 0.75, { label: "ETH", color: P.ETH, a: pop(g, B.board + 1.2), seed: 29 });
  K.slate(ctx, 1160, 590, 1000, 150, [TXT.formula], { a: pop(g, B.formula), write: span(g, B.formula, B.formula + 1.6), size: 44 });
  K.screen(ctx);
  SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: TXT.chapter.filter(Boolean) });
  /* the hosts are the storytellers: big, pointing at what is explained, carrying props, reacting */
  HOST.duo(ctx, g, {
    point: K.toScreen(1160, 590), pointAmt: hold(g, B.formula, B.formula + 3),
    carryL: g > B.board && g < B.formula - 1 ? (c, x, y) => K.tag(c, x - 10, y + 30, "A > B", { size: 34, seed: 3 }) : null,
    reacts: [{ at: B.board, kind: "think", dur: 1.6 }, { at: B.formula + 1.5, kind: "tip", dur: 1.6 }],
    preacts: [{ at: B.formula, kind: "surprise", dur: 1.2 }],
  });
}

RUN(draw);
