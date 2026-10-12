/* ============================================================
   KIT 20 PIXEL: the world's language-free symbols.
   - K.pix(ctx, name, x, y, cell, color, opt)  pixel-art icon from a bitmap,
     centred on (x, y); each "#" is one rounded cell. Used on robot faces,
     medallions, bullets and stamps.
   - K.seg7(ctx, str, x, y, h, color, opt)    seven-segment LED digits for every
     number in the world (prices, clocks, scores). Supports 0-9 . , - + % : $
   ============================================================ */
var AK = window.AK || (window.AK = {});
(function (K) {
  const P = K.P;
  K.ICONS = {
    eye: ["...#####...", ".##.....##.", "#...###...#", "#..#####..#", "#...###...#", ".##.....##.", "...#####..."],
    fork: ["#.....#", "##...##", ".##.##.", "..###..", "...#...", "...#...", "...#..."],
    brain: [".##.##.", "#..#..#", "#.##.##", "##..#.#", "#..#..#", ".##.##.", "...#..."],
    bolt: ["....###", "...###.", "..###..", ".######", "...###.", "..###..", ".##....", "#......"],
    check: ["......#", ".....##", "#...##.", "##.##..", ".###...", "..#...."],
    cross: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    up: ["...#...", "..###..", ".#####.", "#######", "..###..", "..###..", "..###.."],
    down: ["..###..", "..###..", "..###..", "#######", ".#####.", "..###..", "...#..."],
    heart: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
    gear: ["..#.#..", ".#####.", "##...##", ".#...#.", "##...##", ".#####.", "..#.#.."],
    lens: [".###..", "#...#.", "#...#.", "#...#.", ".####.", "....##", ".....#"],
    shield: ["#######", "#.....#", "#..#..#", "#.###.#", ".#.#.#.", "..#.#..", "...#..."],
    chat: ["#######", "#.....#", "#.#.#.#", "#.....#", "#######", ".##....", ".#....."],
    coin: [".###.", "#.#.#", "##..#", "#..##", "#.#.#", ".###."],
    rocket: ["...#...", "..###..", "..#.#..", "..###..", ".#####.", "#.###.#", "..#.#.."],
    branch: ["#.....", "#.....", "##..#.", "#.##..", "#..#..", "#...#.", "#....#"],
    chart: ["......#", ".....#.", "..#.#..", ".#.#...", "#......", "#######"],
    team: ["#####.#####", "#.#.#.#.#.#", "#####.#####", "..#.....#..", ".###...###.", ".###...###."],
    globe: ["..###..", ".#.#.#.", "#######", "#..#..#", "#######", ".#.#.#.", "..###.."],
    clock: [".###.", "#.#.#", "#.##.", "#...#", ".###."],
    play: ["#...", "##..", "###.", "##..", "#..."],
    harness: [".#...#.", ".#...#.", "#######", "#######", ".#####.", "..###..", "...#...", "...#..."],
    dollar: ["..#..", ".####", "#.#..", ".###.", "..#.#", "####.", "..#.."],
    quest: [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
    idea: [".###.", "#...#", "#...#", "#...#", ".#.#.", ".###.", ".###."],
  };
  /* draw an icon; opt.glow adds an additive halo, opt.bg draws a backing plate */
  K.pix = function (ctx, name, x, y, cell, color, opt) {
    const o = Object.assign({ glow: 0, round: 0.28, a: 1 }, opt || {});
    const B = K.ICONS[name]; if (!B || o.a <= 0) return;
    const rows = B.length, cols = Math.max(...B.map((r) => r.length));
    const x0 = x - (cols * cell) / 2, y0 = y - (rows * cell) / 2, g = cell * 0.05, rr = cell * o.round;
    ctx.save(); ctx.globalAlpha *= o.a;
    if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = cell * 2.2 * o.glow; }
    ctx.fillStyle = color; ctx.beginPath();
    B.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === "#") {
      const px = x0 + i * cell + g, py = y0 + j * cell + g, s = cell - 2 * g;
      if (ctx.roundRect) ctx.roundRect(px, py, s, s, rr); else ctx.rect(px, py, s, s);
    } });
    ctx.fill(); ctx.restore();
    return { w: cols * cell, h: rows * cell };
  };

  /* ---------- seven-segment digits ---------- */
  const SEG = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcfgd", "-": "g", "+": "g", " ": "" };
  /* segment polygon for a cell of width w, height h (slanted 8 %) */
  function segPoly(k, w, h, t) {
    /* classic hexagonal segments: horizontal a, g, d; vertical f, b (top), e, c (bottom) */
    const g = t * 0.18, q = t / 2, hh = h / 2;
    const Hs = (yc) => [[q + g, yc], [t + g, yc - q], [w - t - g, yc - q], [w - q - g, yc], [w - t - g, yc + q], [t + g, yc + q]];
    const Vs = (xc, y0, y1) => [[xc, y0 + g], [xc + q, y0 + q + g], [xc + q, y1 - q - g], [xc, y1 - g], [xc - q, y1 - q - g], [xc - q, y0 + q + g]];
    return { a: Hs(q), g: Hs(hh), d: Hs(h - q), f: Vs(q, q, hh), b: Vs(w - q, q, hh), e: Vs(q, hh, h - q), c: Vs(w - q, hh, h - q) }[k];
  }
  /* returns the drawn width. opt: align "center"|"left"|"right", ghost (unlit segments alpha), glow */
  K.seg7W = (str, h) => { let w = 0; const cw = h * 0.52, gap = h * 0.14; for (const c of String(str)) w += (c === "." || c === "," || c === ":" ? h * 0.18 : c === "%" || c === "$" ? h * 0.6 : cw) + gap; return w - gap; };
  K.seg7 = function (ctx, str, x, y, h, color, opt) {
    const o = Object.assign({ align: "center", ghost: 0.07, glow: 0.8, a: 1, skew: 0.08 }, opt || {});
    str = String(str); const W = K.seg7W(str, h), cw = h * 0.52, gap = h * 0.14, t = h * 0.13;
    let cx = o.align === "center" ? x - W / 2 : o.align === "right" ? x - W : x;
    ctx.save(); ctx.globalAlpha *= o.a; ctx.translate(0, y - h / 2);
    const fillPoly = (pts, ox) => { ctx.moveTo(ox + pts[0][0] - pts[0][1] * o.skew + h * o.skew * 0.5, pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(ox + pts[i][0] - pts[i][1] * o.skew + h * o.skew * 0.5, pts[i][1]); ctx.closePath(); };
    for (const c of str) {
      if (c === "." || c === "," || c === ":") {
        ctx.fillStyle = color; if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = h * 0.25 * o.glow; }
        ctx.beginPath();
        if (c === ":") { ctx.rect(cx, h * 0.28, t, t); ctx.rect(cx - h * 0.07, h * 0.66, t, t); } else ctx.rect(cx - h * 0.05 * o.skew, h - t, t, t);
        ctx.fill(); cx += h * 0.18 + gap; continue;
      }
      if (c === "%" || c === "$") {
        K.text(ctx, c, cx + h * 0.3, h / 2, { size: h * 0.95, font: K.FONT.display, fill: color, glow: o.glow ? color : null, glowR: h * 0.25 });
        cx += h * 0.6 + gap; continue;
      }
      const on = SEG[c] != null ? SEG[c] : "";
      /* ghost (unlit) segments first, then lit ones with glow */
      if (o.ghost) { ctx.save(); ctx.shadowBlur = 0; ctx.globalAlpha *= o.ghost; ctx.fillStyle = color; ctx.beginPath(); "abcdefg".split("").forEach((k) => fillPoly(segPoly(k, cw, h, t), cx)); ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.fillStyle = color; if (o.glow) { ctx.shadowColor = color; ctx.shadowBlur = h * 0.25 * o.glow; }
      ctx.beginPath(); on.split("").forEach((k) => fillPoly(segPoly(k, cw, h, t), cx));
      if (c === "+") { const vx = cx + cw / 2 - t / 2; ctx.rect(vx, h * 0.3, t, h * 0.4); }
      ctx.fill(); ctx.restore();
      cx += cw + gap;
    }
    ctx.restore();
    return W;
  };
  void P;
})(AK);
