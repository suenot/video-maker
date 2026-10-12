/* ============================================================
   INTRO 20 SIDE SET: horizon, big ship, the crab close up.
   Used by the opening, the two-ship choruses and the title card. Crab poses are pure functions of t.
   ============================================================ */
const pulseB = (t) => K.pulse(t, 1, 6);          /* every beat */
const pulseA = (t) => K.pulse(t, 4, 5);          /* every bar */
const win = (t, a, b, fi, fo) => K.ss(a - (fi || 0.25), a, t) * (1 - K.ss(b - (fo || 0.25), b, t)); /* 0..1 inside [a, b] */

/* ---------- opening + verse: helm, cap tip, spyglass, "!" ---------- */
function crabOpening(t) {
  const st = { seed: 500, blink: K.blinkAt(t, 3), mouth: "smile", look: [0.2, 0] };
  const bounce = pulseB(t);
  st.squash = 0.1 * bounce - 0.04;
  /* left claw on the helm wheel, right claw waves to the beat */
  st.clawL = { x: -72, y: -42 + 4 * Math.sin(t * 3), open: 0.15 };
  st.clawR = { x: 92, y: -70 - 18 * bounce, open: 0.3 + 0.4 * bounce };
  st.look = [Math.sin(t * 1.3) * 0.8, -0.1];
  /* "A crab sails out": tips the cap to us, wink-smile */
  const sal = win(t, T.salute, T.salute + 1.4, 0.3, 0.35);
  if (sal > 0) {
    st.clawR = { x: K.lerp(92, 62, sal), y: K.lerp(-70, -150, sal), open: 0.35, rot: K.lerp(-40, -150, sal) };
    st.hatLift = 18 * sal; st.hatTip = 14 * sal; st.look = [0, 0]; st.mouth = "grin";
    st.wink = K.ss(T.salute + 0.2, T.salute + 0.35, t) * (1 - K.ss(T.salute + 0.9, T.salute + 1.05, t));
  }
  /* "Rust-iron ship": proud knock on the rail */
  const rv = win(t, T.rivets, T.rivets + 1.2, 0.2, 0.3);
  if (rv > 0) { st.clawR = { x: 70, y: K.lerp(-70, -12, rv) + 10 * pulseB(t), open: 0.1 }; st.look = [0.6, 0.8]; st.mouth = "grin"; }
  /* "markets wide": looks around */
  if (t > T.pullOut[0] && t < T.spyUp - 0.6) st.look = [Math.sin((t - T.pullOut[0]) * 2.2), -0.5];
  /* anticipation then spyglass up */
  const up = K.ss(T.spyUp - 0.25, T.spyUp + 0.2, t);
  if (t > T.spyUp - 0.6) st.squash += 0.22 * K.ss(T.spyUp - 0.6, T.spyUp - 0.25, t) * (1 - up);
  if (up > 0) {
    st.hold = "spyglass";
    st.clawR = { x: K.lerp(92, 38, up), y: K.lerp(-70, -150, up), open: 0.05, rot: K.lerp(-30, -14, up) };
    st.look = [1, -0.6]; st.lean = -4 * up;
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

/* ---------- chorus: "sail with me!" beckon + wink ---------- */
function crabBeckon(t) {
  const b = pulseB(t), st = { seed: 500, blink: K.blinkAt(t, 23), mouth: "grin", look: [0, 0], squash: 0.1 * b - 0.03 };
  st.clawL = { x: -96, y: -50 - 10 * b, open: 0.25 };
  const curl = 0.5 + 0.5 * Math.sin((t - T.beckon) * Math.PI / K.beatLen()); /* "come here" on the beat */
  st.clawR = { x: 70 + 26 * curl, y: -120 + 30 * curl, open: 0.2 + 0.6 * (1 - curl), rot: -110 + 50 * curl };
  st.wink = K.ss(T.wink - 0.08, T.wink + 0.05, t) * (1 - K.ss(T.wink + 0.45, T.wink + 0.6, t));
  if (st.wink > 0.2) st.mouth = "smile";
  return st;
}

/* ---------- title card: haul the net, jump, snap, cap tip, wave ---------- */
function crabTitle(t) {
  const st = { seed: 500, blink: K.blinkAt(t, 9), mouth: "grin", look: [0.3, -0.5], squash: 0.08 * pulseB(t) - 0.03 };
  st.clawL = { x: -96, y: -50 - 10 * pulseB(t), open: 0.25 };
  st.clawR = { x: 96, y: -50 - 10 * pulseB(t + 0.25), open: 0.25 };
  /* "Haul in the spread": both claws on the rope, lean back on every beat */
  const hl = win(t, T.haul[0], T.haul[1], 0.3, 0.3);
  if (hl > 0) {
    const pull = pulseB(t);
    st.clawL = { x: K.lerp(-96, 70, hl), y: K.lerp(-50, -40 - 30 * pull, hl), open: 0.1 };
    st.clawR = { x: K.lerp(96, 110, hl), y: K.lerp(-50, -60 - 30 * pull, hl), open: 0.1 };
    st.lean = -10 * hl * (0.4 + 0.6 * pull); st.mouth = pull > 0.5 ? "open" : "grin"; st.look = [1, 0.3]; st.squash += 0.12 * pull * hl;
  }
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
    st.mouth = "open"; st.look = [0, -1]; st.lean = 0;
  }
  /* claw snap flourish on two beats: right claw high, snapping */
  const s0 = T.snap[0] - 0.3, s1 = T.hatTip - 0.2;
  if (t > s0 && t < s1) {
    const r = K.ss(s0, T.snap[0], t) * (1 - K.ss(s1 - 0.3, s1, t));
    const snapOpen = Math.min(K.inv(T.snap[0] - 0.2, T.snap[0], t) - K.inv(T.snap[0], T.snap[0] + 0.06, t) + K.inv(T.snap[1] - 0.2, T.snap[1], t) - K.inv(T.snap[1], T.snap[1] + 0.06, t), 1);
    st.clawR = { x: K.lerp(96, 104, r), y: K.lerp(-50, -196, r), open: 0.1 + 0.85 * snapOpen, rot: K.lerp(0, -70, r) };
    st.look = [0.9, -0.8]; st.lean = -5 * r;
  }
  /* cap tip with the left claw */
  const h0 = T.hatTip - 0.2, h1 = T.hatTip + 0.9;
  if (t > h0 && t < h1) {
    const r = K.ss(h0, T.hatTip, t) * (1 - K.ss(h1 - 0.3, h1, t));
    st.clawL = { x: K.lerp(-96, -66, r), y: K.lerp(-50, -146, r), open: 0.35, rot: K.lerp(180, -30, r) };
    st.hatLift = 16 * r; st.hatTip = -16 * r; st.blink = Math.max(st.blink, r > 0.6 ? 1 : 0); st.mouth = "grin";
  }
  /* wave goodbye to the end */
  if (t > T.hatTip + 1.0) {
    const r = K.ss(T.hatTip + 1.0, T.hatTip + 1.3, t);
    st.clawR = { x: 110 + 16 * Math.sin((t - T.hatTip) * 9) * r, y: K.lerp(-50, -170, r), open: 0.5, rot: -80 + 20 * Math.sin((t - T.hatTip) * 9) * r };
  }
  return st;
}

/* ---------- the side set ----------
   o: horizon, warm, zoom/fx/fy (push-in), sunX/sunY, drift,
      shipX/Y/S, crab(t) -> pose, crabS, coins, swell, behind/front hooks,
      markets [{x, label, color, t0}] (coin flags on the horizon islands),
      rivets (time the spark run starts) */
function drawSide(t, o) {
  const horizon = o.horizon;
  K.screen(ctx);
  ctx.save();
  const z = o.zoom || 1, fx = o.fx || 960, fy = o.fy || 600;
  const toX = o.toX == null ? fx : o.toX; /* screen x the focus point moves to (lets a push-in recentre) */
  const camAt = (k) => { ctx.setTransform(1, 0, 0, 1, 0, 0); const zz = 1 + (z - 1) * k; ctx.translate(K.lerp(fx, toX, k), fy); ctx.scale(zz, zz); ctx.translate(-fx, -fy); };
  camAt(0.4);
  const sky = { warm: o.warm, drift: o.drift || 0 }; if (o.sunX != null) sky.sunX = o.sunX; if (o.sunY != null) sky.sunY = o.sunY;
  K.sideSky(ctx, horizon, sky);
  for (let i = 0; i < 3; i++) {
    const gx = ((t * (70 + i * 12) + i * 520) % 2400) - 240, gy = 170 + i * 60 + Math.sin(t * 1.5 + i) * 14;
    K.gull(ctx, gx, gy, 0.9 - i * 0.15, i * 2);
  }
  camAt(0.7);
  K.farIsland(ctx, 330, horizon, 320, 70, 1);
  K.farIsland(ctx, 1240, horizon, 200, 44, 2);
  K.farIsland(ctx, 1720, horizon, 240, 52, 3);
  (o.markets || []).forEach((m, i) => {
    const a = K.inv(m.t0, m.t0 + 0.4, t); if (a <= 0) return;
    const s = K.E.back(a, 2.4), bob = Math.sin(t * 2 + i) * 4;
    K.line(ctx, [[m.x, horizon - 30], [m.x, horizon - 30 - 90 * s]], { stroke: P.ink, w: 4, boil: 0.6, seed: 960 + i, gap: 0 });
    ctx.save(); ctx.translate(m.x, horizon - 140 * s + bob); ctx.scale(s, s);
    K.coin(ctx, 0, 0, 48, { color: m.color, label: m.label, labelColor: P.paper, size: m.label.length > 3 ? 21 : 26, seed: 970 + i });
    ctx.restore();
  });
  K.sideSea(ctx, horizon, { warm: o.warm });
  K.waveRow(ctx, horizon + 70, { amp: 6, len: 90, speed: 18, color: "#4aa3b8", w: 2.5, seed: 21, crest: "#e6f4ee" });
  camAt(1);
  const sw = o.swell || 0; /* 0..1: one big swell lifts every ship together ("copula sea") */
  K.waveRow(ctx, horizon + 190, { amp: 9 + 10 * sw, len: 140 + 60 * sw, speed: 32, color: P.seaMid, w: 3.2, seed: 22 });
  const bob = 7 * Math.sin(t * 2.2) - 6 * pulseA(t) - 34 * sw * Math.sin(t * 2.4), rock = 2.4 * Math.sin(t * 1.6 + 0.4) + 3 * sw * Math.cos(t * 2.4);
  if (o.behind) o.behind(t, bob, rock);
  const cs = o.crabS || 1, pose = o.crab(t);
  const crabFn = (c) => K.crab(c, 0, 0, cs, pose);
  K.ship(ctx, o.shipX, o.shipY + bob, o.shipS, { rock, coins: o.coins || 0, crab: crabFn, sail: 1 });
  if (o.front) o.front(t, bob, rock);
  /* "Rust-iron": a spark runs along the rivet row */
  if (o.rivets != null) {
    const d = t - o.rivets;
    if (d > 0 && d < 1.3) for (let i = 0; i < 15; i++) {
      const k = d * 18 - i; if (k < 0 || k > 3) continue;
      const a = Math.sin((k / 3) * Math.PI);
      K.glow(ctx, o.shipX + o.shipS * (-150 + i * 21), o.shipY + bob + o.shipS * -46, 50, "rgba(255,230,150,0.9)", a * 0.7);
      K.sparkle(ctx, o.shipX + o.shipS * (-150 + i * 21), o.shipY + bob + o.shipS * -46, 34 * a, a, 980 + i);
    }
  }
  if (o.coins) for (let i = 0; i < 3; i++) {
    const ph = (t * 1.3 + i * 0.37) % 1, gx = o.shipX + o.shipS * (70 + 50 * K.hash(i, Math.floor(t * 1.3 + i * 0.37))), gy = o.shipY + bob - o.shipS * (90 + 30 * K.hash(i + 5, Math.floor(t * 1.3 + i * 0.37)));
    K.sparkle(ctx, gx, gy, 22 * Math.sin(ph * Math.PI), Math.sin(ph * Math.PI), i);
  }
  if (o.notes) o.notes(t, bob);
  K.waveRow(ctx, o.shipY + 30, { amp: 12 + 16 * sw, len: 180 + 80 * sw, speed: 44, color: "#2a86a0", w: 4, seed: 23 });
  K.waveRow(ctx, o.shipY + 110, { amp: 14 + 18 * sw, len: 220 + 90 * sw, speed: 60, color: P.seaDeep, w: 4.5, seed: 24 });
  if (o.over) o.over(t, bob);
  ctx.restore();
}
