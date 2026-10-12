/* ============================================================
   SCENE TEMPLATE (Block Diner). Copied by new_scene.sh. Read collections/_episode/README.md.
   Times are EPISODE-GLOBAL seconds g (as in prep/SCENES.md).
   Available: K (kit, namespace DK), P (palette), SCENE {id,start,end,in,out}, NR (narration),
   HOST (Nibbs + Bizzy), SIGN (chapter / note / stamp), SET (diner backdrop), TR (transitions),
   ctx, DUR, pop / span / hold, RUN.
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */

/* 1. Every string the viewer reads, copied exactly from SCENES.md (with its corrections). */
const TXT = {
  chapter: ["Machine Learning-Driven Wallet Tracking", "Vector embeddings of trading style", "Up to 84% recognition among 100,000 candidates"],
  formula: ["x * y = k"],
};

/* 2. Beats hang on WORDS: NR.cue(word, after) = global start of the first matching word at/after
      `after` (use the SCENES.md time - 1 s). Use the transcript spelling (see SCENES.md quirks). */
const B = {
  heading: SCENE.start + 0.5,
  coin: NR.cue("wallet", SCENE.start),
  board: NR.cue("embeddings", SCENE.start),
};

/* 3. Camera: one monotone track in WORLD coordinates, keys on beats. */
const CAM = K.mkTrack([
  [SCENE.start, { x: 960, y: 540, z: 1 }],
  [B.board, { x: 1020, y: 530, z: 1.06 }],
  [SCENE.end, { x: 1060, y: 520, z: 1.1 }],
]);

/* 4. One frame: world (camera) -> explainer objects -> screen-space signs -> hosts on top. */
function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  SET.diner(ctx, g, {});
  K.node(ctx, 900, SET.counterTop() - 20, 0.9, { label: "ETH", color: P.ETH, a: pop(g, B.coin), seed: 23 });
  K.chalkboard(ctx, 1450, 300, 560, 200, TXT.formula, { a: pop(g, B.board), write: span(g, B.board, B.board + 1.4), size: 64 });
  K.screen(ctx);
  SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: TXT.chapter });
  /* the hosts are the storytellers: big (s 0.9), pointing at what is explained, carrying props, reacting */
  HOST.duo(ctx, g, {
    point: K.toScreen(1450, 300), pointAmt: hold(g, B.board, B.board + 3),
    carryL: g > B.coin - 2 && g < B.board ? (c, x, y) => K.coin(c, x, y - 30, 34, { color: P.ETH, label: "ETH", labelColor: P.cream, seed: 3 }) : null,
    reacts: [{ at: B.coin, kind: "think", dur: 1.6 }, { at: B.board + 1.5, kind: "thumbs", dur: 1.6 }],
    preacts: [{ at: B.board, kind: "surprise", dur: 1.2 }],
  });
}

RUN(draw);
