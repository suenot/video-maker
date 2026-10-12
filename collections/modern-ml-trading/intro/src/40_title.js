/* ============================================================
   INTRO 40 TITLE: art-deco marquee drops on "Modern ML for Trading",
   DOM letters fall into it, bulbs chase on eighth notes, five episode
   medals pop on "steal the show". Title text is DOM (crisp, per language);
   the marquee is canvas ink in screen space.
   ============================================================ */
const MQ = { cx: 860, cy: 196, w: 1140, h: 246 }; /* shifted left: the marketmaker.cc plate owns the top-right corner */
const MEDAL_Y = 952, MEDAL_R = 50;
function marqueeDrop(t) {
  const u = K.inv(T.title, T.title + 0.55, t);
  if (u <= 0) return null;
  const y = -560 * (1 - K.E.back(u, 1.5)), d = t - T.title;
  return { y, rot: 0.035 * Math.exp(-d * 2.5) * Math.sin(d * 9) };
}

/* five episode icons, language-free: anomaly, AutoML, Bayesian, conformal band, diffusion */
const ICONS = [
  (c, r) => { K.line(c, [[-r * 0.6, r * 0.2], [-r * 0.25, r * 0.15], [-r * 0.05, -r * 0.55], [r * 0.12, r * 0.2], [r * 0.6, r * 0.1]], { stroke: P.paper, w: 4, boil: 0.4, seed: 1 }); K.dot(c, -r * 0.05, -r * 0.55, r * 0.12, P.bad, P.ink, 2, 2); },
  (c, r) => { for (let i = 0; i < 8; i++) { const a = (i / 8) * K.TAU; K.line(c, [[Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32], [Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55]], { stroke: P.paper, w: 6, boil: 0.3, seed: 10 + i, taper: false }); } K.dot(c, 0, 0, r * 0.34, P.paper, P.ink, 2.5, 19); K.dot(c, 0, 0, r * 0.12, P.glassDeep, P.ink, 2, 20); },
  (c, r) => { const p = []; for (let i = 0; i <= 12; i++) { const x = -0.6 + (i / 12) * 1.2; p.push([x * r, r * 0.4 - Math.exp(-x * x * 9) * r * 0.85]); } K.line(c, p, { stroke: P.paper, w: 4.5, boil: 0.4, seed: 30 }); },
  (c, r) => { c.save(); c.globalAlpha = 0.55; c.fillStyle = P.glass; c.beginPath(); c.moveTo(-r * 0.6, r * 0.05); c.lineTo(r * 0.6, -r * 0.45); c.lineTo(r * 0.6, -r * 0.05); c.lineTo(-r * 0.6, r * 0.45); c.closePath(); c.fill(); c.restore(); K.line(c, [[-r * 0.6, r * 0.25], [r * 0.6, -r * 0.25]], { stroke: P.paper, w: 4.5, boil: 0.4, seed: 40 }); },
  (c, r) => { for (let i = 0; i < 9; i++) K.dot(c, K.hs(i, 3) * r * 0.5 - r * 0.15, K.hs(i, 4) * r * 0.5, r * 0.07, P.paper, null, 0, 50 + i); K.line(c, [[r * 0.05, 0], [r * 0.32, 0]], { stroke: P.brassLight, w: 3.5, boil: 0.3, seed: 60 }); K.dot(c, r * 0.48, 0, r * 0.14, P.brassLight, P.ink, 2, 61); },
];
const MEDAL_COLORS = [P.bad, P.glassDeep, P.copper, P.glassDark, P.owlDark];

function drawTitleCanvas(t) {
  K.screen(ctx);
  const m = marqueeDrop(t);
  if (m) {
    ctx.save(); ctx.translate(MQ.cx, MQ.cy + m.y); ctx.rotate(m.rot); ctx.translate(-MQ.cx, -MQ.cy);
    K.marquee(ctx, MQ.cx, MQ.cy, MQ.w, MQ.h, 1, { seed: 560, chase: Math.floor((t - T.title) / (BEAT / 2)) });
    ctx.restore();
  }
  for (let i = 0; i < 5; i++) {
    const t0 = T.show + (i * BEAT) / 2, a = K.inv(t0, t0 + 0.35, t);
    if (a <= 0) continue;
    const s = K.E.back(a, 2.6), x = MQ.cx + (i - 2) * 150, y = MEDAL_Y + 5 * Math.sin(t * 2.4 + i) - 8 * K.pulse(t - i * 0.06, 1, 6);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.medal(ctx, 0, 0, MEDAL_R, { seed: 600 + i * 7, color: MEDAL_COLORS[i], icon: ICONS[i] });
    ctx.restore();
  }
  return m;
}

function layoutTitleDom(t, m) {
  titleEl.style.opacity = m ? "1" : "0";
  if (!m) return;
  const n = TITLE_LN.length, sizes = TITLE_LN.map((d) => +d.dataset.size), gap = 6;
  const total = sizes.reduce((a, b) => a + b, 0) * 1.12 + gap * (n - 1);
  let y = MQ.cy + m.y - total / 2;
  TITLE_LN.forEach((d, i) => { d.style.left = (MQ.cx - 960) + "px"; d.style.top = y.toFixed(1) + "px"; d.style.transform = `rotate(${(m.rot * 57.3).toFixed(2)}deg)`; d.style.transformOrigin = "960px " + (MQ.cy + m.y - y).toFixed(0) + "px"; y += sizes[i] * 1.12 + gap; });
  TITLE_CH.forEach((c) => {
    const t0 = T.letters + c.idx * 0.03, a = K.inv(t0, t0 + 0.38, t);
    const yy = (1 - K.E.back(a, 2.2)) * -120, land = K.inv(t0 + 0.26, t0 + 0.5, t);
    const sq = Math.sin(land * Math.PI) * 0.18 * (1 - land);
    const beatHop = -5 * K.pulse(t, 2, 6) * K.inv(T.show, T.show + 0.2, t) * (c.line === n - 1 ? 1 : 0);
    c.el.style.opacity = a > 0 ? Math.min(1, a * 3).toFixed(2) : "0";
    c.el.style.transform = `translateY(${(yy + beatHop).toFixed(1)}px) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
  });
}
