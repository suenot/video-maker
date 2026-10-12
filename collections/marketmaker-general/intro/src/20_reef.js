/* ============================================================
   INTRO 20 REEF: the Coral Exchange set, fish traffic, transitions.
   World: sand floor at y ~ 1000, Otto's clam desk at (960, 940),
   exchange towers from x -1300 to 3300. Layers (parallax):
     far 0.35 (muted towers), mid 0.65 (towers with tickers, kelp),
     near 1.0 (sand, desk, corals), front 1.25 (kelp blades, bubbles).
   ============================================================ */
const DESK = { x: 960, y: 945, s: 1.08 };
const OCT = { x: 960, y: 905, s: 1 };
/* world point -> Otto's local arm space */
const toLocal = (wx, wy, o) => ({ x: (wx - (o || OCT).x) / (o || OCT).s, y: (wy - (o || OCT).y) / (o || OCT).s });

const FAR = [
  [-1100, 300, 560], [-760, 240, 420], [-420, 280, 640], [-60, 220, 380], [420, 260, 520], [1500, 230, 600], [1900, 280, 440], [2350, 250, 560], [2800, 300, 470], [3200, 240, 620],
];
const MID = [ /* x, w, h, colour key, ticker */
  [-900, 210, 620, "coral", ["101.20", "99.85", "+1.2%"]],
  [-520, 180, 500, "fan", ["42.10", "42.12"]],
  [-140, 210, 600, "brain", ["7 340", "7 342"]],
  [1760, 230, 680, "kelp", ["0.0525", "0.0526"]],
  [2260, 190, 520, "coral", ["148.2", "148.4"]],
  [2760, 220, 640, "fan", ["3 270", "3 272"]],
];
const COLS = { coral: [P.coral, P.coralDark], fan: [P.fan, P.fanDark], brain: [P.brain, P.brainDark], kelp: [P.kelp, P.kelpDark] };

/* fish traffic: deterministic lanes */
const TRAFFIC = Array.from({ length: 14 }, (_, i) => ({
  sp: ["Y", "T", "O", "B"][i % 4], dir: K.hash(i, 3) > 0.5 ? 1 : -1, y: 120 + 560 * K.hash(i, 4), v: 90 + 110 * K.hash(i, 5), x0: K.hash(i, 6) * 4800, s: 0.38 + 0.3 * K.hash(i, 7),
}));
function drawTraffic(t, n, p, yOff) {
  K.applyCam(ctx, p == null ? 0.8 : p);
  for (let i = 0; i < Math.min(n, TRAFFIC.length); i++) {
    const f = TRAFFIC[i], span = 4800, x = -1500 + (((f.x0 + f.dir * f.v * t) % span) + span) % span;
    K.fish(ctx, x, f.y + (yOff || 0) + 14 * Math.sin(t * 1.5 + i), f.s, { species: f.sp, dir: f.dir, seed: 900 + i * 11, blink: K.blinkAt(t, 40 + i) });
  }
}

/* the whole reef. o: { depth, pop(i) -> 0..1 tower grow, mid(ctx), octo(ctx), front(ctx), traffic, desk, rays, bubbles } */
function drawReef(t, cam, o) {
  o = o || {};
  K.begin(ctx, t, Object.assign({ rot: 0 }, cam));
  K.ocean(ctx, { depth: o.depth == null ? 0.45 : o.depth });
  K.rays(ctx, { a: o.rays == null ? 1 : o.rays, x: 960 - (cam.x - 960) * 0.2 });
  /* surface (visible during the descent) */
  if (cam.y < 200) { K.applyCam(ctx, 1); K.surface(ctx, -1650, {}); K.glow(ctx, 1250, -1620, 420, "rgba(255,250,200,0.9)", 0.7); }
  /* far layer: muted silhouettes */
  K.applyCam(ctx, 0.35);
  FAR.forEach((f, i) => {
    const g = o.pop ? o.pop(i - 20) : 1; if (g <= 0) return;
    const h = f[2] * K.E.back(Math.min(1, g), 1.4);
    K.tower(ctx, f[0], 1000, f[1], h, { color: K.mix(P.shallow, P.mid, 0.4 + 0.3 * K.hash(i, 1)), dark: K.mix(P.mid, P.deep, 0.5), seed: 300 + i, windows: 2 });
  });
  /* mid layer: exchange towers with tickers, kelp forest */
  K.applyCam(ctx, 0.65);
  [[-1200, 560], [-640, 470], [560, 520], [1400, 600], [2050, 480], [3050, 560]].forEach((k, i) => K.kelp(ctx, k[0], 1010, k[1], { seed: 400 + i, color: P.kelpDark, dark: "#0a6a5c" }));
  MID.forEach((m, i) => {
    const g = o.pop ? o.pop(i) : 1; if (g <= 0) return;
    const c = COLS[m[3]], h = m[2] * K.E.back(Math.min(1, g), 1.5);
    K.tower(ctx, m[0], 1010, m[1], h, { color: c[0], dark: c[1], ticker: g >= 1 ? m[4] : null, seed: 320 + i * 7 });
  });
  if (o.traffic) drawTraffic(t, o.traffic, 0.8, o.trafficY);
  /* near layer */
  K.applyCam(ctx, 1);
  K.sand(ctx, 1000, { x0: -1800, x1: 3800 });
  K.brainCoral(ctx, 250, 1030, 0.9, {});
  K.coralBranch(ctx, 1560, 1020, 1.05, { seed: 77 });
  K.coralFan(ctx, 1720, 1030, 0.85, {});
  K.rock(ctx, 1380, 1050, 230, 120, {});
  K.coralBranch(ctx, 380, 1030, 0.75, { seed: 78, color: P.fan, dark: P.fanDark });
  K.starfish(ctx, 640, 1060, 34, { rot: 0.3 });
  K.starfish(ctx, 1290, 1075, 26, { color: P.ask, rot: 1.1 });
  if (o.desk !== false) K.clamDesk(ctx, DESK.x, DESK.y, DESK.s, { part: "back", open: o.deskOpen == null ? 1 : o.deskOpen });
  if (o.mid) o.mid(ctx);
  if (o.octo) o.octo(ctx);
  if (o.desk !== false) K.clamDesk(ctx, DESK.x, DESK.y, DESK.s, { part: "front", pearl: true });
  if (o.front) o.front(ctx);
  /* front layer: drifting bubbles */
  if (o.bubbles === false) return;
  K.applyCam(ctx, 1.25);
  K.bubbles(ctx, { x0: cam.x - 1400, x1: cam.x + 1400, y0: 1500, h: 2600, n: 22, seed: 33 });
}

/* standard Otto at his desk: merges a pose with idle life (blink, beat bob, singing) */
function otto(t, pose, place) {
  const pl = place || OCT;
  const st = Object.assign({ blink: K.blinkAt(t, 5), squash: 0.07 * K.pulse(t, 1, 6), talk: singAt(t) * 0.9, look: [0.15 * Math.sin(t * 0.9), 0] }, pose || {});
  K.applyCam(ctx, 1);
  K.octo(ctx, pl.x, pl.y, pl.s, st);
}

/* ---------- transitions ---------- */
/* bubble curtain: a dense wall of foam bubbles rises through the frame; full cover at tc */
function bubbleCurtain(t, tc, half) {
  half = half || 0.32;
  const d = t - tc; if (d < -half || d > half) return;
  const off = K.lerp(1500, -1500, (d + half) / (2 * half));
  K.screen(ctx);
  for (let row = 0; row < 16; row++) for (let col = 0; col < 11; col++) {
    const i = row * 11 + col, x = col * 190 - 20 + (row % 2) * 95 + K.hs(i, 4) * 30, y = 540 + off + (row - 7.5) * 150 + K.hs(i, 5) * 30;
    if (y < -220 || y > 1300) continue;
    const r = 120 + 50 * K.hash(i, 6);
    K.shape(ctx, K.ellipsePts(x, y, r, r, 14), { fill: i % 5 ? P.foam : "#c9f1ff", stroke: P.ink, w: 5, boil: 1, seed: 600 + i, hi: { color: "#ffffff", dx: -r * 0.2, dy: -r * 0.2 } });
  }
}
/* ink burst: the cloud grows from (x, y) to cover at tc, then thins out after */
function inkTransition(t, tc, x, y, half) {
  half = half || 0.45;
  const d = t - tc; if (d < -half || d > half) return;
  const g = d < 0 ? K.E.in3(K.inv(-half, 0, d)) : 1 - K.E.out3(K.inv(0, half, d));
  K.inkCloud(ctx, d < 0 ? x : 960, d < 0 ? y : 540, Math.max(0.001, g) * 1.05, { maxR: 1500 });
}
