/* ============================================================
   INTRO 20 SIDE SET: horizon, big ship, the crab close up.
   Used twice: opening (0 - 4.6 s) and the title card (15 - 20 s).
   ============================================================ */
const pulseB = (t) => K.pulse(t, 1, 6);          /* every beat */
const pulseA = (t) => K.pulse(t, 4, 5);          /* every accent (bar) */

/* crab pose for the opening */
function crabOpening(t) {
  const st = { seed: 500, blink: K.blinkAt(t, 3), mouth: "smile", look: [0.2, 0] };
  const bounce = pulseB(t);
  st.squash = 0.1 * bounce - 0.04;
  /* left claw on the helm wheel (local: wheel is 55 px behind the crab), right claw waves to the beat */
  st.clawL = { x: -72, y: -42 + 4 * Math.sin(t * 3), open: 0.15 };
  st.clawR = { x: 92, y: -70 - 18 * bounce, open: 0.3 + 0.4 * bounce };
  st.look = [Math.sin(t * 1.3) * 0.8, -0.1];
  /* anticipation then spyglass up */
  const up = K.ss(T.spyUp - 0.25, T.spyUp + 0.2, t);
  if (t > T.spyUp - 0.6) st.squash += 0.22 * K.ss(T.spyUp - 0.6, T.spyUp - 0.25, t) * (1 - up);
  if (up > 0) {
    st.hold = "spyglass";
    st.clawR = { x: K.lerp(92, 38, up), y: K.lerp(-70, -150, up), open: 0.05, rot: K.lerp(-30, -14, up) };
    st.look = [1, -0.6];
    st.lean = -4 * up;
  }
  /* discovery: eyes pop, mouth open, a little hop */
  const pop = K.ss(T.spot - 0.08, T.spot + 0.06, t) * (1 - K.ss(T.spot + 0.5, T.spot + 0.9, t));
  if (t > T.spot - 0.1) {
    st.blink = 0; st.exclaim = K.inv(T.spot - 0.05, T.spot + 0.2, t) * (1 - K.inv(T.spot + 0.9, T.spot + 1.1, t)); st.eyeUp = 20 * pop; st.brow = 1.5 * pop; st.mouth = pop > 0.3 ? "open" : "o";
    st.hop = 18 * Math.max(0, Math.sin(K.inv(T.spot, T.spot + 0.35, t) * Math.PI));
    st.squash -= 0.25 * pop;
  }
  return st;
}

/* crab pose for the title card */
function crabTitle(t) {
  const st = { seed: 500, blink: K.blinkAt(t, 9), mouth: "grin", look: [0.3, -0.5], squash: 0.08 * pulseB(t) - 0.03 };
  st.clawL = { x: -96, y: -50 - 10 * pulseB(t), open: 0.25 };
  st.clawR = { x: 96, y: -50 - 10 * pulseB(t + 0.25), open: 0.25 };
  /* jump: crouch, stretch up, land squash */
  const j0 = T.jump - 0.3, j1 = T.jump + 0.55;
  if (t > j0 && t < j1 + 0.4) {
    const crouch = K.ss(j0, T.jump, t) * (1 - K.ss(T.jump, T.jump + 0.05, t));
    const air = K.inv(T.jump, j1, t), h = Math.sin(air * Math.PI);
    st.squash += 0.35 * crouch - 0.35 * h * (air < 1 ? 1 : 0);
    st.hop = 85 * h;
    const land = K.inv(j1, j1 + 0.35, t);
    if (land > 0 && land < 1) st.squash += 0.4 * Math.sin(land * Math.PI) * (1 - land);
    st.clawL = { x: -100, y: -130 - 60 * h, open: 0.8 }; st.clawR = { x: 100, y: -130 - 60 * h, open: 0.8 };
    st.mouth = "open"; st.look = [0, -1];
  }
  /* claw snap flourish on two beats: right claw high, snapping */
  const s0 = T.snap[0] - 0.3, s1 = T.hatTip - 0.2;
  if (t > s0 && t < s1) {
    const r = K.ss(s0, T.snap[0], t) * (1 - K.ss(s1 - 0.3, s1, t));
    const snapOpen = Math.min(K.inv(T.snap[0] - 0.2, T.snap[0], t) - K.inv(T.snap[0], T.snap[0] + 0.06, t) + K.inv(T.snap[1] - 0.2, T.snap[1], t) - K.inv(T.snap[1], T.snap[1] + 0.06, t), 1);
    st.clawR = { x: K.lerp(96, 104, r), y: K.lerp(-50, -196, r), open: 0.1 + 0.85 * snapOpen, rot: K.lerp(0, -70, r) };
    st.look = [0.9, -0.8]; st.lean = -5 * r;
  }
  /* hat tip with the left claw */
  const h0 = T.hatTip - 0.2, h1 = T.hatTip + 0.8;
  if (t > h0 && t < h1) {
    const r = K.ss(h0, T.hatTip, t) * (1 - K.ss(h1 - 0.3, h1, t));
    st.clawL = { x: K.lerp(-96, -66, r), y: K.lerp(-50, -146, r), open: 0.35, rot: K.lerp(180, -30, r) };
    st.hatLift = 16 * r; st.hatTip = -16 * r; st.blink = Math.max(st.blink, r > 0.6 ? 1 : 0); st.mouth = "grin";
  }
  /* wave goodbye at the end */
  if (t > T.hatTip + 0.9) {
    const r = K.ss(T.hatTip + 0.9, T.hatTip + 1.2, t);
    st.clawR = { x: 110 + 16 * Math.sin((t - T.hatTip) * 9) * r, y: K.lerp(-50, -170, r), open: 0.5, rot: -80 + 20 * Math.sin((t - T.hatTip) * 9) * r };
  }
  return st;
}

/* t: time; warm 0..1 (golden light for the title); opts: ship placement + push-in */
function drawSide(t, o) {
  const horizon = o.horizon;
  K.screen(ctx);
  ctx.save();
  /* gentle push-in: scale around a focus point (sky moves at half rate = depth) */
  const z = o.zoom || 1, fx = o.fx || 960, fy = o.fy || 600;
  const camAt = (k) => { ctx.setTransform(1, 0, 0, 1, 0, 0); const zz = 1 + (z - 1) * k; ctx.translate(fx, fy); ctx.scale(zz, zz); ctx.translate(-fx, -fy); };
  camAt(0.4);
  K.sideSky(ctx, horizon, { warm: o.warm, drift: o.drift || 0 });
  /* gulls */
  for (let i = 0; i < 3; i++) {
    const gx = ((t * (70 + i * 12) + i * 520) % 2400) - 240, gy = 170 + i * 60 + Math.sin(t * 1.5 + i) * 14;
    K.gull(ctx, gx, gy, 0.9 - i * 0.15, i * 2);
  }
  camAt(0.7);
  K.farIsland(ctx, 330, horizon, 320, 70, 1);
  K.farIsland(ctx, 1240, horizon, 200, 44, 2);
  K.sideSea(ctx, horizon, { warm: o.warm });
  K.waveRow(ctx, horizon + 70, { amp: 6, len: 90, speed: 18, color: "#4aa3b8", w: 2.5, seed: 21, crest: "#e6f4ee" });
  camAt(1);
  const sw = o.swell || 0; /* 0..1: one big swell lifts every ship together ("copula sea") */
  K.waveRow(ctx, horizon + 190, { amp: 9 + 10 * sw, len: 140 + 60 * sw, speed: 32, color: P.seaMid, w: 3.2, seed: 22 });
  const bob = 7 * Math.sin(t * 2.2) - 6 * pulseA(t) - 34 * sw * Math.sin(t * 2.4), rock = 2.4 * Math.sin(t * 1.6 + 0.4) + 3 * sw * Math.cos(t * 2.4);
  if (o.behind) o.behind(t, bob, rock);
  /* the ship */
  const crabFn = (c) => K.crab(c, 0, 0, o.crabS || 1, o.crab(t));
  K.ship(ctx, o.shipX, o.shipY + bob, o.shipS, { rock, coins: o.coins || 0, crab: crabFn, sail: 1 });
  if (o.front) o.front(t, bob, rock);
  /* coin glints on the pile */
  if (o.coins) for (let i = 0; i < 3; i++) {
    const ph = (t * 1.3 + i * 0.37) % 1, gx = o.shipX + o.shipS * (70 + 50 * K.hash(i, Math.floor(t * 1.3 + i * 0.37))), gy = o.shipY + bob - o.shipS * (90 + 30 * K.hash(i + 5, Math.floor(t * 1.3 + i * 0.37)));
    K.sparkle(ctx, gx, gy, 22 * Math.sin(ph * Math.PI), Math.sin(ph * Math.PI), i);
  }
  /* front waves cover the hull bottom */
  K.waveRow(ctx, o.shipY + 30, { amp: 12 + 16 * sw, len: 180 + 80 * sw, speed: 44, color: "#2a86a0", w: 4, seed: 23 });
  K.waveRow(ctx, o.shipY + 110, { amp: 14 + 18 * sw, len: 220 + 90 * sw, speed: 60, color: P.seaDeep, w: 4.5, seed: 24 });
  ctx.restore();
}
