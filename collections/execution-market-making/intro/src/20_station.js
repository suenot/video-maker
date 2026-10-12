/* ============================================================
   INTRO 20 STATION: the yard (0 - 9.1 s), one continuous world.
   0.00  close on Mr. Tick and his pocket watch; the giant crate behind
   1.83  he looks up: "!" and the camera pulls back to show its size
   3.60  "where the clockwork turns": the tower clock ticks on every beat
   5.43  wide yard; "a big order splits": cut lines, then 8 slices hop onto 8 wagons
   7.24  whip pan to the bridge; wagons leave a quarter beat apart, tiny ripples,
         the price flap moves one tick only ("the price won't slide")
   ============================================================ */
const camYard = K.mkTrack([
  [0, { x: 540, y: 650, z: 1.3 }],
  [T.pull[0], { x: 590, y: 640, z: 1.38 }],
  [T.pull[1], { x: 980, y: 600, z: 0.86 }],
  [T.camClock[0], { x: 1010, y: 592, z: 0.86 }],
  [T.camClock[1], { x: 1240, y: 505, z: 0.92 }],
  [T.camWide[0], { x: 1270, y: 515, z: 0.92 }],
  [T.camWide[1], { x: 1640, y: 560, z: 0.74 }],
  [T.whip[0], { x: 1680, y: 562, z: 0.75 }],
  [T.whip[1], { x: 3820, y: 700, z: 1.08 }],
  [T.flap1[1], { x: 3880, y: 700, z: 1.1 }],
]);
const WHIP_MID = (T.whip[0] + T.whip[1]) / 2;
const TOWER = { x: 1790, s: 0.95 };

/* wagon i departure: front wagon (i = 7) first, a quarter beat apart */
const departAt = (i) => T.depart + (N_WAG - 1 - i) * BEAT * 0.25;
function wagonX(i, t) {
  const x0 = WAG_X0 + i * WAG_DX, tau = t - departAt(i);
  if (tau <= 0) return x0;
  const v = 1500, ramp = 0.5;
  return x0 + (tau < ramp ? (v * tau * tau) / (2 * ramp) : (v * ramp) / 2 + v * (tau - ramp));
}
/* time wagon i passes the middle of the pond (solved numerically once) */
const PASS = [];
for (let i = 0; i < N_WAG; i++) { let tt = departAt(i); while (wagonX(i, tt) < POND.x && tt < DUR) tt += 0.005; PASS.push(tt); }

/* slice i hop: start time and progress */
const hopAt = (i) => T.hops + i * BEAT * 0.25;
const HOP_D = 0.42;

/* tower clock: the minute hand jumps on every beat from 3.60 s */
function clockMinute(t) {
  const b = (t - T.clock) / BEAT;
  if (b < 0) return 52;
  const k = Math.floor(b), f = b - k;
  return 52 + k + K.E.back(K.clamp(f / 0.35, 0, 1), 3);
}

/* teardrop poplar (mid-century tree) */
function poplar(c, x, y, h, seed, col) {
  K.line(c, [[x, y], [x, y - h * 0.3]], { w: 4, seed: seed + 1, key: P.woodDark });
  const pts = [];
  for (let i = 0; i <= 16; i++) { const a = (i / 16) * K.TAU, sn = Math.sin(a), cs = Math.cos(a); pts.push([x + cs * h * 0.17 * (1 - 0.35 * Math.max(0, -sn)), y - h * 0.62 + sn * h * 0.42 - (sn < 0 ? -sn * h * 0.12 : 0)]); }
  K.shape(c, pts, { fill: col || P.tealDark, w: 2.5, smooth: true, seed, shade: { color: P.ink, dx: h * 0.06, dy: 0 }, alpha: 1 });
}

function yardBackground(c, t) {
  K.applyCam(c, 0.22);
  K.sky(c, { horizon: 760, sun: [1250, 230], sunR: 120 });
  K.cloud(c, 380, 160, 300, 11); K.cloud(c, 1620, 110, 240, 14); K.cloud(c, 2500, 210, 280, 17);
  K.applyCam(c, 0.45);
  K.hills(c, -1400, 4200, 780, { h: 210, color: P.hillFar, seed: 5, n: 9, kind: "tri", tone: false, w: 2 });
  K.applyCam(c, 0.72);
  K.hills(c, -1400, 5200, 830, { h: 150, color: P.hillMid, seed: 8, n: 10 });
  for (let i = 0; i < 9; i++) poplar(c, -60 + i * 610 + 120 * K.hash(i, 3), 830, 210 + 60 * K.hash(i, 4), 300 + i, i % 3 ? P.tealDark : P.teal);
}

function parentCar(c, t, crateA) {
  const x = CRATE.x;
  [-230, -130, 130, 230].forEach((dx, i) => K.wheel(c, x + dx, RAIL - 22, 22, 0, 900 + i * 3));
  K.shape(c, K.rectPts(x - 320, RAIL - 58, 640, 26, 6), { fill: P.tomato, w: 3, seed: 920, shade: { color: P.tomatoDark, dx: 0, dy: -10 } });
  const w = CRATE.w, h = CRATE.h, y = RAIL - 58;
  const first = hopAt(0);
  if (t < first) {
    const sliceU = K.inv(T.slice[0], T.slice[1], t);
    /* the whole crate shivers once when the last cut lands */
    const jit = Math.sin((t - T.slice[1]) * 60) * 4 * K.inv(T.slice[1] + 0.25, T.slice[1], t) * (t > T.slice[1] ? 1 : 0);
    K.crate(c, x + jit, y, w, h, { label: ORDER, labelSize: 112, seed: 930, slices: 4, rows: 2, sliceU });
  }
  return { x, y, w, h };
}

function drawPieces(c, t, car) {
  /* 4 x 2 grid of pieces; top row hops first, left to right */
  const pw = car.w / 4, ph = car.h / 2;
  if (t < hopAt(0)) return;
  for (let i = 0; i < N_WAG; i++) {
    const t0 = hopAt(i), u = K.inv(t0, t0 + HOP_D, t);
    if (u >= 1) continue; /* landed: the wagon draws its own crate */
    const col = i % 4, row = Math.floor(i / 4);
    const sx = car.x - car.w / 2 + pw * (col + 0.5), sy = car.y - (1 - row) * ph;
    const tx = WAG_X0 + i * WAG_DX, ty = RAIL - 58 * WAG_S;
    const e = K.E.inOut(u), x = K.lerp(sx, tx, e), arc = (220 + 26 * i) * Math.sin(Math.PI * u);
    const w = K.lerp(pw - 6, 140, K.E.out3(u)), h = K.lerp(ph - 6, 84, K.E.out3(u));
    c.save(); c.translate(x, K.lerp(sy, ty, e) - arc); c.rotate(Math.sin(Math.PI * u) * 0.5 * (i % 2 ? 1 : -1));
    K.crate(c, 0, 0, w, h, { seed: 940 + i * 3, color: P.mustard, label: u > 0.55 ? CHILD : "", labelSize: 40 });
    c.restore();
  }
}

function drawWagons(c, t) {
  for (let i = 0; i < N_WAG; i++) {
    const x = wagonX(i, t), landed = t >= hopAt(i) + HOP_D;
    const bump = landed ? Math.sin(K.clamp((t - hopAt(i) - HOP_D) / 0.25, 0, 1) * Math.PI) * 7 : 0;
    const keyRot = t * 6 + i; /* wind-up key: these are clockwork wagons */
    K.wagon(c, x, RAIL, WAG_S, {
      roll: x - WAG_X0, seed: 1000 + i * 20, bob: bump + (x > WAG_X0 + i * WAG_DX + 1 ? Math.sin(t * 22 + i) * 1.2 : 0),
      color: i % 2 ? P.teal : P.tealLight, shade: P.tealDark,
      load: (cc) => {
        /* wind-up key on the wagon side */
        cc.save(); cc.translate(-70, -46); cc.rotate(keyRot);
        K.shape(cc, [[0, -4], [-22, -14], [-22, 14], [0, 4], [22, 14], [22, -14]], { fill: P.mustard, w: 2, seed: 1010 + i, boil: 0.3 });
        cc.restore();
        if (landed) K.crate(cc, 0, -58, 140, 84, { label: CHILD, labelSize: 40, seed: 1015 + i * 3 });
      },
    });
  }
}

function yardForeground(c, t) {
  /* ground, with the pond cut under the bridge */
  K.shape(c, [[-1600, RAIL + 20], [6200, RAIL + 20], [6200, 1900], [-1600, 1900]], { fill: P.hillNear, w: 3, seed: 860, tone: { color: P.ink, gap: 12, r: 0.6, r2: 2.6, dir: Math.PI / 2, alpha: 0.2 } });
  K.shape(c, [[POND.x - POND.w / 2 - 40, RAIL + 18], [POND.x + POND.w / 2 + 40, RAIL + 18], [POND.x + POND.w / 2 - 20, RAIL + 210], [POND.x - POND.w / 2 + 20, RAIL + 210]], { fill: P.creamDeep, w: 3, seed: 862 });
  K.pond(c, POND.x, RAIL + 130, POND.w, 150, 864);
  /* ripples and tiny splashes where each wagon crosses */
  PASS.forEach((tp, i) => {
    K.ripple(c, POND.x + (i % 3 - 1) * 60, RAIL + 128, 120, (t - tp) / 1.1, 870 + i);
    K.splash(c, POND.x + (i % 3 - 1) * 60, RAIL + 124, 34, (t - tp) / 0.6, 880 + i);
  });
  /* platform + lamps (left), clock tower behind */
  K.clockTower(c, TOWER.x, PLAT_Y + 4, TOWER.s, { hour: 9 + clockMinute(t) / 60, minute: clockMinute(t), gearRot: t * 0.7 + 2.2 * K.ss(T.clock, T.clock + 1.8, t), seed: 40 });
  K.platform(c, -900, 880, PLAT_Y, { h: 84 });
  K.lampPost(c, -140, PLAT_Y, 250, 1100); K.lampPost(c, 780, PLAT_Y, 250, 1104);
  K.track(c, -1600, 6200, RAIL);
  /* bridge: two teal truss girders and stone piers */
  [POND.x - 200, POND.x + 200].forEach((px, i) => K.shape(c, K.rectPts(px - 26, RAIL + 20, 52, 150, 2), { fill: P.creamShade, w: 3, seed: 890 + i, tone: { color: P.ink, gap: 8, r: 1.2, r2: 1.2, alpha: 0.3 } }));
  const bx0 = POND.x - POND.w / 2 - 40, bx1 = POND.x + POND.w / 2 + 40;
  K.shape(c, K.rectPts(bx0, RAIL + 8, bx1 - bx0, 24, 6), { fill: P.teal, w: 3, seed: 895 });
  c.save(); c.strokeStyle = P.ink; c.lineWidth = K.lw(c, 3); c.beginPath();
  for (let x = bx0; x < bx1 - 10; x += 80) { c.moveTo(x, RAIL + 32); c.lineTo(x + 40, RAIL + 60); c.lineTo(x + 80, RAIL + 32); }
  c.moveTo(bx0, RAIL + 60); c.lineTo(bx1, RAIL + 60); c.stroke(); c.restore();
}

/* clock-tick sparkles on the beats of bar 2 */
function tickStars(c, t) {
  const cx = TOWER.x, cy = PLAT_Y + 4 - (640 - 170) * TOWER.s;
  for (let k = 0; k < 4; k++) {
    const d = t - (T.clock + k * BEAT); if (d < 0 || d > 0.4) continue;
    const a = (k % 2 ? 0.25 : -0.25) * Math.PI + (k > 1 ? Math.PI : 0), r = 150 + 90 * d;
    K.star(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, 34 * (1 - d / 0.4), { seed: 1200 + k, rot: d * 3 });
  }
}

function mouseYardPose(t) {
  const bl = K.blinkAt(t, 9), pulse = K.pulse(t, 1, 6);
  const st = { blink: bl, squash: 0.06 * pulse, seed: 700 };
  if (t < T.camClock[0]) {
    /* watch close-up, then the look up */
    const lid = K.inv(T.lid, T.lid + 0.3, t) * (1 - K.inv(T.lidShut, T.lidShut + 0.12, t));
    st.handL = { x: -58, y: -122 + 4 * pulse, hold: "watch", lid };
    st.handR = { x: 66, y: -80 };
    st.look = [-0.5, 0.9];
    st.mouth = "smile";
    const u = t - T.lookUp;
    if (u > -0.18 && u < 0) st.squash = 0.28 * K.inv(-0.18, -0.05, u); /* anticipation */
    if (u >= 0) {
      st.blink = 0; st.look = [1, -1]; st.exclaim = K.inv(0, 0.3, u); st.eyeUp = 6 * (1 - K.inv(0.6, 1.2, u));
      st.squash = -0.25 * Math.exp(-u * 5) * Math.cos(u * 16); st.brow = 1.3; st.mouth = u < 0.7 ? "o" : "grin"; st.ear = Math.exp(-u * 4) * Math.sin(u * 30);
      if (u > 0.55) { st.exclaim = 1 - K.inv(1.1, 1.3, u); st.handR = { x: 120, y: -200 - 6 * pulse, hold: "point" }; }
    }
  } else if (t < T.camWide[0]) {
    /* compares his watch with the tower clock, nodding on the beat */
    st.handL = { x: -70, y: -230 + 8 * pulse, hold: "watch", lid: 1 };
    st.handR = { x: 64, y: -70 };
    st.look = [0.9, -1]; st.mouth = "smile"; st.brow = 0.5;
    st.lean = 3 * Math.sin((t - T.clock) / BEAT * Math.PI);
  } else {
    /* whistle on the downbeat, then the flag for each hop */
    const w = K.inv(T.camWide[1] - 0.3, T.camWide[1], t) * (1 - K.inv(T.slice[0] + 0.1, T.slice[0] + 0.3, t));
    st.handL = { x: -66, y: -74 };
    if (w > 0) { st.handR = { x: 30, y: -172, hold: "whistle", wAng: Math.PI * 1.04 }; st.mouth = "whistle"; st.puff = w; st.look = [0.6, 0]; st.blink = 0; }
    else {
      const b = (t - T.hops) / (BEAT * 0.25), f = b - Math.floor(b), wave = b > 0 && b < 8 ? Math.sin(f * Math.PI) : 0;
      st.handR = { x: 74, y: -190 + 40 * wave, hold: "flag" };
      st.look = [1, -0.3]; st.mouth = t > T.hops ? "grin" : "smile";
      st.squash = 0.08 * wave;
    }
  }
  return st;
}

function mouseBridgePose(t) {
  const bl = K.blinkAt(t, 13), pulse = K.pulse(t, 1, 6);
  const ok = K.inv(T.priceFlip + 0.1, T.priceFlip + 0.35, t);
  return {
    blink: bl, squash: 0.06 * pulse + 0.15 * Math.sin(ok * Math.PI), seed: 700,
    handL: { x: -60, y: -160 + 6 * pulse, hold: "watch", lid: 1 },
    handR: ok > 0 ? { x: 92, y: -150 - 40 * K.E.back(ok, 2), hold: "thumb" } : { x: 66, y: -70 },
    look: ok > 0 ? [-0.4, -0.6] : [-1, 0.2], mouth: ok > 0 ? "grin" : "smile", brow: ok > 0 ? 0.8 : 0,
  };
}

function drawYard(c, t) {
  const cam = camYard(t);
  K.begin(c, t, { x: cam.x, y: cam.y, z: cam.z, rot: 0 });
  yardBackground(c, t);
  K.applyCam(c, 1);
  yardForeground(c, t);
  if (t >= T.clock - 0.1 && t < T.clock + 4 * BEAT) tickStars(c, t);
  const car = parentCar(c, t);
  drawWagons(c, t);
  drawPieces(c, t, car);
  /* "8 x 1 250" luggage tag once the last slice lands */
  const tagA = K.inv(hopAt(N_WAG - 1) + HOP_D, hopAt(N_WAG - 1) + HOP_D + 0.35, t) * (1 - K.inv(T.whip[0], T.whip[0] + 0.2, t));
  if (tagA > 0) K.tag(c, WAG_X0 + 3.5 * WAG_DX, RAIL - 280, "8 × " + CHILD, { a: tagA, size: 50, color: P.mustardLight });
  /* price flap over the pond: only the last digit moves */
  const fa = K.inv(T.whip[1] - 0.45, T.whip[1] - 0.05, t);
  if (fa > 0) {
    [POND.x - 150, POND.x + 150].forEach((px, i) => K.shape(c, K.rectPts(px - 7, 440, 14, RAIL - 440, 2), { fill: P.ink, w: 2, seed: 1300 + i, reg: 0 }));
    K.flap(c, POND.x, 470, "100.01", { a: fa, h: 110, prev: "100.00", flip: K.inv(T.priceFlip, T.priceFlip + 0.35, t), seed: 1310, colors: [null, null, null, null, null, P.mustardLight] });
  }
  /* Mr. Tick */
  if (t < WHIP_MID) K.mouse(c, 520, PLAT_Y, MOUSE_S, mouseYardPose(t));
  else K.mouse(c, BRIDGE_MOUSE_X, RAIL + 74, MOUSE_S, mouseBridgePose(t));
  /* whip-pan speed lines */
  const wv = Math.sin(Math.PI * K.inv(T.whip[0], T.whip[1], t));
  if (wv > 0.05) {
    K.screen(c); c.save(); c.globalAlpha = 0.5 * wv; c.strokeStyle = P.cream; c.lineCap = "round";
    for (let i = 0; i < 14; i++) { const y = 80 + i * 70 + K.hash(i, K.bf) * 30, x = K.hash(i + 30, K.bf) * 1920, L = 300 + 500 * K.hash(i + 60, 5); c.lineWidth = 4 + 6 * K.hash(i, 9); c.beginPath(); c.moveTo(x - L, y); c.lineTo(x, y); c.stroke(); }
    c.restore();
  }
}
