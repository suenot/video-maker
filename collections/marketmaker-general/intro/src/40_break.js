/* ============================================================
   INTRO 40 BREAK (bars 12 - 16, the song's instrumental break):
   how wide the channel goes. Bill Williams Alligator + fractals + AO,
   a Lorenz attractor (chaos), a manifold with a path on it.
   Otto stands on the sand right of each board and points / traces.
   ============================================================ */
const SIDE = { x: 1590, y: 1000, s: 0.74 }; /* Otto standing on the sand, right of a board */

/* ---------- SC14 break: Bill Williams Alligator + fractals + Awesome Oscillator (bars 12 - 13.5) ---------- */
const CD14 = K.genCandles(44, 23, 100, 1.2, 0.09), AL14 = K.alligator(CD14), AO14 = K.ao(CD14, 20), FR14 = K.fractals(CD14).filter((f) => f.i > 6);
const BOARD = { x: 800, y: 480, w: 1200, h: 780 };
function sc14(t) {
  const draw = K.inv(at(12, 0), at(12, 3.6), t);
  drawReef(t, { x: 960, y: 540, z: 1 }, {
    desk: false, traffic: 3, depth: 0.55,
    mid: () => {
      K.applyCam(ctx, 1);
      const res = K.chart(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { a: ap(t, at(12, 0), 0.35), candles: CD14, lines: [{ data: AL14.jaw, color: P.jaw, w: 6 }, { data: AL14.teeth, color: P.teeth, w: 6 }, { data: AL14.lips, color: P.lips, w: 6 }], fractals: FR14, hist: { data: AO14, frac: 0.25 }, draw, tab: P.kelp, rot: -0.01 });
      sc14.res = res;
    },
    octo: () => {
      const r = sc14.res, i = Math.max(0, Math.min(CD14.length - 1, Math.floor(draw * CD14.length) - 1));
      /* point at the chart from its right edge, at the height of the newest candle */
      const tip = r ? toLocal(BOARD.x + BOARD.w / 2 + 40, K.clamp(r.Y(CD14[i].h), BOARD.y - 40, BOARD.y + 220), SIDE) : { x: -600, y: -500 };
      /* two arms snap like alligator jaws on every beat */
      const snap = K.pulse(t, 1, 5);
      otto(t, { mouth: "grin", look: [-1, -0.3], brow: 0.5,
        arms: [null, null, { x: tip.x, y: tip.y, bend: -40, curl: 0.6 }, null, null, { x: 330, y: -470 - 60 * snap, bend: 40, curl: 1.2 }, { x: 360, y: -330 + 50 * snap, bend: 40, curl: -1.2 }, null] }, SIDE);
    },
  });
}

/* ---------- SC15 break: a Lorenz attractor (chaos) traced by Otto (bars 13.5 - 14.75) ---------- */
function flipWrap(cx, sx, fn) { ctx.save(); ctx.translate(cx, 0); ctx.scale(Math.max(0.001, sx), 1); ctx.translate(-cx, 0); const r = fn(); ctx.restore(); return r; }
function sc15(t) {
  const out = K.inv(at(14, 2.6), at(14, 3), t);
  drawReef(t, { x: 960, y: 540, z: 1 }, {
    desk: false, traffic: 2, depth: 0.85, rays: 0.5,
    mid: () => {
      K.applyCam(ctx, 1);
      sc15.head = flipWrap(BOARD.x, 1 - out, () => K.attractor(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { a: ap(t, at(13, 2), 0.3), draw: K.tw(t, at(13, 2), at(14, 2.6), 0.08, 1, K.E.out3), yaw: -0.25 + (t - at(13, 2)) * 0.3, pitch: 0.15, scale: 1.3, tab: P.lilac }));
    },
    octo: () => {
      const hd = sc15.head || [BOARD.x, BOARD.y], tl = toLocal(hd[0] + 30, hd[1] + 30, SIDE);
      otto(t, { skin: K.SKIN.chaos, mouth: "o", brow: 1.2, look: [-1, -0.4], arms: [null, null, { x: K.clamp(tl.x, -1300, -200), y: tl.y, bend: -80 }, null, null, null, null, null] }, SIDE);
    },
  });
}

/* ---------- SC16 break: a manifold with a path on it (bars 14.75 - 16) ---------- */
const PATH16 = Array.from({ length: 40 }, (_, i) => [-0.85 + i * 0.044, 0.55 * Math.sin(i * 0.16) - 0.2]);
function sc16(t) {
  const inn = K.inv(at(14, 3), at(14, 3.5), t);
  drawReef(t, { x: 960, y: 540, z: 1 }, {
    desk: false, traffic: 2, depth: 0.7, rays: 0.7,
    mid: () => {
      K.applyCam(ctx, 1);
      flipWrap(BOARD.x, K.E.back(inn, 1.5), () => K.manifold(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { a: 1, draw: K.inv(at(14, 3), at(15, 1), t), yaw: 0.4 + (t - at(14, 3)) * 0.35, tilt: 0.6, path: PATH16, pathDraw: K.inv(at(15, 0.5), at(15, 3.4), t), tab: P.kelp }));
    },
    octo: () => otto(t, { skin: K.SKIN.bull, mouth: "grin", brow: 0.6, look: [-1, -0.2], glint: K.inv(at(15, 3), at(15, 3.6), t),
      arms: [null, null, armTrack(t, 2, [[at(15, 0), { x: -520, y: -420, bend: -50, curl: 1.4 }]]), null, null, null, null, null] }, SIDE),
  });
}
