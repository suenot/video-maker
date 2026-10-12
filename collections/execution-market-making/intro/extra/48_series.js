/* ============================================================
   INTRO 48 SERIES: chorus 1, "Execution and Market Making, on deck!" (25.8 - 29.5 s)
   The station's big departure board lists the collection: each row (icon,
   name, platform) flips in on the sung words; on "on deck!" Mr. Tick blows
   the whistle and points up at it. Names are tickers / proper names only,
   so the drawn world stays language-free.
   ============================================================ */
const SER = { x: 200, y: 110, w: 1220, rowH: 168, rows: ["TWAP · VWAP", "POV", "ALMGREN–CHRISS", "BID / ASK"] };

function drawSeries(c, t) {
  const S = T.series;
  K.begin(c, t, { x: 960, y: 540, z: K.tw(t, S.t0 - 0.4, S.end, 1.04, 0.98, K.E.inOut), rot: 0 });
  K.applyCam(c, 1);
  K.shape(c, [[-200, -200], [2200, -200], [2200, 1400], [-200, 1400]], { fill: P.cream, key: null, boil: 0, seed: 3500, tone: { color: P.creamDeep, gap: 12, r: 0.4, r2: 2.6, dir: Math.PI / 2, alpha: 0.6 } });
  K.shape(c, [[-200, 860], [2200, 860], [2200, 1400], [-200, 1400]], { fill: P.teal, w: 3, seed: 3501, shade: { color: P.tealDark, dx: 0, dy: 24 } });
  /* a hall clock above the board's right edge */
  K.clockFace(c, 1700, 250, 120, { hour: 10, minute: 15 + (t - S.t0) * 2, seed: 3502 });
  K.line(c, [[1700, 20], [1700, 120]], { w: 5, seed: 3503 });
  /* the board */
  const { x, y, w, rowH } = SER, H = SER.rows.length * rowH + 60;
  K.shape(c, K.rrectPts(x, y, w, H, 22, 4), { fill: P.board, w: 4, seed: 3510, reg: 0, shade: { color: "#1c1c20", dx: 0, dy: 14 } });
  SER.rows.forEach((name, i) => {
    const t0 = S.rows[i], a = K.inv(t0 - 0.05, t0 + 0.3, t), ry = y + 30 + i * rowH + rowH / 2;
    if (i) { c.save(); c.globalAlpha = 0.5; K.line(c, [[x + 30, ry - rowH / 2], [x + w - 30, ry - rowH / 2]], { key: P.inkSoft, w: 2, boil: 0 }); c.restore(); }
    /* roundel icon (same icons as the title) */
    if (a > 0) {
      c.save(); const s = K.popS(a); c.translate(x + 110, ry); c.scale(s, s);
      K.shape(c, K.ellipsePts(0, 0, 60, 60, 28), { fill: ROUND_C[i], w: 3.5, smooth: true, seed: 3520 + i * 5 });
      K.shape(c, K.ellipsePts(0, 0, 44, 44, 24), { fill: P.cream, w: 3, smooth: true, seed: 3521 + i * 5 });
      ICONS[i](c, 44); c.restore();
    }
    /* name flips in as a row of flaps */
    const n = name.length, cw = 46, fl = K.inv(t0, t0 + 0.45, t);
    if (fl > 0) for (let k = 0; k < n; k++) {
      const fk = K.clamp(fl * (n + 4) - k, 0, 1);
      K.flapChar(c, x + 210 + k * (cw + 4), ry - 38, cw, 76, name[k], { flip: fk, prev: " ", seed: 3530 + i * 40 + k, color: i === 3 ? P.mustardLight : P.flapText, size: 54 });
    }
    /* platform number */
    if (a > 0) K.flap(c, x + w - 90, ry, String(i + 1), { h: 92, a, prev: " ", flip: K.inv(t0 + 0.1, t0 + 0.4, t), seed: 3600 + i * 5, color: P.mustardLight });
  });
  /* Mr. Tick */
  const pulse = K.pulse(t, 1, 6), st = { blink: K.blinkAt(t, 81), seed: 700, squash: 0.06 * pulse, mouth: "smile", look: [-1, -1], brow: 0.6 };
  const r = S.rows.filter((q) => t >= q).length;
  st.handL = r > 0 ? { x: -120, y: -230 + 10 * Math.sin(r * 2), hold: "point" } : { x: -64, y: -74 };
  st.handR = { x: 66, y: -110, hold: "watch", lid: 1 };
  const wh = Math.sin(Math.PI * K.inv(S.deck - 0.1, S.deck + 0.7, t));
  if (wh > 0) { st.handR = { x: 30, y: -172, hold: "whistle", wAng: Math.PI * 1.04 }; st.mouth = "whistle"; st.puff = wh; st.blink = 0; st.look = [0, -0.4]; st.squash = -0.15 * wh; }
  K.mouse(c, 1640, 1010, 1.5, st);
  if (wh > 0.1) { const age = K.inv(S.deck, S.deck + 0.8, t); K.puff(c, 1640 - 50 - 60 * age, 1010 - 1.5 * 230 - 160 * age, 46, age, 3650); }
}
