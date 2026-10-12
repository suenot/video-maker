/* ============================================================
   INTRO 30 QUOTES: "Quote both sides and let the spread provide" (9.08 - 10.9 s)
   Two ticket booths: BID (teal) and ASK (tomato). Mr. Tick points to each as
   its split-flap price flips in, then coins from both windows land at his
   feet and the spread tag "+0.04" pops.
   ============================================================ */
const BOOTH = { y: 900, w: 380, h: 420, L: 470, R: 1450 };
const PILE = [1130, 900];

function coinArc(i, t) {
  /* coin i comes from the bid window (even) or the ask window (odd) */
  const t0 = T.coins + i * BEAT * 0.25, u = K.inv(t0, t0 + 0.45, t);
  if (u <= 0) return null;
  const sx = i % 2 ? BOOTH.R - 120 : BOOTH.L + 120, sy = BOOTH.y - BOOTH.h * 0.36;
  const rest = [PILE[0] + ((i % 3) - 1) * 26, PILE[1] - 16 - Math.floor(i / 2) * 15];
  if (u >= 1) return { x: rest[0], y: rest[1], landed: true };
  return { x: K.lerp(sx, rest[0], u), y: K.lerp(sy, rest[1], u) - 200 * Math.sin(Math.PI * u), landed: false };
}

function drawQuotes(c, t) {
  const z = K.tw(t, T.flap1[0], T.flap1[1] + 1.6, 1.04, 1.0, K.E.out3);
  K.begin(c, t, { x: 960, y: 560, z, rot: 0 });
  K.applyCam(c, 0.3);
  K.sky(c, { horizon: 780, sun: [960, 250], sunR: 125 });
  K.cloud(c, 260, 180, 260, 21); K.cloud(c, 1700, 140, 230, 24);
  K.applyCam(c, 0.7);
  K.hills(c, -600, 2600, 820, { h: 170, color: P.hillMid, seed: 27, n: 6 });
  K.applyCam(c, 1);
  K.shape(c, [[-400, BOOTH.y - 10], [2400, BOOTH.y - 10], [2400, 1500], [-400, 1500]], { fill: P.creamShade, w: 3, seed: 1400, tone: { color: P.ink, gap: 10, r: 0.6, r2: 2.4, dir: Math.PI / 2, alpha: 0.22 } });
  const litB = K.inv(T.bid, T.bid + 0.12, t), litA = K.inv(T.ask, T.ask + 0.12, t);
  K.booth(c, BOOTH.L, BOOTH.y, BOOTH.w, BOOTH.h, { color: P.teal, shade: P.tealDark, seed: 1410, lit: litB });
  K.booth(c, BOOTH.R, BOOTH.y, BOOTH.w, BOOTH.h, { color: P.tomato, shade: P.tomatoDark, seed: 1440, lit: litA });
  K.text(c, "BID", BOOTH.L, BOOTH.y - 72, { size: 64, weight: 800, fill: P.cream, track: 6 });
  K.text(c, "ASK", BOOTH.R, BOOTH.y - 72, { size: 64, weight: 800, fill: P.cream, track: 6 });
  /* split-flap prices on the booth roofs */
  K.flap(c, BOOTH.L, BOOTH.y - BOOTH.h - 140, " 99.98", { h: 92, a: K.inv(T.flap1[1] - 0.1, T.flap1[1] + 0.25, t), prev: "      ", flip: K.inv(T.bid, T.bid + 0.4, t), seed: 1470 });
  K.flap(c, BOOTH.R, BOOTH.y - BOOTH.h - 140, "100.02", { h: 92, a: K.inv(T.flap1[1] - 0.05, T.flap1[1] + 0.3, t), prev: "      ", flip: K.inv(T.ask, T.ask + 0.4, t), seed: 1480 });
  /* coin pile at his feet */
  for (let i = 0; i < 10; i++) {
    const q = coinArc(i, t); if (!q) continue;
    K.coin(c, q.x, q.y, 24, { seed: 1500 + i * 3, label: "¢", size: 22 });
  }
  /* the spread: "+0.04" tag above the pile */
  const sa = K.inv(T.spread, T.spread + 0.35, t);
  if (sa > 0) K.tag(c, PILE[0] + 40, BOOTH.y - 470 - 10 * K.pulse(t, 1, 6), "+0.04", { a: sa, size: 58, color: P.mustardLight });
  /* Mr. Tick between the booths */
  const bl = K.blinkAt(t, 21), pulse = K.pulse(t, 1, 6);
  const pb = K.inv(T.bid - 0.08, T.bid + 0.15, t), pa = K.inv(T.ask - 0.08, T.ask + 0.15, t), cn = K.inv(T.coins + 0.2, T.coins + 0.5, t);
  const st = { blink: bl, squash: 0.06 * pulse, seed: 700, mouth: "smile", look: [0, 0] };
  st.handL = pb > 0 ? { x: -60 - 70 * K.E.back(pb, 2), y: -170 - 20 * pb, hold: "point" } : { x: -64, y: -72 };
  st.handR = pa > 0 ? { x: 60 + 70 * K.E.back(pa, 2), y: -170 - 20 * pa, hold: "point" } : { x: 64, y: -72 };
  if (pb > 0) st.look = [-1, -0.4];
  if (pa > 0) st.look = [1, -0.4];
  if (cn > 0) { st.look = [0.6, 1]; st.mouth = "grin"; st.handL = { x: -80, y: -110, open: 1 }; st.handR = { x: 80, y: -110, open: 1 }; st.brow = 0.7; }
  const hp = K.inv(T.spread, T.spread + 0.4, t);
  if (hp > 0 && hp < 1) { st.hop = 50 * Math.sin(Math.PI * hp); st.squash = -0.15 * Math.sin(Math.PI * hp); }
  K.mouse(c, 900, BOOTH.y, 1.3, st);
}
