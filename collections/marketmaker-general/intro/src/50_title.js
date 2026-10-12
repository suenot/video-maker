/* ============================================================
   INTRO 50 TITLE (bar 16 -> end): "Marketmaker! Marketmaker of the sand!"
   A wavy cream plate pops on the downbeat; the title letters (DOM, crisp,
   per-language) drop in on 32nd notes; the subtitle sits on a navy pill.
   Otto waves the eight-card fan below, fish swim behind, the last note winks.
   ============================================================ */
const PLATE = { cx: 960, cy: 345, w: 1300, h: 330 }; /* clear of the logo in the top-right corner */
const T_PLATE = at(16, 0), T_LETTERS = at(16, 0.5), T_SUB = at(17, 0), T_WINK = at(18, 0);
let SUB_W = 0;

function titleSizes() {
  const w0 = K.textW(ctx, TITLE_LINES[0], 100, 900, '"Unbounded", "CJK SC", "CJK TC", sans-serif');
  const s0 = Math.min(140, Math.floor((1140 / Math.max(1, w0)) * 100));
  let s1 = 0;
  if (TITLE_LINES[1]) {
    const f1 = IS_CJK ? (LANG === "zh-TW" ? '"Manrope", "CJK TC", sans-serif' : '"Manrope", "CJK SC", sans-serif') : '"Manrope", sans-serif';
    const w1 = K.textW(ctx, TITLE_LINES[1], 100, IS_CJK ? 900 : 800, f1);
    s1 = Math.min(IS_CJK ? 66 : 56, Math.floor((1060 / Math.max(1, w1)) * 100));
    SUB_W = (w1 * s1) / 100;
  }
  return [s0, s1];
}

function scTitle(t) {
  const d = t - T_PLATE, hop = Math.max(0, Math.sin(K.inv(0, 0.6, d) * Math.PI)) * 90 + 16 * K.pulse(t, 2, 5);
  drawReef(t, { x: 960, y: 540, z: K.tw(t, T_PLATE, DUR, 1, 1.04, K.E.out3) }, {
    desk: false, traffic: 6, trafficY: -60, bubbles: false,
    octo: () => otto(t, { hop, mouth: t > T_WINK ? "grin" : "grin", brow: 0.9, wink: t > T_WINK && t < T_WINK + 0.6 ? Math.sin(K.inv(T_WINK, T_WINK + 0.6, t) * Math.PI) : 0,
      glint: K.inv(T_WINK + 0.5, T_WINK + 1.0, t), squash: d < 0.1 ? -0.2 : 0.07 * K.pulse(t, 1, 6),
      arms: fanArms(t, T_PLATE, { r: 600, ry: 300, cy: -250, s: 0.66 }) }, { x: 960, y: 1070, s: 0.84 }),
    front: () => {
      K.screen(ctx);
      const u = K.inv(T_PLATE, T_PLATE + 0.45, t);
      K.titlePlate(ctx, PLATE.cx, PLATE.cy, PLATE.w, PLATE.h, u, {});
      /* subtitle pill */
      const su = K.inv(T_SUB, T_SUB + 0.35, t);
      if (su > 0 && SUB_W > 0) {
        const s = K.popS(su), pw = SUB_W + 90, ph = 84;
        ctx.save(); ctx.translate(PLATE.cx, PLATE.cy + 98); ctx.scale(s, s);
        K.shape(ctx, K.rrectPts(-pw / 2, -ph / 2, pw, ph, ph / 2, 4), { fill: P.ink, stroke: P.ink, w: 5, boil: 0.5, seed: 820, hi: { color: "#22306a", dx: 0, dy: 10 } });
        ctx.restore();
      }
      /* sparkles on the plate hit and on the wink */
      [[T_PLATE, PLATE.cy, 760], [T_WINK, PLATE.cy, 700]].forEach(([ts, cy, rr], k) => {
        const dd = t - ts; if (dd < 0 || dd > 0.6) return;
        for (let i = 0; i < 10; i++) { const a = (i / 10) * K.TAU + k; K.sparkle(ctx, PLATE.cx + Math.cos(a) * rr * (0.7 + 0.5 * dd), cy + Math.sin(a) * 200 * (0.8 + dd), 30 * (1 - dd / 0.6), 1 - dd / 0.6, 830 + i + k * 10); }
      });
      K.bubbleBurst(ctx, 960, 760, t - T_PLATE, { n: 16, r: 700, size: 26, dur: 1.1, seed: 840 });
    },
  });
}

function layoutTitleDom(t) {
  const on = t >= T_LETTERS - 0.05;
  titleEl.style.opacity = on ? "1" : "0";
  if (!on) return;
  const [s0, s1] = titleSizes();
  TITLE_LN[0].style.fontSize = s0 + "px";
  TITLE_LN[0].style.top = (PLATE.cy - 60 - s0 / 2 + 4 * Math.sin(t * 1.6)).toFixed(1) + "px";
  if (TITLE_LN[1]) { TITLE_LN[1].style.fontSize = s1 + "px"; TITLE_LN[1].style.top = (PLATE.cy + 98 - s1 * 0.56).toFixed(1) + "px"; }
  TITLE_CH.forEach((c) => {
    const t0 = c.line === 0 ? T_LETTERS + c.k * 0.045 : T_SUB + 0.1 + c.k * 0.018, a = K.inv(t0, t0 + 0.38, t);
    const yy = (1 - K.E.back(a, 2.6)) * (c.line === 0 ? -120 : 40), land = K.inv(t0 + 0.25, t0 + 0.5, t), sq = Math.sin(land * Math.PI) * 0.18 * (1 - land);
    const beatHop = c.line === 0 ? -7 * K.pulse(t - c.k * 0.03, 2, 6) * K.inv(T_SUB, T_SUB + 0.2, t) : 0; /* the word bounces along with the skank */
    c.el.style.opacity = a > 0 ? Math.min(1, a * 3).toFixed(2) : "0";
    c.el.style.transform = `translateY(${(yy + beatHop).toFixed(1)}px) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
  });
}
