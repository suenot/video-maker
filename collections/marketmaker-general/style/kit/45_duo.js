/* ============================================================
   KIT 45 DUO: Otto (host A, the explainer) + Puff (host B, the co-host)
   placed together and acted from narration data.
   K.duo(ctx, t, opt) draws both hosts (and an optional sand mound "stage")
   in the current coordinate space (usually screen space: K.screen(ctx)).
   opt:
     x, y      Otto's arm-base point (default 400, 1040); s scale (default 0.95 -> Otto ~400 px tall)
     side      +1 = Puff to Otto's right, -1 = Puff to his left (for a duo in the bottom-right)
     talkA, talkB   loudness 0..1 of each voice this frame (mouths + gestures)
     speaker   "A" | "B" | null (default: the louder voice); the other one listens (looks, nods)
     actA, actB     { kind, u } acting on top, u 0..1 envelope (use hold(t, t0, t1)):
                    A kinds: point, surprise, think, grin, nod, shrug, wave, carry
                    B kinds: point, surprise (puffs up), think, grin, nod, shrug, wave, worry
     pointA, pointB [x, y] target in the same space; pointAmtA / pointAmtB 0..1
     propA     fn(ctx, x, y, ang) drawn in Otto's outer arm (carry a card, chart, coin...)
     skinA     Otto colour shift (K.SKIN.*);  stage (default true);  a fade 0..1;  seed
   Returns { A: {x, y, head}, B: {x, y}, tips } so scenes can attach props or leaders.
   ============================================================ */
var MK = window.MK || (window.MK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;
  const act = (o, k) => (o && o.kind === k ? clamp(o.u == null ? 1 : o.u, 0, 1) : 0);

  K.duoStage = function (ctx, x, y, w, seed) {
    const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14, a = Math.PI + u * Math.PI; pts.push([x + Math.cos(a) * w / 2, y + 30 + Math.sin(a) * 70 + 6 * Math.sin(i * 2.1 + seed)]); }
    K.shape(ctx, pts.concat([[x + w / 2, y + 200], [x - w / 2, y + 200]]), { fill: P.sand, w: 5, boil: 0.6, seed: seed + 1, shade: { color: P.sandDark, dx: 0, dy: -26 }, dots: { color: P.sandDark, alpha: 0.5, gap: 20, r: 3, ang: Math.PI / 2, from: 0.4 } });
    K.starfish(ctx, x - w * 0.32, y + 46, 22, { rot: 0.4, seed: seed + 2 });
  };

  K.duo = function (ctx, t, o) {
    o = Object.assign({ x: 400, y: 1040, s: 0.95, side: 1, talkA: 0, talkB: 0, speaker: null, actA: null, actB: null, pointA: null, pointB: null, pointAmtA: 0, pointAmtB: 0, propA: null, skinA: null, stage: true, a: 1, seed: 0 }, o || {});
    if (o.a <= 0) return null;
    const sd = o.side, s = o.s, ox = o.x, oy = o.y;
    const ps = 0.92 * s, px = ox + sd * 380 * s, bob = 9 * Math.sin(t * 2.1 + 0.7), py = oy - 300 * s;
    const tA = clamp(o.talkA, 0, 1), tB = clamp(o.talkB, 0, 1);
    const spk = o.speaker || (tA > tB + 0.04 ? "A" : tB > tA + 0.04 ? "B" : null);
    ctx.save(); ctx.globalAlpha *= clamp(o.a, 0, 1);
    if (o.stage) K.duoStage(ctx, ox + sd * 170 * s, oy + 10, 980 * s, 960 + o.seed);

    /* ---------- Otto (A) ---------- */
    const L = (wx, wy) => ({ x: (wx - ox) / s, y: (wy - oy) / s });
    const outer = sd > 0 ? 1 : 6, inner = sd > 0 ? 6 : 1; /* outer arm = away from Puff */
    const rest = (i) => { const r = K.OCTO_REST[i]; return { x: r[0], y: r[1], bend: (i < 4 ? 1 : -1) * 20, curl: (i < 4 ? -1 : 1) * 2.6 }; };
    const mixA = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), bend: lerp(a.bend || 0, b.bend || 0, u), curl: lerp(a.curl || 0, b.curl || 0, u), card: u > 0.5 ? b.card : null, prop: u > 0.5 ? b.prop : null, wrap: u > 0.5 ? b.wrap : false });
    const arms = [null, null, null, null, null, null, null, null];
    const pA = { blink: K.blinkAt(t, 11 + o.seed), talk: tA, squash: 0.05 * K.pulse(t, 1, 6) + 0.06 * tA, skin: o.skinA || undefined, seed: 700 + o.seed };
    pA.look = spk === "B" ? [sd * 0.9, -0.25] : [0.1 * Math.sin(t * 0.8), -0.1];
    /* talking hands: the outer arm opens and lifts while Otto speaks */
    const ge = clamp(tA * 2.4, 0, 1) * (spk === "A" ? 1 : 0.3);
    if (ge > 0.02) arms[outer] = mixA(rest(outer), { x: -sd * (330 + 30 * Math.sin(t * 1.9)), y: -300 - 90 * (0.5 + 0.5 * Math.sin(t * 2.3)), bend: -sd * 40, curl: sd * 0.8 }, ge);
    /* listening: small nods on the other voice */
    if (spk === "B") pA.lean = 2.5 * Math.sin(t * 6.5) * clamp(tB * 2, 0, 1);
    const u = (k) => act(o.actA, k);
    if (o.pointA && o.pointAmtA > 0) {
      const tg = L(o.pointA[0], o.pointA[1]), useI = tg.x * sd < 0 ? outer : inner, root = [useI === 1 ? -72 : 72, -128];
      let dx = tg.x - root[0], dy = tg.y - root[1]; const d = Math.hypot(dx, dy) || 1, k = Math.min(1, 560 / d);
      arms[useI] = mixA(arms[useI] || rest(useI), { x: root[0] + dx * k, y: root[1] + dy * k, bend: (useI === 1 ? -1 : 1) * 30, curl: (useI === 1 ? 1 : -1) * 0.7 }, clamp(o.pointAmtA, 0, 1));
      pA.look = [clamp(dx / d * 1.2, -1, 1), clamp(dy / d, -1, 1)];
    }
    if (u("surprise")) { const v = u("surprise"); pA.exclaim = v; pA.brow = 1.4 * v; pA.mouth = "o"; pA.hop = 50 * Math.sin(Math.PI * v); pA.squash = -0.2 * Math.sin(Math.PI * v); if (tA < 0.1) pA.talk = 0; }
    if (u("think")) { const v = u("think"); arms[inner] = mixA(arms[inner] || rest(inner), { x: sd * 70, y: -150, bend: sd * 60, curl: -sd * 1.8 }, v); pA.look = [0.4 * sd, -1]; pA.brow = 0.7 * v; if (tA < 0.1) pA.mouth = "flat"; }
    if (u("grin")) { pA.mouth = "grin"; pA.glint = u("grin"); pA.brow = 0.6; }
    if (u("nod")) pA.lean = 5 * Math.sin(t * 9) * u("nod");
    if (u("shrug")) { const v = u("shrug"); [1, 6].forEach((i) => (arms[i] = mixA(arms[i] || rest(i), { x: (i === 1 ? -1 : 1) * 360, y: -360, bend: (i === 1 ? 1 : -1) * 40, curl: (i === 1 ? -1 : 1) * 1.5 }, v))); pA.brow = v; pA.mouth = "flat"; }
    if (u("wave")) arms[outer] = mixA(arms[outer] || rest(outer), { x: -sd * 300, y: -460 + 30 * Math.sin(t * 12), bend: -sd * 30, curl: sd * 1 }, u("wave"));
    if (o.propA || u("carry")) arms[outer] = mixA(arms[outer] || rest(outer), { x: -sd * 330, y: -420, bend: -sd * 40, prop: o.propA, wrap: true }, o.propA ? Math.max(u("carry"), o.actA ? 0 : 1) : u("carry"));
    pA.arms = arms;
    K.octo(ctx, ox, oy, s, pA);
    const tips = K.octoTips;
    if (u("think") > 0.5) { /* Otto's thought bubble */
      const g = K.E.back(K.inv(0.5, 1, u("think")), 2), hx = ox + sd * 20 * s, hy = oy - 560 * s;
      K.dot(ctx, ox + sd * 70 * s, oy - 430 * s, 9 * s, P.cream, P.ink, 4, 970); K.dot(ctx, ox + sd * 45 * s, oy - 475 * s, 13 * s, P.cream, P.ink, 4, 971);
      ctx.save(); ctx.translate(hx, hy); ctx.scale(g * s, g * s);
      K.shape(ctx, K.blobPts(0, 0, 60, 48, 12, 972, 0.12), { fill: P.cream, w: 4.5, boil: 0.6, seed: 972 });
      K.text(ctx, "?", 0, 4, { size: 58, weight: 900, font: K.FONT.display, fill: P.bid });
      ctx.restore();
    }

    /* ---------- Puff (B) ---------- */
    const v = (k) => act(o.actB, k);
    const headA = [ox, oy - 250 * s];
    const pB = { blink: K.blinkAt(t, 23 + o.seed), talk: tB, bob, squash: 0.05 * K.pulse(t, 1, 6) + 0.08 * tB, seed: 900 + o.seed };
    pB.lookAt = spk === "A" ? [(headA[0] - px) / ps, (headA[1] - py - bob) / ps] : [0.1 * Math.sin(t * 0.7) * 60, 20];
    if (spk === "A") pB.lean = 3 * Math.sin(t * 6.5 + 1) * clamp(tA * 2, 0, 1); /* listening nods */
    /* talking fins */
    if (spk === "B") { const f = clamp(tB * 2.4, 0, 1); pB.finR = { x: 150, y: 10 - 60 * f * (0.5 + 0.5 * Math.sin(t * 3.1)) }; pB.finL = { x: -150, y: 30 - 40 * f * (0.5 + 0.5 * Math.sin(t * 2.6 + 1)) }; }
    if (o.pointB && o.pointAmtB > 0) {
      const dx = (o.pointB[0] - px) / ps, dy = (o.pointB[1] - py - bob) / ps, d = Math.hypot(dx, dy) || 1, k = dx < 0 ? "finL" : "finR";
      const base = { x: (k === "finL" ? -1 : 1) * 150, y: 30 };
      pB[k] = { x: lerp(base.x, (k === "finL" ? -100 : 100) + (dx / d) * 120, o.pointAmtB), y: lerp(base.y, 18 + (dy / d) * 120, o.pointAmtB) };
      pB.lookAt = [dx, dy]; pB.lean = (dx > 0 ? 6 : -6) * o.pointAmtB;
    }
    if (v("surprise")) { const w = v("surprise"); pB.puff = w; pB.wide = w; pB.exclaim = w; pB.brow = 1.3 * w; pB.squash = -0.15 * Math.sin(Math.PI * w); pB.finL = { x: -170, y: -60 * w }; pB.finR = { x: 170, y: -60 * w }; }
    if (v("think")) { const w = v("think"); pB.think = w; pB.browTilt = w; pB.look = [0.5, -0.9]; delete pB.lookAt; pB.finR = { x: 40, y: 64 }; if (tB < 0.1) pB.mouth = "flat"; }
    if (v("grin")) pB.mouth = "grin";
    if (v("worry")) { pB.mouth = "worry"; pB.brow = -0.6; }
    if (v("nod")) pB.lean = 7 * Math.sin(t * 9) * v("nod");
    if (v("shrug")) { const w = v("shrug"); pB.finL = { x: -140, y: -80 * w }; pB.finR = { x: 140, y: -80 * w }; pB.brow = w; pB.mouth = "flat"; }
    if (v("wave")) pB[sd > 0 ? "finR" : "finL"] = { x: sd * 130, y: -110 + 30 * Math.sin(t * 12) };
    K.puffer(ctx, px, py, ps, pB);
    ctx.restore();
    return { A: { x: ox, y: oy, head: headA }, B: { x: px, y: py + bob }, tips };
  };
})(MK);
