/* ============================================================
   SCENE TEMPLATE (Order Book Bazaar). Copied by new_scene.sh. Read collections/_episode/README.md
   and style/episode/README.md.
   Times are EPISODE-GLOBAL seconds g (as in prep/SCENES.md).
   Available: K (kit, BK), P (palette), SCENE {id,start,end,in,out}, NR (narration), HOST (Tikki + Gekko),
   SIGN (chapter / note / stamp), SET (bazaar / plaster backdrops), TR (transitions), ctx, DUR,
   pop / span / hold, RUN.
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */

/* 1. Every string the viewer reads, copied exactly from SCENES.md (with its corrections). */
const TXT = {
  chapter: ["2. watchOrderBookForSymbols", "Bulk Subscription", "One socket, many books."],
  formula: ["spread = ask - bid"],
};

/* 2. Beats hang on WORDS: NR.cue(word, after) = global start of the first matching word at/after
      `after` (use the SCENES.md time - 1 s). Use the transcript spelling (see SCENES.md quirks). */
const B = {
  heading: SCENE.start + 0.5,
  board: SCENE.start + 8,
  note: SCENE.start + 16,
};

/* 3. One frame: backdrop -> explainer objects (world coordinates are screen px here) -> screen-space
      signs -> hosts on top. For a moving camera use K.mkTrack + K.applyCam and SET.bazaar({ pan }). */
function draw(g) {
  SET.plaster(ctx, g);
  K.tileBoard(ctx, 1230, 330, 760, 220, TXT.formula, { a: pop(g, B.board), size: 64, write: span(g, B.board, B.board + 1.4) });
  SIGN.note(ctx, 1260, 640, { a: pop(g, B.note), title: "Spread", lines: ["Gap between best ask and best bid."], w: 560, size: 32, to: [1200, 470] });
  K.screen(ctx);
  SIGN.chapter(ctx, g, { at: B.heading, until: B.heading + 5, lines: TXT.chapter });
  /* the hosts are the storytellers: big, pointing at what is explained, carrying props, reacting.
     Tikki holds the abacus in his left paw unless carryL is set. */
  HOST.duo(ctx, g, {
    point: [1200, 440], pointAmt: hold(g, B.board, B.board + 3),
    carryR: g > B.note && g < B.note + 3 ? (c, x, y) => K.tag(c, x, y - 34, "0.01", { size: 40, seed: 3 }) : null,
    reacts: [{ at: B.board + 1.5, kind: "think", dur: 1.6 }, { at: B.note + 3, kind: "thumbs", dur: 1.6 }],
    preacts: [{ at: B.board, kind: "surprise", dur: 1.2 }],
  });
}

RUN(draw);
