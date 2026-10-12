/* ============================================================
   INTRO 40 TITLE (16.1 - 20.1 s): the marquee lights up over the stage,
   the title letters drop in on the beat (DOM text, one variable per
   language), the cast takes a bow: "Kalman's filter knows it well".
   ============================================================ */
const MARQ = { cx: 960, cy: 268, w: 1500, h: 350 };
const TCAT = { x: 700, y: 1000, s: 0.95 };
const TPEN = { y: 985, s: 0.86, A: 1150, B: 1330 };

function catTitlePose(t) {
  const pb = pulseB(t);
  const st = { seed: 800, blink: K.blinkAt(t, 9), mouth: "grin", look: [0.2, -0.3], turn: 0.1, squash: 0.08 * pb - 0.02 };
  st.gloveL = { x: -110, y: -170 - 14 * pb, open: 1 }; st.gloveR = { x: 110, y: -170 - 14 * pulseB(t - BEAT / 2), open: 1 };
  /* ta-da on the title hit */
  const td = K.ss(T.title, T.title + 0.25, t) * (1 - K.ss(T.hatTip - 0.5, T.hatTip - 0.2, t));
  if (td > 0) { st.gloveL = { x: -150, y: -260, open: 1 }; st.gloveR = { x: 150, y: -260, open: 1 }; st.hop = 20 * Math.sin(K.inv(T.title, T.title + 0.4, t) * Math.PI); }
  /* hat tip + wink on "knows it well" */
  const tip = K.ss(T.hatTip - 0.2, T.hatTip + 0.1, t);
  if (tip > 0) {
    st.gloveR = { x: K.lerp(110, 26, tip), y: K.lerp(-170, -372, tip), open: 0.2, rot: -70 };
    st.hatLift = 40 * tip * (1 - K.ss(T.irisEnd[0] + 0.2, T.irisEnd[0] + 0.5, t)); st.hatTip = -18 * tip; st.wink = tip * (1 - K.ss(T.hatTip + 0.9, T.hatTip + 1.1, t)); st.look = [0, 0]; st.turn = 0;
    st.gloveL = { x: -90, y: -130 - 10 * pb, open: 0.4 };
  }
  return st;
}
function penTitlePose(t, who) {
  const off = who === "A" ? 0 : 0.5, pb = pulseB(t);
  const st = { seed: who === "A" ? 900 : 950, hat: who === "A" ? "top" : "boater", blink: K.blinkAt(t, who === "A" ? 11 : 13), look: [who === "A" ? 0.5 : -0.5, 0] };
  st.tapL = tapOf(t, off); st.tapR = tapOf(t, off + 0.5);
  st.squash = 0.08 * pb - 0.02; st.hop = 8 * pb;
  st.flipL = 30 + 20 * Math.sin(t * 7.85 + off * 3); st.flipR = 30 + 20 * Math.sin(t * 7.85 + 1 + off * 3);
  const up = K.ss(T.title, T.title + 0.3, t) * (1 - K.ss(T.title + 1.2, T.title + 1.5, t));
  if (up > 0) { st.flipL = K.lerp(st.flipL, 150, up); st.flipR = K.lerp(st.flipR, 150, up); st.beak = "open"; }
  const tip = K.ss(T.hatTip - 0.1, T.hatTip + 0.2, t);
  if (tip > 0) { st.hatTip = -25 * tip * (1 - K.ss(T.hatTip + 0.8, T.hatTip + 1.1, t)); st.look = [0, 0]; }
  return st;
}

let CAT_HEAD = [960, 600];
function drawTitleSet(t) {
  K.cam = { x: 960, y: 540, z: K.tw(t, T.title, T.title + 1.5, 1.04, 1, K.E.out3), rot: 0 }; K.applyCam(ctx, 1);
  K.backdrop(ctx, { lx: 960, ly: 420, light: 0.7 });
  K.floor(ctx);
  K.spot(ctx, TCAT.x, TCAT.y + 10, 420, 0.8, [600, -260]);
  K.spot(ctx, (TPEN.A + TPEN.B) / 2, TPEN.y + 10, 480, 0.8, [1300, -260]);
  /* last act's coins, settled on the floor */
  K.coinRain(ctx, t + 12, T.rain, { x0: 300, x1: 1650, floorY: FLOOR + 140, n: 24, seed: 640, r: 24, stagger: 0.9 });
  const pa = penTitlePose(t, "A"), pb = penTitlePose(t, "B");
  const wa = K.penguinWaist(TPEN.A, TPEN.y, TPEN.s, 1, pa), wb = K.penguinWaist(TPEN.B, TPEN.y, TPEN.s, -1, pb);
  K.spring(ctx, wa, wb, { r: 18, w: 6, coils: 7 });
  K.penguin(ctx, TPEN.A, TPEN.y, TPEN.s, pa);
  K.penguin(ctx, TPEN.B, TPEN.y, TPEN.s, pb);
  const r = K.cat(ctx, TCAT.x, TCAT.y, TCAT.s, catTitlePose(t));
  CAT_HEAD = K.toScreen(r.head[0], r.head[1] - 10);
  K.valance(ctx, -60, { x0: -300, x1: 2220, depth: 90, swags: 6 });
  K.curtain(ctx, -1, 1, { seed: 400 }); K.curtain(ctx, 1, 1, { seed: 460 });
  K.proscenium(ctx, { x: [-90, 2010] });
  K.footlights(ctx, 1110, 120, 1800, 9, 1);
  /* the marquee (screen space) */
  K.screen(ctx);
  const u = K.inv(T.title - 0.05, T.title + 0.45, t);
  return K.marquee(ctx, MARQ.cx, MARQ.cy + Math.sin(t * 1.7) * 4, MARQ.w, MARQ.h, u, { chase: K.beatIndex(t) * (t > T.hatTip ? 2 : 1), seed: 1800 });
}

/* DOM title: fit each line into the marquee, letters drop in on eighth notes */
const TITLE_MAX_W = MARQ.w - 190;
function layoutTitleDom(t, box) {
  titleEl.style.opacity = box ? "1" : "0";
  if (!box) return;
  const n = TITLE_LN.length;
  const base = IS_CJK ? 132 : n > 1 ? 118 : 124;
  const sizes = TITLE_LN.map((d, i) => {
    const s0 = i === 0 || n === 1 ? base : Math.round(base * 0.86);
    d.style.fontSize = s0 + "px";
    const w = d.firstChild.scrollWidth || 1;
    return Math.min(s0, Math.floor((s0 * TITLE_MAX_W) / w));
  });
  sizes.forEach((s, i) => { TITLE_LN[i].style.fontSize = s + "px"; });
  const gap = 8, total = sizes.reduce((a, b) => a + b * 1.12, 0) + gap * (n - 1);
  let y = box.y + box.h / 2 - total / 2 - 14;
  TITLE_LN.forEach((d, i) => { d.style.top = y.toFixed(1) + "px"; y += sizes[i] * 1.12 + gap; });
  TITLE_CH.forEach((c) => {
    const t0 = T.letters + c.idx * 0.03, a = K.inv(t0, t0 + 0.38, t);
    const yy = (1 - K.E.back(a, 2.2)) * -110, land = K.inv(t0 + 0.26, t0 + 0.5, t);
    const sq = Math.sin(land * Math.PI) * 0.14 * (1 - land);
    const hop = -5 * K.pulse(t, 2, 6) * K.inv(T.hatTip - 0.3, T.hatTip, t) * (c.line === n - 1 ? 1 : 0);
    c.el.style.opacity = a > 0 ? Math.min(1, a * 3).toFixed(2) : "0";
    c.el.style.transform = `translateY(${(yy + hop).toFixed(1)}px) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
  });
}
