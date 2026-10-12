/* ============================================================
   KIT 41 TALK: talking mouths for both hosts.
   K.speech(talk, t, seed) turns one loudness value per frame (0..1, from
   the narration sync) into a viseme-ish mouth: { open, wide, round, v }.
   Syllables change about 7 times a second (seeded, deterministic); each
   syllable picks a shape (A open, O round, E wide, M closed) and the
   loudness scales how far it opens. Both rigs read it when pose.talk > 0.06
   (or take pose.viseme = "A" | "O" | "E" | "M" to force a shape).
   K.talkMouth(ctx, x, y, w, sp, seed) draws a generic noir mouth from it.
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;
  const VIS = {
    A: { open: 1.0, wide: 0.8, round: 0 },
    O: { open: 0.8, wide: 0.35, round: 1 },
    E: { open: 0.45, wide: 1.0, round: 0 },
    M: { open: 0.12, wide: 0.6, round: 0 },
  };
  const ORDER = ["A", "E", "O", "A", "M", "E", "A", "O"];
  K.VISEMES = VIS;

  K.speech = function (talk, t, seed, force) {
    talk = clamp(talk || 0, 0, 1);
    if (force && VIS[force]) { const v = VIS[force]; return { open: v.open * Math.max(talk, 0.6), wide: v.wide, round: v.round, v: force }; }
    const rate = 7.1 + 1.3 * K.hash(seed || 1, 5), ph = t * rate + (seed || 0) * 0.37, i = Math.floor(ph), f = ph - i;
    const a = VIS[ORDER[Math.floor(K.hash(i, seed || 3) * ORDER.length)]], b = VIS[ORDER[Math.floor(K.hash(i + 1, seed || 3) * ORDER.length)]];
    const u = K.ss(0.7, 1, f); /* hold the shape, blend into the next one */
    const flutter = 0.55 + 0.45 * Math.sin(Math.PI * f);
    return {
      open: talk * lerp(a.open, b.open, u) * flutter,
      wide: lerp(a.wide, b.wide, u), round: lerp(a.round, b.round, u),
      v: u < 0.5 ? ORDER[Math.floor(K.hash(i, seed || 3) * ORDER.length)] : ORDER[Math.floor(K.hash(i + 1, seed || 3) * ORDER.length)],
    };
  };

  /* generic mouth: (x, y) = centre of the lips, w = full width at wide 1 */
  K.talkMouth = function (ctx, x, y, w, sp, seed) {
    const ww = w * (0.55 + 0.45 * sp.wide) * (1 - 0.35 * sp.round), hh = 3 + w * 0.62 * sp.open;
    if (sp.open < 0.08) { K.line(ctx, [[x - ww / 2, y], [x, y + 2], [x + ww / 2, y]], { stroke: P.ink, w: 4, boil: 0.5, seed, gap: 0 }); return; }
    const pts = sp.round > 0.5
      ? K.ellipsePts(x, y + hh * 0.4, ww * 0.45, hh * 0.6, 12)
      : [[x - ww / 2, y], [x - ww * 0.2, y - 2], [x + ww * 0.2, y - 2], [x + ww / 2, y], [x + ww * 0.3, y + hh * 0.8], [x, y + hh], [x - ww * 0.3, y + hh * 0.8]];
    K.shape(ctx, pts, { fill: P.mouthIn, w: 3.5, boil: 0.6, seed, gap: 0 });
    if (sp.open > 0.4) K.shape(ctx, K.ellipsePts(x, y + hh * 0.72, ww * 0.22, hh * 0.18, 8), { fill: P.tongue, stroke: null, w: 0, boil: 0.3, seed: seed + 1 });
  };
})(CK);
