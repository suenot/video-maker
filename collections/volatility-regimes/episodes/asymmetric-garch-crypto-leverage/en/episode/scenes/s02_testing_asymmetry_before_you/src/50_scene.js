/* ============================================================
   SCENE TEMPLATE (Siggy the Surf Turtle). Copied by new_scene.sh. Read collections/_episode/README.md.
   Times are EPISODE-GLOBAL seconds g (as in prep/SCENES.md).
   Available: K (kit), P (palette), SCENE {id,start,end,in,out}, NR (narration), HOST (Siggy + Gully),
   SIGN (chapter / note / stamp), BEACH (world backdrop + regime), TR (transitions), ctx, DUR, pop / span / hold, RUN.
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */

/* 1. Every string the viewer reads, copied exactly from SCENES.md (with its corrections). */
const TXT = {
  chapter: ["Leverage Effect", "Why drops move volatility more than rises", ""],
  formula: ["σ^2_t = ω + α·ε^2_{t-1} + β·σ^2_{t-1}"],
};

/* 2. Beats hang on WORDS: NR.cue(word, after) = global start of the first matching word at/after
      `after` (use the SCENES.md time - 1 s). Use the transcript spelling (see SCENES.md quirks). */
const B = {
  heading: SCENE.start + 0.6,
  board: SCENE.start + 6,
  flip: SCENE.start + 14,
};

/* 3. Camera: one monotone track in WORLD coordinates, keys on beats. */
const CAM = K.mkTrack([
  [SCENE.start, { x: 960, y: 540, z: 1 }],
  [B.board, { x: 1000, y: 520, z: 1.06 }],
  [SCENE.end, { x: 1040, y: 520, z: 1.1 }],
]);

/* 4. One frame: world (camera) -> explainer objects -> screen-space signs -> hosts on top. */
function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  const storm = BEACH.storm(g, [[SCENE.start, 0], [B.flip - 0.3, 0], [B.flip + 0.5, 1], [SCENE.end, 1]]);
  BEACH.world(ctx, g, { storm, flash: hold(g, B.flip, B.flip + 0.6, 0.15) });
  K.forecastBoard(ctx, 1280, 400, 1000, 300, TXT.formula, { a: pop(g, B.board), write: span(g, B.board, B.board + 2.5), hi: /σ/ });
  K.screen(ctx);
  SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: TXT.chapter.filter(Boolean) });
  /* the hosts are the storytellers: big (s 1.55), pointing at what is explained, carrying props, reacting */
  HOST.duo(ctx, g, {
    point: K.toScreen(1280, 400), pointAmt: hold(g, B.board + 1, B.board + 5),
    carryL: g > B.board - 3 && g < B.board ? (c, x, y) => K.tag(c, x, y - 30, "σ", { size: 44, seed: 3, hot: true }) : null,
    reacts: [{ at: B.board, kind: "think", dur: 1.6 }, { at: B.flip + 1.5, kind: "thumbs", dur: 1.6 }],
    preacts: [{ at: B.flip, kind: "surprise", dur: 1.2 }],
  });
}

RUN(draw);
