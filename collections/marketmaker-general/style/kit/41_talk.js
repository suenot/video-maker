/* ============================================================
   KIT 41 TALK: talking mouths shared by both hosts.
   Narration sync gives a loudness value 0..1 per frame (`talk`).
   K.viseme(t, talk, seed) picks a viseme-ish shape per syllable
   (about 7.5 syllables per second, seeded, deterministic):
     "m" closed, "a" open tall, "o" round, "e" wide with teeth, "u" small round.
   K.talkMouth draws it; the opening scales with loudness.
   ============================================================ */
var MK = window.MK || (window.MK = {});
(function (K) {
  const P = K.P, { clamp, hash } = K;
  const SHAPES = ["a", "o", "e", "a", "u", "e"];
  K.viseme = function (t, talk, seed) {
    if (talk < 0.06) return "m";
    const syl = Math.floor(t * 7.5 + hash(seed | 0, 3));
    return talk < 0.18 ? "u" : SHAPES[Math.floor(hash(syl, seed | 0) * SHAPES.length)];
  };
  /* cx, cy = mouth centre; w = half width at rest (local px); colours: inside, tongue */
  K.talkMouth = function (ctx, cx, cy, w, talk, vis, seed, opt) {
    const o = Object.assign({ inside: "#7a1f3d", tongue: "#ff8fa8", teeth: "#ffffff", line: P.ink, lw: 5 }, opt || {});
    talk = clamp(talk, 0, 1);
    if (vis === "m" || talk < 0.06) { K.line(ctx, [[cx - w * 0.8, cy], [cx, cy + w * 0.12], [cx + w * 0.8, cy]], { stroke: o.line, w: o.lw, boil: 0.4, seed }); return; }
    let mw, mh;
    if (vis === "o") { mw = w * (0.55 + 0.25 * talk); mh = w * (0.6 + 0.6 * talk); }
    else if (vis === "u") { mw = w * (0.38 + 0.15 * talk); mh = w * (0.35 + 0.35 * talk); }
    else if (vis === "e") { mw = w * (1.05 + 0.2 * talk); mh = w * (0.3 + 0.5 * talk); }
    else { mw = w * (0.8 + 0.25 * talk); mh = w * (0.45 + 1.0 * talk); } /* "a" */
    const pts = vis === "o" || vis === "u" ? K.ellipsePts(cx, cy + mh * 0.4, mw, mh * 0.6, 14)
      : [[cx - mw, cy], [cx, cy - mh * 0.08], [cx + mw, cy], [cx + mw * 0.62, cy + mh], [cx, cy + mh * 1.12], [cx - mw * 0.62, cy + mh]];
    K.shape(ctx, pts, { fill: o.inside, stroke: o.line, w: o.lw * 0.9, boil: 0.4, seed });
    ctx.save(); K.pathOf(ctx, pts, true); ctx.clip();
    if (vis === "e" || vis === "a") K.shape(ctx, K.rectPts(cx - mw, cy - 4, mw * 2, Math.max(5, mh * 0.28), 2), { fill: o.teeth, stroke: null, w: 0, boil: 0.2, seed: seed + 1 });
    if (talk > 0.3 && vis !== "u") K.shape(ctx, K.ellipsePts(cx, cy + mh * 0.95, mw * 0.5, mh * 0.3, 10), { fill: o.tongue, stroke: null, w: 0, boil: 0.3, seed: seed + 2 });
    ctx.restore();
  };
})(MK);
