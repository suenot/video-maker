/* ============================================================
   EPISODE 66 SIGNS: reusable text carriers of the diner (all text sits on a sign, an order
   ticket or a rubber stamp, never on the raw wall).
   SIGN.chapter(ctx, g, o)  neon diner sign that drops in on two chrome chains, lights up,
                            holds, lifts away. SCREEN space. Use at every slide start.
                            o: { at, until, lines: [section, subsection?, tagline?], y, maxW }
                            Long lines wrap (default maxW 1300) and the sign grows.
   SIGN.note(ctx, x, y, o)  order ticket (cream, notched, cherry header) with a title and body
                            lines, optional leader line with an arrow. World or screen space.
                            o: { a, title, lines, w, size, to: [x, y], titleColor, seed, mono }
                            Body text is Nunito 700 (or Anonymous Pro with mono: true), >= 28 px.
   SIGN.stamp(ctx, x, y, o) rubber-stamp word ("DRAFT", "UNVERIFIED") with an optional ink
                            cross-out. o: { a, text, cross (0..1), color, size, rot }
   SIGN.wrap(ctx, str, maxW, size, weight, font) -> lines
   ============================================================ */
const SIGN = (function () {
  const P = K.P, { clamp } = K;
  /* Canvas text only requests a webfont when it first draws, so the first frame can show a fallback face
     (Lobster looks like Times). Request every kit face up front: document.fonts.ready then waits for them
     and the runtime re-renders. The sample text pulls the latin and cyrillic subsets. */
  if (typeof document !== "undefined" && document.fonts && document.fonts.load) {
    ["400 64px Lobster", "600 32px Nunito", "800 32px Nunito", "900 32px Nunito", "400 32px 'Anonymous Pro'", "700 32px 'Anonymous Pro'"].forEach((f) => document.fonts.load(f, "AaEe0Яя").catch(() => {}));
  }
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));

  function wrap(ctx, str, maxW, size, weight, font) {
    const words = String(str).split(" "), out = []; let cur = "";
    words.forEach((wd) => { const t = cur ? cur + " " + wd : wd; if (cur && K.textW(ctx, t, size, weight, font) > maxW) { out.push(cur); cur = wd; } else cur = t; });
    if (cur) out.push(cur); return out;
  }

  function chapter(ctx, g, o) {
    if (g < o.at || g > o.until) return;
    const L = (o.lines || []).filter(Boolean), y0 = o.y == null ? 250 : o.y, maxW = o.maxW || 1300;
    const sizes = [64, 44, 34], weights = [400, 900, 700], fonts = [K.FONT.script, K.FONT.display, K.FONT.text], cols = [P.cream, P.mint, P.cream], lhs = [76, 56, 46];
    /* wrap each line with its own style, keep the style index per wrapped row */
    const rows = []; let w = 0;
    L.forEach((s, i) => wrap(ctx, s, maxW, sizes[i], weights[i], fonts[i]).forEach((q) => { rows.push({ q, i }); w = Math.max(w, K.textW(ctx, q, sizes[i], weights[i], fonts[i])); }));
    const bw = Math.min(1640, w + 170), bh = rows.reduce((s, r) => s + lhs[r.i], 0) + 70;
    const drop = K.E.back(clamp((g - o.at) / 0.6, 0, 1), 1.5), lift = K.E.in3(clamp((g - (o.until - 0.5)) / 0.5, 0, 1));
    const cy = K.lerp(-bh - 140, y0, drop) - lift * (bh + y0 + 200), cx = 960 + 6 * Math.sin(g * 1.3) * (1 - drop * 0.9);
    const on = clamp((g - o.at - 0.35) / 0.7, 0, 1);
    K.screen(ctx);
    [-1, 1].forEach((sd, i) => K.rule(ctx, [[cx + sd * bw * 0.32, cy - bh / 2 - 40], [cx + sd * bw * 0.32, -60]], { stroke: P.chromeDark, w: 7, boil: 0.8, seed: 940 + i }));
    K.neonSign(ctx, cx, cy, bw, bh, on, { seed: 945 });
    let yy = cy - bh / 2 + 40;
    rows.forEach((r) => {
      yy += lhs[r.i] / 2;
      K.text(ctx, r.q, cx, yy + 2, { size: sizes[r.i], weight: weights[r.i], font: fonts[r.i], fill: cols[r.i], drop: { color: P.ink, dx: 3, dy: 3 } });
      yy += lhs[r.i] / 2;
    });
  }

  function note(ctx, x, y, o) {
    o = Object.assign({ a: 1, title: "", lines: [], w: 560, size: 32, seed: 960, titleColor: P.cream, to: null, mono: false }, o || {});
    const a = popS(o.a); if (a <= 0) return;
    const font = o.mono ? K.FONT.mono : K.FONT.text, tf = K.FONT.display, bsz = o.mono ? o.size + 4 : o.size;
    const body = []; o.lines.forEach((l) => wrap(ctx, l, o.w - 64, bsz, 700, font).forEach((q) => body.push(q)));
    const tl = o.title ? wrap(ctx, o.title, o.w - 64, o.size * 1.05, 900, tf) : [];
    const lh = bsz * 1.28, tlh = o.size * 1.25, headH = tl.length ? tl.length * tlh + 28 : 0;
    const h = headH + body.length * lh + 44;
    if (o.to && o.a > 0.6) {
      const ex = clamp(o.to[0], x - o.w / 2, x + o.w / 2), ey = clamp(o.to[1], y - h / 2, y + h / 2);
      const sx = Math.abs(o.to[0] - x) > o.w / 2 ? ex : x, sy = Math.abs(o.to[0] - x) > o.w / 2 ? y : ey;
      const u = clamp((o.a - 0.6) / 0.4, 0, 1), tx = K.lerp(sx, o.to[0], u), ty = K.lerp(sy, o.to[1], u);
      K.line(ctx, [[sx, sy], [tx, ty]], { stroke: P.ink, w: 6, boil: 1, seed: o.seed + 1, taper: 0 });
      if (u > 0.9) { const an = Math.atan2(ty - sy, tx - sx); ctx.save(); ctx.translate(tx, ty); ctx.rotate(an); K.shape(ctx, [[6, 0], [-20, -13], [-20, 13]], { fill: P.mustard, w: 3.5, boil: 0.6, seed: o.seed + 2 }); ctx.restore(); }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(K.hs(o.seed, 3) * 0.02);
    const W = o.w, hy = -h / 2 + headH;
    const pts = [[-W / 2, -h / 2], [W / 2, -h / 2], [W / 2, h / 2], [-W / 2, h / 2]];
    K.shape(ctx, pts, { fill: P.cream, w: 4.5, boil: 1.1, seed: o.seed, shade: { color: P.creamShade, dx: -10, dy: -10 } });
    if (headH) {
      K.shape(ctx, [[-W / 2, -h / 2], [W / 2, -h / 2], [W / 2, hy], [-W / 2, hy]], { fill: P.cherry, w: 4.5, boil: 1, seed: o.seed + 3, shade: { color: P.cherryDark, dx: 0, dy: -10 } });
      /* ticket notches on both sides of the seam */
      [-1, 1].forEach((sd, i) => K.shape(ctx, K.ellipsePts(sd * W / 2, hy, 11, 11, 8), { fill: P.wall, w: 3, boil: 0.4, seed: o.seed + 5 + i, misreg: false }));
    }
    let yy = -h / 2 + 14 + tlh / 2;
    tl.forEach((s) => { K.text(ctx, s, -W / 2 + 30, yy, { size: o.size * 1.05, weight: 900, font: tf, fill: o.titleColor, align: "left" }); yy += tlh; });
    yy = hy + 22 + lh / 2;
    body.forEach((s) => { K.text(ctx, s, -W / 2 + 30, yy, { size: bsz, weight: o.mono ? 700 : 700, font, fill: P.ink, align: "left" }); yy += lh; });
    ctx.restore();
  }

  function stamp(ctx, x, y, o) {
    o = Object.assign({ a: 1, text: "DRAFT", cross: 0, color: P.cherry, size: 64, rot: -0.12 }, o || {});
    if (o.a <= 0) return;
    const sc = o.a >= 1 ? 1 : 1 + 0.6 * (1 - K.E.out3(o.a)); /* slams down from big */
    const w = K.textW(ctx, o.text, o.size, 900, K.FONT.display) + 70, h = o.size + 46;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(o.a * 3, 0, 1);
    K.shape(ctx, K.roundRectPts(-w / 2, -h / 2, w, h, 14), { fill: null, stroke: o.color, w: 8, boil: 1.2, seed: 970 });
    K.shape(ctx, K.roundRectPts(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 8), { fill: null, stroke: o.color, w: 3, boil: 0.8, seed: 971 });
    K.text(ctx, o.text, 0, 3, { size: o.size, weight: 900, fill: o.color });
    if (o.cross > 0) {
      const c = clamp(o.cross, 0, 1);
      K.line(ctx, [[-w / 2 - 12, -h / 2 - 12], [K.lerp(-w / 2 - 12, w / 2 + 12, Math.min(1, c * 2)), K.lerp(-h / 2 - 12, h / 2 + 12, Math.min(1, c * 2))]], { stroke: P.ink, w: 12, boil: 1.2, seed: 972, taper: 0 });
      if (c > 0.5) K.line(ctx, [[w / 2 + 12, -h / 2 - 12], [K.lerp(w / 2 + 12, -w / 2 - 12, (c - 0.5) * 2), K.lerp(-h / 2 - 12, h / 2 + 12, (c - 0.5) * 2)]], { stroke: P.ink, w: 12, boil: 1.2, seed: 973, taper: 0 });
    }
    ctx.restore();
  }
  return { chapter, note, stamp, wrap };
})();
