/* ============================================================
   INTRO 60 TITLE: back on the rainy street (52.84 - 64.5).
   52.84 venetian-blind wipe from the board
   53.84 "find the cause and test it twice": the case file gets two stamps
   55.84 "Causality and Lead-Lag in Markets!": the marquee plate unfolds,
         title letters drop in (DOM text, one per language)
   57.84 six case badges pop on eighth notes (one per episode topic)
   59.84 hat tip; 61.84 wink; 63.84 the lamp goes out, the marquee stays
   ============================================================ */
const PLATE = { cx: 960, cy: 190, w: 1560, h: 290 };
const CAM_TITLE = { x: 1500, y: 540, z: 1, rot: 0 };
const FOX_T = { x: 330, y: 820, s: 1.1 };
const BADGE_Y = 478, BADGE_R = 54;

/* six language-free episode icons: causal graph, Granger (lagged waves), transfer
   entropy (bits on an arrow), lead-lag paws, confounder (mask), causal forest (tree) */
const ICONS = [
  (c, r) => { const p = [[0, -r * 0.42], [-r * 0.42, r * 0.36], [r * 0.42, r * 0.36]]; [[0, 1], [0, 2], [1, 2]].forEach(([a, b], i) => K.line(c, [p[a], p[b]], { stroke: P.string, w: 4, boil: 0.5, seed: 1 + i, gap: 0, taper: false })); p.forEach((q, i) => K.dot(c, q[0], q[1], r * 0.15, P.paper, P.ink, 2.5, 4 + i)); },
  (c, r) => { [[0, P.amberDeep], [r * 0.3, P.B]].forEach(([dx, col], k) => { const pts = []; for (let i = 0; i <= 8; i++) { const x = -r * 0.62 + i * r * 0.14; pts.push([x + dx * 0.4, Math.sin((x - dx) / r * 5) * r * 0.25 + (k ? r * 0.12 : -r * 0.12)]); } K.line(c, pts, { stroke: col, w: 4.5, boil: 0.5, seed: 10 + k, gap: 0, taper: false }); }); },
  (c, r) => { K.line(c, [[-r * 0.55, r * 0.1], [r * 0.4, r * 0.1]], { stroke: P.ink, w: 5, boil: 0.5, seed: 20, gap: 0, taper: false }); K.shape(c, [[r * 0.58, r * 0.1], [r * 0.3, -r * 0.08], [r * 0.3, r * 0.28]], { fill: P.ink, w: 2, boil: 0.4, seed: 21, gap: 0 }); K.text(c, "01", -r * 0.1, -r * 0.24, { size: r * 0.5, weight: 700, font: K.FONT.mono, fill: P.ink }); },
  (c, r) => { K.paw(c, -r * 0.24, r * 0.12, 0.62, -Math.PI / 2, P.amberDeep, 1); K.paw(c, r * 0.26, -r * 0.08, 0.62, -Math.PI / 2, P.B, 1); },
  (c, r) => { K.shape(c, [[-r * 0.62, -r * 0.18], [0, -r * 0.3], [r * 0.62, -r * 0.18], [r * 0.5, r * 0.22], [r * 0.12, r * 0.14], [0, r * 0.3], [-r * 0.12, r * 0.14], [-r * 0.5, r * 0.22]], { fill: P.ink, w: 2.5, boil: 0.5, seed: 30, gap: 0 }); [-1, 1].forEach((sd) => K.shape(c, K.ellipsePts(sd * r * 0.28, -r * 0.02, r * 0.13, r * 0.07, 8), { fill: P.amberGlow, stroke: null, w: 0, boil: 0.3, seed: 31 + sd })); },
  (c, r) => { K.shape(c, K.rectPts(-r * 0.08, r * 0.05, r * 0.16, r * 0.45, 1), { fill: P.furDark, w: 2.5, boil: 0.4, seed: 40 }); K.shape(c, K.blobPts(0, -r * 0.18, r * 0.48, r * 0.36, 12, 4, 0.25), { fill: P.C, w: 3, boil: 0.6, seed: 41, shade: { color: "#6f8a58", dx: -6, dy: -5 } }); },
];

/* brass shield badge */
function badge(c, x, y, r, a, i) {
  const s = K.E.back(a, 2.6);
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(Math.sin(K.now * 1.5 + i) * 0.04);
  const sh = [[-r, -r * 0.78], [0, -r * 1.02], [r, -r * 0.78], [r * 0.9, r * 0.25], [0, r * 1.02], [-r * 0.9, r * 0.25]];
  K.shape(c, sh, { fill: P.brass, w: 5, boil: 0.9, seed: 800 + i * 5, shade: { color: P.brassDark, dx: -9, dy: -9 } });
  K.shape(c, sh.map((p) => [p[0] * 0.78, p[1] * 0.78 - 2]), { fill: P.paper, w: 3, boil: 0.7, seed: 801 + i * 5 });
  ICONS[i](c, r * 0.95);
  c.restore();
}

function caseFile(t) {
  /* the manila folder the fox holds up; stamps land on it */
  const u = ap(t, at(26), 0.4); if (u <= 0) return;
  const lower = ap(t, at(27, 2), 0.5), x = 560, y = 650 + 700 * K.E.in3(lower), s = K.E.back(u, 2) * (1 - 0.3 * lower);
  K.screen(ctx); ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(s, s);
  K.shape(ctx, [[-150, -100], [-60, -100], [-44, -118], [40, -118], [56, -100], [150, -100], [150, 100], [-150, 100]], { fill: "#c7a265", w: 5, boil: 1, seed: 820, shade: { color: "#9a7a45", dx: -10, dy: -10 } });
  for (let i = 0; i < 4; i++) K.line(ctx, [[-110, -50 + i * 32], [i === 3 ? 20 : 110, -50 + i * 32]], { stroke: "#8a6a3a", w: 5, boil: 0.5, seed: 821 + i, taper: false });
  [[at(26, 2), -60, 20], [at(26, 3), 70, 30]].forEach(([t0, sx, sy], k) => {
    const v = ap(t, t0, 0.25); if (v <= 0) return;
    const sc = 1 + 0.7 * (1 - K.E.out3(v));
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.25 + k * 0.3); ctx.scale(sc * 0.75, sc * 0.75); ctx.globalAlpha *= Math.min(1, v * 3) * 0.9;
    K.shape(ctx, K.ellipsePts(0, 0, 70, 70, 22), { stroke: "#2f7a3a", w: 10, boil: 1, seed: 830 + k, gap: 0.08 });
    K.line(ctx, [[-32, 0], [-8, 24], [36, -28]], { stroke: "#2f7a3a", w: 15, boil: 0.8, seed: 832 + k, gap: 0, taper: false });
    ctx.restore();
  });
  ctx.restore();
}

function titleLampOn(t) {
  const d = t - at(31); if (d < 0) return 1;
  if (d < 0.4) return [1, 0.2, 0.8, 0, 0.5, 0][Math.floor(d * 15) % 6];
  return 0;
}
function foxTitlePose(t) {
  const tip = ap(t, at(29), 0.3) * (1 - ap(t, at(29, 2.5), 0.3));
  const wink = ap(t, at(30), 0.12) * (1 - ap(t, at(30, 1.5), 0.15));
  const hold = 1 - ap(t, at(27, 2), 0.4);
  return {
    seed: 780, light: titleLampOn(t), squash: 0.08 * K.pulse(t, 1, 6) + 0.25 * Math.sin(Math.PI * ap(t, at(27), 0.3)),
    hop: 30 * Math.sin(Math.PI * ap(t, at(27), 0.45)), blink: wink > 0 ? 0 : K.blinkAt(t, 19), lid: wink > 0.5 ? 0.3 : 0.3,
    mouth: t > at(27) ? "grin" : "smirk", look: [0.7, -0.4], turn: 0.3,
    hatTip: -18 * tip, hatLift: 20 * tip,
    pawL: tip > 0 ? { x: -60, y: -390 } : { x: -86, y: -100 },
    pawR: hold > 0 ? { x: 160, y: -190 } : { x: 140, y: -230, rot: -30 },
    hold: hold > 0 ? null : "magnifier", tail: Math.sin(t * 3) + 0.5 * K.pulse(t, 1, 6),
    winkR: wink,
  };
}
function drawTitleScene(t) {
  const lamp = titleLampOn(t);
  const drift = K.ss(at(26), DUR, t);
  drawStreetSet(t, { x: CAM_TITLE.x + 40 * drift, y: CAM_TITLE.y - 10 * drift, z: 1 + 0.04 * drift, rot: 0 }, {
    lamp, flash: K.flash(t, at(27)) * 0.5,
    extra: (tt) => {
      const st = foxTitlePose(tt);
      K.fox(ctx, FOX_T.x + CAM_TITLE.x - 960, FOX_T.y, FOX_T.s, st);
      /* the wink: one lid closed, drawn over the right eye */
      if (st.winkR > 0.5) {
        const ex = FOX_T.x + CAM_TITLE.x - 960 + (28 + 0.3 * 14 + 0.3 * 6) * FOX_T.s, ey = FOX_T.y + (-276 - 16) * FOX_T.s;
        K.shape(ctx, K.ellipsePts(ex, ey, 22 * FOX_T.s, 15 * FOX_T.s, 10), { fill: P.fur, stroke: null, w: 0, boil: 0.4, seed: 790 });
        K.line(ctx, [[ex - 18, ey + 2], [ex, ey + 8], [ex + 18, ey + 2]], { stroke: P.ink, w: 5, boil: 0.5, seed: 791, gap: 0 });
      }
    },
  });
  caseFile(t);
  /* marquee plate + badges (screen space) */
  K.screen(ctx);
  const u = K.inv(at(27), at(27, 1.2), t);
  if (u > 0) K.banner(ctx, PLATE.cx, PLATE.cy, PLATE.w, PLATE.h, u, { seed: 71 });
  for (let i = 0; i < 6; i++) {
    const t0 = at(28) + i * BEAT / 2, a = ap(t, t0, 0.35); if (a <= 0) continue;
    badge(ctx, 1085 + (i - 2.5) * 136, BADGE_Y + 6 * Math.sin(t * 2.4 + i) - 10 * K.pulse(t - i * 0.08, 1, 6), BADGE_R, a, i);
  }
  layoutTitleDom(t);
}

function layoutTitleDom(t) {
  const u = K.inv(at(27), at(27, 1.2), t);
  titleEl.style.opacity = u > 0.5 ? "1" : "0";
  if (u <= 0.5) return;
  const n = TITLE_LN.length, sizes = TITLE_LN.map((d) => +d.dataset.size), gap = 6;
  const total = sizes.reduce((a, b) => a + b, 0) + gap * (n - 1);
  let y = PLATE.cy - total / 2 - 4;
  TITLE_LN.forEach((d, i) => { d.style.top = y.toFixed(1) + "px"; y += sizes[i] + gap; });
  const T0 = at(27, 0.6);
  TITLE_CH.forEach((c) => {
    const t0 = T0 + c.idx * 0.03, a = K.inv(t0, t0 + 0.4, t);
    const yy = (1 - K.E.back(a, 2.4)) * -120, land = K.inv(t0 + 0.28, t0 + 0.5, t);
    const sq = Math.sin(land * Math.PI) * 0.14 * (1 - land);
    const beatHop = c.line === n - 1 ? -5 * K.pulse(t, 4, 6) * K.inv(T0 + 1.2, T0 + 1.4, t) : 0;
    c.el.style.opacity = a > 0 ? Math.min(1, a * 3).toFixed(2) : "0";
    c.el.style.transform = `translateY(${(yy + beatHop).toFixed(1)}px) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
  });
}
