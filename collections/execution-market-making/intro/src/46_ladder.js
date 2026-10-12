/* ============================================================
   INTRO 46 LADDER: "Buy the bid and sell the ask just so" (chorus 1: 18.5 s,
   chorus 2: 40.5 s). The order book is the station's departure board: asks
   (tomato) above, bids (teal) below. On "bid" Mr. Tick's mustard quote tab
   slides into the best bid, on "ask" into the best ask; on "just so" both
   get filled, the rows flash and the spread pops as a luggage tag.
   Chorus 2 is the same board later in the day: the tag shows the running total.
   ============================================================ */
const LAD = { x: 250, y: 120, w: 980, rowH: 96 };
/* morning book (chorus 1) and afternoon book (chorus 2): same spread, the market has moved */
const BOOK1 = [["", "100.04", "900"], ["", "100.03", "600"], ["", "100.02", "300"], null, ["300", " 99.98", ""], ["700", " 99.97", ""], ["1 100", " 99.96", ""]];
const BOOK2 = [["", "100.14", "800"], ["", "100.13", "500"], ["", "100.12", "400"], null, ["400", "100.08", ""], ["600", "100.07", ""], ["900", "100.06", ""]];

function drawLadder(c, t, L, total, book) {
  const rows = book;
  K.begin(c, t, { x: 960, y: 540, z: K.tw(t, L.t0 - 0.4, L.end, 1.05, 1.0, K.E.out3), rot: 0 });
  K.applyCam(c, 1);
  /* station hall: cream wall, teal wainscot, arched windows */
  K.shape(c, [[-200, -200], [2200, -200], [2200, 1400], [-200, 1400]], { fill: P.cream, key: null, boil: 0, seed: 3200, tone: { color: P.creamDeep, gap: 12, r: 0.4, r2: 2.6, dir: Math.PI / 2, alpha: 0.6 } });
  [1420, 1720].forEach((x, i) => {
    const pts = K.arcPts(x, 260, 110, Math.PI, K.TAU, 10).concat([[x + 110, 560], [x - 110, 560]]);
    K.shape(c, pts, { fill: P.tealPale, w: 3.5, seed: 3201 + i, tone: { color: P.cream, gap: 12, r: 3, r2: 0, dir: -Math.PI / 2, alpha: 0.5 } });
    K.line(c, [[x, 150], [x, 560]], { w: 3, seed: 3203 + i }); K.line(c, [[x - 110, 380], [x + 110, 380]], { w: 3, seed: 3205 + i });
  });
  K.shape(c, [[-200, 820], [2200, 820], [2200, 1400], [-200, 1400]], { fill: P.teal, w: 3, seed: 3210, shade: { color: P.tealDark, dx: 0, dy: 24 } });
  /* the board */
  const { x, y, w, rowH } = LAD, H = rows.length * rowH + 130;
  K.shape(c, K.rrectPts(x, y, w, H, 20, 4), { fill: P.board, w: 4, seed: 3220, reg: 0, shade: { color: "#1c1c20", dx: 0, dy: 14 } });
  K.shape(c, K.rrectPts(x + 14, y + 14, w - 28, 70, 10, 3), { fill: P.mustard, w: 2.5, seed: 3221 });
  const colX = [x + 150, x + w / 2, x + w - 150];
  K.text(c, "BID", colX[0], y + 50, { size: 40, weight: 800, fill: P.ink, track: 4 });
  K.text(c, "ASK", colX[2], y + 50, { size: 40, weight: 800, fill: P.ink, track: 4 });
  const flash = Math.max(0, Math.sin(Math.PI * K.inv(L.fill, L.fill + 0.5, t)));
  rows.forEach((r, i) => {
    const ry = y + 110 + i * rowH + rowH / 2;
    if (!r) { /* the spread row */
      c.save(); c.setLineDash([14, 10]); K.line(c, [[x + 40, ry], [x + w - 40, ry]], { key: P.inkSoft, w: 3, boil: 0 }); c.restore();
      return;
    }
    const best = i === 2 || i === 4;
    const a = K.inv(L.t0 - 0.2 + i * 0.06, L.t0 + 0.1 + i * 0.06, t);
    if (best && flash > 0) K.shape(c, K.rrectPts(x + 24, ry - rowH / 2 + 8, w - 48, rowH - 16, 10, 2), { fill: P.mustardLight, w: 2, seed: 3230 + i, alpha: flash });
    const ask = i < 3, col = flash > 0.3 && best ? P.ink : ask ? P.tomatoLight : P.tealPale;
    c.save(); c.globalAlpha *= a;
    K.text(c, r[0], colX[0], ry + 2, { size: 48, weight: 700, font: K.FONT.mono, fill: col });
    K.text(c, r[1], colX[1], ry + 2, { size: 56, weight: 700, font: K.FONT.mono, fill: flash > 0.3 && best ? P.ink : P.cream });
    K.text(c, r[2], colX[2], ry + 2, { size: 48, weight: 700, font: K.FONT.mono, fill: col });
    c.restore();
  });
  /* Mr. Tick's quote tabs (mouse-ear badge) slide in from the board edges */
  const tab = (u, row, side, seed) => {
    if (u <= 0) return;
    const ry = y + 110 + row * rowH + rowH / 2, tx = side < 0 ? K.lerp(x - 260, x - 70, K.E.back(u, 1.6)) : K.lerp(x + w + 260, x + w + 70, K.E.back(u, 1.6));
    const pts = side < 0 ? [[tx - 70, ry - 34], [tx + 40, ry - 34], [tx + 70, ry], [tx + 40, ry + 34], [tx - 70, ry + 34]] : [[tx + 70, ry - 34], [tx - 40, ry - 34], [tx - 70, ry], [tx - 40, ry + 34], [tx + 70, ry + 34]];
    K.shape(c, pts, { fill: P.mustard, w: 3, seed, shade: { color: P.mustardDark, dx: 0, dy: -8 } });
    const bx = tx - side * 10; /* the badge: a tiny mouse head */
    K.dot(c, bx - 14, ry - 12, 10, P.fur, P.ink, 2, seed + 1); K.dot(c, bx + 14, ry - 12, 10, P.fur, P.ink, 2, seed + 2);
    K.dot(c, bx, ry + 4, 16, P.fur, P.ink, 2, seed + 3); K.dot(c, bx, ry + 8, 3.5, P.ink, null, 0, seed + 4);
  };
  tab(K.inv(L.bid - 0.1, L.bid + 0.3, t), 4, -1, 3240);
  tab(K.inv(L.ask - 0.1, L.ask + 0.3, t), 2, 1, 3250);
  /* fills: coins fly from the best rows to a pile at his feet; the spread tag */
  const pile = [1560, 990];
  for (let i = 0; i < 8; i++) {
    const t0 = L.fill + 0.05 + i * BEAT * 0.25, u = K.inv(t0, t0 + 0.45, t); if (u <= 0) continue;
    const sx = i % 2 ? x + w + 40 : x + w - 40, sy = y + 110 + (i % 2 ? 2 : 4) * rowH + rowH / 2;
    const rx = pile[0] + ((i % 3) - 1) * 28, ry = pile[1] - 14 - Math.floor(i / 2) * 15;
    const cx = K.lerp(sx, rx, u), cy = K.lerp(sy, ry, u) - 220 * Math.sin(Math.PI * u);
    K.coin(c, u >= 1 ? rx : cx, u >= 1 ? ry : cy, 26, { seed: 3260 + i * 3, label: "¢", size: 24 });
  }
  const sa = K.inv(L.fill + 0.35, L.fill + 0.7, t);
  if (sa > 0) K.tag(c, x + w / 2, y + 110 + 3 * rowH + rowH / 2 - 4, total, { a: sa, size: 54, color: P.mustardLight });
  /* Mr. Tick beside the board */
  const pulse = K.pulse(t, 1, 6), st = { blink: K.blinkAt(t, 61), seed: 700, squash: 0.06 * pulse, mouth: "smile", look: [-1, -0.5] };
  const pb = K.inv(L.bid - 0.15, L.bid + 0.1, t), pa = K.inv(L.ask - 0.15, L.ask + 0.1, t), fl = K.inv(L.fill, L.fill + 0.2, t);
  st.handL = pb > 0 ? { x: -130, y: -150 + 40 * (1 - pa), hold: "point" } : { x: -64, y: -74 };
  st.handR = { x: 66, y: -78 };
  if (pa > 0) { st.handL = { x: -130, y: -230, hold: "point" }; st.look = [-1, -1]; }
  if (fl > 0) {
    const hp = K.inv(L.fill + 0.3, L.fill + 0.75, t);
    st.handL = { x: -86, y: -150, open: 1 }; st.handR = { x: 86, y: -150, open: 1 }; st.mouth = "grin"; st.look = [0.2, 1]; st.brow = 0.8;
    if (hp > 0 && hp < 1) { st.hop = 46 * Math.sin(Math.PI * hp); st.squash = -0.15 * Math.sin(Math.PI * hp); }
  }
  K.mouse(c, 1640, 1000, 1.5, st);
}
