/* ============================================================
   EPISODE 66 SIGNS: reusable text carriers for the episode, in the materials of a
   1920s picture house (ink cards with paper rules, paper cards, rubber stamps).
   Text sits on a card, never on the raw backdrop. Gold only marks money / the signal.
   SIGN.chapter(ctx, g, o)  silent-film intertitle: pops open like an iris, holds, closes.
                            o: { at, until, lines: [section, subsection?, tagline?], y, goldLine }
                            SCREEN space. Use at every slide start (SCENES.md title / subtitle / tagline).
                            goldLine: index of the line set in gold (default 1; -1 for none).
   SIGN.note(ctx, x, y, o)  paper card with a bold title and body lines, a pin, optional
                            leader line with an arrow to a point. o: { a, title, lines, w, size,
                            to: [x, y], titleColor, seed, mono, ink (dark card) }. World or screen space.
   SIGN.stamp(ctx, x, y, o) rubber-stamp word (e.g. "UNVERIFIED") in ink (gold with o.gold),
                            optional cross-out. o: { a, text, cross (0..1), gold, size, rot }
   SIGN.wrap(ctx, str, maxW, size, weight, font)  -> lines
   ============================================================ */
const SIGN = (function () {
  const P = K.P, { clamp } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));

  function wrap(ctx, str, maxW, size, weight, font) {
    const words = String(str).split(" "), out = []; let cur = "";
    words.forEach((wd) => { const t = cur ? cur + " " + wd : wd; if (cur && K.textW(ctx, t, size, weight, font) > maxW) { out.push(cur); cur = wd; } else cur = t; });
    if (cur) out.push(cur); return out;
  }

  function chapter(ctx, g, o) {
    if (g < o.at || g > o.until) return;
    const src = (o.lines || []).filter(Boolean), gi = o.goldLine == null ? 1 : o.goldLine;
    const sizes = [62, 46, 34], weights = [900, 900, 500], fonts = [K.FONT.display, K.FONT.display, K.FONT.label], MAXW = 1500;
    const rows = []; /* wrap every line, remember its style */
    src.forEach((s, i) => wrap(ctx, s, MAXW, sizes[i], weights[i], fonts[i]).forEach((q) => rows.push({ s: q, i })));
    let w = 0; rows.forEach((r) => (w = Math.max(w, K.textW(ctx, r.s, sizes[r.i], weights[r.i], fonts[r.i]))));
    w = Math.max(560, w + 180);
    const lh = (r) => sizes[r.i] * 1.28, h = rows.reduce((s, r) => s + lh(r), 0) + 110;
    const open = K.E.back(clamp((g - o.at) / 0.5, 0, 1), 1.5), close = K.E.in3(clamp((g - (o.until - 0.4)) / 0.4, 0, 1));
    const k = open * (1 - close); if (k <= 0.01) return;
    const y0 = o.y == null ? 230 : o.y;
    K.screen(ctx); ctx.save(); ctx.translate(960, y0); ctx.scale(k, k); ctx.rotate(0.006 * Math.sin(g * 1.3));
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.ink, w: 6, boil: 0.8, seed: 1100 });
    K.shape(ctx, K.rectPts(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 4), { fill: null, stroke: P.paper, w: 4, boil: 0.6, seed: 1101 });
    K.shape(ctx, K.rectPts(-w / 2 + 28, -h / 2 + 28, w - 56, h - 56, 4), { fill: null, stroke: P.paper, w: 2, boil: 0.6, seed: 1102 });
    let yy = -h / 2 + 55;
    rows.forEach((r) => {
      const l = lh(r); yy += l / 2;
      K.text(ctx, r.s, 0, yy, { size: sizes[r.i], weight: weights[r.i], font: fonts[r.i], fill: r.i === gi ? P.gold : P.paper });
      yy += l / 2;
    });
    ctx.restore();
  }

  function note(ctx, x, y, o) {
    o = Object.assign({ a: 1, title: "", lines: [], w: 560, size: 32, seed: 1160, titleColor: P.ink, to: null, mono: false, ink: false }, o || {});
    const a = popS(o.a); if (a <= 0) return;
    const font = o.mono ? K.FONT.mono : K.FONT.label, tf = K.FONT.display, bodyCol = o.ink ? P.paper : P.ink;
    const body = []; o.lines.forEach((l) => wrap(ctx, l, o.w - 64, o.size, 500, font).forEach((q) => body.push(q)));
    const tl = o.title ? wrap(ctx, o.title, o.w - 64, o.size * 1.15, 900, tf) : [];
    const lh = o.size * 1.32, h = 52 + tl.length * lh * 1.1 + body.length * lh + (tl.length && body.length ? 8 : 0);
    if (o.to && o.a > 0.6) { /* leader: brush line from the card edge to the target, with an arrow head */
      const ex = clamp(o.to[0], x - o.w / 2, x + o.w / 2), ey = clamp(o.to[1], y - h / 2, y + h / 2);
      const side = Math.abs(o.to[0] - x) > o.w / 2, sx = side ? ex : x, sy = side ? y : ey;
      const u = clamp((o.a - 0.6) / 0.4, 0, 1), tx = K.lerp(sx, o.to[0], u), ty = K.lerp(sy, o.to[1], u);
      K.line(ctx, [[sx, sy], [tx, ty]], { stroke: P.ink, w: 6, boil: 0.8, seed: o.seed + 1, taper: [1, 0.6] });
      if (u > 0.9) { const ang = Math.atan2(ty - sy, tx - sx); ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang); K.shape(ctx, [[6, 0], [-22, -13], [-22, 13]], { fill: P.ink, w: 3, boil: 0.5, seed: o.seed + 2 }); ctx.restore(); }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(K.hs(o.seed, 3) * 0.02);
    K.shape(ctx, K.rectPts(-o.w / 2, -h / 2, o.w, h, 4), { fill: o.ink ? P.ink : P.paper, w: 5, boil: 0.8, seed: o.seed, shade: o.ink ? null : { color: P.g5, dx: -10, dy: -10 } });
    K.shape(ctx, K.rectPts(-o.w / 2 + 12, -h / 2 + 12, o.w - 24, h - 24, 3), { fill: null, stroke: o.ink ? P.paper : P.ink, w: 2.5, boil: 0.5, seed: o.seed + 3 });
    K.dot(ctx, 0, -h / 2 + 2, 7, P.g4, P.ink, 3, o.seed + 4); /* the pin */
    let yy = -h / 2 + 30 + lh / 2;
    tl.forEach((s) => { K.text(ctx, s, -o.w / 2 + 32, yy + 4, { size: o.size * 1.15, weight: 900, font: tf, fill: o.ink ? P.paper : o.titleColor, align: "left" }); yy += lh * 1.1; });
    if (tl.length && body.length) yy += 8;
    body.forEach((s) => { K.text(ctx, s, -o.w / 2 + 32, yy, { size: o.size, weight: 500, font, fill: bodyCol, align: "left" }); yy += lh; });
    ctx.restore();
  }

  function stamp(ctx, x, y, o) {
    o = Object.assign({ a: 1, text: "UNVERIFIED", cross: 0, gold: false, size: 64, rot: -0.1 }, o || {});
    if (o.a <= 0) return;
    const col = o.gold ? P.goldDark : P.ink, k = o.a >= 1 ? 1 : 1 + 0.6 * (1 - K.E.out3(o.a)); /* slams down from big */
    const w = K.textW(ctx, o.text, o.size, 900, K.FONT.display) + 70, h = o.size + 46;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(k, k); ctx.globalAlpha *= clamp(o.a * 3, 0, 1) * 0.92;
    if (o.gold) K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: P.gold, stroke: null, w: 0, boil: 0.8, seed: 1170 });
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: null, stroke: col, w: 8, boil: 0.9, seed: 1171 });
    K.shape(ctx, K.rectPts(-w / 2 + 11, -h / 2 + 11, w - 22, h - 22, 3), { fill: null, stroke: col, w: 3, boil: 0.7, seed: 1172 });
    K.text(ctx, o.text, 0, 3, { size: o.size, weight: 900, font: K.FONT.display, fill: col });
    if (o.cross > 0) {
      const c = clamp(o.cross, 0, 1), e = Math.min(1, c * 2);
      K.line(ctx, [[-w / 2 - 14, -h / 2 - 14], [K.lerp(-w / 2 - 14, w / 2 + 14, e), K.lerp(-h / 2 - 14, h / 2 + 14, e)]], { stroke: P.ink, w: 14, boil: 0.8, seed: 1173, taper: [0.7, 0.7] });
      if (c > 0.5) { const f = (c - 0.5) * 2; K.line(ctx, [[w / 2 + 14, -h / 2 - 14], [K.lerp(w / 2 + 14, -w / 2 - 14, f), K.lerp(-h / 2 - 14, h / 2 + 14, f)]], { stroke: P.ink, w: 14, boil: 0.8, seed: 1174, taper: [0.7, 0.7] }); }
    }
    ctx.restore();
  }
  return { chapter, note, stamp, wrap };
})();
