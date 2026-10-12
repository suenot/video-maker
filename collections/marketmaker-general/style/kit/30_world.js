/* ============================================================
   KIT 30 WORLD: the Coral Exchange, a stock exchange on a reef.
   Water: flat colour bands (no smooth gradients), slanted light rays,
   rising bubbles. Reef: sand, kelp, branch / fan / brain coral, rocks,
   coral exchange towers with ticker strips, clam-shell trading desks.
   Traders: fish of four species. Transitions: the octopus ink cloud.
   Everything is drawn from t alone (K.now) and seeded shapes.
   ============================================================ */
var MK = window.MK || (window.MK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;

  /* ---------- water: 6 flat bands with soft wavy borders (screen space) ----------
     depth 0 = just under the surface (bright), 1 = deep reef (darker) */
  const mix = (a, b, u) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, u)), g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, u)), bl = Math.round(lerp(pa & 255, pb & 255, u));
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
  };
  K.mix = mix;
  K.ocean = function (ctx, opt) {
    const o = Object.assign({ depth: 0.4, shift: 0 }, opt || {});
    const top = mix(P.surface, P.shallow, o.depth), bot = mix(P.mid, P.deep, o.depth);
    K.screen(ctx);
    const N = 6;
    for (let i = 0; i < N; i++) {
      const y0 = (i / N) * 1080 - 20, c = mix(top, bot, i / (N - 1));
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-20, 1100);
      for (let x = -20; x <= 1940; x += 60) ctx.lineTo(x, y0 + 14 * Math.sin(x * 0.004 + i * 1.7 + K.now * 0.6 + o.shift));
      ctx.lineTo(1940, 1100); ctx.closePath(); ctx.fill();
    }
  };
  /* slanted light rays from the surface, swaying (screen space, additive) */
  K.rays = function (ctx, opt) {
    const o = Object.assign({ a: 1, n: 7, x: 960, spread: 1700, len: 1250, ang: 0.28 }, opt || {});
    K.screen(ctx); ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < o.n; i++) {
      const sw = Math.sin(K.now * 0.5 + i * 1.9) * 0.05, x = o.x - o.spread / 2 + (i + 0.5) * (o.spread / o.n) + hs(i, 3) * 60;
      const w0 = 30 + 50 * hash(i, 4), w1 = w0 * 3.2, a = o.ang + sw;
      const ex = x - Math.sin(a) * o.len, ey = Math.cos(a) * o.len;
      ctx.globalAlpha = o.a * (0.07 + 0.07 * hash(i, 5)) * (0.75 + 0.25 * Math.sin(K.now * 0.9 + i));
      ctx.fillStyle = P.ray; ctx.beginPath();
      ctx.moveTo(x - w0, -20); ctx.lineTo(x + w0, -20); ctx.lineTo(ex + w1, ey); ctx.lineTo(ex - w1, ey); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };
  /* the water surface seen from below (wavy bright band with sun caustics) */
  K.surface = function (ctx, y, opt) {
    const o = Object.assign({ x0: -400, x1: 2400 }, opt || {});
    const top = [];
    for (let x = o.x0; x <= o.x1; x += 80) top.push([x, y + 16 * Math.sin(x * 0.006 + K.now * 1.6) + 8 * Math.sin(x * 0.017 - K.now * 2.2)]);
    const sky = top.concat([[o.x1, y - 900], [o.x0, y - 900]]);
    K.shape(ctx, sky, { fill: P.foam, stroke: P.ink, w: 5, boil: 0.8, seed: 7, hi: { color: "#ffffff", dx: 0, dy: 22 } });
    K.line(ctx, top.map((p) => [p[0], p[1] + 26]), { stroke: P.ray, w: 6, boil: 1, seed: 8 });
  };
  K.sun = function (ctx, x, y, r) {
    K.glow(ctx, x, y, r * 2.6, "rgba(255,240,170,0.9)", 0.6);
    K.shape(ctx, K.ellipsePts(x, y, r, r, 20), { fill: P.sun, w: 5, boil: 0.8, seed: 9, hi: { color: "#fff3b0", dx: 8, dy: 8 } });
  };

  /* ---------- bubbles ---------- */
  K.bubble = function (ctx, x, y, r, seed, a) {
    ctx.save(); if (a != null) ctx.globalAlpha *= a;
    K.shape(ctx, K.ellipsePts(x, y, r, r * (0.94 + 0.06 * Math.sin(K.now * 5 + seed)), 12), { fill: "rgba(232,251,255,0.22)", stroke: P.foam, w: Math.max(2.2, r * 0.16), boil: 0.4, seed });
    K.shape(ctx, K.ellipsePts(x - r * 0.35, y - r * 0.38, r * 0.26, r * 0.16, 8, -0.6), { fill: "#ffffff", stroke: null, w: 0, boil: 0.2, seed: seed + 1 });
    ctx.restore();
  };
  /* a field of rising bubbles in world space: x range, bottom, height; deterministic from t */
  K.bubbles = function (ctx, opt) {
    const o = Object.assign({ n: 26, x0: 0, x1: 1920, y0: 1100, h: 1300, speed: 90, rMin: 5, rMax: 18, seed: 31, a: 1 }, opt || {});
    for (let i = 0; i < o.n; i++) {
      const r = lerp(o.rMin, o.rMax, hash(i, o.seed) ** 2), sp = o.speed * (0.6 + 0.8 * hash(i, o.seed + 1));
      const ph = (hash(i, o.seed + 2) * o.h + K.now * sp) % o.h;
      const x = lerp(o.x0, o.x1, hash(i, o.seed + 3)) + 14 * Math.sin(K.now * 2 + i * 1.3);
      K.bubble(ctx, x, o.y0 - ph, r, o.seed * 7 + i, o.a * clamp(ph / 80, 0, 1));
    }
  };
  /* bubble burst: a ring of bubbles flying out from (x, y), age d in seconds */
  K.bubbleBurst = function (ctx, x, y, d, opt) {
    const o = Object.assign({ n: 10, r: 160, size: 14, seed: 41, dur: 0.8 }, opt || {});
    if (d < 0 || d > o.dur) return;
    const u = d / o.dur, e = K.E.out3(u);
    for (let i = 0; i < o.n; i++) {
      const a = (i / o.n) * K.TAU + hs(i, o.seed) * 0.4, rr = o.r * e * (0.7 + 0.5 * hash(i, o.seed + 1));
      K.bubble(ctx, x + Math.cos(a) * rr, y + Math.sin(a) * rr - 60 * u, o.size * (0.6 + 0.6 * hash(i, o.seed + 2)) * (1 - 0.5 * u), o.seed + i, 1 - u * u);
    }
  };

  /* ---------- sand floor (world): wavy top, flat colour, dotted texture ---------- */
  K.sand = function (ctx, y, opt) {
    const o = Object.assign({ x0: -600, x1: 3000, seed: 51, color: P.sand, dark: P.sandDark, amp: 26 }, opt || {});
    const top = [];
    for (let x = o.x0; x <= o.x1; x += 90) top.push([x, y + o.amp * Math.sin(x * 0.0035 + o.seed) + 10 * Math.sin(x * 0.011)]);
    const pts = top.concat([[o.x1, y + 1400], [o.x0, y + 1400]]);
    K.shape(ctx, pts, { fill: o.color, w: 5, boil: 0.7, seed: o.seed, shade: { color: o.dark, dx: 0, dy: -40 }, dots: { color: o.dark, alpha: 0.5, gap: 22, r: 3, ang: Math.PI / 2, from: 0.35 } });
  };

  /* ---------- kelp: a swaying ribbon tube with leaf blades ---------- */
  K.kelp = function (ctx, x, y, h, opt) {
    const o = Object.assign({ seed: 61, sway: 1, color: P.kelp, dark: P.kelpDark, w: 16 }, opt || {});
    const N = 9, pts = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, bend = Math.sin(K.now * 1.1 + o.seed + u * 2.4) * 46 * u * u * o.sway;
      pts.push([x + bend + hs(i, o.seed) * 6, y - h * u]);
    }
    K.tube(ctx, pts, o.w, o.color, o.seed);
    for (let i = 2; i < N; i += 1) {
      const p = pts[i], sd = i % 2 ? 1 : -1, L = 46 + 22 * hash(i, o.seed), a = sd * (0.9 + 0.2 * Math.sin(K.now * 1.4 + i));
      const leaf = [[p[0], p[1]], [p[0] + sd * L * 0.5, p[1] - L * 0.55], [p[0] + Math.sin(a) * L, p[1] - Math.cos(a) * L * 0.4 - L * 0.4], [p[0] + sd * L * 0.3, p[1] - 6]];
      K.shape(ctx, leaf, { fill: i % 3 ? o.color : P.kelpLight, w: 4, boil: 0.6, seed: o.seed + i * 3, shade: { color: o.dark, dx: sd * 6, dy: 4 } });
    }
  };

  /* ---------- corals ---------- */
  K.coralBranch = function (ctx, x, y, s, opt) {
    const o = Object.assign({ seed: 71, color: P.coral, dark: P.coralDark, depth: 3 }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const sway = Math.sin(K.now * 0.9 + o.seed) * 0.04;
    const branch = (bx, by, ang, len, w, d, id) => {
      const ex = bx + Math.sin(ang) * len, ey = by - Math.cos(ang) * len;
      const mx = (bx + ex) / 2 + Math.cos(ang) * len * 0.12, my = (by + ey) / 2;
      K.tube(ctx, [[bx, by], [mx, my], [ex, ey]], w, o.color, o.seed + id, { ow: 9 });
      if (d <= 0) { K.dot(ctx, ex, ey, w * 0.55, o.color, P.ink, 4, o.seed + id + 50); return; }
      branch(ex, ey, ang - 0.45 - 0.2 * hash(id, o.seed) + sway, len * 0.72, w * 0.8, d - 1, id * 2 + 1);
      branch(ex, ey, ang + 0.4 + 0.2 * hash(id + 9, o.seed) + sway, len * 0.68, w * 0.8, d - 1, id * 2 + 2);
    };
    branch(0, 0, sway, 90, 30, o.depth, 1);
    ctx.restore();
  };
  K.coralFan = function (ctx, x, y, s, opt) {
    const o = Object.assign({ seed: 81, color: P.fan, dark: P.fanDark }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(K.now * 0.8 + o.seed) * 0.05);
    const fan = [[0, 0]];
    for (let i = 0; i <= 10; i++) { const a = -1.15 + (i / 10) * 2.3; fan.push([Math.sin(a) * 170, -Math.cos(a) * 190 - 20 * Math.sin(i * 1.7)]); }
    K.shape(ctx, fan, { fill: o.color, w: 5, boil: 0.8, seed: o.seed, shade: { color: o.dark, dx: 14, dy: 10 }, dots: { color: P.ink, alpha: 0.18, gap: 14, r: 3.4, ang: 1.2 } });
    for (let i = 1; i < 10; i++) { const a = -1.15 + (i / 10) * 2.3; K.line(ctx, [[0, -10], [Math.sin(a) * 90, -Math.cos(a) * 100], [Math.sin(a) * 160, -Math.cos(a) * 178]], { stroke: o.dark, w: 3, boil: 0.6, seed: o.seed + i }); }
    K.tube(ctx, [[0, 0], [0, 26]], 16, o.dark, o.seed + 20);
    ctx.restore();
  };
  K.brainCoral = function (ctx, x, y, s, opt) {
    const o = Object.assign({ seed: 91, color: P.brain, dark: P.brainDark }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const dome = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI; dome.push([Math.cos(a) * 120, Math.sin(a) * 92]); }
    K.shape(ctx, dome, { fill: o.color, w: 5, boil: 0.8, seed: o.seed, shade: { color: o.dark, dx: 16, dy: 0 }, hi: { color: "#ffd27a", dx: -10, dy: 14 } });
    for (let k = 0; k < 4; k++) {
      const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([-100 + 200 * u, -18 - k * 20 + 9 * Math.sin(u * 12 + k)]); }
      ctx.save(); K.pathOf(ctx, dome, true); ctx.clip(); K.line(ctx, pts, { stroke: o.dark, w: 4, boil: 0.6, seed: o.seed + k }); ctx.restore();
    }
    ctx.restore();
  };
  K.rock = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ seed: 101, color: P.rock, dark: P.rockDark }, opt || {});
    const pts = K.blobPts(x, y - h * 0.45, w / 2, h / 2, 12, o.seed, 0.12).map((p) => [p[0], Math.min(p[1], y)]);
    K.shape(ctx, pts, { fill: o.color, w: 5, boil: 0.7, seed: o.seed, shade: { color: o.dark, dx: 18, dy: 12 }, dots: { color: P.ink, alpha: 0.16, gap: 13, r: 3, ang: 0.6 } });
  };
  K.starfish = function (ctx, x, y, r, opt) {
    const o = Object.assign({ seed: 111, color: P.brain, rot: 0 }, opt || {});
    const pts = []; for (let i = 0; i < 10; i++) { const a = o.rot + (i / 10) * K.TAU - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    K.shape(ctx, pts, { fill: o.color, w: 4, boil: 0.6, seed: o.seed, shade: { color: P.brainDark, dx: 5, dy: 5 } });
  };

  /* ---------- coral exchange tower: a rounded coral building with portholes and a ticker strip ----------
     ticker: array of short strings (numbers only) scrolling along a dark LED band */
  K.tower = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ seed: 121, color: P.coral, dark: P.coralDark, ticker: null, tickColor: P.sun, windows: 3, cap: true }, opt || {});
    const sway = Math.sin(K.now * 0.6 + o.seed) * 3;
    const body = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8; body.push([x - w / 2 + 6 * Math.sin(u * 7 + o.seed) + sway * u, y - h * u]); }
    const capPts = []; for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI; capPts.push([x + sway + Math.cos(a) * w / 2, y - h + Math.sin(a) * w * 0.35]); }
    const right = []; for (let i = 8; i >= 0; i--) { const u = i / 8; right.push([x + w / 2 + 6 * Math.sin(u * 6 + o.seed + 2) + sway * u, y - h * u]); }
    const pts = body.concat(o.cap ? capPts : [], right);
    K.shape(ctx, pts, { fill: o.color, w: 5, boil: 0.8, seed: o.seed, shade: { color: o.dark, dx: -w * 0.22, dy: 0 }, dots: { color: P.ink, alpha: 0.14, gap: 14, r: 3.2, ang: 0 } });
    /* polyps (dots) on the skin */
    for (let i = 0; i < 7; i++) K.dot(ctx, x - w * 0.35 + w * 0.7 * hash(i, o.seed), y - h * (0.1 + 0.8 * hash(i + 5, o.seed)), 4 + 3 * hash(i + 9, o.seed), P.octoLight, null, 0, o.seed + i);
    /* portholes */
    for (let i = 0; i < o.windows; i++) {
      const wy = y - h * (0.28 + (0.5 * i) / Math.max(1, o.windows - 1)) , wx = x + sway * 0.5;
      K.shape(ctx, K.ellipsePts(wx, wy, w * 0.17, w * 0.17, 14), { fill: P.lens, w: 5, boil: 0.5, seed: o.seed + 20 + i, hi: { color: "#ffffff", dx: 6, dy: 6 } });
      K.glow(ctx, wx, wy, w * 0.28, "rgba(255,240,160,0.8)", 0.25 + 0.15 * Math.sin(K.now * 2 + i));
    }
    /* ticker strip: dark band wrapping the tower with scrolling numbers */
    if (o.ticker) {
      const ty = y - h * 0.86, bh = 46;
      const band = K.rrectPts(x - w / 2 - 14, ty - bh / 2, w + 28, bh, 12, 3);
      K.shape(ctx, band, { fill: P.board, w: 4, boil: 0.5, seed: o.seed + 40 });
      ctx.save(); K.pathOf(ctx, band, true); ctx.clip();
      const str = o.ticker.join("   ") + "   ", tw = K.textW(ctx, str, 26, 700, K.FONT.mono), off = (K.now * 70 + hash(o.seed, 1) * tw) % tw;
      for (let k = -1; k < 2; k++) K.text(ctx, str, x - w / 2 - off + k * tw, ty + 1, { size: 26, weight: 700, font: K.FONT.mono, fill: o.tickColor, align: "left" });
      ctx.restore();
    }
  };

  /* ---------- clam-shell trading desk (the octopus's booth). open 0..1 ---------- */
  /* part: "back" (lid, behind the octopus), "front" (desk, in front), or "both" */
  K.clamDesk = function (ctx, x, y, s, opt) {
    const o = Object.assign({ seed: 131, open: 1, pearl: true, part: "both" }, opt || {});
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.part !== "front") {
    const shellPts = (up) => { const p = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; p.push([Math.cos(a) * 260, (up ? 1 : -0.55) * Math.sin(a) * 120 * (1 + 0.06 * Math.sin(i * 3.1))]); } return p; };
    /* lid (back) */
    ctx.save(); ctx.rotate(-0.0); ctx.translate(0, -10); ctx.scale(1, 0.25 + 0.75 * o.open);
    K.shape(ctx, shellPts(true), { fill: P.shell, w: 5, boil: 0.7, seed: o.seed, shade: { color: P.shellDark, dx: 0, dy: 26 } });
    for (let i = 1; i < 7; i++) { const a = Math.PI + (i / 7) * Math.PI; K.line(ctx, [[0, 0], [Math.cos(a) * 230, Math.sin(a) * 104]], { stroke: P.shellDark, w: 4, boil: 0.5, seed: o.seed + i }); }
    ctx.restore();
    }
    if (o.part === "back") { ctx.restore(); return; }
    /* desk front (lower shell) */
    const front = []; for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; front.push([Math.cos(a) * 280, Math.sin(a) * 110]); }
    K.shape(ctx, front, { fill: P.shell, w: 6, boil: 0.7, seed: o.seed + 10, shade: { color: P.shellDark, dx: 0, dy: -30 }, dots: { color: P.octoDark, alpha: 0.18, gap: 14, r: 3.2, ang: Math.PI / 2 } });
    for (let i = 1; i < 8; i++) { const a = (i / 8) * Math.PI; K.line(ctx, [[Math.cos(a) * 60, Math.sin(a) * 24], [Math.cos(a) * 250, Math.sin(a) * 98]], { stroke: P.shellDark, w: 4, boil: 0.5, seed: o.seed + 20 + i }); }
    if (o.pearl) { K.glow(ctx, 0, 30, 70, "rgba(255,255,255,0.9)", 0.35); K.dot(ctx, 0, 30, 22, P.pearl, P.ink, 4, o.seed + 40); K.dot(ctx, -7, 23, 6, "#ffffff", null, 0, o.seed + 41); }
    ctx.restore();
  };

  /* ---------- fish trader. dir +1 swims right. opt: species "Y" | "T" | "O" | "B", phase, mouth, card ---------- */
  K.fish = function (ctx, x, y, s, opt) {
    const o = Object.assign({ species: "Y", dir: 1, seed: 141, mouth: "smile", blink: 0, look: [0, 0], fins: 1 }, opt || {});
    const col = P["fish" + o.species], dark = P["fish" + o.species + "Dark"];
    const ph = K.now * 9 + o.seed, wag = Math.sin(ph) * 0.28;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * o.dir, s);
    ctx.rotate(Math.sin(ph * 0.5) * 0.04);
    /* tail */
    ctx.save(); ctx.translate(-70, 0); ctx.rotate(wag);
    K.shape(ctx, [[8, 0], [-46, -40], [-34, 0], [-46, 40]], { fill: dark, w: 5, boil: 0.6, seed: o.seed + 1 });
    ctx.restore();
    /* body: species shapes */
    const ry = o.species === "B" ? 34 : o.species === "T" ? 50 : 44, rx = o.species === "B" ? 92 : 78;
    const body = K.ellipsePts(0, 0, rx, ry, 18).map((p) => [p[0] + (p[0] > 0 ? 0 : 0), p[1] * (p[0] > 40 ? 0.9 : 1)]);
    /* dorsal fin */
    K.shape(ctx, [[-30, -ry + 6], [-6, -ry - 30 - 6 * Math.sin(ph * 0.7)], [26, -ry + 4]], { fill: dark, w: 4.5, boil: 0.6, seed: o.seed + 2 });
    K.shape(ctx, body, { fill: col, w: 5.5, boil: 0.7, seed: o.seed + 3, shade: { color: dark, dx: 0, dy: -16 }, hi: { color: "#ffffff55", dx: 0, dy: 14 } });
    /* stripes */
    if (o.species === "Y" || o.species === "O") [-18, 12].forEach((sx, i) => { ctx.save(); K.pathOf(ctx, body, true); ctx.clip(); K.shape(ctx, K.rrectPts(sx - 8, -60, 16, 120, 8, 2), { fill: o.species === "O" ? P.cream : dark, w: 3.5, boil: 0.5, seed: o.seed + 4 + i }); ctx.restore(); });
    /* pectoral fin flaps */
    ctx.save(); ctx.translate(-4, 10); ctx.rotate(0.4 + Math.sin(ph * 1.3) * 0.35 * o.fins);
    K.shape(ctx, [[0, 0], [-30, 14], [-22, 26]], { fill: dark, w: 4, boil: 0.5, seed: o.seed + 6 });
    ctx.restore();
    /* eye */
    const ex = rx * 0.52, ey = -ry * 0.25;
    K.shape(ctx, K.ellipsePts(ex, ey, 15, 15 * (1 - 0.9 * o.blink) + 1, 12), { fill: P.eye, w: 4, boil: 0.4, seed: o.seed + 7 });
    if (o.blink < 0.5) K.dot(ctx, ex + 4 + o.look[0] * 4, ey + o.look[1] * 4, 7, P.pupil, null, 0, o.seed + 8);
    /* mouth */
    if (o.mouth === "o") K.shape(ctx, K.ellipsePts(rx - 6, 10, 7, 8, 8), { fill: P.ink, w: 3, boil: 0.4, seed: o.seed + 9 });
    else K.line(ctx, [[rx - 26, 12], [rx - 14, 18], [rx - 4, 12]], { stroke: P.ink, w: 4, boil: 0.4, seed: o.seed + 9 });
    ctx.restore();
    /* a card carried in front (price quote the fish just took) */
    if (o.card) K.card(ctx, x + o.dir * s * 160, y + s * 18, s * 0.62, Object.assign({ rot: o.dir * 0.12 }, o.card));
  };

  /* ---------- price card: rounded colour card with a number (bid / ask / plain) ---------- */
  K.card = function (ctx, x, y, s, opt) {
    const o = Object.assign({ kind: "bid", text: "99.98", rot: 0, seed: 151, a: 1, icon: true }, opt || {});
    const a = o.a >= 1 ? 1 : o.a <= 0 ? 0 : K.E.back(o.a, 2.2); if (a <= 0) return;
    const fill = o.kind === "bid" ? P.bid : o.kind === "ask" ? P.ask : o.kind === "up" ? P.up : o.kind === "down" ? P.down : o.kind === "sun" ? P.sun : P.cream;
    const dark = o.kind === "bid" ? P.bidDark : o.kind === "ask" ? P.askDark : o.kind === "up" ? P.upDark : o.kind === "down" ? P.downDark : o.kind === "sun" ? P.sunDark : P.creamShade;
    const tc = o.kind === "plain" || o.kind === "sun" ? P.ink : "#ffffff";
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot); ctx.scale(s * a, s * a);
    const w = Math.max(150, K.textW(ctx, o.text, 46, 700, K.FONT.mono) + (o.icon ? 84 : 44)), h = 84;
    K.shape(ctx, K.rrectPts(-w / 2, -h / 2, w, h, 20, 3), { fill, w: 5, boil: 0.6, seed: o.seed, shade: { color: dark, dx: 0, dy: -10 }, drop: { dx: 0, dy: 9 } });
    let tx = 0;
    if (o.icon && (o.kind === "bid" || o.kind === "ask")) {
      /* arrow: bid points down-in (we buy), ask points up-out (we sell) */
      const ix = -w / 2 + 34, up = o.kind === "ask";
      K.shape(ctx, up ? [[ix, -16], [ix + 15, 6], [ix - 15, 6]] : [[ix, 16], [ix + 15, -6], [ix - 15, -6]], { fill: "#ffffff", w: 3.5, boil: 0.4, seed: o.seed + 1, sharp: true });
      tx = 20;
    }
    K.text(ctx, o.text, tx, 2, { size: 46, weight: 700, font: K.FONT.mono, fill: tc });
    ctx.restore();
  };

  /* ---------- coins, pearls, sparkles ---------- */
  K.coin = function (ctx, x, y, r, opt) {
    const o = Object.assign({ color: P.sun, dark: P.sunDark, label: "", seed: 161, size: null, labelColor: P.ink, spin: 0 }, opt || {});
    const sx = Math.max(0.12, Math.abs(Math.cos(o.spin)));
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
    K.shape(ctx, K.ellipsePts(0, 0, r, r, 18), { fill: o.color, w: Math.max(3, r * 0.08), boil: 0.4 + r * 0.01, seed: o.seed, shade: { color: o.dark, dx: -r * 0.16, dy: -r * 0.16 } });
    K.shape(ctx, K.ellipsePts(0, 0, r * 0.7, r * 0.7, 16), { fill: null, stroke: o.dark, w: Math.max(2, r * 0.05), boil: 0.4, seed: o.seed + 1 });
    if (o.label) K.text(ctx, o.label, 0, r * 0.04, { size: o.size || r * 0.62, weight: 900, font: K.FONT.display, fill: o.labelColor });
    ctx.restore();
  };
  K.sparkle = function (ctx, x, y, r, a, seed) {
    if (a <= 0 || r <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(hs(seed || 1, 3) * 0.4);
    K.shape(ctx, [[0, -r], [r * 0.22, -r * 0.22], [r, 0], [r * 0.22, r * 0.22], [0, r], [-r * 0.22, r * 0.22], [-r, 0], [-r * 0.22, -r * 0.22]], { fill: P.sun, w: 3.5, boil: 0.4, seed: seed || 1, sharp: true });
    ctx.restore();
  };

  /* ---------- octopus ink cloud (transition). grow 0..1 covers the screen at 1 ---------- */
  K.inkCloud = function (ctx, cx, cy, grow, opt) {
    const o = Object.assign({ seed: 171, color: "#1b1e3d", rim: P.lilac, maxR: 1500 }, opt || {});
    if (grow <= 0) return;
    const r = o.maxR * grow;
    K.screen(ctx);
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * K.TAU + o.seed, d = r * 0.45 * (0.5 + 0.5 * hash(k, o.seed));
      const pts = K.blobPts(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, r * (0.55 + 0.2 * hash(k + 3, o.seed)), r * (0.5 + 0.2 * hash(k + 5, o.seed)), 14, o.seed + k, 0.22);
      K.shape(ctx, pts, { fill: o.color, stroke: o.rim, w: 6, boil: 2, seed: o.seed + k * 13 });
    }
    K.shape(ctx, K.blobPts(cx, cy, r * 0.8, r * 0.7, 16, o.seed + 50, 0.2), { fill: o.color, stroke: null, w: 0, boil: 2, seed: o.seed + 60 });
  };
})(MK);
