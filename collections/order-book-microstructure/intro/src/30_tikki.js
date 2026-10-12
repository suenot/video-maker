/* ============================================================
   INTRO 30 TIKKI: where the raccoon is and what it does, as a pure function of t.
   3.23 - 4.45  swings in from the left on a rope (pendulum, legs running in the air)
   4.45 - 4.83  lets go, lands on the balcony on the downbeat (squash)
   then: fez tip, abacus flicks, a big breath, "Hey!", the clap that slams the
   book together, the "tight" pinch, pointing with the flow, a hop over the cart,
   the imbalance shout, counting the queue on the abacus.
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

/* abacus rows: show the best-level sizes, then count the queue */
function beadsAt(t) {
  const flick = (t0) => K.ss(t0, t0 + 0.12, t);
  if (t < T.depth) return [0.2 + 0.2 * flick(T.beads), 0.6 - 0.2 * flick(T.beads + BEAT / 2), 0.4 + 0.4 * flick(T.beads + BEAT), 0.8];
  const left = CRATES.bid[0].filter((q) => q.remove != null && t >= q.remove + 0.2).length;
  return [(STAR.k + 1 - left) / 5, 0.4, 0.8, 0.2];
}

/* returns { mode: "hang" | "stand", x, y, s, rot, pose } */
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
    const u = K.inv(T.release, T.land, t), e = ropeEnd(ropeTheta(T.release) + 0.0001);
    const th = TH0 * Math.cos(OMEGA * (T.release - T.swing));
    const c = Math.cos(th * 0.9), s = Math.sin(th * 0.9);
    const fx = e[0] - (HAND_UP[0] * c - HAND_UP[1] * s), fy = e[1] - (HAND_UP[0] * s + HAND_UP[1] * c);
    const x = K.lerp(fx, RAC.x, u), y = K.lerp(fy, RAC.y, u) - 90 * Math.sin(u * Math.PI);
    Object.assign(st, { handR: { x: 96, y: -230, pose: "open" }, handL: { x: -110, y: -200, pose: "fist" }, mouth: "open", squash: -0.25 * (1 - u), tassel: 30 * (1 - u), look: [0, 0.6], blink: 0, ear: 1 });
    return { mode: "stand", x, y, s: RAC.s, lean: th * 50 * (1 - u), st };
  }
  /* --- on the balcony --- */
  const land = K.inv(T.land, T.land + 0.35, t);
  if (land < 1) { st.squash += 0.42 * Math.sin(land * Math.PI) * (1 - land * 0.5); st.tassel = -24 * Math.sin(land * Math.PI * 2) * (1 - land); }
  /* fez tip */
  const f = K.ss(T.fez - 0.2, T.fez, t) * (1 - K.ss(T.fez + 0.35, T.fez + 0.6, t));
  if (f > 0) { st.handR = { x: K.lerp(84, 44, f), y: K.lerp(-84, -268, f), pose: "pinch" }; st.fezTip = -18 * f; st.fezLift = 12 * f; st.mouth = "smirk"; st.brow = -0.4 * f; }
  /* abacus flicks on the beat */
  if (t > T.beads - 0.15 && t < T.inhale) {
    const k = Math.max(0, Math.floor((t - T.beads + 0.15) / (BEAT / 2))), ph = ((t - T.beads + 0.15) % (BEAT / 2)) / (BEAT / 2);
    st.handR = { x: -40 + 30 * Math.sin(ph * Math.PI) + k * 6, y: -110 - 30 * Math.sin(ph * Math.PI), pose: "point" };
    st.look = [-0.6, 0.5];
  }
  /* anticipation: a big breath before "Hey!" */
  const inh = K.ss(T.inhale, T.hey - 0.05, t) * (1 - K.ss(T.hey - 0.05, T.hey + 0.02, t));
  if (inh > 0) { st.squash = -0.22 * inh; st.handL = { x: -100, y: -100 - 20 * inh, pose: "fist" }; st.handR = { x: 100, y: -110 - 30 * inh, pose: "open" }; st.mouth = "o"; st.brow = 0.4 * inh; st.ear = 0.8 * inh; st.look = [0.4, -0.4]; }
  /* "Hey!": shout, arms up, a little hop */
  const hey = K.inv(T.hey - 0.03, T.hey + 0.08, t) * (1 - K.ss(T.clap - 0.25, T.clap - 0.05, t));
  if (hey > 0) {
    const hh = Math.sin(K.inv(T.hey, T.hey + 0.4, t) * Math.PI);
    st.mouth = "shout"; st.brow = 1.3; st.hop = 26 * hh; st.squash = 0.18 * (1 - hey) - 0.2 * hh; st.ear = 1; st.blink = 0;
    st.handL = { x: -120, y: -250, pose: "fist" }; st.handR = { x: 130, y: -260, pose: "open" }; st.look = [0.8, -0.3];
    st.tassel = 30 * Math.sin((t - T.hey) * 14) * Math.exp(-3 * (t - T.hey));
  }
  /* the clap: hands meet in front, the book slams shut on "spread" */
  const cl = K.ss(T.clap - 0.2, T.slam - 0.02, t) * (1 - K.ss(T.tight - 0.15, T.tight + 0.05, t));
  if (cl > 0) {
    const meet = K.ss(T.slam - 0.15, T.slam - 0.02, t);
    st.handL = { x: K.lerp(-130, -14, meet), y: K.lerp(-230, -118, meet), pose: "open", rot: K.lerp(-60, 0, meet) };
    st.handR = { x: K.lerp(130, 14, meet), y: K.lerp(-230, -118, meet), pose: "open", rot: K.lerp(240, 180, meet) };
    st.hold = null; st.mouth = meet > 0.5 ? "grin" : "open"; st.blink = meet > 0.9 && t < T.slam + 0.15 ? 1 : 0; st.squash = 0.2 * Math.exp(-6 * Math.max(0, t - T.slam)) * (t > T.slam ? 1 : 0);
    st.headTilt = 6 * Math.sin((t - T.clap) * 8) * Math.exp(-2 * Math.max(0, t - T.slam));
  }
  /* "tight": pinch gesture by the face, sly grin */
  const ti = K.ss(T.tight - 0.15, T.tight + 0.05, t) * (1 - K.ss(T.depth - 0.25, T.depth, t));
  if (ti > 0) {
    st.handR = { x: K.lerp(84, 96, ti), y: K.lerp(-84, -232, ti), pose: "pinch", rot: -100 };
    st.mouth = "smirk"; st.brow = -0.5 * ti; st.look = [0.9, -0.5]; st.lean = -4 * ti; st.blink = Math.max(st.blink, t > T.tight + 0.5 && t < T.tight + 0.7 ? 0.7 : 0);
  }
  /* "Depth and flow from left to right": points along the flow */
  const fl = K.ss(T.depth - 0.1, T.depth + 0.2, t) * (1 - K.ss(T.cart[0] - 0.2, T.cart[0], t));
  if (fl > 0) {
    const sw = K.inv(T.depth, T.cart[0] - 0.2, t);
    st.handR = { x: 140, y: K.lerp(-220, -120, sw) + 10 * b, pose: "point", rot: K.lerp(-40, 10, sw) };
    st.look = [K.lerp(-0.4, 1, sw), 0.1]; st.mouth = "grin"; st.lean = 3;
  }
  /* the cart zooms past: hop over it, then the imbalance shout */
  const cx = cartX(t), dist = Math.abs(cx - RAC.x);
  if (t > T.cart[0] - 0.12 && t < T.shout) {
    const crouch = K.ss(T.cart[0] - 0.12, T.cart[0] + 0.04, t) * (1 - K.ss(T.cart[0] + 0.04, T.cart[0] + 0.08, t));
    const j = K.inv(T.cart[0] + 0.06, T.cart[0] + 0.5, t), hh = Math.sin(j * Math.PI);
    st.squash = 0.3 * crouch - 0.3 * hh * (j < 1 ? 1 : 0); st.hop = 110 * hh;
    st.mouth = "o"; st.brow = 1.2; st.blink = 0; st.handL = { x: -120, y: -170 - 40 * hh, pose: "fist" }; st.handR = { x: 120, y: -200 - 40 * hh, pose: "open" };
    st.look = [cx > RAC.x ? 1 : -1, 0.8 * (1 - K.clamp(dist / 600, 0, 1))]; st.tassel = 40 * hh;
    const ld = K.inv(T.cart[0] + 0.5, T.cart[0] + 0.75, t); if (ld > 0 && ld < 1) st.squash += 0.3 * Math.sin(ld * Math.PI);
    if (t > T.take[0] - 0.1) { st.exclaim = K.inv(T.take[0] - 0.1, T.take[0] + 0.1, t); st.eyeUp = 14; st.look = [1, -0.2]; }
  }
  const sh = K.ss(T.shout - 0.05, T.shout + 0.08, t) * (1 - K.ss(T.ticks + 0.2, T.ticks + 0.5, t));
  if (sh > 0) {
    st.mouth = "shout"; st.brow = 1.2; st.blink = 0; st.handR = { x: 150, y: -270, pose: "point", rot: -70 }; st.handL = { x: -110, y: -120, pose: "fist" };
    st.squash = -0.12 * sh + 0.1 * pulseB(t); st.tassel = 22 * Math.sin((t - T.shout) * 12); st.look = [0.8, -0.4];
  }
  /* "Every tick": nods to each tick, eyes follow the plaques upward */
  if (t > T.ticks - 0.1 && t < T.queueCam) { const u = K.inv(T.ticks, T.ticks + 0.7, t); st.look = [0.9, K.lerp(0.8, -1, u)]; st.headTilt = 4 * Math.sin(t * 26); st.mouth = "o"; }
  /* "every queue": counts the queue on the abacus, beams when ours is first */
  if (t > T.queueCam) {
    const near = T.fills.reduce((m, tf) => Math.max(m, Math.exp(-10 * Math.abs(t - tf))), 0);
    st.handR = { x: -30 + 20 * near, y: -112 - 26 * near, pose: "point" }; st.look = [0.8, 0.6]; st.mouth = "smile";
    if (t > T.fills[2] + 0.2) { st.mouth = "grin"; st.handR = { x: 120, y: -240, pose: "fist", rot: -90 }; st.brow = 0.8; st.look = [0.7, 0.2]; st.hop = 14 * pulseB(t); }
  }
  return { mode: "stand", x: RAC.x, y: RAC.y, s: RAC.s, lean: st.lean || 0, st };
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
