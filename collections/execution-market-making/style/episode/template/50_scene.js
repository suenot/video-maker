/* ============================================================
   SCENE TEMPLATE (Clockwork Station). Copied by new_scene.sh. Read collections/_episode/README.md.
   Times are EPISODE-GLOBAL seconds g (as in prep/SCENES.md).
   Available: K (kit), P (palette), SCENE {id,start,end,in,out}, NR (narration), HOST (Mr. Tick + Dash),
   SIGN (chapter / note / stamp), STATION (backdrop set), TR (transitions), ctx, DUR, pop / span / hold, RUN.
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */

/* 1. Every string the viewer reads, copied exactly from SCENES.md (with its corrections). */
const TXT = {
  chapter: ["Slide title", "Subtitle", "Tagline from the slide"],
  formula: "x_i = X / N",
  stamp: "FRONT-RUN",
  note: ["Risk Factor: Front-Running", "Without randomization a 60-second metronome will be exploited."],
};

/* 2. Beats hang on WORDS: NR.cue(word, after) = global start of the first matching word at/after
      `after` (use the SCENES.md time - 1 s). Use the transcript spelling (see SCENES.md quirks). */
const B = {
  heading: SCENE.start + 0.4,
  formula: SCENE.start + 8,
  note: SCENE.start + 16,
  stamp: SCENE.start + 26,
};

/* 3. Camera: one monotone track in WORLD coordinates, keys on beats (push-ins <= 1.2x over >= 4 s). */
const CAM = K.mkTrack([
  [SCENE.start, { x: 960, y: 540, z: 1 }],
  [B.formula, { x: 1000, y: 540, z: 1.05 }],
  [SCENE.end, { x: 1040, y: 540, z: 1.1 }],
]);

/* 4. One frame: set (camera) -> explainer objects -> screen-space signs -> hosts on top. */
function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  STATION.draw(ctx, g, {
    mid: (c) => {
      K.plaque(c, 1000, 250, 620, 170, [TXT.formula], { a: pop(g, B.formula), write: span(g, B.formula, B.formula + 1.2), size: 64, seed: 241 });
    },
  });
  K.screen(ctx);
  SIGN.note(ctx, 1380, 640, { a: pop(g, B.note), title: TXT.note[0], lines: [TXT.note[1]], w: 640, to: STATION.toScreen(1310, 430) });
  SIGN.stamp(ctx, 1560, 470, { a: pop(g, B.stamp, 0.3), text: TXT.stamp, size: 56 });
  SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: TXT.chapter });
  /* the hosts are the storytellers: big, pointing at what is explained, carrying props, reacting */
  HOST.duo(ctx, g, {
    point: STATION.toScreen(1310, 335), pointAmt: hold(g, B.formula, B.formula + 3),
    carryR: g > B.heading + 5 && g < B.formula ? (c, x, y) => K.tag(c, x, y - 34, "N", { size: 34, seed: 3 }) : null,
    reacts: [{ at: B.note + 1, kind: "think", dur: 1.6 }, { at: B.formula + 1.6, kind: "thumbs", dur: 1.6 }],
    preacts: [{ at: B.formula, kind: "surprise", dur: 1.2 }, { at: B.stamp, kind: "worry", dur: 1.6 }],
    ppoint: STATION.toScreen(1310, 335), ppointAmt: hold(g, B.note, B.note + 3),
  });
}

RUN(draw);
