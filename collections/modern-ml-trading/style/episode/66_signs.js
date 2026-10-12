/* ============================================================
   EPISODE 66 SIGNS: reusable text carriers for the episode. All text sits on
   cream paper in a brass frame or on a catalogue card, never on the raw wall.
   SIGN.chapter(ctx, g, o)  brass deco plaque that drops in on two brass rods, holds, lifts away.
                            o: { at, until, lines: [section, subsection?, tagline?], y }
                            SCREEN space. Use at every slide start (SCENES.md title / subtitle / tagline).
   SIGN.note(ctx, x, y, o)  catalogue index card with a green bold title and body lines, optional
                            leader string with a brass pin to a point. o: { a, title, lines, w, size,
                            to: [x, y], titleColor, seed, mono }. Works in world or screen space.
   SIGN.stamp(ctx, x, y, o) rubber-stamp word (e.g. "OVERFIT") with an optional cross-out.
                            o: { a, text, cross (0..1 draws the cross), color, size, rot }
   SIGN.wrap(ctx, str, maxW, size, weight, font)  word-wrap helper -> lines
   ============================================================ */
const SIGN = (function () {
  const P = K.P, { clamp } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));

  function chapter(ctx, g, o) {
    const L = o.lines || [], y0 = o.y == null ? 200 : o.y;
    if (g < o.at || g > o.until) return;
    const drop = K.E.back(clamp((g - o.at) / 0.55, 0, 1), 1.6), lift = K.E.in3(clamp((g - (o.until - 0.5)) / 0.5, 0, 1));
    const base = [64, 46, 34], weights = [700, 800, 500], fonts = [K.FONT.display, K.FONT.text, K.FONT.text], cols = [P.ink, P.glassDeep, P.inkSoft];
    /* shrink a line that would not fit the 1500 px plaque */
    const sizes = L.map((s, i) => { const w = K.textW(ctx, s, base[i], weights[i], fonts[i]); return w > 1500 ? Math.max(28, base[i] * 1500 / w) : base[i]; });
    let w = 0; L.forEach((s, i) => (w = Math.max(w, K.textW(ctx, s, sizes[i], weights[i], fonts[i]))));
    w += 150; const lh = [88, 62, 50], h = L.reduce((s, _, i) => s + lh[i], 0) + 44;
    const y = K.lerp(-h - 60, y0, drop) - lift * (h + y0 + 100), x = 960;
    const sway = 0.01 * Math.sin(g * 1.4);
    ctx.save(); ctx.translate(x, y - h / 2); ctx.rotate(sway); ctx.translate(0, h / 2);
    /* brass rods up out of the frame */
    [-1, 1].forEach((sd, i) => K.line(ctx, [[sd * (w / 2 - 50), -h / 2 - 400], [sd * (w / 2 - 50), -h / 2 - 20]], { stroke: P.brassDark, w: 7, boil: 0.8, seed: 940 + i, taper: false }));
    ctx.save(); ctx.translate(-w / 2, -h / 2);
    K.decoFrame(ctx, 0, 0, w, h, { seed: 945, fill: P.paper, bw: 16, step: 16 });
    ctx.restore();
    let yy = -h / 2 + 22;
    L.forEach((s, i) => { yy += lh[i]; K.text(ctx, s, 0, yy - lh[i] / 2 + 2, { size: sizes[i], weight: weights[i], font: fonts[i], fill: cols[i], track: i === 0 ? 1.5 : 0 }); });
    if (L.length > 1) K.line(ctx, [[-w / 2 + 80, -h / 2 + 22 + lh[0] + 2], [w / 2 - 80, -h / 2 + 22 + lh[0] + 2]], { stroke: P.brass, w: 3, boil: 0.5, seed: 948, taper: false });
    ctx.restore();
  }

  function wrap(ctx, str, maxW, size, weight, font) {
    const words = String(str).split(" "), out = []; let cur = "";
    words.forEach((wd) => { const t = cur ? cur + " " + wd : wd; if (cur && K.textW(ctx, t, size, weight, font) > maxW) { out.push(cur); cur = wd; } else cur = t; });
    if (cur) out.push(cur); return out;
  }

  function note(ctx, x, y, o) {
    o = Object.assign({ a: 1, title: "", lines: [], w: 520, size: 32, seed: 960, titleColor: P.glassDeep, to: null, mono: false }, o || {});
    const a = popS(o.a); if (a <= 0) return;
    const font = o.mono ? K.FONT.mono : K.FONT.text, tf = K.FONT.display;
    const body = []; o.lines.forEach((l) => wrap(ctx, l, o.w - 64, o.size, 500, font).forEach((q) => body.push(q)));
    const tl = o.title ? wrap(ctx, o.title, o.w - 64, o.size * 1.1, 700, tf) : [];
    const lh = o.size * 1.3, h = 48 + tl.length * lh * 1.05 + body.length * lh + (tl.length && body.length ? 14 : 0);
    if (o.to && o.a > 0.6) {
      /* leader string: from the card edge to the target, ending in a brass pin */
      const outX = Math.abs(o.to[0] - x) > o.w / 2;
      const sx = outX ? clamp(o.to[0], x - o.w / 2, x + o.w / 2) : x, sy = outX ? y : clamp(o.to[1], y - h / 2, y + h / 2);
      const u = clamp((o.a - 0.6) / 0.4, 0, 1), tx = K.lerp(sx, o.to[0], u), ty = K.lerp(sy, o.to[1], u);
      K.line(ctx, [[sx, sy], [tx, ty]], { stroke: P.brassDark, w: 5, boil: 0.8, seed: o.seed + 1, taper: false });
      if (u > 0.9) { K.dot(ctx, tx, ty, 11, P.brass, P.ink, 3, o.seed + 2); K.dot(ctx, tx - 3, ty - 3, 3.5, P.brassLight, null, 0, o.seed + 3); }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(K.hs(o.seed, 3) * 0.018);
    K.shape(ctx, K.rrectPts(-o.w / 2, -h / 2, o.w, h, 12), { fill: P.paper, w: 4.5, boil: 0.9, seed: o.seed, shade: { color: P.paperShade, dx: -10, dy: -10 } });
    K.line(ctx, [[-o.w / 2 + 14, -h / 2 + 12 + (tl.length ? tl.length * lh * 1.05 + 6 : 0)], [o.w / 2 - 14, -h / 2 + 12 + (tl.length ? tl.length * lh * 1.05 + 6 : 0)]], { stroke: P.glassDark, w: 2.5, boil: 0.4, seed: o.seed + 4, taper: false, alpha: tl.length && body.length ? 0.8 : 0 });
    let yy = -h / 2 + 24 + lh / 2;
    tl.forEach((s) => { K.text(ctx, s, -o.w / 2 + 32, yy, { size: o.size * 1.1, weight: 700, font: tf, fill: o.titleColor, align: "left" }); yy += lh * 1.05; });
    if (tl.length && body.length) yy += 14;
    body.forEach((s) => { K.text(ctx, s, -o.w / 2 + 32, yy, { size: o.size, weight: 500, font, fill: P.ink, align: "left" }); yy += lh; });
    ctx.restore();
  }

  function stamp(ctx, x, y, o) {
    o = Object.assign({ a: 1, text: "OVERFIT", cross: 0, color: P.bad, size: 70, rot: -0.1 }, o || {});
    if (o.a <= 0) return;
    const a = o.a >= 1 ? 1 : 1 + 0.6 * (1 - K.E.out3(o.a)); /* slams down from big */
    const w = K.textW(ctx, o.text, o.size, 700, K.FONT.display) + 80, h = o.size + 46;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(a, a); ctx.globalAlpha *= clamp(o.a * 3, 0, 1);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: null, stroke: o.color, w: 8, boil: 1, seed: 970 });
    K.shape(ctx, K.rectPts(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 4), { fill: null, stroke: o.color, w: 3, boil: 0.8, seed: 973 });
    K.text(ctx, o.text, 0, 3, { size: o.size, weight: 700, font: K.FONT.display, fill: o.color, track: 3 });
    if (o.cross > 0) {
      const c = clamp(o.cross, 0, 1), m = 12;
      K.line(ctx, [[-w / 2 - m, -h / 2 - m], [K.lerp(-w / 2 - m, w / 2 + m, Math.min(1, c * 2)), K.lerp(-h / 2 - m, h / 2 + m, Math.min(1, c * 2))]], { stroke: o.color, w: 12, boil: 1, seed: 971, taper: false });
      if (c > 0.5) K.line(ctx, [[w / 2 + m, -h / 2 - m], [K.lerp(w / 2 + m, -w / 2 - m, (c - 0.5) * 2), K.lerp(-h / 2 - m, h / 2 + m, (c - 0.5) * 2)]], { stroke: o.color, w: 12, boil: 1, seed: 972, taper: false });
    }
    ctx.restore();
  }
  return { chapter, note, stamp, wrap };
})();
