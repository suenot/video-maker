/* ============================================================
   EPISODE 69 RICH: text with subscripts for formulas, shared by every scene.
   Write a subscript as "_" + one character: "R(i_1, i_2)" draws i with a small 1 under it.
   Mono, bold, left-aligned from x (baseline middle, like K.text). Not boiled: it sits on a carrier.

   RICH.w(ctx, str, size)         width in px of the whole string
   RICH.glyphs(str)               count of drawn characters (the "_" markers are not counted), for typing it in
   RICH.draw(ctx, str, x, y, o)   draw it; o = { size 40, fill K.P.ink, n: all } (n = how many glyphs to show,
                                  for chalking it term by term). Returns the drawn width.
   RICH.tag(ctx, x, y, str, o)    a paper tag centred on x, y holding the string;
                                  o = { a 1 (pop-in 0..1), size 40, hot false (gold tag), seed 2700 }
   ============================================================ */
const RICH = (function () {
  const SUB = 0.62, DROP = 0.28;
  const w = (ctx, str, size) => {
    let t = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === "_" && i + 1 < str.length) { t += K.textW(ctx, str[i + 1], size * SUB, 700, K.FONT.mono); i++; }
      else t += K.textW(ctx, str[i], size, 700, K.FONT.mono);
    }
    return t;
  };
  const glyphs = (str) => str.replace(/_/g, "").length;
  function draw(ctx, str, x, y, o) {
    o = Object.assign({ size: 40, fill: K.P.ink, n: 1e9 }, o || {});
    let cx = x, shown = 0;
    for (let i = 0; i < str.length && shown < o.n; i++) {
      const sub = str[i] === "_" && i + 1 < str.length, ch = sub ? str[++i] : str[i], sz = sub ? o.size * SUB : o.size;
      K.text(ctx, ch, cx, y + (sub ? o.size * DROP : 0), { size: sz, weight: 700, font: K.FONT.mono, fill: o.fill, align: "left" });
      cx += K.textW(ctx, ch, sz, 700, K.FONT.mono); shown++;
    }
    return cx - x;
  }
  function tag(ctx, x, y, str, o) {
    const P = K.P;
    o = Object.assign({ a: 1, size: 40, hot: false, seed: 2700 }, o || {});
    const a = o.a <= 0 ? 0 : o.a >= 1 ? 1 : K.E.back(o.a, 2.2); if (a <= 0) return;
    const tw = w(ctx, str, o.size) + 30, h = o.size + 22;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    K.shape(ctx, K.rectPts(-tw / 2, -h / 2, tw, h, 3), { fill: o.hot ? P.profit : P.paper, w: 3.5, boil: 1, seed: o.seed, shade: { color: o.hot ? P.goldDark : P.paperShade, dx: 0, dy: -5 } });
    draw(ctx, str, -tw / 2 + 15, 0, { size: o.size });
    ctx.restore();
  }
  return { w, glyphs, draw, tag };
})();
