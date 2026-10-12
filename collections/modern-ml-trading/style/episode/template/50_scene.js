/* ============================================================
   SCENE TEMPLATE (Greenhouse Lab, Professor Strix + Pico). Copied by new_scene.sh. Read collections/_episode/README.md.
   Times are EPISODE-GLOBAL seconds g (as in prep/SCENES.md).
   Available: K (kit, LK), P (palette), SCENE {id,start,end,in,out}, NR (narration), HOST (owl + hummingbird),
   SIGN (chapter / note / stamp), LAB (lab backdrop), TR (transitions), ctx, DUR, pop / span / hold, RUN.
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */

/* 1. Every string the viewer reads, copied exactly from SCENES.md (with its corrections). */
const TXT = {
  chapter: ["What Counts as an Anomaly", "Three kinds of trap", ""],
  tag: "50x volume",
  formula: ["z = (x - mean) / std"],
};

/* 2. Beats hang on WORDS: NR.cue(word, after) = global start of the first matching word at/after
      `after` (use the SCENES.md time - 1 s). Use the transcript spelling (see SCENES.md quirks). */
const B = {
  heading: SCENE.start + 0.5,
  plate: SCENE.start + 3,
  spike: SCENE.start + 8,
  formula: SCENE.start + 14,
};

/* 3. Camera: one monotone track in WORLD coordinates, keys on beats. Hosts live in screen space. */
const CAM = K.mkTrack([
  [SCENE.start, { x: 960, y: 540, z: 1.0 }],
  [B.spike, { x: 1010, y: 540, z: 1.05 }],
  [SCENE.end, { x: 1010, y: 540, z: 1.05 }],
]);

/* illustrative series (decorative, not data from the episode) */
const SERIES = Array.from({ length: 28 }, (_, i) => 0.42 + 0.06 * Math.sin(i * 1.3) + 0.04 * Math.sin(i * 3.1 + 1) + (i === 11 ? 0.42 : 0));

/* 4. One frame: world (camera) -> explainer objects -> screen-space signs -> hosts on top. */
function draw(g, t) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  LAB.draw(ctx, g, { fern: false });
  K.applyCam(ctx, 1);
  K.plate(ctx, 1290, 400, 800, 380, [{ data: SERIES, color: P.data, kind: "line" }], { a: pop(g, B.plate), draw: span(g, B.plate + 0.4, B.spike), title: "BTC/USDT", seed: 330 });
  K.tag(ctx, 1500, 360, TXT.tag, { a: pop(g, B.spike), size: 34, seed: 361 });
  K.board(ctx, 1290, 690, 640, 120, TXT.formula, { a: pop(g, B.formula), write: span(g, B.formula, B.formula + 1.6), size: 44, seed: 420 });
  K.screen(ctx);
  SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: TXT.chapter.filter(Boolean) });
  /* the hosts are the storytellers: big, pointing at what is explained, carrying props, reacting */
  HOST.duo(ctx, g, {
    stage: "none",
    point: K.toScreen(1290, 380), pointAmt: hold(g, B.spike, B.spike + 4),
    carryL: g > B.plate && g < B.spike ? (c, x, y) => K.tag(c, x + 10, y - 40, "?", { size: 40, seed: 3 }) : null,
    reacts: [{ at: B.spike, kind: "surprise", dur: 1.4 }, { at: B.formula + 2, kind: "thumbs", dur: 1.6 }],
    preacts: [{ at: B.spike + 0.4, kind: "flap", dur: 1.4 }, { at: B.formula, kind: "write", dur: 3 }],
  });
}

RUN(draw);
