/* ============================================================
   INTRO 55 LEVERAGE: the asymmetric (GJR) GARCH picture, on a surf poster.
   Top card: the price; bottom card: sigma. The same-size drop and rise
   (-12 % / +12 %) get very different swells: drops raise volatility far
   more than rises (the leverage effect). Siggy points at the drop's spike.
   ============================================================ */
const LEV = { price: { x: 780, y: 360, w: 1360, h: 400 }, sig: { x: 780, y: 800, w: 1360, h: 400 } };
const PRICE = [], LSIG = [];
(function () {
  const rnd = K.mulberry(1955), n = 60;
  /* designed daily returns (%): drift, a sharp drop (days 18-21), a slow climb, a sharp rise (days 40-43) */
  let p = 100, s2 = 0.4;
  for (let i = 0; i < n; i++) {
    let r = 0.15 + (rnd() - 0.5) * 0.9;
    if (i >= 18 && i < 22) r = -3.2 + (rnd() - 0.5) * 0.6;
    else if (i >= 22 && i < 38) r = 0.35 + (rnd() - 0.5) * 0.8;
    else if (i >= 40 && i < 44) r = 3.0 + (rnd() - 0.5) * 0.6;
    /* GJR-GARCH: sigma2 = omega + (alpha + gamma * [r < 0]) * r^2 + beta * sigma2 */
    s2 = 0.08 + (0.03 + (r < 0 ? 0.28 : 0)) * r * r + 0.72 * s2;
    p *= 1 + r / 100; PRICE.push(p); LSIG.push(Math.sqrt(s2));
  }
})();

function drawLeverage(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1, rot: 0 });
  drawPosterBack(t);
  const draw = K.inv(T.lev + 0.1, T.lev + 1.5, t), A = LEV.price, B = LEV.sig;
  const pc = K.posterChart(ctx, A.x, A.y, A.w, A.h, [{ kind: "line", data: PRICE, color: P.seaDeep, w: 7 }], { a: K.inv(T.unroll[0], T.lev, t), draw, seed: 43, yMin: 84, yMax: 106 });
  const sc = K.posterChart(ctx, B.x, B.y, B.w, B.h, [{ kind: "area", data: LSIG, color: P.sigma, w: 7 }, { kind: "line", data: LSIG, color: P.sigma, w: 7 }], { a: K.inv(T.unroll[0] + 0.1, T.lev + 0.1, t), draw, seed: 45, yMin: 0, yMax: 2.8, header: false });
  if (pc && sc) {
    /* tags appear as the pen passes the move */
    const tg = (day) => K.inv(T.lev + 0.1 + 1.4 * (day / 60), T.lev + 0.4 + 1.4 * (day / 60), t);
    K.tag(ctx, pc.X(20), pc.Y(PRICE[21]) + 54, "-12 %", { a: tg(21), fill: P.storm, size: 34, seed: 191 });
    K.tag(ctx, pc.X(42), pc.Y(PRICE[43]) - 50, "+12 %", { a: tg(43), fill: P.up, size: 34, seed: 192 });
    /* the spikes: a big coral arrow for the drop, a small green one for the rise */
    const pk = (d0, d1) => { let m = 0, k = d0; for (let i = d0; i < d1; i++) if (LSIG[i] > m) { m = LSIG[i]; k = i; } return k; };
    const kd = pk(18, 30), ku = pk(40, 52);
    K.tag(ctx, sc.X(kd) + 90, sc.Y(LSIG[kd]) + 10, "σ " + LSIG[kd].toFixed(1), { a: tg(kd + 1), fill: P.storm, size: 32, seed: 193 });
    K.tag(ctx, sc.X(ku) + 90, sc.Y(LSIG[ku]) - 20, "σ " + LSIG[ku].toFixed(1), { a: tg(ku + 1), fill: P.up, size: 32, seed: 194 });
  }
  /* the leverage medal and Siggy on the right */
  K.medal(ctx, 1690, 330, 120, { a: K.inv(T.lev + 0.2, T.lev + 0.55, t), color: P.storm, icon: K.ICON.leverage, seed: 670 });
  const up = K.E.back(K.inv(T.lev + 0.3, T.lev + 0.7, t), 1.6), pt = K.inv(T.levPoint, T.levPoint + 0.3, t);
  if (up > 0) K.turtle(ctx, 1700, 1250 - 220 * up, 1.2, {
    seed: 700, blink: K.blinkAt(t, 17), mouth: pt > 0 ? "wow" : "smile", shades: 20 * pt, eyeUp: 2 * pt, look: [-1, -0.2], turn: -0.6, brow: 1.2 * pt,
    squash: 0.08 * K.pulse(t, 1, 6) - 0.15 * Math.sin(pt * Math.PI), flipL: { x: K.lerp(-110, -230, K.E.back(pt, 1.6)), y: K.lerp(-90, -170, pt) }, flipR: { x: 100, y: -80 },
  });
}
