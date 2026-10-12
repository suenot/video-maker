/* ============================================================
   INTRO 20 DINER: the long diner set (0 - 12.98 s).
   0.12 "Order book at level two": a level-2 menu card stands on the counter;
   1.81 Nibbs pops up and points at it; 3.41 "bids and asks in plain view":
   depth bars grow. Then:
   World strip, x -400 .. 3700: pass window + conveyor chain of trays (the
   blockchain) across the back, the mempool ticket rail in the dark corner
   (x 2380 - 3100), the counter in front. The camera dollies from Nibbs to the
   corner, Slyce clips his two tickets around the victim's order, the three
   tickets fly into the next tray and become a sandwich, Slyce takes a bite.
   ============================================================ */
const inv = K.inv, tw = K.tw, E = K.E;
const COUNTER_Y = 780, RAIL_Y = 470, BELT_Y = 340, BELT_V = 150, NIBBS_Y = 880, BOT_S = 1.0;

const camDiner = K.mkTrack([
  [0, { x: 470, y: 590, z: 1.16 }],
  [T.popUp[1], { x: 520, y: 580, z: 1.12 }],
  [T.plain, { x: 560, y: 570, z: 1.08 }],
  [T.magUp - 0.5, { x: 760, y: 560, z: 1 }],
  [T.pan[0], { x: 760, y: 560, z: 1 }],
  [T.pan[1], { x: 2740, y: 520, z: 1.06 }],
  [T.frontClip, { x: 2790, y: 500, z: 1.1 }],
  [T.fly, { x: 2850, y: 480, z: 1.12 }],
  [T.fly + 0.6, { x: 2960, y: 440, z: 1.18 }],
  [T.slap[1], { x: 2980, y: 440, z: 1.22 }],
]);

/* ---------- the chain of trays: k = 0 is the tray that gets the sandwich ---------- */
const TRAY0 = 2910 - BELT_V * (T.fly + 0.25);
const trayX = (k, t) => TRAY0 + k * 600 + BELT_V * t;
const TRAY_ITEMS = (k) => {
  const r = (i) => K.hash(k * 13 + i, 77);
  const pick = (i) => (r(i) < 0.45 ? { kind: "ticket", color: r(i + 5) < 0.5 ? P.mint : P.cherryLight, label: r(i + 9) < 0.6 ? "ETH" : "USDC" } : r(i) < 0.7 ? { kind: "coin" } : r(i) < 0.85 ? { kind: "cup" } : { kind: "plate" });
  return [pick(1), pick(2), pick(3)];
};

/* ---------- pending tickets on the rail (the mempool) ---------- */
const VICTIM = { x: 2910, color: P.mint, label: "ETH", amt: "2.0", arrow: "up", gas: 1, seed: 230 };
const FRONT = { x: 2780, color: P.cherry, label: "ETH", amt: "9.5", arrow: "up", gas: 3, seed: 240, t: T.frontClip };
const BACK = { x: 3040, color: P.cherry, label: "ETH", amt: "9.5", arrow: "down", gas: 0, seed: 250, t: T.backClip };
const OTHERS = [
  { x: 2640, color: P.mint, label: "USDC", amt: "500", arrow: "down", gas: 1, seed: 210 },
  { x: 3170, color: P.mint, label: "ETH", amt: "0.4", arrow: "down", gas: 2, seed: 220 },
  { x: 3300, color: P.mint, label: "USDC", amt: "80", arrow: "up", gas: 1, seed: 225 },
];
const SANDWICH = [FRONT, VICTIM, BACK];
const SLOT = [-84, 0, 84]; /* slot x in the tray, left to right */

function railTicket(tk, t, extra) {
  const sw = Math.sin(t * 2.3 + tk.seed) * 0.04 + (extra || 0);
  K.ticket(ctx, tk.x, RAIL_Y + 6, 0.92, { color: tk.color, label: tk.label, amt: tk.amt, arrow: tk.arrow, gas: tk.gas, seed: tk.seed, tilt: sw, a: tk.t ? inv(tk.t, tk.t + 0.35, t) : 1 });
}
function darkness(t) { return 0.18 + 0.52 * inv(T.dim[0], T.dim[1], t); }
function lampOn(t) {
  if (t < T.dim[0]) return 1;
  if (t > T.dim[1]) return 0.08;
  return K.hash(Math.floor(t * 14), 5) > 0.5 ? 0.9 : 0.1; /* flicker, stepped at 14 Hz */
}

/* ---------- Nibbs in the diner ---------- */
function nibbsDiner(t) {
  const pop = inv(T.popUp[0], T.popUp[1], t), dash = inv(T.pan[0] + 0.05, T.pan[1] - 0.15, t);
  const x = K.lerp(640, 2150, E.inOut(dash)), down = (1 - E.back(pop, 1.6)) * 340;
  const land = t - T.popUp[1], bounce = 0.08 * K.pulse(t, 1, 6);
  const st = { blink: K.blinkAt(t, 3), mouth: "smile", look: [0, 0], cheeks: 0.25 };
  st.squash = pop < 1 ? -0.3 * Math.sin(pop * Math.PI) : land < 0.35 ? 0.32 * Math.exp(-land * 9) * Math.cos(land * 22) : bounce;
  st.pawL = { x: -78, y: -40 }; st.pawR = { x: 78, y: -40 };
  if (t > T.popUp[1] && t < T.magUp - 0.25) { /* presents the order book on the counter */
    const pt = E.back(inv(T.popUp[1], T.popUp[1] + 0.35, t), 2), op = E.back(inv(T.plain, T.plain + 0.35, t), 2);
    st.look = [-1, 0.2]; st.mouth = "grin";
    st.pawL = { x: K.lerp(-78, -110, pt), y: K.lerp(-40, -170, pt) + 14 * K.pulse(t, 1, 6) };
    if (op > 0) { st.pawR = { x: K.lerp(78, 110, op), y: K.lerp(-40, -160, op) }; st.look = [-0.4, 0]; st.cheeks = 0.7; }
    if (t > T.level2 && t < T.level2 + 0.4) { st.eyeUp = 4; st.mouth = "open"; }
  }
  if (t > T.magUp - 0.25) {
    const u = E.back(inv(T.magUp - 0.25, T.magUp + 0.1, t), 2);
    st.hold = "magnifier"; st.magS = 1.35; st.magAng = K.lerp(40, -18, u); st.pawR = { x: K.lerp(70, 104, u), y: K.lerp(-40, -150, u) };
    st.look = [K.lerp(0, 1, u), -0.2];
  }
  if (dash > 0 && dash < 1) { /* cartoon dash: lean in, toque lags, speed lines */
    const sp = Math.sin(dash * Math.PI);
    st.lean = 18 * sp; st.toqueTip = -16 * sp; st.squash = -0.12 * sp; st.mouth = "o";
    for (let i = 0; i < 5; i++) { const y = 520 + i * 52, l = 160 + 120 * K.hash(i, K.bf); K.line(ctx, [[x - 120 - l, y], [x - 120, y]], { stroke: P.ink, w: 6, boil: 0.5, seed: 30 + i, alpha: sp }); }
  }
  if (t >= T.pan[1] - 0.15) { /* in the corner: magnifier on the rail */
    const sway = Math.sin(t * 2.2) * 6;
    st.hold = "magnifier"; st.magS = 1.5; st.magAng = -24 + sway * 0.4; st.pawR = { x: 100, y: -160 + sway };
    st.look = [1, 0.2]; st.brow = 0.3; st.whisk = 1.6;
  }
  if (t > T.frontClip) { st.brow = -0.6; st.mouth = "frown"; }
  if (t > T.gasp) {
    const g = inv(T.gasp, T.gasp + 0.3, t);
    st.exclaim = g; st.eyeUp = 6 * g; st.mouth = "open"; st.brow = 1.3; st.cheeks = 0.6; st.squash = -0.25 * Math.exp(-(t - T.gasp) * 6);
  }
  if (t > T.slap[0]) { /* yanks the menu out: paw swings at the camera */
    const u = inv(T.slap[0], T.slap[1], t);
    st.brow = -1; st.mouth = "grin"; st.exclaim = 0; st.eyeUp = 0;
    st.pawL = { x: K.lerp(-78, -20, u), y: K.lerp(-40, -200, u) };
  }
  ctx.save(); ctx.beginPath(); ctx.rect(-1000, -1000, 6000, COUNTER_Y + 1040); ctx.clip();
  K.hamster(ctx, x, NIBBS_Y + down, 1.6, st);
  ctx.restore();
  return { x, y: NIBBS_Y + down };
}

/* ---------- Slyce in the diner. Returns true when he stands on the counter (draw in front) ---------- */
function slyceDiner(t, front) {
  if (t < T.eyes - 0.1) return;
  const hop = inv(T.botUp, T.botUp + 0.42, t);
  const onTop = t >= T.botUp + 0.25;
  if (onTop !== front) return;
  const st = { glow: K.lerp(0.9, 0.5, inv(T.botUp, T.botUp + 1, t)), look: Math.sin(t * 3.1) * 0.8, grin: 0.6, seed: 900 };
  let x = 3160, y = COUNTER_Y + 105;
  if (t >= T.botUp) {
    const arc = Math.sin(Math.min(1, hop) * Math.PI) * 170;
    y = K.lerp(COUNTER_Y + 105, COUNTER_Y, E.out3(hop)) - arc;
    st.squash = hop < 0.05 ? 0.25 : hop >= 1 ? 0.3 * Math.exp(-(t - T.botUp - 0.42) * 8) : -0.2;
  }
  /* sneak left to the front slot, clip, then right to the back slot */
  const walk1 = inv(T.botUp + 0.45, T.frontClip - 0.12, t), walk2 = inv(T.frontClip + 0.3, T.backClip - 0.12, t);
  if (t >= T.botUp + 0.42) {
    x = K.lerp(3160, 2860, E.inOut(walk1));
    x = K.lerp(x, 3000, E.inOut(walk2));
    if ((walk1 > 0 && walk1 < 1) || (walk2 > 0 && walk2 < 1)) { st.walk = t * 15; st.lean = -8; y = COUNTER_Y - Math.abs(Math.sin(t * 15)) * 8; }
  }
  const s = BOT_S, toL = (wx, wy) => ({ x: (wx - x) / s, y: (wy - y) / s });
  /* clip the front ticket with the left glove, the back ticket with the right */
  const reach1 = inv(T.frontClip - 0.3, T.frontClip, t) * (1 - inv(T.frontClip + 0.15, T.frontClip + 0.4, t));
  const reach2 = inv(T.backClip - 0.3, T.backClip, t) * (1 - inv(T.backClip + 0.15, T.backClip + 0.4, t));
  st.armL = { x: K.lerp(-110, toL(FRONT.x, RAIL_Y + 10).x, reach1), y: K.lerp(-150, toL(FRONT.x, RAIL_Y + 10).y, reach1) };
  st.armR = { x: K.lerp(110, toL(BACK.x, RAIL_Y + 10).x, reach2), y: K.lerp(-150, toL(BACK.x, RAIL_Y + 10).y, reach2) };
  if (t > T.backClip + 0.4 && t < T.fly + 0.3) { const r = Math.sin(t * 18) * 14; st.armL = { x: -30 + r, y: -175 }; st.armR = { x: 30 - r, y: -170 }; st.grin = 1; st.glow = 0.9; } /* rubs his gloves */
  /* the bite: big hop up to the tray, chomp at the apex */
  const j = inv(T.bite - 0.42, T.bite + 0.45, t);
  if (j > 0 && j < 1) {
    const tx = trayX(0, T.bite);
    x = K.lerp(3000, tx - 10, Math.min(1, j * 2.2));
    y = COUNTER_Y - Math.sin(j * Math.PI) * 330; st.squash = -0.25 * Math.sin(j * Math.PI); st.grin = 1; st.armL = { x: -130, y: -260 }; st.armR = { x: 130, y: -260 };
  }
  if (t >= T.bite + 0.45) { x = trayX(0, T.bite) - 10; st.grin = 1; st.armL = { x: -60, y: -120 }; st.armR = { x: 60, y: -120 }; st.squash = 0.3 * Math.exp(-(t - T.bite - 0.45) * 8); st.look = -0.9; }
  K.sandwichBot(ctx, x, y, s, st);
  K.botAt = { x, y };
}

/* ---------- tray contents for the sandwich tray ---------- */
function sandwichTray(t, x) {
  const fly = (i) => inv(T.fly + i * BEAT / 4, T.fly + i * BEAT / 4 + 0.42, t);
  K.block(ctx, x, BELT_Y, 1, { num: "#19 204 118", items: [], seed: 160, hot: inv(T.fly + 0.5, T.fly + 0.9, t) * (1 - inv(T.bite + 0.3, T.bite + 0.8, t)) });
  SANDWICH.forEach((tk, i) => {
    const u = fly(i); if (u < 1) return;
    const land = t - (T.fly + i * BEAT / 4 + 0.42), sq = 0.18 * Math.exp(-land * 10);
    const sx = x + SLOT[i] * (i === 1 ? 1 : 0.9), sy = BELT_Y - 88;
    ctx.save(); ctx.translate(sx, sy); ctx.scale(1 + sq, 1 - sq);
    if (i === 1) K.burger(ctx, 0, 6, 0.78, 170, inv(T.bite - 0.04, T.bite + 0.08, t));
    else { ctx.rotate(i === 0 ? -Math.PI / 2 : Math.PI / 2); K.breadSlice(ctx, 0, 0, 0.82, P.cherry, 180 + i); }
    ctx.restore();
  });
}
function flyingTickets(t, x0) {
  SANDWICH.forEach((tk, i) => {
    const u = inv(T.fly + i * BEAT / 4, T.fly + i * BEAT / 4 + 0.42, t);
    if (u <= 0 || u >= 1) return;
    const tx = trayX(0, t) + SLOT[i], ty = BELT_Y - 150, e = E.inOut(u);
    const x = K.lerp(tk.x, tx, e), y = K.lerp(RAIL_Y + 6, ty, e) - Math.sin(u * Math.PI) * 120;
    K.ticket(ctx, x, y, K.lerp(0.92, 0.6, e), { color: tk.color, label: tk.label, amt: tk.amt, arrow: tk.arrow, gas: tk.gas, seed: tk.seed, tilt: u * (i - 1) * 1.6, clip: false });
  });
}

/* ---------- the whole diner frame ---------- */
function drawDiner(t) {
  K.cam = Object.assign({ rot: 0 }, camDiner(t));
  if (t > T.bite && t < T.bite + 0.3) { const k = 1 - inv(T.bite, T.bite + 0.3, t); K.cam.x += K.hs(K.bf, 3) * 10 * k; K.cam.y += K.hs(K.bf, 4) * 8 * k; } /* chomp shake */
  K.applyCam(ctx, 1);
  const nb = drawDinerWorld(t, true);
  /* magnifier lens: the world again, 1.7x, inside the glass (no Nibbs in it) */
  if (t >= T.pan[1] - 0.15 && t < T.slap[0] && K.lens) {
    const L = K.lens, c = K.cam, m = 1.7, z2 = c.z * m;
    const wx = c.x + (L.x - 960) / c.z, wy = c.y + (L.y - 540) / c.z;
    const saved = K.cam;
    K.screen(ctx); ctx.save(); ctx.beginPath(); ctx.arc(L.x, L.y, L.r * 0.97, 0, K.TAU); ctx.clip();
    K.cam = { x: wx - (L.x - 960) / z2, y: wy - (L.y - 540) / z2, z: z2, rot: 0 };
    K.applyCam(ctx, 1); drawDinerWorld(t, false);
    ctx.restore(); K.cam = saved;
    K.screen(ctx); ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = "#cdeff6"; ctx.beginPath(); ctx.arc(L.x, L.y, L.r * 0.97, 0, K.TAU); ctx.fill(); ctx.restore();
    K.screen(ctx); K.line(ctx, [[L.x - L.r * 0.55, L.y - L.r * 0.2], [L.x - L.r * 0.35, L.y - L.r * 0.55], [L.x - L.r * 0.05, L.y - L.r * 0.7]], { stroke: "#ffffff", w: 8, boil: 0.5, seed: 77, alpha: 0.85 });
    K.lensHand = L;
  }
  return nb;
}
function drawDinerWorld(t, full) {
  const dark = darkness(t);
  K.wall(ctx, -500, 3800, -300, COUNTER_Y + 20, { seed: 3, wainscot: 0.3 });
  /* the dark corner: night wash + dot screen, soft edge */
  ctx.save();
  const g = ctx.createLinearGradient(2050, 0, 2420, 0); g.addColorStop(0, "rgba(20,31,49,0)"); g.addColorStop(1, `rgba(18,28,58,${dark.toFixed(3)})`);
  ctx.fillStyle = g; ctx.fillRect(2050, -300, 1800, COUNTER_Y + 330);
  ctx.globalAlpha = Math.min(1, dark * 1.6); ctx.fillStyle = K.dotPattern(ctx, "rgba(10,14,30,0.35)", 3, 12); ctx.fillRect(2420, -300, 1400, COUNTER_Y + 330);
  ctx.restore();
  K.passWindow(ctx, 100, 20, 1200, 230, 30);
  K.window(ctx, 1560, 40, 420, 210, 35);
  /* chain of trays */
  K.conveyor(ctx, -500, 3800, BELT_Y, BELT_V * t, { seed: 60 });
  for (let k = -7; k <= 2; k++) {
    const x = trayX(k, t); if (x < -600 || x > 3900) continue;
    if (k === 0) { if (t >= T.fly - 1.5) sandwichTray(t, x); else K.block(ctx, x, BELT_Y, 1, { num: "#19 204 118", items: [], seed: 160 }); continue; }
    K.block(ctx, x, BELT_Y, 1, { num: "#19 204 " + (118 - k), items: TRAY_ITEMS(k), seed: 100 + ((k + 20) % 9) * 7, seal: x > 3000 ? 1 : 0 });
  }
  /* lamps */
  K.lamp(ctx, 420, -40, 0.9, 1, 50); K.lamp(ctx, 1420, -40, 0.9, 1, 51); K.lamp(ctx, 2750, -40, 0.9, lampOn(t), 52);
  /* mempool rail */
  K.ticketRail(ctx, 2560, 3380, RAIL_Y, 300);
  OTHERS.forEach((tk) => railTicket(tk, t));
  SANDWICH.forEach((tk, i) => { if (inv(T.fly + i * BEAT / 4, T.fly + i * BEAT / 4 + 0.42, t) <= 0) railTicket(tk, t, tk.t && t - tk.t < 0.4 ? Math.sin((t - tk.t) * 30) * 0.12 * (1 - (t - tk.t) / 0.4) : 0); });
  /* Slyce behind the counter (peeking), the counter, Slyce on top */
  slyceDiner(t, false);
  const nb = full ? nibbsDiner(t) : null;
  K.counter(ctx, -500, 3800, COUNTER_Y, 290, { seed: 40 });
  K.checkerFloor(ctx, -500, 3800, COUNTER_Y + 290, COUNTER_Y + 700, { seed: 9 });
  K.coffee(ctx, 1180, COUNTER_Y + 16, 0.8, 410);
  drawL2(t);
  if (dark > 0.2) { ctx.save(); ctx.globalAlpha = (dark - 0.12) * 0.8; ctx.fillStyle = P.nightDark; ctx.fillRect(2420, COUNTER_Y, 1400, 320); ctx.restore(); }
  slyceDiner(t, true);
  flyingTickets(t);
  /* the mark: -1.2 % tag and coins to Slyce */
  if (t > T.bite - 0.05) {
    const tx = trayX(0, t);
    K.burst(ctx, tx + 90, BELT_Y - 170, 80 * E.back(inv(T.bite - 0.05, T.bite + 0.15, t), 2) * (1 - inv(T.bite + 0.25, T.bite + 0.45, t)), { seed: 610, color: P.mustard });
    K.tag(ctx, tx + 200, BELT_Y - 210, "-1.2 %", { a: inv(T.bite + 0.08, T.bite + 0.45, t), seed: 19, size: 40, fill: P.cherry, color: P.cream });
    for (let i = 0; i < 3; i++) {
      const u = inv(T.bite + 0.1 + i * 0.1, T.bite + 0.55 + i * 0.1, t); if (u <= 0 || u >= 1) continue;
      const bx = trayX(0, T.bite) - 10;
      K.coin(ctx, K.lerp(tx + 20, bx - 40 + i * 40, u), K.lerp(BELT_Y - 90, COUNTER_Y - 160, u) - Math.sin(u * Math.PI) * 140, 22, { color: P.mustard, seed: 630 + i });
    }
  }
  if (full) { K.stool(ctx, 360, 1150, 1, 70); K.stool(ctx, 1060, 1150, 1, 71); K.stool(ctx, 1760, 1150, 1, 72); K.stool(ctx, 2460, 1150, 1, 73); K.stool(ctx, 3160, 1150, 1, 74); }
  return nb;
}

/* ---------- the level-2 menu card standing on the counter (opening) ---------- */
const L2_ROWS = [["USDC", "ETH"], ["2 012", "4.1"], ["2 008", "2.5"], ["2 004", "3.0"], ["2 001", "6.2"]];
function drawL2(t) {
  const pop = inv(T.l2 - 0.1, T.l2 + 0.35, t); if (pop <= 0) return;
  const shown = inv(T.l2 + BEAT, T.l2 + BEAT * 4, t) * 4 / 5 + 1 / 5;
  const bars = [0, 0.66, 0.4, 0.48, 1].map((b, i) => b * E.out3(inv(T.plain + (i - 1) * BEAT / 2, T.plain + (i - 1) * BEAT / 2 + 0.5, t)));
  const x = 270, y = COUNTER_Y - 230;
  K.menu(ctx, x, y, [190, 140], L2_ROWS, { a: pop, size: 34, rowH: 54, seed: 22, reveal: shown, rowColors: [null, P.ask, P.ask, P.bid, P.bid], bars, barColors: [null, P.cherryLight, P.cherryLight, P.mint, P.mint], title: "ETH · USDC" });
  /* "L2" tags on the outer rows */
  const top = y - (5 * 54 + 60 + 90) / 2 + 30 + 90;
  [1, 4].forEach((ri, k) => K.tag(ctx, x - 260, top + ri * 54 + 27, "L2", { a: inv(T.level2 + k * BEAT / 2, T.level2 + k * BEAT / 2 + 0.35, t), seed: 23 + k, size: 30, hot: true }));
  [2, 3].forEach((ri, k) => K.tag(ctx, x - 260, top + ri * 54 + 27, "L1", { a: inv(T.level2 + 0.1 + k * BEAT / 2, T.level2 + 0.45 + k * BEAT / 2, t), seed: 25 + k, size: 26 }));
}
