/* ============================================================
   EPISODE 66 SIGNS: reusable text carriers of the bazaar (all text sits on
   cloth, paper or wood, never on the patterned sky).
   SIGN.chapter(ctx, g, o)  section banner: a kilim unrolls from a carved beam on two ropes,
                            holds, rolls back up. SCREEN space. Use at every slide start
                            (SCENES.md title / subtitle / tagline).
                            o: { at, until, lines: [section, subsection?, tagline?], y }
                            long lines wrap, the type shrinks to fit (never below 44 / 34 / 28 px)
   SIGN.note(ctx, x, y, o)  merchant's paper tag: title + body lines, saffron top band, optional
                            leader string with an arrow to a point. World or screen space.
                            o: { a, title, lines, w, size, to: [x, y], titleColor, seed, mono }
   SIGN.stamp(ctx, x, y, o) rubber-stamp word in a double frame (e.g. "DATED CLAIM") with an
                            optional cross-out. o: { a, text, cross (0..1), color, size, rot }
   SIGN.wrap(ctx, str, maxW, size, weight, font)   -> array of lines
   ============================================================ */
const SIGN = (function () {
  const P = K.P, { clamp } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));

  function wrap(ctx, str, maxW, size, weight, font) {
    const words = String(str).split(" "), out = []; let cur = "";
    words.forEach((wd) => { const t = cur ? cur + " " + wd : wd; if (cur && K.textW(ctx, t, size, weight, font) > maxW) { out.push(cur); cur = wd; } else cur = t; });
    if (cur) out.push(cur); return out;
  }

  /* zigzag border strip of triangles (kilim trim) along a horizontal edge */
  function trim(ctx, x0, x1, y, dir, seed, c1, c2) {
    const n = Math.max(2, Math.round((x1 - x0) / 44));
    for (let i = 0; i < n; i++) {
      const bx = x0 + ((x1 - x0) * (i + 0.5)) / n, d = 13 * dir;
      K.shape(ctx, [[bx - 14, y - d], [bx + 14, y - d], [bx, y + d]], { fill: i % 2 ? c1 : c2, w: 2.5, boil: 0.5, seed: seed + i, k: 0, nicks: 0 });
    }
  }

  function chapter(ctx, g, o) {
    if (g < o.at || g > o.until) return;
    const L = (o.lines || []).filter(Boolean), y0 = o.y == null ? 70 : o.y;
    if (!L.length) return;
    const unroll = K.E.out3(clamp((g - o.at) / 0.7, 0, 1)), up = K.E.in3(clamp((g - (o.until - 0.6)) / 0.6, 0, 1));
    const base = [62, 44, 34], minS = [44, 34, 28], weights = [400, 400, 600], fonts = [K.FONT.display, K.FONT.display, K.FONT.label], cols = [P.ink, P.terraDark, P.inkSoft];
    const maxW = 1380, rows = [];
    L.forEach((s, i) => {
      let sz = base[Math.min(i, 2)];
      /* shrink one line to fit before wrapping it */
      while (sz > minS[Math.min(i, 2)] && K.textW(ctx, s, sz, weights[Math.min(i, 2)], fonts[Math.min(i, 2)]) > maxW) sz -= 2;
      wrap(ctx, s, maxW, sz, weights[Math.min(i, 2)], fonts[Math.min(i, 2)]).forEach((ln) => rows.push({ s: ln, sz, i: Math.min(i, 2) }));
    });
    let w = 0; rows.forEach((r) => (w = Math.max(w, K.textW(ctx, r.s, r.sz, weights[r.i], fonts[r.i]))));
    w = Math.max(760, w + 190);
    const lh = (r) => r.sz * 1.28, h = rows.reduce((s, r) => s + lh(r), 0) + 120;
    const cx = 960, beamY = y0 + 8 - up * (h + 160);
    const vis = clamp(unroll * (1 - up * 0.2), 0, 1);
    /* ropes + beam */
    [-1, 1].forEach((sd, i) => K.line(ctx, [[cx + sd * (w / 2 - 36), beamY - 90], [cx + sd * (w / 2 - 30), beamY]], { stroke: P.ink, w: 5, boil: 0.8, seed: 940 + i }));
    const sway = Math.sin(g * 1.4) * 3, hh = h * vis, top = beamY + 10;
    if (hh > 6) {
      const body = [[cx - w / 2, top], [cx + w / 2, top], [cx + w / 2 + sway, top + hh], [cx - w / 2 + sway, top + hh]];
      K.shape(ctx, body, { fill: P.paper, w: 6, boil: 1.1, seed: 945, k: 0.1, specks: 18, shade: { color: P.paperShade, dx: 0, dy: -12 } });
      ctx.save(); K.pathOf(ctx, body, true, 0.1); ctx.clip();
      K.line(ctx, K.rectPts(cx - w / 2 + 16, top + 14, w - 32, h - 28, 4).concat([[cx - w / 2 + 16, top + 14]]), { stroke: P.terra, w: 8, boil: 0.8, seed: 946 });
      trim(ctx, cx - w / 2 + 34, cx + w / 2 - 34, top + 42, 1, 950, P.teal, P.saffron);
      trim(ctx, cx - w / 2 + 34, cx + w / 2 - 34, top + h - 42, -1, 990, P.saffron, P.teal);
      let yy = top + 62;
      rows.forEach((r) => { const hl = lh(r); K.text(ctx, r.s, cx + sway * 0.5, yy + hl / 2, { size: r.sz, weight: weights[r.i], font: fonts[r.i], fill: cols[r.i] }); yy += hl; });
      ctx.restore();
      /* fringe along the lower edge */
      for (let i = 0; i <= 22; i++) { const fx = cx - w / 2 + sway + (w * i) / 22; K.line(ctx, [[fx, top + hh], [fx + Math.sin(g * 3 + i) * 3, top + hh + 22]], { stroke: P.paperShade, w: 4, boil: 0.7, seed: 1000 + i }); }
    }
    K.shape(ctx, K.rectPts(cx - w / 2 - 44, beamY - 12, w + 88, 32, 4), { fill: P.wood, w: 5, boil: 0.9, seed: 944, k: 0.4, shade: { color: P.woodDark, dx: 0, dy: -8 }, gouge: { ang: 0, alpha: 0.3, color: P.woodDark, gap: 10, len: 0.9 } });
    [-1, 1].forEach((sd, i) => K.dot(ctx, cx + sd * (w / 2 + 44), beamY + 4, 18, P.terra, P.ink, 4, 960 + i));
  }

  function note(ctx, x, y, o) {
    o = Object.assign({ a: 1, title: "", lines: [], w: 520, size: 32, seed: 960, titleColor: P.terraDark, to: null, mono: false }, o || {});
    const a = popS(o.a); if (a <= 0) return;
    const font = o.mono ? K.FONT.mono : K.FONT.label, tf = K.FONT.display;
    const body = []; o.lines.forEach((l) => wrap(ctx, l, o.w - 56, o.size, o.mono ? 400 : 600, font).forEach((q) => body.push(q)));
    const tl = o.title ? wrap(ctx, o.title, o.w - 56, o.size * 1.05, 400, tf) : [];
    const lh = o.size * 1.3, h = 56 + tl.length * lh * 1.05 + body.length * lh + (tl.length && body.length ? 6 : 0);
    if (o.to && o.a > 0.6) {
      /* leader string from the note edge to the target, with an arrow head */
      const ex = clamp(o.to[0], x - o.w / 2, x + o.w / 2), ey = clamp(o.to[1], y - h / 2, y + h / 2);
      const sx = Math.abs(o.to[0] - x) > o.w / 2 ? ex : x, sy = Math.abs(o.to[0] - x) > o.w / 2 ? y : ey;
      const u = clamp((o.a - 0.6) / 0.4, 0, 1), tx = K.lerp(sx, o.to[0], u), ty = K.lerp(sy, o.to[1], u);
      K.line(ctx, [[sx, sy], [tx, ty]], { stroke: P.ink, w: 5, boil: 1, seed: o.seed + 1, gap: 0 });
      if (u > 0.9) { const ang = Math.atan2(ty - sy, tx - sx); ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang); K.shape(ctx, [[4, 0], [-18, -11], [-18, 11]], { fill: P.ink, w: 3, boil: 0.6, seed: o.seed + 2, nicks: 0 }); ctx.restore(); }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(K.hs(o.seed, 3) * 0.02);
    const l = -o.w / 2, t = -h / 2;
    K.shape(ctx, [[l, t], [l + o.w - 26, t], [l + o.w, t + 26], [l + o.w, t + h], [l, t + h]], { fill: P.paper, w: 4.5, boil: 1, seed: o.seed, k: 0.08, shade: { color: P.paperShade, dx: -8, dy: -8 } });
    K.shape(ctx, K.rectPts(l + 6, t + 6, o.w - 12, 14, 2), { fill: P.saffron, stroke: null, w: 0, boil: 0.6, seed: o.seed + 4, reg: false, pattern: { kind: "zigzag", color: P.terra, gap: 12, w: 2.5, alpha: 0.8 } });
    K.dot(ctx, l + 26, t + 40, 7, P.paperShade, P.ink, 2.5, o.seed + 5);
    let yy = t + 30 + lh / 2;
    tl.forEach((s) => { K.text(ctx, s, l + 28, yy + 8, { size: o.size * 1.05, weight: 400, font: tf, fill: o.titleColor, align: "left" }); yy += lh * 1.05; });
    if (tl.length && body.length) yy += 6;
    body.forEach((s) => { K.text(ctx, s, l + 28, yy + 8, { size: o.size, weight: o.mono ? 400 : 600, font, fill: P.ink, align: "left" }); yy += lh; });
    ctx.restore();
  }

  function stamp(ctx, x, y, o) {
    o = Object.assign({ a: 1, text: "DATED CLAIM", cross: 0, color: P.ask, size: 60, rot: -0.1 }, o || {});
    if (o.a <= 0) return;
    const a = o.a >= 1 ? 1 : 1 + 0.6 * (1 - K.E.out3(o.a)); /* slams down from big */
    const w = K.textW(ctx, o.text, o.size, 400, K.FONT.display) + o.text.length * 6 + 70, h = o.size + 44;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(a, a); ctx.globalAlpha *= clamp(o.a * 3, 0, 1);
    K.shape(ctx, K.rectPts(-w / 2, -h / 2, w, h, 4), { fill: null, stroke: o.color, w: 7, boil: 1.1, seed: 970, nicks: 0 });
    K.shape(ctx, K.rectPts(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 4), { fill: null, stroke: o.color, w: 3, boil: 0.9, seed: 973, nicks: 0 });
    K.text(ctx, o.text, 0, 4, { size: o.size, weight: 400, font: K.FONT.display, fill: o.color, track: 6 });
    if (o.cross > 0) {
      const c = clamp(o.cross, 0, 1);
      K.line(ctx, [[-w / 2 - 10, -h / 2 - 10], [K.lerp(-w / 2 - 10, w / 2 + 10, Math.min(1, c * 2)), K.lerp(-h / 2 - 10, h / 2 + 10, Math.min(1, c * 2))]], { stroke: o.color, w: 12, boil: 1.1, seed: 971 });
      if (c > 0.5) K.line(ctx, [[w / 2 + 10, -h / 2 - 10], [K.lerp(w / 2 + 10, -w / 2 - 10, (c - 0.5) * 2), K.lerp(-h / 2 - 10, h / 2 + 10, (c - 0.5) * 2)]], { stroke: o.color, w: 12, boil: 1.1, seed: 972 });
    }
    ctx.restore();
  }
  return { chapter, note, stamp, wrap };
})();
