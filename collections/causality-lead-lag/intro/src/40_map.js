/* ============================================================
   INTRO 40 MAP: "Follow the trail that the markets left" (11.80 - 15.67).
   The city from above after a lightning cut. Two trails walk the streets
   like price paths: A (amber) first, B (blue) takes the same turns two
   beats later. A tiny top-down fox (fedora + tail) follows; price tags pop
   at A's turns.
   ============================================================ */
/* ---------- the map ---------- */
const BLOCK = 300, ROAD = 90;
/* the price route along the street grid (road centre lines are at k * BLOCK) */
const ROUTE = [[0, 1200], [600, 1200], [600, 900], [900, 900], [900, 600], [1500, 600], [1500, 1200], [1800, 1200], [1800, 300], [2400, 300], [2400, 900], [3000, 900]];
const ROUTE_LEN = (() => { let L = 0; for (let i = 1; i < ROUTE.length; i++) L += Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]); return L; })();
function routeAt(d, off) {
  d = K.clamp(d, 0, ROUTE_LEN);
  for (let i = 1; i < ROUTE.length; i++) {
    const a = ROUTE[i - 1], b = ROUTE[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d <= L || i === ROUTE.length - 1) { const u = Math.min(1, d / L), ang = Math.atan2(b[1] - a[1], b[0] - a[0]); return [a[0] + (b[0] - a[0]) * u - Math.sin(ang) * off, a[1] + (b[1] - a[1]) * u + Math.cos(ang) * off, ang]; }
    d -= L;
  }
}
const MAP_T0 = at(6), STEP_D = 140, STEP_T = BEAT / 2; /* a print every eighth note */
/* the camera rides between the newest A print and the fox */
const camZ = K.mkSpline([[at(6), 1.12], [at(8), 0.92]]);
function camMap(t) {
  const el = Math.max(0, t - MAP_T0), a = routeAt(el / STEP_T * STEP_D, 0), f = routeAt(Math.max(0, (el - 3 * BEAT) / STEP_T * STEP_D), 0);
  return { x: (a[0] + f[0]) / 2 + 120, y: (a[1] + f[1]) / 2 - 40, z: camZ(t) };
}
function drawMap(t) {
  const cam = Object.assign({ rot: -4 }, camMap(t));
  K.begin(ctx, t, cam);
  K.screen(ctx); ctx.fillStyle = P.street; ctx.fillRect(0, 0, 1920, 1080);
  K.applyCam(ctx, 1);
  ctx.fillStyle = P.streetLight; ctx.fillRect(-1000, -800, 5200, 3200);
  /* lane dashes along every road */
  ctx.save(); ctx.strokeStyle = K.rgba(P.greyLight, 0.28); ctx.lineWidth = 5; ctx.setLineDash([26, 30]); ctx.beginPath();
  for (let k = -3; k < 13; k++) { ctx.moveTo(k * BLOCK, -800); ctx.lineTo(k * BLOCK, 2400); ctx.moveTo(-1000, k * BLOCK); ctx.lineTo(4200, k * BLOCK); }
  ctx.stroke(); ctx.restore();
  /* roof blocks between the roads */
  for (let bx = -900; bx < 3600; bx += BLOCK) for (let by = -600; by < 2100; by += BLOCK) {
    const k = K.hash(Math.round(bx * 7 + by), 5), x = bx + ROAD / 2, y = by + ROAD / 2, s = BLOCK - ROAD;
    K.shape(ctx, K.rectPts(x, y, s, s, 2), { fill: k < 0.3 ? P.bldg : P.bldgDark, w: 5, boil: 0.8, seed: 400 + Math.round(k * 997), shade: { color: P.ink, dx: -22, dy: -22 } });
    if (k > 0.55) { K.shape(ctx, K.ellipsePts(x + s * 0.7, y + s * 0.3, 26, 26, 10), { fill: P.bldgLight, w: 3, boil: 0.6, seed: 410 + Math.round(k * 97) }); }
    if (k < 0.2) K.glow(ctx, x + s * 0.3, y + s * 0.6, 40, K.rgba(P.amber, 0.6), 0.7); /* skylight */
  }
  /* street lamps at crossings */
  for (let x = 0; x < 3300; x += BLOCK * 2) for (let y = 0; y < 1600; y += BLOCK * 2) K.glow(ctx, x, y, 90, K.rgba(P.amberGlow, 0.5), 0.6);
  K.ripples(ctx, -200, 3200, -200, 1500, t, { n: 40, alpha: 0.35 });
  /* the two trails */
  const el = t - MAP_T0;
  [[0, P.A, -34, 0], [1, P.B, 34, 2 * BEAT]].forEach(([k, col, off, lag]) => {
    const nShown = (el - lag) / STEP_T;
    for (let i = 0; i < Math.min(nShown, ROUTE_LEN / STEP_D); i++) {
      const q = routeAt(i * STEP_D, off + (i % 2 ? 9 : -9));
      K.paw(ctx, q[0], q[1], 1.25, q[2], col, K.clamp(nShown - i, 0, 1));
    }
  });
  /* price tags at A's turns */
  const tags = [["101", 1], ["98", 3], ["104", 5], ["97", 7], ["106", 9]];
  let dd = 0;
  for (let i = 1; i < ROUTE.length; i++) {
    dd += Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]);
    const tg = tags.find((g) => g[1] === i); if (!tg) continue;
    const t0 = MAP_T0 + (dd / STEP_D) * STEP_T;
    K.tag(ctx, ROUTE[i][0] + 70, ROUTE[i][1] - 70, tg[0], { a: ap(t, t0, 0.35), hot: true, size: 54, seed: 430 + i, anchor: [ROUTE[i][0], ROUTE[i][1]] });
  }
  /* the top-down fox, a beat behind B */
  const fq = routeAt(Math.max(0, (el - 3 * BEAT) / STEP_T * STEP_D), 0);
  if (el > 3 * BEAT) foxTop(fq[0], fq[1], fq[2], t);
  K.screen(ctx);
  K.rain(ctx, t, { n: 160, alpha: 0.28, wind: 0.05, len: 30 });
}
/* the fox seen from above: tail, coat shoulders, fedora */
function foxTop(x, y, ang, t) {
  K.glow(ctx, x, y, 170, K.rgba(P.amberGlow, 0.55), 0.8);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1.7, 1.7);
  const sw = Math.sin(t * 10) * 0.3;
  ctx.save(); ctx.rotate(Math.PI + sw);
  K.shape(ctx, [[20, 0], [60, -18], [100, -6], [110, 8], [70, 18]], { fill: P.fur, w: 4, boil: 0.8, seed: 450, shade: { color: P.furDark, dx: 0, dy: 6 } });
  K.shape(ctx, [[92, -8], [112, -2], [110, 10], [96, 12]], { fill: P.cream, w: 3, boil: 0.6, seed: 451 });
  ctx.restore();
  K.shape(ctx, K.ellipsePts(0, 0, 34, 48, 14), { fill: P.coat, w: 4.5, boil: 0.8, seed: 452, shade: { color: P.coatDark, dx: -6, dy: -8 } });
  K.shape(ctx, [[30, -22], [58, -30], [38, -6]], { fill: P.fur, w: 3.5, boil: 0.6, seed: 453 });
  K.shape(ctx, [[30, 22], [58, 30], [38, 6]], { fill: P.fur, w: 3.5, boil: 0.6, seed: 454 });
  K.shape(ctx, K.ellipsePts(20, 0, 7, 7, 8), { fill: P.nose, stroke: null, w: 0, boil: 0.4, seed: 455 });
  K.shape(ctx, K.ellipsePts(0, 0, 40, 40, 16), { fill: P.greyDark, w: 4.5, boil: 0.8, seed: 456, shade: { color: P.hat, dx: 8, dy: 8 } });
  K.shape(ctx, K.ellipsePts(0, 0, 24, 22, 12), { fill: P.hat, w: 3.5, boil: 0.6, seed: 457 });
  K.shape(ctx, K.ellipsePts(0, 0, 24, 22, 12), { fill: null, stroke: P.amber, w: 3, boil: 0.6, seed: 458 });
  ctx.restore();
}
