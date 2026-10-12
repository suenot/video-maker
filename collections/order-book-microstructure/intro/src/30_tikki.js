/* ============================================================
   INTRO 30 TIKKI: where the raccoon is and what it does, as a pure function of t.
   Gestures are small functions with their own anchor times, so each chorus can
   reuse them (shout, clap, pinch, point along the flow, hop over a cart ...).
   The acts are listed in tikki(t) in film order; later acts win.
   ============================================================ */
const RAC = { x: -790, y: YB0, s: 1.2 };
const PIV = [-900, -1700], ROPE = 1600, OMEGA = 1.4, TH0 = -0.82;
const ropeTheta = (t) => {
  const tau = t - T.swing;
  if (t < T.release) return TH0 * Math.cos(OMEGA * tau);
  const thR = TH0 * Math.cos(OMEGA * (T.release - T.swing));
  return K.lerp(thR, -1.15, K.ss(T.release, T.release + 1.0, t)); /* the empty rope is pulled back off screen */
};
const ropeEnd = (th) => [PIV[0] + Math.sin(th) * ROPE, PIV[1] + Math.cos(th) * ROPE];
const HAND_LOCAL = [34, -206]; /* hand target while hanging (arm straight up), raccoon space */
const HAND_UP = [HAND_LOCAL[0] * RAC.s, HAND_LOCAL[1] * RAC.s]; /* the same in world units */

function drawRope(t) {
  if (t < T.swing || t > T.release + 1.0) return;
  const e = ropeEnd(ropeTheta(t)), pts = [];
  for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([K.lerp(PIV[0], e[0], u) + Math.sin(u * Math.PI) * 12 * Math.sin(t * 5), K.lerp(PIV[1], e[1], u)]); }
  K.line(ctx, pts, { stroke: P.ink, w: 9, boil: 1, seed: 600 });
  K.line(ctx, pts, { stroke: P.saffronDark, w: 4, boil: 1, seed: 601 });
}

/* abacus rows: best-level sizes, then the queue count, later the imbalance */
function beadsAt(t) {
  const flick = (t0) => K.ss(t0, t0 + 0.12, t);
  if (t < T.depth) return [0.2 + 0.2 * flick(T.beads), 0.6 - 0.2 * flick(T.beads + BEAT / 2), 0.4 + 0.4 * flick(T.beads + BEAT), 0.8];
  if (t < T.prio) { const left = CRATES.bid[0].filter((q) => q.kind === "fill" && t >= q.remove + 0.2).length; return [(STAR.k + 1 - left) / 5, 0.4, 0.8, 0.2]; }
  const k = Math.max(0, Math.floor((t - T.prio) / (BEAT / 2)));
  if (t < T.cart2[0]) return [Math.min(5, k) / 5, Math.min(7, k) > 5 ? (k - 5) / 5 : 0, 0.6, 0.2];
  if (t < T.candles[0]) return [1, 0.4, 0.4 + 0.2 * Math.sin(t * 3) * 0, 0.6];
  const j = Math.floor((t - T.candles[0]) / BEAT) % 6;
  return [j / 5, (5 - j) / 5, 0.6, 0.4];
}

/* ---------- gestures (each edits the pose st in place; t0.. anchors) ---------- */
function gInhale(st, t, tH) {
  const inh = K.ss(tH - 0.42, tH - 0.05, t) * (1 - K.ss(tH - 0.05, tH + 0.02, t));
  if (inh > 0) { st.squash = -0.22 * inh; st.handL = { x: -100, y: -100 - 20 * inh, pose: "fist" }; st.handR = { x: 100, y: -110 - 30 * inh, pose: "open" }; st.mouth = "o"; st.brow = 0.4 * inh; st.ear = 0.8 * inh; st.look = [0.4, -0.4]; }
}
function gShout(st, t, tH, tEnd) {
  const hey = K.inv(tH - 0.03, tH + 0.08, t) * (1 - K.ss(tEnd - 0.25, tEnd - 0.05, t));
  if (hey <= 0) return;
  const hh = Math.sin(K.inv(tH, tH + 0.4, t) * Math.PI);
  st.mouth = "shout"; st.brow = 1.3; st.hop = 26 * hh; st.squash = 0.18 * (1 - hey) - 0.2 * hh; st.ear = 1; st.blink = 0;
  st.handL = { x: -120, y: -250, pose: "fist" }; st.handR = { x: 130, y: -260, pose: "open" }; st.look = [0.8, -0.3];
  st.tassel = 30 * Math.sin((t - tH) * 14) * Math.exp(-3 * (t - tH));
}
function gClap(st, t, tC, tS, tEnd) {
  const cl = K.ss(tC - 0.2, tS - 0.02, t) * (1 - K.ss(tEnd - 0.15, tEnd + 0.05, t));
  if (cl <= 0) return;
  const meet = K.ss(tS - 0.15, tS - 0.02, t);
  st.handL = { x: K.lerp(-130, -14, meet), y: K.lerp(-230, -118, meet), pose: "open", rot: K.lerp(-60, 0, meet) };
  st.handR = { x: K.lerp(130, 14, meet), y: K.lerp(-230, -118, meet), pose: "open", rot: K.lerp(240, 180, meet) };
  st.hold = null; st.mouth = meet > 0.5 ? "grin" : "open"; st.blink = meet > 0.9 && t < tS + 0.15 ? 1 : 0;
  st.squash = t > tS ? 0.2 * Math.exp(-6 * (t - tS)) : 0;
  st.headTilt = 6 * Math.sin((t - tC) * 8) * Math.exp(-2 * Math.max(0, t - tS));
}
function gPinch(st, t, t0, t1) {
  const ti = K.ss(t0 - 0.15, t0 + 0.05, t) * (1 - K.ss(t1 - 0.25, t1, t));
  if (ti <= 0) return;
  st.handR = { x: K.lerp(84, 96, ti), y: K.lerp(-84, -232, ti), pose: "pinch", rot: -100 };
  st.mouth = "smirk"; st.brow = -0.5 * ti; st.look = [0.9, -0.5]; st.lean = -4 * ti; st.blink = Math.max(st.blink, t > t0 + 0.5 && t < t0 + 0.7 ? 0.7 : 0);
}
function gPointFlow(st, t, t0, t1, b) {
  const fl = K.ss(t0 - 0.1, t0 + 0.2, t) * (1 - K.ss(t1 - 0.2, t1, t));
  if (fl <= 0) return;
  const sw = K.inv(t0, t1 - 0.2, t);
  st.handR = { x: 140, y: K.lerp(-220, -120, sw) + 10 * b, pose: "point", rot: K.lerp(-40, 10, sw) };
  st.look = [K.lerp(-0.4, 1, sw), 0.1]; st.mouth = "grin"; st.lean = 3;
}
/* a cart zooms past along the alley floor: crouch, hop over it, land */
function gHop(st, t, tc, dirRight) {
  if (t < tc - 0.2 || t > tc + 0.9) return;
  const crouch = K.ss(tc - 0.2, tc - 0.04, t) * (1 - K.ss(tc - 0.04, tc, t));
  const j = K.inv(tc, tc + 0.44, t), hh = Math.sin(j * Math.PI);
  st.squash = 0.3 * crouch - 0.3 * hh * (j < 1 ? 1 : 0); st.hop = 110 * hh;
  st.mouth = "o"; st.brow = 1.2; st.blink = 0; st.handL = { x: -120, y: -170 - 40 * hh, pose: "fist" }; st.handR = { x: 120, y: -200 - 40 * hh, pose: "open" };
  st.look = [dirRight ? 1 : -1, 0.6]; st.tassel = 40 * hh;
  const ld = K.inv(tc + 0.44, tc + 0.7, t); if (ld > 0 && ld < 1) st.squash += 0.3 * Math.sin(ld * Math.PI);
}
function gNodTicks(st, t, t0, t1) {
  if (t < t0 - 0.1 || t > t1) return;
  const u = K.inv(t0, t0 + 0.7, t); st.look = [0.9, K.lerp(0.8, -1, u)]; st.headTilt = 4 * Math.sin(t * 26); st.mouth = "o";
}
/* bouncy dance on the beat: hops, alternating arms, legs kicking */
function gDance(st, t, t0, t1, amp) {
  const w = K.ss(t0 - 0.1, t0 + 0.1, t) * (1 - K.ss(t1 - 0.2, t1, t));
  if (w <= 0) return;
  const b = pulseB(t), ph = Math.floor((t - t0) / BEAT) % 2 ? 1 : -1, sw = Math.sin(((t - t0) / BEAT) * Math.PI);
  st.hop = (amp || 34) * b * w; st.squash = 0.16 * (1 - b) * w - 0.08 * b;
  st.handL = { x: -110 - 20 * sw, y: -170 - 70 * Math.max(0, ph) * b, pose: "open" };
  st.handR = { x: 120 + 20 * sw, y: -170 - 70 * Math.max(0, -ph) * b, pose: "open" };
  st.legWalk = (t - t0) * 9; st.lean = 7 * sw * w; st.tassel = -22 * sw; st.tail = sw; st.mouth = "grin"; st.look = [sw * 0.6, -0.3];
}
/* point at something (world point) with the right paw */
function gPointAt(st, t, t0, t1, wx, wy, look) {
  const w = K.ss(t0 - 0.1, t0 + 0.2, t) * (1 - K.ss(t1 - 0.2, t1, t));
  if (w <= 0) return;
  const lx = (wx - RAC.x) / RAC.s, ly = (wy - RAC.y) / RAC.s, a = Math.atan2(ly + 134, lx - 48), r = 76;
  st.handR = { x: K.lerp(st.handR.x, 48 + Math.cos(a) * r, w), y: K.lerp(st.handR.y, -134 + Math.sin(a) * r, w), pose: "point", rot: (a * 180) / Math.PI };
  st.look = look || [Math.cos(a), Math.sin(a)]; st.lean = 3 * w;
}

/* returns { mode: "hang" | "stand", ... , st } */
function tikki(t) {
  const st = { seed: 700, blink: K.blinkAt(t, 5), mouth: "smile", look: [0.3, 0], hold: "abacus", beads: beadsAt(t) };
  const b = pulseB(t);
  st.squash = 0.07 * b - 0.02;
  st.handL = { x: -92, y: -96 + 6 * b, pose: "fist" };
  st.handR = { x: 84, y: -84 - 8 * b, pose: "open" };
  /* --- swinging in --- */
  if (t < T.release) {
    const th = ropeTheta(t), vel = -TH0 * OMEGA * Math.sin(OMEGA * (t - T.swing));
    Object.assign(st, { handR: { x: HAND_LOCAL[0], y: HAND_LOCAL[1], pose: "fist" }, handL: { x: -110, y: -150 + 20 * Math.sin(t * 9), pose: "fist" }, mouth: "grin", look: [1, -0.2], legWalk: t * 16, tassel: -vel * 40, tail: Math.sin(t * 8) * 0.9, squash: -0.12, blink: 0, ear: 0.6 });
    return { mode: "hang", hand: ropeEnd(th), rot: th * 0.9, st };
  }
  /* --- flight from the rope to the balcony --- */
  if (t < T.land) {
    const u = K.inv(T.release, T.land, t), e = ropeEnd(ropeTheta(T.release));
    const th = TH0 * Math.cos(OMEGA * (T.release - T.swing)), c = Math.cos(th * 0.9), s = Math.sin(th * 0.9);
    const fx = e[0] - (HAND_UP[0] * c - HAND_UP[1] * s), fy = e[1] - (HAND_UP[0] * s + HAND_UP[1] * c);
    const x = K.lerp(fx, RAC.x, u), y = K.lerp(fy, RAC.y, u) - 90 * Math.sin(u * Math.PI);
    Object.assign(st, { handR: { x: 96, y: -230, pose: "open" }, handL: { x: -110, y: -200, pose: "fist" }, mouth: "open", squash: -0.25 * (1 - u), tassel: 30 * (1 - u), look: [0, 0.6], blink: 0, ear: 1 });
    return { mode: "stand", x, y, s: RAC.s, lean: th * 50 * (1 - u), st };
  }
  /* --- intro, on the balcony --- */
  const land = K.inv(T.land, T.land + 0.35, t);
  if (land < 1) { st.squash += 0.42 * Math.sin(land * Math.PI) * (1 - land * 0.5); st.tassel = -24 * Math.sin(land * Math.PI * 2) * (1 - land); }
  const f = K.ss(T.fez - 0.2, T.fez, t) * (1 - K.ss(T.fez + 0.35, T.fez + 0.6, t));
  if (f > 0) { st.handR = { x: K.lerp(84, 44, f), y: K.lerp(-84, -268, f), pose: "pinch" }; st.fezTip = -18 * f; st.fezLift = 12 * f; st.mouth = "smirk"; st.brow = -0.4 * f; }
  if (t > T.beads - 0.15 && t < T.inhale) {
    const k = Math.max(0, Math.floor((t - T.beads + 0.15) / (BEAT / 2))), ph = ((t - T.beads + 0.15) % (BEAT / 2)) / (BEAT / 2);
    st.handR = { x: -40 + 30 * Math.sin(ph * Math.PI) + k * 6, y: -110 - 30 * Math.sin(ph * Math.PI), pose: "point" };
    st.look = [-0.6, 0.5];
  }
  /* --- chorus 1 --- */
  gInhale(st, t, T.hey);
  gShout(st, t, T.hey, T.clap);
  gClap(st, t, T.clap, T.slam, T.tight);
  gPinch(st, t, T.tight, T.depth);
  gPointFlow(st, t, T.depth, T.cart[0], b);
  gHop(st, t, T.cart[0] + 0.06, true);
  if (t > T.take[0] - 0.1 && t < T.shout) { st.exclaim = K.inv(T.take[0] - 0.1, T.take[0] + 0.1, t); st.eyeUp = 14; st.look = [1, -0.2]; st.blink = 0; }
  const sh = K.ss(T.shout - 0.05, T.shout + 0.08, t) * (1 - K.ss(T.ticks + 0.2, T.ticks + 0.5, t));
  if (sh > 0) { st.mouth = "shout"; st.brow = 1.2; st.blink = 0; st.handR = { x: 150, y: -270, pose: "point", rot: -70 }; st.handL = { x: -110, y: -120, pose: "fist" }; st.squash = -0.12 * sh + 0.1 * b; st.tassel = 22 * Math.sin((t - T.shout) * 12); st.look = [0.8, -0.4]; }
  gNodTicks(st, t, T.ticks, T.queueCam);
  if (t > T.queueCam && t < T.tease[0]) {
    const near = T.fills.reduce((m, tf) => Math.max(m, Math.exp(-10 * Math.abs(t - tf))), 0);
    st.handR = { x: -30 + 20 * near, y: -112 - 26 * near, pose: "point" }; st.look = [0.8, 0.6]; st.mouth = "smile";
    if (t > T.fills[2] + 0.2) { st.mouth = "grin"; st.handR = { x: 120, y: -240, pose: "fist", rot: -90 }; st.brow = 0.8; st.look = [0.7, 0.2]; st.hop = 14 * b; }
  }
  gDance(st, t, T.tease[0], T.tease[3], 26);
  /* --- verse --- */
  /* "Bids on the left": points left at the green hills; "asks up high": up-right at the red ones */
  gPointAt(st, t, T.hills[0], T.hills[1], -2200, 500, [-1, 0.2]);
  if (t > T.hills[0] && t < T.hills[1]) st.handL = { x: -150, y: -150, pose: "open" };
  gPointAt(st, t, T.hills[1], T.sky[0] - 0.3, 1800, -900, [1, -1]);
  /* "Stacked like a tower reaching to the sky": looks up, flinches on each landing, cheers at the flag */
  if (t > T.sky[0] - 0.4 && t < T.prio) {
    st.look = [0.7, -1]; st.mouth = "o"; st.brow = 0.8;
    const thump = [T.sky[0], T.sky[1]].reduce((m, tl) => Math.max(m, t > tl ? Math.exp(-7 * (t - tl)) : 0), 0);
    st.squash += 0.25 * thump; st.ear = thump; st.blink = thump > 0.6 ? 1 : 0;
    if (t > T.sky[2]) { st.mouth = "grin"; st.handR = { x: 130, y: -280, pose: "open" }; st.handL = { x: -130, y: -270, pose: "fist" }; st.hop = 20 * b; }
  }
  /* "Limit orders wait in a price-time queue": counts the crates on the beats with the abacus */
  if (t > T.prio - 0.1 && t < T.cart2[0]) {
    const ph = ((t - T.prio) % (BEAT / 2)) / (BEAT / 2);
    st.handR = { x: -40 + 30 * Math.sin(ph * Math.PI), y: -110 - 30 * Math.sin(ph * Math.PI), pose: "point" }; st.look = [0.9, -0.6]; st.mouth = "smile";
    if (t > T.newbie && t < T.newbie + 0.9) { st.exclaim = K.inv(T.newbie, T.newbie + 0.15, t); st.look = [1, -0.7]; st.mouth = "o"; }
  }
  /* "Market orders come and they cross right through!": the sell cart, hop, our fill pays a coin */
  const cross = (() => { for (let x = 0; x < 200; x++) { const tt = T.cart2[0] + x * 0.01; if (cart2X(tt) < RAC.x + 120) return tt; } return T.cart2[1]; })();
  if (t > T.cart2[0] && t < cross - 0.2) { st.look = [1, 0.5]; st.mouth = "o"; st.brow = 0.8; }
  if (t > T.take2[0] - 0.05 && t < T.coin) { st.exclaim = K.inv(T.take2[0] - 0.05, T.take2[0] + 0.1, t); st.look = [1, 0.3]; st.eyeUp = 12; st.blink = 0; }
  gHop(st, t, cross - 0.1, false);
  if (t > T.coin && t < T.dusk[1] + 0.2) { const c = K.ss(T.coin - 0.05, T.coin + 0.1, t); st.handR = { x: 110, y: -250 - 10 * b, pose: "fist" }; st.mouth = "grin"; st.brow = 0.9; st.look = [0.7, -0.8]; st.hop = Math.max(st.hop || 0, 16 * b * c); }
  /* --- chorus 2 (dusk) --- */
  gInhale(st, t, T.hey2);
  gShout(st, t, T.hey2, T.hey2 + 3 * BEAT);
  /* "tight": grabs the lantern rope at the alley mouth and pulls it taut */
  const rp = K.ss(T.rope - 0.6, T.rope - 0.3, t) * (1 - K.ss(T.flow2 - 0.3, T.flow2, t));
  if (rp > 0) {
    const pull = K.ss(T.rope - 0.2, T.rope + 0.05, t);
    st.handR = { x: K.lerp(190, 150, pull), y: -150 + 6 * pull, pose: "fist" }; st.handL = { x: K.lerp(140, 100, pull), y: -150, pose: "fist" }; st.hold = null;
    st.lean = -10 * pull; st.mouth = pull > 0.5 ? "grin" : "o"; st.brow = -0.3; st.look = [1, 0];
  }
  gPointFlow(st, t, T.flow2, T.tickChart[0], b);
  gPointAt(st, t, T.tickChart[0], T.fireworks, 380, -380, [1, -0.6]);
  gDance(st, t, T.fireworks, T.dance[0], 46);
  /* --- break (night) --- */
  gDance(st, t, T.dance[0], T.dance[1], 40);
  if (t > T.ofi[0] - 0.1 && t < T.ofi[1]) { st.handR = { x: 70, y: -236, pose: "pinch", rot: -110 }; st.look = [0.8, -0.6]; st.brow = -0.3; st.mouth = "smirk"; st.headTilt = 3 * Math.sin(t * 2); }
  gPointAt(st, t, T.ofi[0] + 4 * BEAT, T.ofi[1], -400, -360, [1, -0.6]);
  if (t > T.ofi[0] + 4 * BEAT && t < T.ofi[1]) st.mouth = "grin";
  gPointAt(st, t, T.candles[0], T.candles[1], -300 + 80 * Math.floor(K.clamp((t - T.candles[0]) / BEAT, 0, 7)), -400, [1, -0.5]);
  if (t > T.code[0] - 0.1 && t < T.code[1] - 0.3) { st.look = [1, -0.5]; st.handR = { x: 66, y: -232, pose: "pinch", rot: -110 }; st.mouth = "o"; if (t > T.code[0] + 6 * BEAT) { st.handR = { x: 130, y: -250, pose: "fist", rot: -90 }; st.mouth = "grin"; } }
  /* --- final chorus (dawn) --- */
  gInhale(st, t, T.hey3);
  gShout(st, t, T.hey3, T.hey3 + 2 * BEAT - 0.05);
  gClap(st, t, T.hey3 + 2 * BEAT - 0.2, T.hey3 + 2 * BEAT + 0.15, T.hey3 + 4 * BEAT);
  gPinch(st, t, T.hey3 + 4 * BEAT, T.flow3);
  gPointFlow(st, t, T.flow3, T.ticks3 - 0.1, b);
  gNodTicks(st, t, T.ticks3, T.drop[1]);
  return { mode: "stand", x: RAC.x, y: RAC.y, s: RAC.s, lean: st.lean || 0, st };
}

/* world position of Tikki's right paw (approximate: target, hop and scale) */
function tikkiPaw(t) {
  const r = tikki(t), h = r.st.handR;
  return [RAC.x + h.x * RAC.s, RAC.y + (h.y - (r.st.hop || 0)) * RAC.s];
}

function drawTikki(t) {
  if (t < T.swing) return;
  const r = tikki(t);
  if (r.mode === "hang") {
    ctx.save(); ctx.translate(r.hand[0], r.hand[1]); ctx.rotate(r.rot);
    K.raccoon(ctx, -HAND_UP[0], -HAND_UP[1], RAC.s, r.st);
    ctx.restore();
  } else {
    r.st.lean = r.lean;
    K.raccoon(ctx, r.x, r.y, r.s, r.st);
  }
}
