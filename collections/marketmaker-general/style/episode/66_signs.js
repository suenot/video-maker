/* ============================================================
   EPISODE 66 SIGNS: reusable text carriers for the episode (Coral Exchange look:
   cream boards with navy outlines, coral / kelp / sun tabs, never text on raw water).
   SIGN.chapter(ctx, g, o)  section title plate that drops in on two kelp ropes, holds, lifts away.
                            o: { at, until, lines: [section, subsection?, tagline?], y }
                            SCREEN space. Use at every slide start (SCENES.md title / subtitle / tagline).
   SIGN.note(ctx, x, y, o)  cream callout card with a bold title and body lines and a coral tab,
                            optional leader line with an arrow to a point. o: { a, title, lines, w, size,
                            to: [x, y], titleColor, tab, seed, mono }. Works in world or screen space.
   SIGN.stamp(ctx, x, y, o) stamped pill word (e.g. "ATTRIBUTED") with an optional cross-out.
                            o: { a, text, cross (0..1 draws the cross), color, size, rot }
   SIGN.wrap(ctx, str, maxW, size, weight, font) -> lines
   ============================================================ */
const SIGN = (function () {
  const P = K.P, { clamp } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));

  function chapter(ctx, g, o) {
    const L = (o.lines || []).filter(Boolean), y0 = o.y == null ? 190 : o.y;
    if (g < o.at || g > o.until) return;
    const drop = K.E.back(clamp((g - o.at) / 0.55, 0, 1), 1.6), lift = K.E.in3(clamp((g - (o.until - 0.5)) / 0.5, 0, 1));
    const sizes = [60, 42, 32], weights = [900, 800, 700], fonts = [K.FONT.display, K.FONT.display, K.FONT.text], cols = [P.ink, P.askDark, P.inkSoft];
    const lh = [84, 62, 50];
    let w = 0; L.forEach((s, i) => (w = Math.max(w, K.textW(ctx, s, sizes[i], weights[i], fonts[i]))));
    w = Math.min(1700, w + 150); const h = L.reduce((s, _, i) => s + lh[i], 0) + 56;
    const y = K.lerp(-h - 40, y0, drop) - lift * (h + y0 + 80), x = 960;
    ctx.save(); ctx.translate(x, y - h / 2 - 200); ctx.rotate(0.012 * Math.sin(g * 1.4)); ctx.translate(0, 200);
    [-1, 1].forEach((sd, i) => K.line(ctx, [[sd * (w / 2 - 70), -400], [sd * (w / 2 - 70), 8]], { stroke: P.kelpDark, w: 9, boil: 1, seed: 940 + i, gap: 0 }));
    K.shape(ctx, K.rrectPts(-w / 2, 0, w, h, 26, 4), { fill: P.cream, w: 6, boil: 0.9, seed: 945, shade: { color: P.creamShade, dx: 0, dy: -14 }, drop: { dx: 10, dy: 14 }, dots: { color: P.ask, alpha: 0.14, gap: 16, r: 3.4, ang: Math.PI / 2, from: 0.7 } });
    const bar = K.rrectPts(-w / 2, 0, w, 16, 8, 4); bar.sharp = true;
    K.shape(ctx, bar, { fill: P.ask, w: 5, boil: 0.6, seed: 946 });
    let yy = 28;
    L.forEach((s, i) => { yy += lh[i]; K.text(ctx, s, 0, yy - lh[i] / 2 + 4, { size: sizes[i], weight: weights[i], font: fonts[i], fill: cols[i] }); });
    ctx.restore();
  }

  function wrap(ctx, str, maxW, size, weight, font) {
    const words = String(str).split(" "), out = []; let cur = "";
    words.forEach((wd) => { const t = cur ? cur + " " + wd : wd; if (cur && K.textW(ctx, t, size, weight, font) > maxW) { out.push(cur); cur = wd; } else cur = t; });
    if (cur) out.push(cur); return out;
  }

  function note(ctx, x, y, o) {
    o = Object.assign({ a: 1, title: "", lines: [], w: 520, size: 32, seed: 960, titleColor: P.askDark, tab: P.ask, to: null, mono: false }, o || {});
    const a = popS(o.a); if (a <= 0) return;
    const font = o.mono ? K.FONT.mono : K.FONT.text, tf = K.FONT.display;
    const body = []; o.lines.forEach((l) => wrap(ctx, l, o.w - 64, o.size, 700, font).forEach((q) => body.push(q)));
    const tl = o.title ? wrap(ctx, o.title, o.w - 64, o.size * 1.05, 800, tf) : [];
    const lh = o.size * 1.3, h = 52 + tl.length * lh + body.length * lh + (tl.length && body.length ? 6 : 0);
    if (o.to && o.a > 0.6) {
      const ex = clamp(o.to[0], x - o.w / 2, x + o.w / 2), ey = clamp(o.to[1], y - h / 2, y + h / 2);
      const sx = Math.abs(o.to[0] - x) > o.w / 2 ? ex : x, sy = Math.abs(o.to[0] - x) > o.w / 2 ? y : ey;
      const u = clamp((o.a - 0.6) / 0.4, 0, 1), tx = K.lerp(sx, o.to[0], u), ty = K.lerp(sy, o.to[1], u);
      K.line(ctx, [[sx, sy], [tx, ty]], { stroke: P.ink, w: 6, boil: 1, seed: o.seed + 1, gap: 0 });
      if (u > 0.9) { const ang = Math.atan2(ty - sy, tx - sx); ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang); K.shape(ctx, [[4, 0], [-20, -12], [-20, 12]], { fill: P.ink, w: 3, boil: 0.6, seed: o.seed + 2, gap: 0 }); ctx.restore(); }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(K.hs(o.seed, 3) * 0.02);
    K.shape(ctx, K.rrectPts(-o.w / 2, -h / 2, o.w, h, 22, 4), { fill: P.cream, w: 5.5, boil: 0.8, seed: o.seed, shade: { color: P.creamShade, dx: 0, dy: -10 }, drop: { dx: 8, dy: 10 } });
    const tab = K.rrectPts(-o.w / 2, -h / 2, o.w, 16, 8, 4); tab.sharp = true;
    K.shape(ctx, tab, { fill: o.tab, w: 4.5, boil: 0.6, seed: o.seed + 3 });
    let yy = -h / 2 + 30 + lh / 2;
    tl.forEach((s) => { K.text(ctx, s, -o.w / 2 + 32, yy, { size: o.size * 1.05, weight: 800, font: tf, fill: o.titleColor, align: "left" }); yy += lh; });
    if (tl.length && body.length) yy += 6;
    body.forEach((s) => { K.text(ctx, s, -o.w / 2 + 32, yy, { size: o.size, weight: 700, font, fill: P.ink, align: "left" }); yy += lh; });
    ctx.restore();
  }

  function stamp(ctx, x, y, o) {
    o = Object.assign({ a: 1, text: "ATTRIBUTED", cross: 0, color: P.askDark, size: 60, rot: -0.1 }, o || {});
    if (o.a <= 0) return;
    const a = o.a >= 1 ? 1 : 1 + 0.6 * (1 - K.E.out3(o.a)); /* slams down from big */
    const w = K.textW(ctx, o.text, o.size, 900, K.FONT.display) + 64, h = o.size + 40;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(a, a); ctx.globalAlpha *= clamp(o.a * 3, 0, 1);
    K.shape(ctx, K.rrectPts(-w / 2, -h / 2, w, h, h / 2, 4), { fill: "rgba(255,246,230,0.92)", stroke: o.color, w: 8, boil: 1, seed: 970, gap: 0.1 });
    K.text(ctx, o.text, 0, 3, { size: o.size, weight: 900, font: K.FONT.display, fill: o.color });
    if (o.cross > 0) {
      const c = clamp(o.cross, 0, 1);
      K.line(ctx, [[-w / 2 - 10, -h / 2 - 10], [K.lerp(-w / 2 - 10, w / 2 + 10, Math.min(1, c * 2)), K.lerp(-h / 2 - 10, h / 2 + 10, Math.min(1, c * 2))]], { stroke: o.color, w: 12, boil: 1.2, seed: 971, gap: 0 });
      if (c > 0.5) K.line(ctx, [[w / 2 + 10, -h / 2 - 10], [K.lerp(w / 2 + 10, -w / 2 - 10, (c - 0.5) * 2), K.lerp(-h / 2 - 10, h / 2 + 10, (c - 0.5) * 2)]], { stroke: o.color, w: 12, boil: 1.2, seed: 972, gap: 0 });
    }
    ctx.restore();
  }
  return { chapter, note, stamp, wrap };
})();
