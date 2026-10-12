/* ============================================================
   INTRO 40 TITLE: kitchen swing doors + the neon sign title card.
   25.02 - 25.80 the doors swing shut and open on the title set.
   25.80 the neon sign flickers on, letters drop in (DOM, per language).
   25.80 outro: the sign lights; 27.38 six episode plates pop on half beats,
         Nibbs tips his toque; Slyce peeks in from the left;
   28.98 the magnifier flashes, Slyce is caught and bolts.
   ============================================================ */
const SIGN = { cx: 940, cy: 362, w: 1220, h: 330 }; /* top edge clears the logo plate (y <= 150) */
const PLATE_Y = 860, PLATE_R = 70;

/* six episode icons, language-free: DEX analytics, AMM pools, MEV sandwich,
   prediction-market traders, onchain flows, blocks */
const ICONS = [
  (c, r) => { [0.35, 0.7, 0.5].forEach((h, i) => K.shape(c, K.rectPts(-r * 0.42 + i * r * 0.3, r * 0.4 - r * h, r * 0.2, r * h, 1), { fill: P.cream, w: 3, boil: 0.4, seed: 3 + i, misreg: false })); },
  (c, r) => { K.rule(c, [[-r * 0.5, -r * 0.15], [r * 0.5, -r * 0.3]], { stroke: P.ink, w: 4, boil: 0.4, seed: 10 }); K.rule(c, [[0, -r * 0.22], [0, r * 0.45]], { stroke: P.ink, w: 4, boil: 0.4, seed: 11 }); K.dot(c, -r * 0.45, r * 0.05, r * 0.16, P.cream, P.ink, 2.5, 12); K.dot(c, r * 0.45, -r * 0.08, r * 0.16, P.cream, P.ink, 2.5, 13); },
  (c, r) => { K.breadSlice(c, -r * 0.3, r * 0.2, r * 0.0042, null, 20); ctx.save(); K.burger(c, r * 0.02, r * 0.28, r * 0.0055, 21, 0); ctx.restore(); K.breadSlice(c, r * 0.34, r * 0.2, r * 0.0042, null, 22); },
  (c, r) => { K.shape(c, K.ellipsePts(0, 0, r * 0.45, r * 0.45, 14), { fill: P.cream, w: 3, boil: 0.4, seed: 30, misreg: false }); K.shape(c, [[0, 0], [0, -r * 0.45], [r * 0.32, -r * 0.32], [r * 0.45, 0], [r * 0.32, r * 0.32]], { fill: P.cherry, w: 3, boil: 0.4, seed: 31, misreg: false }); },
  (c, r) => { K.rule(c, [[-r * 0.35, r * 0.25], [r * 0.3, -r * 0.25]], { stroke: P.ink, w: 4, boil: 0.4, seed: 40 }); K.shape(c, [[r * 0.42, -r * 0.34], [r * 0.12, -r * 0.3], [r * 0.32, -r * 0.08]], { fill: P.ink, w: 2, boil: 0.3, seed: 41, misreg: false }); K.dot(c, -r * 0.38, r * 0.28, r * 0.14, P.cream, P.ink, 2.5, 42); },
  (c, r) => K.chainIcon(c, r * 0.1, 0, r * 0.45, 50),
];
const PLATE_COLORS = [P.cherry, P.USDC, P.mustard, P.teal, P.ETH, P.cherryDark];

/* ---------- swing doors (screen space). u: 0 open .. 1 shut ---------- */
function drawDoors(t) {
  const shut = E.back(inv(T.doors[0], T.doors[0] + 0.38, t), 1.4), open = E.inOut(inv(T.doors[1] - 0.12, T.doors[1] + 0.32, t));
  const k = Math.max(0, Math.min(1.08, shut) * (1 - open));
  if (k <= 0.001) return;
  K.screen(ctx);
  [-1, 1].forEach((sd, i) => {
    const w = 990 * k, x0 = sd < 0 ? -20 : 1940 - w, flex = Math.sin(t * 30) * 4 * (1 - inv(T.doors[0] + 0.38, T.doors[0] + 0.7, t));
    const pts = K.rectPts(x0, -20, w, 1120, 6).map((p) => [p[0] + (p[0] > x0 + 1 && p[0] < x0 + w - 1 ? 0 : 0), p[1] + (Math.abs(p[0] - (sd < 0 ? x0 + w : x0)) < 1 ? flex : 0)]);
    K.shape(ctx, pts, { fill: P.cherry, w: 7, boil: 1.2, seed: 950 + i, shade: { color: P.cherryDark, dx: sd * 40, dy: 0 } });
    const cx = x0 + w / 2;
    K.shape(ctx, K.rectPts(x0 + 40 * k, 820, w - 80 * k, 200, 4), { fill: P.chrome, w: 5, boil: 1, seed: 960 + i, misreg: false, shade: { color: P.chromeDark, dx: 0, dy: -60, dots: false } });
    K.shape(ctx, K.ellipsePts(cx, 360, 150 * k, 150, 18), { fill: P.chrome, w: 6, boil: 1.1, seed: 970 + i, misreg: false });
    K.shape(ctx, K.ellipsePts(cx, 360, 118 * k, 118, 18), { fill: "#ffe7a8", w: 4.5, boil: 1, seed: 980 + i, misreg: false, shade: { color: "#f7cf6a", dx: 18, dy: 18 } });
    K.line(ctx, [[cx - 60 * k, 320], [cx - 30 * k, 280], [cx + 10 * k, 268]], { stroke: "#ffffff", w: 10, boil: 0.5, seed: 990 + i, alpha: 0.8 });
  });
}

function drawTitleSet(t) {
  K.cam = { x: 960, y: 540, z: K.tw(t, T.doors[1], DUR, 1.05, 1.0, E.out3), rot: 0 };
  K.applyCam(ctx, 1);
  K.wall(ctx, -300, 2220, -300, 860, { seed: 13, wainscot: 0.32 });
  K.lamp(ctx, 150, -60, 0.8, 1, 53); K.lamp(ctx, 1770, -60, 0.8, 1, 54);
  /* conveyor keeps the blocks rolling behind the sign */
  K.conveyor(ctx, -300, 2220, 650, BELT_V * t, { seed: 61 });
  for (let k = -1; k < 5; k++) { const x = ((k * 520 + BELT_V * t) % 3120 + 3120) % 3120 - 520; K.block(ctx, x, 650, 0.8, { num: "#19 204 " + (140 + k), items: TRAY_ITEMS(k + 30), seed: 300 + k * 7 }); }
  /* the sign */
  const on = inv(T.sign, T.sign + 0.6, t);
  const box = K.neonSign(ctx, SIGN.cx, SIGN.cy, SIGN.w, SIGN.h, on, { seed: 71, a: inv(T.doors[1] - 0.25, T.doors[1] + 0.2, t) });
  if (on > 0.5) K.glow(ctx, SIGN.cx, SIGN.cy, 900, "rgba(255,93,143,0.35)", 0.35 * on);
  /* Slyce peeks from behind the counter on the left, gets caught, bolts */
  if (t > T.peek) {
    const pk = E.out3(inv(T.peek, T.peek + 0.35, t)), run = inv(T.caught + 0.2, T.caught + 0.8, t);
    const st = { glow: 0.6, look: t < T.caught ? 0.8 : -1, grin: 0.8, seed: 900, sliceR: true, armL: { x: -100, y: -150 }, armR: { x: 120, y: -190 } };
    let x = K.lerp(-40, 150, pk), y = K.lerp(1010, 905, pk);
    if (t > T.caught) { st.shock = 1; st.armL = { x: -110, y: -290 }; st.armR = { x: 110, y: -290 }; y -= Math.sin(Math.min(1, (t - T.caught) / 0.35) * Math.PI) * 90; }
    if (run > 0) { x = K.lerp(150, -300, E.in3(run)); st.walk = t * 22; st.lean = -16; }
    K.sandwichBot(ctx, x, y, 0.95, st);
  }
  K.counter(ctx, -300, 2220, 860, 260, { seed: 42 });
  /* episode plates pop on half beats */
  for (let i = 0; i < 6; i++) {
    const t0 = T.plates + i * BEAT / 2, a = inv(t0, t0 + 0.35, t); if (a <= 0) continue;
    const s = E.back(a, 2.6), x = 850 + (i - 2.5) * 186, y = PLATE_Y - 6 * K.pulse(t - i * 0.06, 1, 6);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.plate(ctx, 0, 22, 1.0, 610 + i);
    K.coin(ctx, 0, -60, PLATE_R, { color: PLATE_COLORS[i], seed: 620 + i * 7 });
    ctx.translate(0, -60); ICONS[i](ctx, PLATE_R);
    ctx.restore();
  }
  nibbsTitle(t);
  return box;
}
function nibbsTitle(t) {
  const st = { blink: K.blinkAt(t, 11), mouth: "grin", cheeks: 0.4, hold: "magnifier", magS: 1.2, magAng: -58 + Math.sin(t * 2.2) * 3, seed: 700 };
  const enter = inv(T.doors[1], T.doors[1] + 0.45, t), down = (1 - E.back(enter, 1.8)) * 260;
  st.squash = enter < 1 ? -0.2 * Math.sin(enter * Math.PI) : 0.08 * K.pulse(t, 1, 6);
  st.pawR = { x: 100, y: -150 + 10 * K.pulse(t, 1, 6) };
  st.pawL = { x: -80, y: -40 };
  const tip = inv(T.tip, T.tip + 0.3, t) * (1 - inv(T.tip + 0.8, T.tip + 1.1, t));
  if (tip > 0) { st.pawL = { x: K.lerp(-80, -40, tip), y: K.lerp(-40, -250, tip) }; st.toqueTip = -16 * tip; st.toqueLift = 26 * tip; st.wink = tip; }
  if (t > T.peek + 0.1) { /* spots Slyce on the left: glare, flash on the downbeat */
    const sw = E.inOut(inv(T.peek + 0.1, T.caught - 0.05, t));
    st.look = [-sw, 0]; st.brow = -0.8 * sw; st.mouth = "smirk"; st.pawL = { x: -110, y: K.lerp(-40, -120, sw) };
    if (t > T.caught) { st.mouth = "grin"; st.brow = 0.8; st.magAng = -58 - 20 * Math.exp(-(t - T.caught) * 6); }
  }
  K.hamster(ctx, 1650, 1000 + down, 1.6, st);
  if (t > T.caught && t < T.caught + 0.5 && K.lens) { /* magnifier flash */
    const k = inv(T.caught, T.caught + 0.5, t);
    K.screen(ctx); K.glow(ctx, K.lens.x, K.lens.y, 260 * (1 - k * 0.5), "rgba(255,255,230,1)", 1 - k);
    K.sparkle(ctx, K.lens.x, K.lens.y, 80 * (1 - k), 1 - k, 5);
    K.applyCam(ctx, 1);
  }
}

/* ---------- title DOM: fit, place inside the sign face, drop letters on the beat ---------- */
const fitCache = {};
function fitSize(line, cls, maxW, maxSize) {
  const key = cls + "|" + line + "|" + (document.fonts ? document.fonts.status : "");
  if (fitCache[key]) return fitCache[key];
  const fam = cls === "l1" ? (IS_CJK ? '900 100px "Nunito", ' + (LANG === "zh-TW" ? '"CJK TC"' : '"CJK SC"') : '900 100px "Nunito"') : IS_CJK ? '900 100px "Nunito", ' + (LANG === "zh-TW" ? '"CJK TC"' : '"CJK SC"') : '400 100px "Lobster"';
  ctx.save(); ctx.font = fam; ctx.letterSpacing = cls === "l1" ? "4px" : "1px"; const w = ctx.measureText(line).width; ctx.restore();
  const v = Math.min(maxSize, Math.floor((100 * maxW) / Math.max(1, w)));
  fitCache[key] = v; return v;
}
function layoutTitleDom(t, box) {
  const vis = t >= T.letters - 0.05 && box;
  titleEl.style.opacity = vis ? "1" : "0";
  if (!vis) return;
  const n = TITLE_LN.length, maxW = SIGN.w - 230;
  const sizes = TITLE_LN.map((d, i) => {
    const cls = d.classList.contains("l1") ? "l1" : "l0", line = TITLE_LINES[i];
    return fitSize(line, cls, maxW, IS_CJK ? 150 : n > 1 ? (cls === "l1" ? 104 : 132) : 140);
  });
  TITLE_LN.forEach((d, i) => { d.style.fontSize = sizes[i] + "px"; });
  const gap = 4, total = sizes.reduce((a, b) => a + b, 0) + gap * (n - 1);
  const zs = K.cam.z, cy = 540 + (SIGN.cy + 6 - 540) * zs;
  let y = cy - total / 2 - (n > 1 ? 6 : 0);
  TITLE_LN.forEach((d, i) => { d.style.top = y.toFixed(1) + "px"; y += sizes[i] + gap; });
  titleEl.style.transform = `scale(${zs.toFixed(4)})`; titleEl.style.transformOrigin = "960px " + cy.toFixed(1) + "px";
  TITLE_CH.forEach((c) => {
    const t0 = T.letters + c.idx * 0.04, a = inv(t0, t0 + 0.4, t);
    const yy = (1 - E.back(a, 2.4)) * -160, land = inv(t0 + 0.28, t0 + 0.55, t);
    const sq = Math.sin(land * Math.PI) * 0.16 * (1 - land);
    const hop = c.line === n - 1 ? -7 * K.pulse(t, 4, 6) * inv(T.plates, T.plates + 0.2, t) : 0;
    c.el.style.opacity = a > 0 ? Math.min(1, a * 3).toFixed(2) : "0";
    c.el.style.transform = `translateY(${(yy + hop).toFixed(1)}px) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
  });
}
