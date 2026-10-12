/* ============================================================
   SCENE TEMPLATE (Coral Exchange: Otto + Puff). Copied by new_scene.sh. Read collections/_episode/README.md.
   Times are EPISODE-GLOBAL seconds g (as in prep/SCENES.md).
   Available: K (kit), P (palette), SCENE {id,start,end,in,out}, NR (narration), HOST (Otto + Puff),
   SIGN (chapter / note / stamp), REEF (backdrop), TR (transitions), ctx, DUR, pop / span / hold, RUN.
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */

/* 1. Every string the viewer reads, copied exactly from SCENES.md (with its corrections). */
const TXT = {
  chapter: ["Section title", "", "Tagline from the slide"],
  bullets: ["First point", "Second point", "Third point"],
};

/* 2. Beats hang on WORDS: NR.cue(word, after) = global start of the first matching word at/after
      `after` (use the SCENES.md time - 1 s). Use the transcript spelling (see SCENES.md quirks). */
const B = {
  heading: SCENE.start + 0.6,
  first: NR.cue("the", SCENE.start + 3),
  second: NR.cue("and", SCENE.start + 8),
};

/* 3. Camera: one monotone track in WORLD coordinates, keys on beats. */
const CAM = K.mkTrack([
  [SCENE.start, { x: 960, y: 540, z: 1 }],
  [SCENE.end, { x: 1000, y: 530, z: 1.05 }],
]);

/* 4. One frame: backdrop -> world (camera) -> explainer objects -> screen-space signs -> hosts on top. */
function draw(g) {
  REEF.draw(ctx, g, { pan: (g - SCENE.start) * 12, depth: 0.45 });
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  K.bullets(ctx, 1420, 520, 820, TXT.bullets, { a: pop(g, B.first), shown: 1 + 2 * span(g, B.first, B.second), title: "Key points", size: 44 });
  K.screen(ctx);
  SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: TXT.chapter });
  /* the hosts are the storytellers: big, pointing at what is explained, carrying props, reacting */
  HOST.duo(ctx, g, {
    point: K.toScreen(1420, 520), pointAmt: hold(g, B.first, B.first + 3),
    carryL: g > B.second && g < B.second + 4 ? (c, x, y) => K.badge(c, x, y - 30, "Hello", { size: 36, seed: 3 }) : null,
    reacts: [{ at: B.second, kind: "grin", dur: 1.6 }],
    preacts: [{ at: B.first, kind: "surprise", dur: 1.2 }],
  });
}

RUN(draw);
