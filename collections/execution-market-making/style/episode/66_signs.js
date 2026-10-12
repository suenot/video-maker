/* ============================================================
   EPISODE 66 SIGNS: reusable text carriers for the episode, in the station's
   materials: teal enamel sign on chains, cream paper cards, tomato rubber stamp.
   Text never sits on raw sky or scenery, always on a carrier.
   SIGN.chapter(ctx, g, o)  section title: an enamel sign drops in on chains, holds, lifts away.
                            o: { at, until, lines: [section, subsection?, tagline?], y (top edge, default 176) }
                            SCREEN space. Use at every slide start (SCENES.md title / subtitle / tagline).
                            Sizes 62 / 44 / 32 px; long lines wrap. Keeps clear of the logo corner.
   SIGN.note(ctx, x, y, o)  paper card with a bold title and body lines, optional leader line with an
                            arrow to a point. o: { a, title, lines, w, size (32), to: [x, y], titleColor,
                            seed, mono, align: "left" | "center" }. Works in world or screen space.
   SIGN.stamp(ctx, x, y, o) rubber-stamp word (e.g. "LAGS") with an optional cross-out.
                            o: { a, text, cross (0..1 draws the cross), color, size, rot }
   SIGN.wrap(ctx, str, maxW, size, weight, font) -> lines
   ============================================================ */
/* canvas text only starts loading a webfont on first use, so the first frame (and a snapshot) would draw the
   fallback face. Ask for every face up front: RUN's document.fonts.ready re-render then waits for them. */
try { if (document.fonts && document.fonts.load) ["500 40px Jost", "700 40px Jost", "800 40px Jost", "500 40px 'IBM Plex Mono'", "700 40px 'IBM Plex Mono'", "900 40px 'CJK SC'", "900 40px 'CJK TC'"].forEach((f) => document.fonts.load(f, "Aa0\u4e2d").catch(() => {})); } catch (e) { /* fonts are best effort */ }
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
    const SZ = [62, 44, 32], WT = [800, 800, 500], FT = [K.FONT.display, K.FONT.display, K.FONT.text], CL = [P.cream, P.mustardLight, P.cream];
    const maxW = 1380, rows = [];
    (o.lines || []).filter(Boolean).forEach((s, i) => {
      const k = Math.min(i, 2);
      wrap(ctx, s, maxW, SZ[k], WT[k], FT[k]).forEach((q) => rows.push({ s: q, k }));
    });
    let tw = 0; rows.forEach((r) => (tw = Math.max(tw, K.textW(ctx, r.s, SZ[r.k], WT[r.k], FT[r.k]))));
    const w = Math.min(1560, tw + 150), lh = (k) => SZ[k] * 1.22;
    const h = rows.reduce((s, r) => s + lh(r.k), 0) + 78;
    const top = o.y == null ? 176 : o.y, cy = top + h / 2, cx = 900;
    const u = clamp((g - o.at) / 0.7, 0, 1), lift = K.E.in3(clamp((g - (o.until - 0.55)) / 0.55, 0, 1));
    ctx.save();
    ctx.translate(0, -lift * (cy + h / 2 + 60));
    const box = K.sign(ctx, cx, cy, w, h, u, { seed: 440 });
    if (box) {
      ctx.translate(box.x, box.y); ctx.rotate(box.rot);
      let yy = -h / 2 + 39;
      rows.forEach((r) => { yy += lh(r.k) / 2; K.text(ctx, r.s, 0, yy + 2, { size: SZ[r.k], weight: WT[r.k], font: FT[r.k], fill: CL[r.k] }); yy += lh(r.k) / 2; });
    }
    ctx.restore();
  }

  function note(ctx, x, y, o) {
    o = Object.assign({ a: 1, title: "", lines: [], w: 520, size: 32, seed: 960, titleColor: P.tealDark, to: null, mono: false, align: "left" }, o || {});
    const a = popS(o.a); if (a <= 0) return;
    const font = o.mono ? K.FONT.mono : K.FONT.text, tf = K.FONT.display, mid = o.align === "center";
    const body = []; o.lines.forEach((l) => wrap(ctx, l, o.w - 64, o.size, 500, font).forEach((q) => body.push(q)));
    const tl = o.title ? wrap(ctx, o.title, o.w - 64, o.size * 1.05, 800, tf) : [];
    const lh = o.size * 1.3, h = 48 + tl.length * lh + body.length * lh + (tl.length && body.length ? 6 : 0);
    if (o.to && o.a > 0.6) {
      /* leader line: from the card edge to the target, with an arrow head */
      const far = Math.abs(o.to[0] - x) > o.w / 2;
      const sx = far ? clamp(o.to[0], x - o.w / 2, x + o.w / 2) : x, sy = far ? y : clamp(o.to[1], y - h / 2, y + h / 2);
      const u = clamp((o.a - 0.6) / 0.4, 0, 1), tx = K.lerp(sx, o.to[0], u), ty = K.lerp(sy, o.to[1], u);
      K.line(ctx, [[sx, sy], [tx, ty]], { key: P.ink, w: 4, boil: 0.8, seed: o.seed + 1 });
      if (u > 0.9) { const ang = Math.atan2(ty - sy, tx - sx); ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang); K.shape(ctx, [[3, 0], [-20, -11], [-20, 11]], { fill: P.ink, w: 2, boil: 0.4, seed: o.seed + 2 }); ctx.restore(); }
    }
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(K.hs(o.seed, 3) * 0.02);
    K.shape(ctx, K.rrectPts(-o.w / 2, -h / 2, o.w, h, 10, 4), { fill: P.cream, w: 3, seed: o.seed, shade: { color: P.creamShade, dx: -8, dy: -9 }, tone: { color: P.ink, gap: 10, r: 0, r2: 1.8, dir: Math.PI / 2, alpha: 0.12 } });
    K.shape(ctx, K.rrectPts(-o.w / 2 + 9, -h / 2 + 9, o.w - 18, h - 18, 6, 4), { fill: null, key: P.mustard, w: 2.5, seed: o.seed + 3 });
    const px = mid ? 0 : -o.w / 2 + 32;
    let yy = -h / 2 + 24 + lh / 2;
    tl.forEach((s) => { K.text(ctx, s, px, yy, { size: o.size * 1.05, weight: 800, font: tf, fill: o.titleColor, align: mid ? "center" : "left" }); yy += lh; });
    if (tl.length && body.length) yy += 6;
    body.forEach((s) => { K.text(ctx, s, px, yy, { size: o.size, weight: 500, font, fill: P.ink, align: mid ? "center" : "left" }); yy += lh; });
    ctx.restore();
  }

  function stamp(ctx, x, y, o) {
    o = Object.assign({ a: 1, text: "STALE", cross: 0, color: P.tomato, size: 64, rot: -0.12 }, o || {});
    if (o.a <= 0) return;
    const sc = o.a >= 1 ? 1 : 1 + 0.6 * (1 - K.E.out3(o.a)); /* slams down from big */
    const w = K.textW(ctx, o.text, o.size, 900, K.FONT.display) + 80, h = o.size + 46;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(o.a * 3, 0, 1);
    K.shape(ctx, K.rrectPts(-w / 2, -h / 2, w, h, 14, 4), { fill: "rgba(243,230,200,0.94)", key: o.color, w: 7, boil: 0.9, seed: 970, reg: 0 });
    K.shape(ctx, K.rrectPts(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 8, 4), { fill: null, key: o.color, w: 3, boil: 0.9, seed: 971 });
    K.text(ctx, o.text, 0, 3, { size: o.size, weight: 900, fill: o.color, track: 4 });
    if (o.cross > 0) {
      const c = clamp(o.cross, 0, 1), e = 12, ln = (p, q, u, sd) => K.line(ctx, [p, [K.lerp(p[0], q[0], u), K.lerp(p[1], q[1], u)]], { key: P.ink, w: 11, boil: 0.8, seed: sd });
      ln([-w / 2 - e, -h / 2 - e], [w / 2 + e, h / 2 + e], Math.min(1, c * 2), 972);
      if (c > 0.5) ln([w / 2 + e, -h / 2 - e], [-w / 2 - e, h / 2 + e], (c - 0.5) * 2, 973);
    }
    ctx.restore();
  }
  return { chapter, note, stamp, wrap };
})();
