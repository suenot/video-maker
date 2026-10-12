/* ============================================================
   EPISODE 66 SIGNS: reusable text carriers for the episode (all text sits
   on paper or wood, never on raw sea).
   SIGN.chapter(ctx, g, o)  section title board that drops in on ropes, holds, lifts away.
                            o: { at, until, lines: [section, subsection?, tagline?], y }
                            SCREEN space. Use at every slide start (SCENES.md title / subtitle / tagline).
   SIGN.note(ctx, x, y, o)  paper callout with a bold title and body lines, optional
                            leader rope with an arrow to a point. o: { a, title, lines, w, size,
                            to: [x, y], titleColor, seed, align }. Works in world or screen space.
   SIGN.stamp(ctx, x, y, o) rubber-stamp word (e.g. "RISK-FREE") with an optional red cross-out.
                            o: { a, text, cross (0..1 draws the cross), color, size, rot }
   ============================================================ */
const SIGN = (function () {
  const P = K.P, { clamp } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));

  function chapter(ctx, g, o) {
    const L = o.lines || [], y0 = o.y == null ? 190 : o.y;
    const drop = K.E.back(K.clamp((g - o.at) / 0.55, 0, 1), 1.6), lift = K.E.in3(K.clamp((g - (o.until - 0.5)) / 0.5, 0, 1));
    if (g < o.at || g > o.until) return;
    const sizes = [62, 44, 32], weights = [900, 800, 500], fonts = [K.FONT.display, K.FONT.display, K.FONT.text], cols = [P.ink, P.rustDark, P.inkSoft];
    let w = 0; L.forEach((s, i) => (w = Math.max(w, K.textW(ctx, s, sizes[i], weights[i], fonts[i]))));
    w += 120; const lh = [86, 62, 50], h = L.reduce((s, _, i) => s + lh[i], 0) + 50;
    const y = K.lerp(-h - 40, y0, drop) - lift * (h + y0 + 80), x = 960;
    const sway = 0.012 * Math.sin(g * 1.4);
    ctx.save(); ctx.translate(x, y - h / 2 - 200); ctx.rotate(sway); ctx.translate(0, 200);
    /* ropes */
    [-1, 1].forEach((sd, i) => K.line(ctx, [[sd * (w / 2 - 70), -300], [sd * (w / 2 - 70), 6]], { stroke: P.woodDark, w: 6, boil: 1, seed: 940 + i, gap: 0 }));
    K.shape(ctx, K.rectPts(-w / 2, 0, w, h, 4), { fill: P.wood, w: 5, boil: 1.3, seed: 945, shade: { color: P.woodDark, dx: 0, dy: -12 }, hatch: { ang: 0.02, gap: 18, alpha: 0.22, color: P.woodDark } });
    K.shape(ctx, K.rectPts(-w / 2 + 14, 14, w - 28, h - 28, 4), { fill: P.paper, w: 3, boil: 1, seed: 946 });
    let yy = 25;
    L.forEach((s, i) => { yy += lh[i]; K.text(ctx, s, 0, yy - lh[i] / 2 + 4, { size: sizes[i], weight: weights[i], font: fonts[i], fill: cols[i] }); });
    ctx.restore();
  }

  function wrap(ctx, str, maxW, size, weight, font) {
    const words = String(str).split(" "), out = []; let cur = "";
    words.forEach((wd) => { const t = cur ? cur + " " + wd : wd; if (cur && K.textW(ctx, t, size, weight, font) > maxW) { out.push(cur); cur = wd; } else cur = t; });
    if (cur) out.push(cur); return out;
  }

  function note(ctx, x, y, o) {
    o = Object.assign({ a: 1, title: "", lines: [], w: 520, size: 32, seed: 960, titleColor: P.rustDark, to: null, mono: false }, o || {});
    const a = popS(o.a); if (a <= 0) return;
    const font = o.mono ? K.FONT.mono : K.FONT.text, tf = K.FONT.display;
    const body = []; o.lines.forEach((l) => wrap(ctx, l, o.w - 56, o.size, 500, font).forEach((q) => body.push(q)));
    const tl = o.title ? wrap(ctx, o.title, o.w - 56, o.size * 1.05, 800, tf) : [];
    const lh = o.size * 1.3, h = 44 + tl.length * lh + body.length * lh + (tl.length && body.length ? 6 : 0);
    if (o.to && o.a > 0.6) {
      /* leader rope: from the note edge to the target, with an arrow */
      const ex = clamp(o.to[0], x - o.w / 2, x + o.w / 2), ey = clamp(o.to[1], y - h / 2, y + h / 2);
      const sx = Math.abs(o.to[0] - x) > o.w / 2 ? ex : x, sy = Math.abs(o.to[0] - x) > o.w / 2 ? y : ey;
      const u = K.clamp((o.a - 0.6) / 0.4, 0, 1), tx = K.lerp(sx, o.to[0], u), ty = K.lerp(sy, o.to[1], u);
      K.line(ctx, [[sx, sy], [tx, ty]], { stroke: P.ink, w: 5, boil: 1, seed: o.seed + 1, gap: 0 });
      if (u > 0.9) { const ang = Math.atan2(ty - sy, tx - sx); ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang); K.shape(ctx, [[4, 0], [-18, -11], [-18, 11]], { fill: P.ink, w: 3, boil: 0.6, seed: o.seed + 2, gap: 0 }); ctx.restore(); }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(K.hs(o.seed, 3) * 0.02);
    K.shape(ctx, K.rectPts(-o.w / 2, -h / 2, o.w, h, 4), { fill: P.paper, w: 4, boil: 1.1, seed: o.seed, shade: { color: P.paperShade, dx: -8, dy: -8 } });
    let yy = -h / 2 + 22 + lh / 2;
    tl.forEach((s) => { K.text(ctx, s, -o.w / 2 + 28, yy, { size: o.size * 1.05, weight: 800, font: tf, fill: o.titleColor, align: "left" }); yy += lh; });
    if (tl.length && body.length) yy += 6;
    body.forEach((s) => { K.text(ctx, s, -o.w / 2 + 28, yy, { size: o.size, weight: 500, font, fill: P.ink, align: "left" }); yy += lh; });
    ctx.restore();
  }

  function stamp(ctx, x, y, o) {
    o = Object.assign({ a: 1, text: "RISK-FREE", cross: 0, color: P.loss, size: 64, rot: -0.12 }, o || {});
    const a = o.a <= 0 ? 0 : o.a >= 1 ? 1 : 1 + 0.6 * (1 - K.E.out3(o.a)); /* slams down from big */
    if (o.a <= 0) return;
    const w = K.textW(ctx, o.text, o.size, 900, K.FONT.display) + 60, h = o.size + 40;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(a, a); ctx.globalAlpha *= clamp(o.a * 3, 0, 1);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: "rgba(255,255,255,0.0)", stroke: o.color, w: 7, boil: 1.2, seed: 970, gap: 0.12 });
    K.text(ctx, o.text, 0, 3, { size: o.size, weight: 900, fill: o.color });
    if (o.cross > 0) {
      const c = K.clamp(o.cross, 0, 1);
      K.line(ctx, [[-w / 2 - 10, -h / 2 - 10], [K.lerp(-w / 2 - 10, w / 2 + 10, Math.min(1, c * 2)), K.lerp(-h / 2 - 10, h / 2 + 10, Math.min(1, c * 2))]], { stroke: o.color, w: 12, boil: 1.2, seed: 971, gap: 0 });
      if (c > 0.5) K.line(ctx, [[w / 2 + 10, -h / 2 - 10], [K.lerp(w / 2 + 10, -w / 2 - 10, (c - 0.5) * 2), K.lerp(-h / 2 - 10, h / 2 + 10, (c - 0.5) * 2)]], { stroke: o.color, w: 12, boil: 1.2, seed: 972, gap: 0 });
    }
    ctx.restore();
  }
  return { chapter, note, stamp, wrap };
})();
