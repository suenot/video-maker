/* ============================================================
   SCENE TEMPLATE (Statistical Arbitrage, the vaudeville house). Copied by new_scene.sh.
   Read collections/_episode/README.md and style/episode/README.md.
   Times are EPISODE-GLOBAL seconds g (as in prep/SCENES.md).
   Available: K (kit), P (palette), SCENE {id,start,end,in,out}, NR (narration),
   HOST (Dan + Skip), SIGN (chapter / note / stamp), HOUSE (stage backdrop), TR (iris), ctx, DUR,
   pop / span / hold, RUN. Add K.film(ctx, g) as the LAST call of draw() (projector flicker + dust).
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */

/* 1. Every string the viewer reads, copied exactly from SCENES.md (with its corrections). */
const TXT = {
  chapter: ["Section title", "Subsection", "One-line tagline."],
  formula: ["z = (S - mu) / sigma"],
  tag: "+2.0",
};

/* 2. Beats hang on WORDS: NR.cue(word, after) = global start of the first matching word at/after
      `after` (use the SCENES.md time - 1 s). Use the transcript spelling (see SCENES.md quirks). */
const B = {
  heading: NR.cue("the", SCENE.start),
  formula: NR.cue("and", SCENE.start + 6),
  tag: NR.cue("the", SCENE.start + 12),
};

/* 3. Camera: one monotone track in WORLD coordinates (the stage), keys on beats, push-ins <= 1.1x. */
const CAM = K.mkTrack([
  [SCENE.start, { x: 960, y: 540, z: 1 }],
  [B.formula, { x: 1000, y: 530, z: 1.04 }],
  [SCENE.end, { x: 1020, y: 520, z: 1.08 }],
]);

/* 4. One frame: house back -> props (world) -> house front -> signs (screen) -> hosts -> film. */
function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  HOUSE.back(ctx, g, { spots: [[1250, 520]] });
  K.intertitle(ctx, 1230, 430, 960, 300, TXT.formula, { a: pop(g, B.formula), write: span(g, B.formula, B.formula + 1.6), size: 64 });
  HOUSE.front(ctx, g);
  K.screen(ctx);
  SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: TXT.chapter });
  /* the hosts are the storytellers: big, pointing at what is explained, carrying props, reacting.
     With no reacts the layer still adds a small unprompted gesture every ~12 s. */
  HOST.duo(ctx, g, {
    point: K.toScreen(1230, 430), pointAmt: hold(g, B.formula, B.formula + 3),
    pcarryR: g > B.tag && g < B.tag + 4 ? (c, x, y) => K.hangTag(c, x + 56, y + 6, TXT.tag, { size: 34, gold: true, seed: 3 }) : null,
    reacts: [{ at: B.formula + 3.2, kind: "grin", dur: 1.4 }],
    preacts: [{ at: B.formula, kind: "surprise", dur: 1.2 }],
  });
  K.film(ctx, g);
}

RUN(draw);
