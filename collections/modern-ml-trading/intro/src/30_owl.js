/* ============================================================
   INTRO 30 OWL: Professor Strix's choreography.
   Arms are IK targets keyed in owl-local space ([t, x, y, hand, hold]);
   positions ease between keys, hand shape and held prop switch at keys.
   Every big move lands on a downbeat, with anticipation before it.
   ============================================================ */
const holdShears = (ctx) => { const o = 1 - K.inv(T.snip - 0.05, T.snip, K.now); K.shears(ctx, 6, 0, -0.1, o * (K.now > T.snip - 0.4 ? 1 : 0.3), 1.1, 3010); };
const holdFlask = (ctx) => K.flask(ctx, 10, 40, 0.42, { seed: 3020, rot: -2.2, layers: [{ h: 0.5, color: P.glass }], cork: false });
const holdLens = (ctx) => K.magnifier(ctx, -10, 0, 0, 0.9, 3030);
const holdCan = (ctx) => K.wateringCan(ctx, 30, 30, 0.35, 0.8, 3040);
const holdSeed = (ctx) => K.seed(ctx, 26, -34, 32, { seed: 3050, glow: 0.8 + 0.2 * K.pulse(K.now, 1), rot: Math.sin(K.now * 3) * 0.2 });

/* [time, x, y, hand, hold] (owl-local, scale 1) */
const R_KEYS = [
  [0, 120, -130, "fist"], [T.swivel, 120, -130, "open"],
  [T.wave[0], 150, -360, "open"], [T.wave[1] - 0.25, 150, -360, "open"],
  [T.gauge - 0.2, 120, -150, "open"], [T.dance1[1], 120, -150, "open"],
  [T.pocket, -48, -170, "fist"], [T.toss - 0.1, -48, -175, "fist"],
  [T.toss, -150, -400, "open"], [T.toss + 0.35, 110, -200, "open"],
  [T.sprout, 120, -150, "open"], [T.worry - 0.1, 120, -150, "open"],
  [T.worry, 96, -300, "open"], [T.snip - 0.35, 96, -300, "hold", holdShears],
  [T.snip + 0.75, 125, -140, "open"],
  [T.band - 0.15, 125, -140, "point"], [T.band + 0.1, 46, -312, "point"], [T.band + 0.5, 46, -312, "point"], [T.truck1[0], 125, -140, "open"],
  [T.truck1[1] - 0.3, 20, -210, "hold", holdLens], [T.ticks + 0.45, 20, -210, "hold", holdLens],
  [T.ticks + 0.7, 200, -230, "point"], [T.jump[0] - 0.2, 200, -230, "point"],
  [T.jump[0], 110, -90, "fist"], [T.jump[1], 150, -300, "open"],
  [T.grow + 0.8, 230, -210, "open"], [T.title - 0.25, 140, -150, "open"],
  [T.title, 190, -440, "open"], [T.title + 0.9, 160, -250, "open"],
  [T.show, -40, -160, "open"], [T.show + 0.7, -40, -160, "open"],
  [T.thumb - 0.2, 150, -290, "thumb"], [T.seedUp - 0.4, 150, -290, "thumb"],
  [T.seedUp, 150, -330, "hold", holdSeed], [DUR, 155, -340, "hold", holdSeed],
];
const L_KEYS = [
  [0, -120, -130, "fist"], [T.swivel, -120, -130, "open"],
  [T.gauge, -360, -270, "point"], [T.gauge + 1.2, -360, -270, "point"], [T.dance1[0], -125, -140, "open"],
  [T.pour[0] - 0.3, -125, -130, "open"],
  [T.pour[0], -175, -330, "hold", holdFlask], [T.pour[1], -175, -330, "hold", holdFlask],
  [T.pour[1] + 0.3, -125, -140, "open"], [T.worry - 0.1, -125, -140, "open"],
  [T.worry, -96, -300, "open"], [T.snip - 0.3, -96, -300, "open"],
  [T.snip, -120, -190, "fist"], [T.wag[0] - 0.15, -120, -190, "fist"],
  [T.wag[0], -125, -390, "point"], [T.wag[1], -125, -390, "point"],
  [T.wag[1] + 0.3, -125, -140, "open"], [T.ticks + 0.5, -125, -140, "open"],
  [T.ticks + 0.75, -160, -290, "thumb"], [T.jump[0] - 0.2, -160, -290, "thumb"],
  [T.jump[0], -110, -90, "fist"], [T.jump[1], -150, -300, "open"],
  [T.grow + 0.25, -330, -250, "hold", holdCan], [T.title - 0.4, -330, -250, "hold", holdCan],
  [T.title - 0.15, -140, -150, "open"], [T.title, -190, -440, "open"], [T.title + 0.9, -160, -250, "open"],
  [T.show, -230, -200, "open"], [T.show + 0.8, -230, -200, "open"],
  [T.show + 1.2, -125, -140, "open"], [T.seedUp, -150, -200, "open"], [DUR, -150, -205, "open"],
];
function armAt(keys, t) {
  let i = 0; while (i < keys.length - 1 && t >= keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const u = b[0] > a[0] ? K.E.inOut(K.inv(a[0], b[0], t)) : 0;
  return { x: K.lerp(a[1], b[1], u), y: K.lerp(a[2], b[2], u), hand: a[3], hold: a[4] };
}

const owlX = K.mkTrack([[0, { x: ST_A.owl }], [T.truck1[0], { x: ST_A.owl }], [T.truck1[1], { x: ST_B.owl }], [T.jump[0], { x: ST_B.owl }], [T.jump[1], { x: ST_C.owl }]]);
const OWL_S = (t) => (t < T.jump[0] ? 1.22 : 1.06);

function owlState(t) {
  const x = owlX(t).x, s = OWL_S(t);
  let y = BENCH_Y, hop = 0, squash = 0.07 * K.pulse(t, 1), lean = 0, tilt = 0, walk = 0;
  /* jump to station C: crouch, stretch in the air, splat on landing */
  const ju = K.inv(T.jump[0], T.jump[1], t);
  if (ju > 0 && ju < 1) { y -= Math.sin(ju * Math.PI) * 300; squash = -0.3 * Math.sin(ju * Math.PI); }
  if (t > T.jump[0] - 0.22 && t < T.jump[0]) squash = 0.35 * K.inv(T.jump[0] - 0.22, T.jump[0] - 0.05, t);
  if (t > T.jump[1]) squash += 0.45 * Math.exp(-(t - T.jump[1]) * 7) * Math.cos((t - T.jump[1]) * 22);
  /* toss + snip + title punches */
  [[T.toss, 0.25], [T.snip, 0.3], [T.land, 0.12], [T.show, 0.2]].forEach(([tt, k]) => { if (t > tt) squash += k * Math.exp(-(t - tt) * 8) * Math.cos((t - tt) * 20); });
  const th = K.inv(T.title, T.title + 0.42, t);
  if (th > 0 && th < 1) { hop = Math.sin(th * Math.PI) * 60; squash = -0.25 * Math.sin(th * Math.PI); }
  if (t > T.title + 0.42) squash += 0.35 * Math.exp(-(t - T.title - 0.42) * 8) * Math.cos((t - T.title - 0.42) * 20);
  /* walk to the flasks */
  const wu = K.inv(T.truck1[0], T.truck1[1], t);
  if (wu > 0 && wu < 1) { walk = (t - T.truck1[0]) * 15; hop = Math.abs(Math.sin(walk)) * 12; lean = 6; }
  /* bow on "steal the show" */
  const bw = K.inv(T.show, T.show + 0.25, t) * (1 - K.inv(T.show + 0.7, T.show + 1.0, t));
  lean += -12 * K.E.inOut(bw); tilt += 14 * K.E.inOut(bw);
  /* head */
  let yaw = 0;
  if (t < T.swivel) yaw = 180;
  else if (t < T.swivel + 0.4) yaw = 180 * (1 - K.E.back(K.inv(T.swivel, T.swivel + 0.4, t), 1.6));
  const spin = K.inv(T.jump[1] + 0.05, T.jump[1] + 0.5, t);
  if (spin > 0 && spin < 1) yaw = 360 * K.E.inOut(spin);
  const worry = K.inv(T.worry, T.worry + 0.15, t) * (1 - K.inv(T.snip, T.snip + 0.2, t));
  const wag = t > T.wag[0] && t < T.wag[1];
  if (wag) tilt += 9 * Math.sin((t - T.wag[0]) * 14);
  if (t > T.band && t < T.truck1[0]) tilt -= 8 * K.inv(T.band, T.band + 0.3, t);
  if (t > T.seedUp) tilt += 6 * K.inv(T.seedUp, T.seedUp + 0.4, t);
  /* face */
  let look = [0, 0.1];
  if (t > T.land - 0.6 && t < T.vine[0]) look = [-1, 0.5];
  else if (t >= T.vine[0] && t < T.snip + 0.6) look = [-0.9, -0.4];
  else if (t >= T.band && t < T.truck1[0]) look = [-0.8, -0.3];
  else if (t >= T.truck1[0] && t < T.jump[0]) look = [1, 0];
  else if (t >= T.grow + 0.2 && t < T.grow + 1.2) look = [-1, 0.2];
  else if (t >= T.grow + 1.2 && t < T.title) look = [1, 0];
  else if (t >= T.seedUp && t < T.wink - 0.1) look = [0.6, -1];
  else if (t >= T.gauge && t < T.gauge + 1.4) look = [-1, 0.2];
  const swivelPop = K.inv(T.swivel + 0.2, T.swivel + 0.35, t) * (1 - K.inv(T.swivel + 0.8, T.swivel + 1.1, t));
  const titlePop = K.inv(T.title, T.title + 0.2, t) * (1 - K.inv(T.title + 0.9, T.title + 1.3, t));
  let mouth = "smile";
  if (worry > 0.3) mouth = "o"; else if (wag) mouth = "open"; else if (t > T.snip && t < T.snip + 0.8) mouth = "grin";
  else if (titlePop > 0.3) mouth = "open"; else if (t > T.show && t < T.show + 1.1) mouth = "grin";
  if (t > T.dance1[0] && t < T.dance1[1]) mouth = "grin";
  const forceOpen = worry > 0 || swivelPop > 0 || titlePop > 0 || (t > T.seedUp && t < T.wink);
  let wingR = armAt(R_KEYS, t), wingL = armAt(L_KEYS, t);
  if (t > T.wave[0] && t < T.wave[1] - 0.25) wingR.x += 26 * Math.sin((t - T.wave[0]) * 15);
  if (wag) wingL.x += 22 * Math.sin((t - T.wag[0]) * 14);
  /* the snip: the shears go to the vine, in owl-local space */
  if (wingR.hold === holdShears) {
    const sx = (SNIP_PT[0] - x) / s - 70, sy = (SNIP_PT[1] - y) / s + 20;
    const kin = K.E.inOut(K.inv(T.snip - 0.35, T.snip - 0.05, t)), kout = K.E.inOut(K.inv(T.snip + 0.35, T.snip + 0.75, t));
    const from = kout > 0 ? [125, -140] : [96, -300], k = kin * (1 - kout);
    wingR.x = K.lerp(from[0], sx, k); wingR.y = K.lerp(from[1], sy, k);
  }
  /* back turned at the bench: tinkering in time with the music */
  if (t < T.swivel) { const k = Math.sin(t * Math.PI / BEAT); wingR.x += 18 * k; wingR.y += 12 * Math.abs(k); wingL.x += 18 * k; wingL.y += 12 * Math.abs(k); tilt += 5 * Math.sin(t * Math.PI / (BEAT * 2)); hop += 8 * K.pulse(t, 1, 6); }
  /* swing dance: arms swap up / down on every beat, lean side to side, hop */
  if (t > T.dance1[0] && t < T.dance1[1]) {
    const b = K.beatIndex(t), p = b % 2 ? 1 : -1, pu = K.pulse(t, 1, 5);
    wingR = { x: 160, y: (p > 0 ? -420 : -110) + 30 * pu, hand: "open" }; wingL = { x: -160, y: (p > 0 ? -110 : -420) + 30 * pu, hand: "open" };
    lean += 9 * p; hop += 26 * pu; squash += 0.1 - 0.15 * pu; walk = b * Math.PI * 0.5;
  }
  /* the final hit: a little ta-da hop */
  const fh = K.inv(T.finale, T.finale + 0.4, t);
  if (fh > 0 && fh < 1) { hop += Math.sin(fh * Math.PI) * 50; squash = -0.22 * Math.sin(fh * Math.PI); }
  if (t > T.finale + 0.4) squash += 0.3 * Math.exp(-(t - T.finale - 0.4) * 8) * Math.cos((t - T.finale - 0.4) * 20);
  /* idle sway */
  wingR.y += 4 * Math.sin(t * 2.2); wingL.y += 4 * Math.sin(t * 2.2 + 1);
  return {
    x, y, s,
    st: { squash, hop, lean, tilt, yaw, walk, look, mouth, wingR, wingL,
      blink: forceOpen ? 0 : K.blinkAt(t, 5), wink: t > T.wink ? "L" : null,
      eyeUp: Math.max(worry, swivelPop * 0.6, titlePop * 0.5), tufts: Math.max(worry, swivelPop, titlePop),
      brow: worry > 0 ? 1.2 * worry : wag ? -0.8 : t > T.band && t < T.truck1[0] ? 0.6 : 0,
      exclaim: K.inv(T.worry, T.worry + 0.3, t) * (1 - K.inv(T.snip - 0.1, T.snip, t)), seed: 700 },
  };
}
/* world position of a hand target (IK reaches it exactly: the arms stretch) */
const handWorld = (o, w) => [o.x + o.s * w.x, o.y + o.s * (w.y - (o.st.hop || 0))];

function drawOwl(t) {
  const o = owlState(t);
  /* spotlight on "steal the show" */
  const sp = K.inv(T.show - 0.1, T.show + 0.2, t);
  if (sp > 0) { K.glow(ctx, o.x, o.y - 230, 420, "rgba(255,240,190,0.5)", sp * (0.8 + 0.2 * K.pulse(t, 1))); }
  /* shadow on the bench */
  ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = P.woodDark; ctx.beginPath(); ctx.ellipse(o.x, BENCH_Y + 4, 120 * o.s * (1 - (BENCH_Y - o.y) / 900), 14, 0, 0, K.TAU); ctx.fill(); ctx.restore();
  K.owl(ctx, o.x, o.y, o.s, o.st);
  /* seed in flight: from the flinging hand to the pot */
  const fu = K.inv(T.toss, T.land, t);
  if (fu > 0 && fu < 1) {
    const h0 = handWorld({ x: ST_A.owl, y: BENCH_Y, s: OWL_S(0), st: {} }, { x: -150, y: -400 });
    const sx = K.lerp(h0[0], POT_TOP[0], fu), sy = K.lerp(h0[1], POT_TOP[1] - 4, fu) - Math.sin(fu * Math.PI) * 220;
    K.seed(ctx, sx, sy, 22, { seed: 3060, rot: fu * 9, glow: 0.7 });
    for (let i = 1; i < 4; i++) { const u2 = Math.max(0, fu - i * 0.06); K.dot(ctx, K.lerp(h0[0], POT_TOP[0], u2), K.lerp(h0[1], POT_TOP[1], u2) - Math.sin(u2 * Math.PI) * 220, 5 - i, P.brassLight, null, 0, 3070 + i); }
  }
  /* data drizzle from the flask: little digits of light falling into the pot */
  const pu = K.inv(T.pour[0] + 0.15, T.pour[1], t);
  if (pu > 0 && pu < 1) {
    const h = handWorld(o, { x: -175, y: -330 }), mouthX = h[0] - 70, mouthY = h[1] + 40;
    for (let i = 0; i < 14; i++) {
      const ph = ((t * 2.2 + i / 14) % 1), dx = K.lerp(mouthX, POT_TOP[0] + 10, ph), dy = K.lerp(mouthY, POT_TOP[1], ph) - Math.sin(ph * Math.PI) * 120;
      K.dot(ctx, dx, dy, 6, i % 3 ? P.glass : P.brassLight, P.ink, 2, 3100 + i);
    }
  }
  /* water drops from the can to the tree pot */
  const wu = K.inv(T.grow + 0.35, T.title - 0.45, t);
  if (wu > 0 && wu < 1) {
    const h = handWorld(o, { x: -330, y: -250 }), x0 = h[0] - 120, y0 = h[1] - 40;
    for (let i = 0; i < 10; i++) {
      const ph = ((t * 2.6 + i / 10) % 1), dx = K.lerp(x0, ST_C.tree + 40, ph), dy = K.lerp(y0, BENCH_Y - 130, ph) - Math.sin(ph * Math.PI) * 50;
      K.shape(ctx, [[dx, dy - 9], [dx + 5, dy + 2], [dx, dy + 6], [dx - 5, dy + 2]], { fill: P.pane, w: 2.4, boil: 0.4, seed: 3200 + i });
    }
  }
  return o;
}
