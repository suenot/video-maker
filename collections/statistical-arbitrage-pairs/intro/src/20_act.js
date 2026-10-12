/* ============================================================
   INTRO 20 THE ACT (0 - 16.1 s): stage, the cat at the piano, the two
   penguins on a spring, the z-meter, the screen, coins and the bell.
   Every function is a pure function of t.
   ============================================================ */
const pulseB = (t) => K.pulse(t, 1, 6);   /* every beat */
const beatPh = (t) => { const b = K.barAt(t); return b < 0 ? 0 : ((t - K.barStart(b)) / BEAT) % 1; };
const tapOf = (t, off) => { const p = (beatPh(t) + (off || 0)) % 1; return Math.max(0, Math.sin(p * Math.PI * 2)) ; };

/* ---------- penguin x positions + spread state ---------- */
function penX(t) {
  const enter = K.inv(T.enter[0], T.enter[1], t), e = K.E.out3(enter);
  let a = K.lerp(2120, PEN.A0, e), b = K.lerp(2330, PEN.B0, e);
  /* drifting apart, then the snap back (fast ease-in, a little overshoot) */
  const d = K.E.inOut(K.inv(T.drift[0], T.drift[1], t));
  const back = K.inv(T.snap, T.hit, t), bk = back * back;
  const dA = (PEN.A1 - PEN.A0) * d * (1 - bk), dB = (PEN.B1 - PEN.B0) * d * (1 - bk);
  a += dA; b += dB;
  /* recoil after the hit */
  const r = t > T.hit ? Math.exp(-(t - T.hit) * 6) * Math.sin((t - T.hit) * 22) * 26 : 0;
  a -= r; b += r;
  /* a little dance sway while close */
  const sway = (t > T.close && t < T.drift[0] + 0.4 ? 1 : 0) * Math.sin((t - T.close) * Math.PI / BEAT / 2) * 16;
  return [a + sway, b + sway];
}
/* spread in sigma from the partners' separation; damped wobble after the snap */
function zOf(t) {
  const [a, b] = penX(t), sep0 = PEN.B0 - PEN.A0, sep1 = PEN.B1 - PEN.A1;
  let z = 2.1 * K.clamp((b - a - sep0) / (sep1 - sep0), -0.4, 1.2);
  if (t > T.hit) z += -0.7 * Math.exp(-(t - T.hit) * 2.6) * Math.cos((t - T.hit) * 9);
  if (t > T.enter[1] && t < T.drift[0]) z += 0.12 * Math.sin(t * 5.3);
  return z;
}

/* ---------- penguin poses ---------- */
function penPose(t, who) {
  const sd = who === "A" ? -1 : 1, off = who === "A" ? 0 : 0.5;
  const st = { seed: who === "A" ? 900 : 950, hat: who === "A" ? "top" : "boater", blink: K.blinkAt(t, who === "A" ? 4 : 6), look: [-sd * 0.6, 0] };
  const walking = t > T.enter[0] && t < T.enter[1] + 0.2;
  st.tapL = tapOf(t, off) * (walking || t > T.close ? 0.9 : 0.4);
  st.tapR = tapOf(t, off + 0.5) * (walking || t > T.close ? 0.9 : 0.4);
  st.squash = 0.08 * pulseB(t) - 0.02;
  st.hop = 6 * pulseB(t);
  st.flipL = 18 + 14 * Math.sin(t * 7.85 + off * 3); st.flipR = 18 + 14 * Math.sin(t * 7.85 + 1 + off * 3);
  st.lean = walking ? -sd * 6 : 0;
  /* "ha!": jazz hands */
  const ha = K.ss(T.ha - 0.15, T.ha + 0.05, t) * (1 - K.ss(T.ha + 0.35, T.ha + 0.6, t));
  if (ha > 0) { st.flipL = K.lerp(st.flipL, 150, ha); st.flipR = K.lerp(st.flipR, 150, ha); st.beak = "open"; st.hop += 26 * ha; st.look = [0, -0.2]; }
  /* drifting apart: lean outward, worried looks at each other */
  const dr = K.inv(T.drift[0], T.drift[1], t) * (1 - K.inv(T.snap, T.hit, t));
  if (dr > 0) { st.lean += sd * 10 * Math.sin(dr * Math.PI); st.look = [-sd, 0]; st[sd < 0 ? "flipR" : "flipL"] = 70 + 30 * dr; }
  if (t > T.drift[1] && t < T.snap) { st.lean = sd * 4; st.beak = "open"; st.look = [-sd, -0.1]; st[sd < 0 ? "flipR" : "flipL"] = 95 + 6 * Math.sin(t * 9); }
  /* the snap: flying back, then the hug */
  if (t > T.snap && t < T.hit) { st.lean = -sd * 14; st.squash = -0.18; st.beak = "open"; st.look = [-sd, 0]; }
  const hug = K.inv(T.hit, T.hit + 0.25, t);
  if (t > T.hit) {
    const land = Math.sin(K.inv(T.hit, T.hit + 0.3, t) * Math.PI) * (1 - K.inv(T.hit, T.hit + 0.3, t));
    st.squash += 0.35 * land; st.beak = "shut"; st.blink = 0; st.look = [-sd * 0.4, -0.2];
    st[sd < 0 ? "flipR" : "flipL"] = K.lerp(40, 110, hug);
    st.heart = who === "A" ? K.inv(T.hit + 0.2, T.hit + 0.55, t) : 0; st.heartX = 85;
  }
  /* bow on the bell */
  const bow = K.ss(T.bow - 0.2, T.bow + 0.2, t) * (1 - K.ss(T.irisOut[1] - 0.1, T.irisOut[1] + 0.2, t));
  if (bow > 0) { st.lean = -sd * 0 + 0; st.squash -= 0.1 * bow; st.hatTip = -30 * bow; }
  return st;
}

/* ---------- the cat ---------- */
const KEY_X = (k) => PIANO.x + (-220 + 6 + (k + 0.5) * (428 / 22)) * PIANO.s;
const KEY_Y = PIANO.y - 280 * PIANO.s;
function toCat(p) { return { x: (p[0] - CAT.x) / CAT.s, y: (p[1] - CAT.y) / CAT.s }; }
function playing(t) { return t < T.ha - 0.2 || (t > T.ha + 0.6 && t < T.trade - 0.35); }
function pressedKeys(t) {
  if (!playing(t)) return [];
  const h = Math.floor((t - 0.12) / (BEAT / 2));
  return [10 + (h % 4) * 2 + (K.hash(h, 3) < 0.5 ? 1 : 0), 17 + (h % 3)];
}
function catPose(t) {
  const st = { seed: 800, blink: K.blinkAt(t, 3), mouth: "smile", look: [0.6, 0], turn: 0.3 };
  const pb = pulseB(t);
  st.squash = 0.07 * pb - 0.02;
  st.lean = -3 + 2 * Math.sin(t * 3.9);
  /* playing: gloves hop on the keys (stride left hand, melody right hand) */
  const keys = pressedKeys(t);
  if (keys.length) {
    /* left hand plays the stride, right hand swings the beat at the act */
    const L = toCat([KEY_X(keys[1]), KEY_Y - 14 * pb]);
    st.gloveL = { x: L.x, y: L.y, open: 0.6, rot: 200 };
    st.gloveR = { x: 96 + 10 * Math.sin(t * Math.PI / BEAT), y: -170 - 26 * pulseB(t - BEAT / 2), open: 0.9, rot: -40 + 20 * Math.sin(t * Math.PI / BEAT) };
    st.look = [0.8, 0.1]; st.turn = 0.5;
  }
  /* "ha!": turn to the camera, wink, hat lift, present the act */
  const ha = K.ss(T.ha - 0.2, T.ha, t) * (1 - K.ss(T.ha + 0.45, T.ha + 0.7, t));
  if (ha > 0) {
    st.turn = K.lerp(st.turn, 0, ha); st.look = [0, 0]; st.wink = ha; st.mouth = "grin"; st.hatLift = 34 * ha; st.hatTip = -12 * ha;
    st.gloveR = { x: K.lerp(st.gloveR ? st.gloveR.x : 74, 150, ha), y: K.lerp(st.gloveR ? st.gloveR.y : -150, -190, ha), open: 1, rot: -20 };
    st.squash -= 0.14 * ha;
  }
  /* "!": z hits the gold zone */
  const pop = K.ss(T.spot - 0.06, T.spot + 0.06, t) * (1 - K.ss(T.trade + 0.4, T.trade + 0.8, t));
  if (pop > 0) { st.blink = 0; st.eyeUp = 10 * pop; st.brow = 1.4 * pop; st.mouth = "o"; st.exclaim = K.inv(T.spot - 0.05, T.spot + 0.25, t) * (1 - K.inv(T.trade + 0.5, T.trade + 0.7, t)); st.look = [1, -0.5]; st.turn = 0.6; }
  /* "trade the spread": wind up and throw two tags (sell the rich, buy the cheap) */
  if (t > T.trade - 0.35 && t < T.flip) {
    st.turn = 0.5; st.look = [1, -0.2]; st.mouth = "sly";
    [T.tagSell, T.tagBuy].forEach((tt) => {
      const wind = K.ss(tt - BEAT * 0.9, tt - BEAT * 0.4, t) * (1 - K.ss(tt - BEAT * 0.4, tt - BEAT * 0.2, t));
      const thr = K.ss(tt - BEAT * 0.4, tt - BEAT * 0.15, t) * (1 - K.ss(tt + 0.1, tt + 0.35, t));
      if (wind > 0 || thr > 0) { st.gloveR = { x: K.lerp(K.lerp(60, -40, wind), 170, thr), y: K.lerp(K.lerp(-170, -230, wind), -200, thr), open: 0.2 + 0.8 * thr }; st.lean = -8 * wind + 8 * thr; }
    });
    if (!st.gloveR) st.gloveR = { x: 90, y: -170, open: 0.5 };
    st.gloveL = { x: -80, y: -120 - 10 * pb, open: 0.3 };
  }
  /* coin flip: bets on the reversion */
  if (t > T.flip - 0.3 && t < T.snap + 0.4) {
    const up = K.ss(T.flip - 0.3, T.flip, t);
    st.gloveR = { x: 70, y: K.lerp(-150, -190, up) + 30 * K.ss(T.catch - 0.1, T.catch + 0.1, t) * 0, open: 0.4 };
    st.gloveL = { x: -70, y: -140, open: 0.4 };
    st.look = [0.3, -1 + 1.6 * K.inv(T.flip, T.flip + 0.6, t) * (1 - K.inv(T.catch - 0.6, T.catch, t))]; st.turn = 0.1;
    st.mouth = t > T.catch ? "grin" : "o";
    st.squash -= 0.2 * (1 - K.inv(T.flip, T.flip + 0.15, t)) * up;
  }
  /* cue! both arms up as the spring snaps */
  const cue = K.ss(T.snap - 0.15, T.snap + 0.05, t) * (1 - K.ss(T.rain - 0.3, T.rain, t));
  if (cue > 0) { st.gloveL = { x: -100, y: -260, open: 1 }; st.gloveR = { x: 110, y: -260, open: 1 }; st.mouth = "grin"; st.look = [1, -0.3]; st.turn = 0.4; st.hop = 30 * Math.sin(K.inv(T.hit, T.hit + 0.4, t) * Math.PI); }
  /* coins rain: hat held out upside down */
  if (t > T.rain - 0.3 && t < T.bell[0] - 0.25) {
    const h = K.ss(T.rain - 0.3, T.rain, t);
    st.hatInHand = true; st.hatTip = 180; st.gloveR = { x: 120, y: -230 + 20 * pb, open: 0.6 }; st.gloveL = { x: -90, y: -170, open: 0.8 }; st.mouth = "grin"; st.look = [0.3, -1]; st.turn = 0.2 * h;
  }
  /* ring the bell (glove slaps the plunger on each hit) */
  if (t > T.bell[0] - 0.3 && t < T.bow - 0.2) {
    const plunger = toCat([BELL.x, BELL.y - 140 * BELL.stoolS - 96 * BELL.s]);
    let lift = 1; T.bell.forEach((tb) => { lift = Math.min(lift, K.ss(tb - 0.02, tb - 0.25, t) + K.ss(tb + 0.02, tb + 0.25, t)); });
    lift = K.clamp(lift, 0, 1);
    st.gloveR = { x: plunger.x - 6, y: plunger.y - 6 - 50 * lift, open: 0.15, rot: 90 }; st.gloveL = { x: -96, y: -200 - 10 * pb, open: 1 };
    st.mouth = lift < 0.3 ? "open" : "grin"; st.look = [0.2, 0]; st.turn = 0; st.squash += 0.12 * (1 - lift);
  }
  /* bow with the hat */
  const bow = K.ss(T.bow - 0.2, T.bow + 0.2, t);
  if (bow > 0 && t < T.irisOut[1]) { st.lean = -10 * bow; st.hatInHand = true; st.hatTip = -20; st.gloveR = { x: 130, y: -120, open: 0.6 }; st.gloveL = { x: -60, y: -110, open: 0.5 }; st.mouth = "grin"; st.wink = bow; st.turn = 0; st.look = [0, 0]; }
  return st;
}

/* ---------- tags thrown at the partners, the flipped coin ---------- */
function drawTags(t, xs) {
  const tags = [[T.tagSell, xs[0], "−1 ▼", 0], [T.tagBuy, xs[1], "+1 ▲", 1]];
  tags.forEach(([tt, px, str, i]) => {
    const t0 = tt - BEAT * 0.2; if (t < t0) return;
    if (t > T.snap + 0.2) return;
    const fly = K.inv(t0, tt, t), from = [CAT.x + 150 * CAT.s, CAT.y - 200 * CAT.s], to = [px, PEN.y - 300 * PEN.s];
    const x = K.lerp(from[0], to[0], fly), y = K.lerp(from[1], to[1], fly) - Math.sin(fly * Math.PI) * 160;
    const fade = 1 - K.inv(T.snap, T.snap + 0.2, t);
    ctx.save(); ctx.globalAlpha = fade;
    K.hangTag(ctx, x, y + (fly >= 1 ? 4 * Math.sin(t * 6 + i) : 0), str, { gold: true, size: 34, seed: 1610 + i * 7, string: fly >= 1 ? 28 : 0, a: K.inv(t0, t0 + 0.15, t) });
    ctx.restore();
  });
}
function drawFlipCoin(t) {
  if (t < T.flip - 0.05 || t > T.snap + 0.3) return;
  const u = K.inv(T.flip, T.catch, t), hx = CAT.x + 74 * CAT.s, hy = CAT.y - 210 * CAT.s;
  const y = hy - Math.sin(u * Math.PI) * 330, spin = u * 26;
  K.coin(ctx, hx + 10 * Math.sin(u * 3), y, 26, { spin: u < 1 ? spin : 0, seed: 1650 });
  if (u >= 1) K.twinkle(ctx, hx + 30, hy - 30, 22, 1 - K.inv(T.catch, T.catch + 0.4, t), P.goldLight, 1651);
}

/* ---------- the projected chart: prices first, the spread after the bell ---------- */
function drawScreen(t) {
  const a = K.inv(T.curtain[0] + 0.3, T.curtain[1], t);
  if (a <= 0) return;
  const draw = K.lerp(0.3, 1, K.inv(T.curtain[1], T.hit, t));
  const two = K.inv(T.chart2, T.chart2 + 0.45, t);
  if (two < 1) K.screenChart(ctx, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, [{ data: CHART.A, color: P.ink, w: 6 }, { data: CHART.B, color: P.g3, w: 6 }], { a, draw, seed: 1400, spread: true, beam: 0.15 });
  if (two > 0) { /* the new reel rolls down over the old one */
    ctx.save(); ctx.beginPath(); ctx.rect(SCREEN.x - SCREEN.w / 2 - 40, SCREEN.y - SCREEN.h / 2 - 40, SCREEN.w + 80, (SCREEN.h + 60) * K.E.out3(two)); ctx.clip();
    const d2 = K.inv(T.chart2 + 0.2, T.bell[2], t), iEntry = 36, iExit = 52;
    K.screenChart(ctx, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, [{ data: CHART.S, color: P.ink, w: 6 }], { a: 1, draw: d2, seed: 1450, yMin: -3, yMax: 3, roller: true, beam: 0.15,
      bands: [{ v: 2, color: P.gold, label: "+2σ" }, { v: 0, color: P.g3, dash: [6, 10] }, { v: -2, color: P.gold, label: "−2σ" }], marks: [{ i: iEntry, s: 0 }, { i: iExit, s: 0 }] });
    ctx.restore();
  }
}

/* ---------- floating notes from the piano ---------- */
function drawNotes(t) {
  for (let i = 0; i < 6; i++) {
    const t0 = 0.3 + i * 0.75 + K.hash(i, 5) * 0.3, d = (t - t0) % 4.5;
    if (t < t0 || !playing(t - d) || d > 1.8) continue;
    K.note(ctx, PIANO.x + 120 + d * 60 + 20 * Math.sin(d * 4 + i), PIANO.y - 520 - d * 150, 0.9, 1 - d / 1.8, 720 + i * 3);
  }
}

/* ---------- the whole stage ---------- */
function camAct(t) {
  /* wide, a gentle push toward the partners as they drift, back out for the snap, push on the bell */
  const zi = K.tw(t, T.drift[0], T.drift[1], 1, 1.06, K.E.inOut) - K.tw(t, T.snap - 0.2, T.hit, 0, 0.06, K.E.inOut);
  const zb = K.tw(t, T.bell[0] - 0.3, T.bell[0] + 0.3, 0, 0.1, K.E.inOut) - K.tw(t, T.bow - 0.4, T.bow + 0.3, 0, 0.1, K.E.inOut);
  const x = 960 + K.tw(t, T.drift[0], T.drift[1], 0, 80, K.E.inOut) - K.tw(t, T.snap - 0.2, T.hit, 0, 80, K.E.inOut) - K.tw(t, T.bell[0] - 0.3, T.bell[0] + 0.3, 0, 120, K.E.inOut);
  const y = 540 + K.tw(t, T.bell[0] - 0.3, T.bell[0] + 0.3, 0, 70, K.E.inOut);
  return { x, y, z: zi + zb, rot: 0 };
}
function drawAct(t) {
  K.cam = camAct(t); K.applyCam(ctx, 1);
  const xs = penX(t), z = zOf(t), strain = K.clamp(z / 2.1, 0, 1.2);
  K.backdrop(ctx, { lx: 1000, light: 0.55 });
  drawScreen(t);
  K.floor(ctx);
  K.spot(ctx, (xs[0] + xs[1]) / 2, PEN.y + 10, 520 + (xs[1] - xs[0]) * 0.6, K.inv(T.enter[0], T.enter[1], t) * 0.9, [1100, -260]);
  K.spot(ctx, CAT.x, CAT.y + 10, 360, 0.7, [700, -260]);
  /* piano, notes, bell on its stand */
  K.piano(ctx, PIANO.x, PIANO.y, PIANO.s, { pressed: pressedKeys(t), jar: K.inv(T.rain, T.bell[2], t) });
  drawNotes(t);
  K.stool(ctx, BELL.x, BELL.y, BELL.stoolS, 530);
  let ring = 0; T.bell.forEach((tb) => { if (t >= tb) ring = Math.max(ring, Math.exp(-(t - tb) * 3)); });
  K.bell(ctx, BELL.x, BELL.y - 140 * BELL.stoolS, BELL.s, ring, 690);
  K.coinRain(ctx, t, T.rain, { x0: 480, x1: 1700, floorY: FLOOR + 120, n: 24, seed: 640, r: 24, stagger: 0.9 });
  /* partners + spring (spring behind their bodies, between the waists) */
  const pa = penPose(t, "A"), pbz = penPose(t, "B");
  const wa = K.penguinWaist(xs[0], PEN.y, PEN.s, 1, pa), wb = K.penguinWaist(xs[1], PEN.y, PEN.s, -1, pbz);
  K.spring(ctx, wa, wb, { strain, r: 17, w: 6, coils: 8, wob: t > T.snap && t < T.hit + 0.6 ? 4 : 0 });
  K.penguin(ctx, xs[0], PEN.y, PEN.s, pa);
  K.penguin(ctx, xs[1], PEN.y, PEN.s, pbz);
  drawTags(t, xs);
  /* distance tag on the spring while it is stretched */
  const dA = K.inv(T.drift[0] + 0.6, T.drift[0] + 1, t) * (1 - K.inv(T.snap + 0.1, T.hit, t));
  if (dA > 0) K.hangTag(ctx, (wa[0] + wb[0]) / 2, wa[1] + 70, "d = " + Math.max(0, z).toFixed(1) + "σ", { a: dA, size: 30, seed: 1630, gold: z >= 2 });
  K.cat(ctx, CAT.x, CAT.y, CAT.s, catPose(t));
  drawFlipCoin(t);
  /* proscenium in front: valance, z-meter, curtains, footlights */
  K.valance(ctx, -10, { x0: -300, x1: 2220, depth: 120, swags: 6 });
  const zA = K.inv(T.curtain[0], T.curtain[1], t);
  K.gauge(ctx, GAUGE.x, GAUGE.y, GAUGE.r, z, { a: K.E.back(K.clamp(zA * 1.4 - 0.3, 0, 1), 2), glow: K.clamp((z - 1.8) * 2, 0, 1) * 0.8 });
  const open = K.E.inOut(K.inv(T.curtain[0], T.curtain[1], t));
  K.curtain(ctx, -1, open, { seed: 400 }); K.curtain(ctx, 1, open, { seed: 460 });
  K.proscenium(ctx, { x: [-90, 2010] });
  K.footlights(ctx, 1110, 120, 1800, 9, 1);
}
