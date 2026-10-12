/* ============================================================
   EPISODE 66 SIGNS (Surf Turtle): reusable text carriers for the episode. All text sits on
   cream poster paper, never on raw water. Screen print look: off-register fills, brush outlines.
   SIGN.chapter(ctx, g, o)  surf poster that unrolls from a wooden dowel, holds, rolls back up.
                            o: { at, until, lines: [section, subsection?, tagline?], y }
                            SCREEN space. Use at every slide start (SCENES.md title / subtitle / tagline).
   SIGN.note(ctx, x, y, o)  cream callout card with a bold title and body lines, optional
                            brush leader with an arrow to a point. o: { a, title, lines, w, size,
                            to: [x, y], titleColor, seed, mono }. Works in world or screen space.
   SIGN.stamp(ctx, x, y, o) rubber-stamp word (e.g. "STORM") with an optional cross-out.
                            o: { a, text, cross (0..1 draws the cross), color, size, rot }
   ============================================================ */
const SIGN = (function () {
  const P = K.P, { clamp } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  /* canvas text does not trigger webfont loading by itself: ask for the faces now (RUN re-renders on fonts.ready) */
  if (typeof document !== "undefined" && document.fonts && document.fonts.load) ["400 64px Lobster", "900 44px Nunito", "700 30px Nunito", "600 30px Nunito", "700 30px 'Fira Mono'"].forEach((f) => document.fonts.load(f, "Aa σα"));
  const HOT = "#b83b4c"; /* P.storm darkened for text on cream */

  function wrap(ctx, str, maxW, size, weight, font) {
    const words = String(str).split(" "), out = []; let cur = "";
    words.forEach((wd) => { const t = cur ? cur + " " + wd : wd; if (cur && K.textW(ctx, t, size, weight, font) > maxW) { out.push(cur); cur = wd; } else cur = t; });
    if (cur) out.push(cur); return out;
  }

  function chapter(ctx, g, o) {
    if (g < o.at || g > o.until) return;
    const L = o.lines || [], y0 = o.y == null ? 70 : o.y;
    const sizes = [64, 44, 30], weights = [400, 900, 700], fonts = [K.FONT.script, K.FONT.display, K.FONT.text], cols = [P.ink, HOT, P.inkSoft];
    const lh = [92, 64, 50], maxW = 1500;
    /* wrap long lines so the poster stays inside the frame */
    const rows = [];
    L.forEach((s, i) => wrap(ctx, s, maxW, sizes[i], weights[i], fonts[i]).forEach((q) => rows.push({ s: q, i })));
    let w = 0; rows.forEach((r) => (w = Math.max(w, K.textW(ctx, r.s, sizes[r.i], weights[r.i], fonts[r.i]))));
    w = Math.max(w + 130, 560);
    const bandH = 34, h = bandH + 30 + rows.reduce((s, r) => s + lh[r.i], 0) + 24;
    const roll = K.E.out3 ? K.E.out3(clamp((g - o.at) / 0.7, 0, 1)) : clamp((g - o.at) / 0.7, 0, 1);
    const up = 1 - K.E.in3(clamp((g - (o.until - 0.6)) / 0.6, 0, 1));
    const vis = h * roll * up; if (vis < 4) return;
    const x0 = 960 - w / 2, sway = 0.006 * Math.sin(g * 1.3);
    ctx.save(); ctx.translate(960, y0); ctx.rotate(sway); ctx.translate(-960, -y0);
    /* the poster sheet, revealed down to `vis` */
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 40, y0, w + 80, vis); ctx.clip();
    const sheet = K.rectPts(x0, y0, w, h, 6);
    K.shape(ctx, sheet, { fill: P.cream, w: 5, boil: 0.9, seed: 940, shade: { color: P.creamShade, dx: 10, dy: 10 } });
    ctx.save(); K.pathOf(ctx, sheet, true); ctx.clip();
    K.bands(ctx, x0, y0, w, bandH, [P.sky0, P.sky1, P.sky2, P.sky3], { wave: 3, seed: 5 });
    ctx.restore();
    K.line(ctx, [[x0 + 6, y0 + bandH], [x0 + w - 6, y0 + bandH]], { stroke: P.ink, w: 4, boil: 0.8, seed: 941 });
    let yy = y0 + bandH + 24;
    rows.forEach((r) => { yy += lh[r.i]; K.text(ctx, r.s, 960, yy - lh[r.i] / 2 + 2, { size: sizes[r.i], weight: weights[r.i], font: fonts[r.i], fill: cols[r.i] }); });
    ctx.restore();
    /* top dowel with hooks, bottom dowel rides the edge */
    [-1, 1].forEach((sd, i) => K.line(ctx, [[960 + sd * (w / 2 - 36), -60], [960 + sd * (w / 2 - 36), y0 - 2]], { stroke: P.woodDark, w: 6, boil: 0.8, seed: 944 + i }));
    K.shape(ctx, K.roundPts(x0 - 22, y0 - 14, w + 44, 24, 10, 4), { fill: P.wood, w: 5, boil: 0.8, seed: 946, shade: { color: P.woodDark, dx: 0, dy: -8 } });
    K.shape(ctx, K.roundPts(x0 - 22, y0 + vis - 8, w + 44, 20, 9, 4), { fill: P.woodLight, w: 5, boil: 0.8, seed: 947, shade: { color: P.wood, dx: 0, dy: -7 } });
    ctx.restore();
  }

  function note(ctx, x, y, o) {
    o = Object.assign({ a: 1, title: "", lines: [], w: 520, size: 32, seed: 960, titleColor: HOT, to: null, mono: false }, o || {});
    const a = popS(o.a); if (a <= 0) return;
    const font = o.mono ? K.FONT.mono : K.FONT.text, tf = K.FONT.display;
    const body = []; o.lines.forEach((l) => wrap(ctx, l, o.w - 56, o.size, 600, font).forEach((q) => body.push(q)));
    const tl = o.title ? wrap(ctx, o.title, o.w - 56, o.size * 1.05, 900, tf) : [];
    const lh = o.size * 1.3, h = 44 + tl.length * lh + body.length * lh + (tl.length && body.length ? 6 : 0);
    if (o.to && o.a > 0.6) {
      /* brush leader from the card edge to the target, with an arrow head */
      const ex = clamp(o.to[0], x - o.w / 2, x + o.w / 2), ey = clamp(o.to[1], y - h / 2, y + h / 2);
      const sx = Math.abs(o.to[0] - x) > o.w / 2 ? ex : x, sy = Math.abs(o.to[0] - x) > o.w / 2 ? y : ey;
      const u = K.clamp((o.a - 0.6) / 0.4, 0, 1), tx = K.lerp(sx, o.to[0], u), ty = K.lerp(sy, o.to[1], u);
      K.line(ctx, [[sx, sy], [tx, ty]], { stroke: P.ink, w: 5, boil: 1, seed: o.seed + 1 });
      if (u > 0.9) { const ang = Math.atan2(ty - sy, tx - sx); ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang); K.shape(ctx, [[4, 0], [-20, -12], [-20, 12]], { fill: P.sigma, w: 3.5, boil: 0.6, seed: o.seed + 2 }); ctx.restore(); }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(K.hs(o.seed, 3) * 0.02);
    K.shape(ctx, K.roundPts(-o.w / 2, -h / 2, o.w, h, 14, 6), { fill: P.cream, w: 4.5, boil: 0.9, seed: o.seed, shade: { color: P.creamShade, dx: 9, dy: 9 } });
    K.shape(ctx, K.rectPts(-o.w / 2 + 16, -h / 2 - 8, 70, 18, 2), { fill: P.sigma, w: 3, boil: 0.5, seed: o.seed + 3 }); /* tape */
    let yy = -h / 2 + 22 + lh / 2;
    tl.forEach((s) => { K.text(ctx, s, -o.w / 2 + 28, yy, { size: o.size * 1.05, weight: 900, font: tf, fill: o.titleColor, align: "left" }); yy += lh; });
    if (tl.length && body.length) yy += 6;
    body.forEach((s) => { K.text(ctx, s, -o.w / 2 + 28, yy, { size: o.size, weight: 600, font, fill: P.ink, align: "left" }); yy += lh; });
    ctx.restore();
  }

  function stamp(ctx, x, y, o) {
    o = Object.assign({ a: 1, text: "STORM", cross: 0, color: HOT, size: 64, rot: -0.12 }, o || {});
    if (o.a <= 0) return;
    const a = o.a >= 1 ? 1 : 1 + 0.6 * (1 - K.E.out3(o.a)); /* slams down from big */
    const w = K.textW(ctx, o.text, o.size, 900, K.FONT.display) + 60, h = o.size + 40;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(a, a); ctx.globalAlpha *= clamp(o.a * 3, 0, 1);
    K.shape(ctx, K.roundPts(-w / 2, -h / 2, w, h, 12, 6), { fill: "rgba(251,238,211,0.82)", stroke: o.color, w: 7, boil: 1.2, seed: 970 });
    K.shape(ctx, K.roundPts(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 8, 6), { fill: null, stroke: o.color, w: 2.5, boil: 1, seed: 973 });
    K.text(ctx, o.text, 0, 3, { size: o.size, weight: 900, fill: o.color });
    if (o.cross > 0) {
      const c = K.clamp(o.cross, 0, 1);
      K.line(ctx, [[-w / 2 - 10, -h / 2 - 10], [K.lerp(-w / 2 - 10, w / 2 + 10, Math.min(1, c * 2)), K.lerp(-h / 2 - 10, h / 2 + 10, Math.min(1, c * 2))]], { stroke: o.color, w: 12, boil: 1.2, seed: 971 });
      if (c > 0.5) K.line(ctx, [[w / 2 + 10, -h / 2 - 10], [K.lerp(w / 2 + 10, -w / 2 - 10, (c - 0.5) * 2), K.lerp(-h / 2 - 10, h / 2 + 10, (c - 0.5) * 2)]], { stroke: o.color, w: 12, boil: 1.2, seed: 972 });
    }
    ctx.restore();
  }
  return { chapter, note, stamp, wrap };
})();
