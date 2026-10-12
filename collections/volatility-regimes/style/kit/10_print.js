/* ============================================================
   KIT 10 PRINT (Surf Turtle kit): screen-print canvas primitives + camera.
   The look of a 60s surf poster pulled by hand:
   - outlines are brush strokes: one filled ribbon whose width swells and
     thins along the path (no broken gaps, unlike an ink pen);
   - colour fills are a separate "screen", printed slightly off register
     (K.REG) so a sliver of paper shows on one side of every shape;
   - shading is a halftone dot band (shape minus its offset copy), never hatching;
   - contours wobble at 12 fps (K.bf), seeded, so every seek is identical.
   - K.begin(ctx, t, cam) once per frame; everything after reads K.now / K.bf.
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const { hs, hash, clamp } = K;
  K.MIN_PX = 2.0;
  K.REG = { dx: 3.2, dy: 2.4 }; /* off-register shift of the colour screen (world px) */
  K.now = 0; K.bf = 0; K.zoom = 1;

  /* ---------- camera: world -> screen. cam = {x, y, z, rot} (centre, zoom, degrees) ---------- */
  K.W = 1920; K.H = 1080;
  K.begin = function (ctx, t, cam) {
    K.ctx = ctx; K.now = t; K.bf = K.boilFrame(t); K.cam = cam; K.zoom = cam.z;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
  };
  /* apply camera with a parallax factor p (1 = world plane, 0 = fixed to screen) */
  K.applyCam = function (ctx, p) {
    p = p == null ? 1 : p;
    const c = K.cam, z = 1 + (c.z - 1) * p;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(K.W / 2, K.H / 2);
    if (c.rot) ctx.rotate((c.rot * Math.PI) / 180 * p);
    ctx.scale(z, z);
    ctx.translate(-c.x * p - (K.W / 2) * (1 - p), -c.y * p - (K.H / 2) * (1 - p));
    K.zoom = z;
  };
  K.screen = function (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); K.zoom = 1; };
  K.toScreen = function (x, y) {
    const c = K.cam, r = ((c.rot || 0) * Math.PI) / 180, dx = (x - c.x) * c.z, dy = (y - c.y) * c.z;
    return [K.W / 2 + dx * Math.cos(r) - dy * Math.sin(r), K.H / 2 + dx * Math.sin(r) + dy * Math.cos(r)];
  };
  const curScale = (ctx) => { const m = ctx.getTransform(); return Math.sqrt(m.a * m.a + m.b * m.b) || 1; };
  K.lw = (ctx, w) => Math.max(w, K.MIN_PX / curScale(ctx));

  /* ---------- point generators ---------- */
  K.ellipsePts = function (cx, cy, rx, ry, n, rot) {
    const out = [], r = rot || 0, cr = Math.cos(r), sr = Math.sin(r);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * K.TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      out.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
    }
    return out;
  };
  K.blobPts = function (cx, cy, rx, ry, n, seed, irr) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * K.TAU, k = 1 + (irr || 0.18) * (K.fbm(i * 0.9, seed, 2) * 2 - 1);
      out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return out;
  };
  K.rectPts = function (x, y, w, h, n) {
    return K.polyPts([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], Math.max(4, Math.min(w, h) / Math.max(2, n || 3)));
  };
  /* resample a polyline to even spacing (Catmull-Rom smoothing overshoots when a long
     edge meets a tight corner; even spacing keeps corners tight and edges straight) */
  K.evenPts = function (pts, step, closed) {
    const src = closed === false ? pts : pts.concat([pts[0]]), cum = [0];
    for (let i = 1; i < src.length; i++) cum.push(cum[i - 1] + Math.hypot(src[i][0] - src[i - 1][0], src[i][1] - src[i - 1][1]));
    const L = cum[cum.length - 1], n = Math.max(closed === false ? 2 : 6, Math.round(L / step)), out = [];
    for (let k = 0, j = 1; k < (closed === false ? n + 1 : n); k++) {
      const d = (L * k) / n; while (j < src.length - 1 && cum[j] < d) j++;
      const u = (d - cum[j - 1]) / (cum[j] - cum[j - 1] || 1);
      out.push([src[j - 1][0] + (src[j][0] - src[j - 1][0]) * u, src[j - 1][1] + (src[j][1] - src[j - 1][1]) * u]);
    }
    return out;
  };
  /* closed polygon with every edge subdivided at about `step` (sharp-cornered props) */
  K.polyPts = function (pts, step) {
    const out = [];
    pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length], n = Math.max(1, Math.round(Math.hypot(q[0] - p[0], q[1] - p[1]) / step)); for (let k = 0; k < n; k++) out.push([p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]); });
    return out;
  };
  /* rounded rectangle (signs, boards, cards); r = corner radius; evenly spaced points */
  K.roundPts = function (x, y, w, h, r, n) {
    n = Math.max(n || 3, 6); r = Math.min(r, w / 2, h / 2); const out = [];
    const C = [[x + w - r, y + r, -0.5], [x + w - r, y + h - r, 0], [x + r, y + h - r, 0.5], [x + r, y + r, 1]];
    C.forEach((c) => { for (let i = 0; i <= n; i++) { const a = (c[2] + i / n * 0.5) * Math.PI; out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } });
    return K.evenPts(out, clamp(Math.min(w, h) / 4, 5, 36));
  };

  /* ---------- wobble (the 12 fps "boil", softer than a pen boil) ---------- */
  K.boil = function (pts, seed, amp, frameOverride) {
    const f = frameOverride == null ? K.bf : frameOverride, s = (seed | 0) + f * 7919;
    return pts.map((p, i) => [p[0] + hs(i * 2 + 1, s) * amp, p[1] + hs(i * 2 + 2, s) * amp]);
  };

  /* ---------- smooth path through points (Catmull-Rom -> Bezier) ---------- */
  function segs(pts, closed) {
    const n = pts.length, out = [];
    const P = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      out.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
    }
    return out;
  }
  K.segs = segs;
  K.pathOf = function (ctx, pts, closed) {
    const S = segs(pts, closed);
    if (!S.length) return;
    ctx.beginPath(); ctx.moveTo(S[0][0][0], S[0][0][1]);
    S.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
    if (closed) ctx.closePath();
  };
  /* sample the smooth path into a dense polyline */
  function sample(pts, closed, k) {
    const S = segs(pts, closed), out = [];
    S.forEach((s, si) => {
      for (let j = 0; j < k; j++) {
        if (si > 0 && j === 0) continue;
        const u = j / k, v = 1 - u;
        out.push([v * v * v * s[0][0] + 3 * v * v * u * s[1][0] + 3 * v * u * u * s[2][0] + u * u * u * s[3][0],
          v * v * v * s[0][1] + 3 * v * v * u * s[1][1] + 3 * v * u * u * s[2][1] + u * u * u * s[3][1]]);
      }
    });
    const L = S[S.length - 1]; if (L) out.push([L[3][0], L[3][1]]);
    return out;
  }
  K.sample = sample;

  /* ---------- brush stroke: one filled ribbon, width swells and thins ----------
     w = nominal width; taper (open lines) thins both ends; swell = width variation */
  K.brush = function (ctx, pts, closed, w, color, seed, opt) {
    const o = Object.assign({ taper: 0.35, swell: 0.32, k: 5 }, opt || {});
    if (pts.length < 2) return;
    const D = sample(pts, closed, o.k), n = D.length;
    if (n < 2) return;
    const base = K.lw(ctx, w) / 2, s = (seed | 0) + K.bf * 31, ph = hash(3, seed | 0) * K.TAU;
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = D[Math.max(0, i - 1)], b = D[Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const u = i / (n - 1);
      let f = 1 + o.swell * Math.sin(u * K.TAU * (closed ? 2 : 1.3) + ph) + 0.08 * hs(i, s);
      if (!closed) f *= o.taper + (1 - o.taper) * Math.sin(Math.min(1, Math.min(u, 1 - u) * 4) * Math.PI / 2);
      const hw = base * Math.max(0.25, f);
      L.push([D[i][0] - ty * hw, D[i][1] + tx * hw]); R.push([D[i][0] + ty * hw, D[i][1] - tx * hw]);
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    if (closed) {
      L.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
      R.slice().reverse().forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
      ctx.fill("nonzero");
    } else {
      L.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      R.slice().reverse().forEach((p) => ctx.lineTo(p[0], p[1]));
      ctx.closePath(); ctx.fill();
      /* round caps */
      [0, n - 1].forEach((i) => { const r = Math.hypot(L[i][0] - R[i][0], L[i][1] - R[i][1]) / 2; ctx.beginPath(); ctx.arc(D[i][0], D[i][1], r, 0, K.TAU); ctx.fill(); });
    }
  };

  /* ---------- halftone: a dot screen clipped to a path ---------- */
  const patCache = {};
  function dotPattern(ctx, color, cell, rr) {
    const key = color + cell + rr;
    if (!patCache[key]) {
      const c = document.createElement("canvas"); c.width = c.height = cell * 2;
      const g = c.getContext("2d"); g.fillStyle = color;
      [[cell / 2, cell / 2], [cell * 1.5, cell * 1.5]].forEach((p) => { g.beginPath(); g.arc(p[0], p[1], rr, 0, K.TAU); g.fill(); });
      patCache[key] = c;
    }
    return ctx.createPattern(patCache[key], "repeat");
  }
  /* fill region pts with dots (density 0..1 sets dot radius); straight: polygon, not smoothed */
  K.halftone = function (ctx, pts, opt) {
    const o = Object.assign({ color: K.P.inkSoft, cell: 9, density: 0.55, alpha: 0.5, closed: true, straight: false }, opt || {});
    ctx.save();
    if (o.straight) { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); } else K.pathOf(ctx, pts, true);
    ctx.globalAlpha *= o.alpha; ctx.fillStyle = dotPattern(ctx, o.color, o.cell, o.cell * 0.5 * clamp(o.density, 0.05, 1));
    ctx.fill(); ctx.restore();
  };

  /* ---------- the workhorse: printed shape ----------
     opt: fill, stroke (default ink), w (brush width), boil (amp), seed,
          shade ({color, dx, dy, dots}: shadow band, solid or halftone),
          dots ({color, density, cell, alpha}: halftone over the whole fill),
          shine ({color, a0, a1}: a cream highlight arc, angles around the bbox),
          reg (false = print colour on register), closed (default true), alpha */
  K.shape = function (ctx, pts, opt) {
    const o = Object.assign({ stroke: K.P.ink, w: 4, boil: 1.0, seed: 1, closed: true, reg: true }, opt || {});
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.fill && o.closed !== false) {
      const rx = o.reg ? K.REG.dx * (0.7 + 0.6 * hash(1, o.seed)) : 0, ry = o.reg ? K.REG.dy * (0.7 + 0.6 * hash(2, o.seed)) : 0;
      const fp = (o.boil ? K.boil(pts, o.seed + 500, o.boil * 0.4) : pts).map((p) => [p[0] + rx, p[1] + ry]);
      K.pathOf(ctx, fp, true); ctx.fillStyle = o.fill; ctx.fill();
      if (o.shade) {
        const op = fp.map((p) => [p[0] + (o.shade.dx || 0), p[1] + (o.shade.dy || 0)]);
        ctx.save(); K.pathOf(ctx, fp, true); ctx.clip();
        ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
        const sg = segs(op, true); ctx.moveTo(sg[0][0][0], sg[0][0][1]);
        sg.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
        ctx.closePath();
        if (o.shade.dots) { ctx.fillStyle = dotPattern(ctx, o.shade.color, o.shade.cell || 9, (o.shade.cell || 9) * 0.5 * (o.shade.density || 0.7)); }
        else ctx.fillStyle = o.shade.color;
        ctx.fill("evenodd");
        ctx.restore();
      }
      if (o.dots) K.halftone(ctx, fp, o.dots);
      if (o.shine) {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        fp.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx2 = (x1 - x0) * 0.36, ry2 = (y1 - y0) * 0.36, a0 = o.shine.a0 == null ? 3.5 : o.shine.a0, a1 = o.shine.a1 == null ? 4.3 : o.shine.a1;
        const arc = []; for (let i = 0; i <= 6; i++) { const a = a0 + (a1 - a0) * i / 6; arc.push([cx + Math.cos(a) * rx2, cy + Math.sin(a) * ry2]); }
        K.brush(ctx, arc, false, o.shine.w || Math.max(3, (x1 - x0) * 0.05), o.shine.color || K.P.cream, o.seed + 77, { taper: 0.2 });
      }
    }
    if (o.stroke && o.w > 0) K.brush(ctx, bp, o.closed !== false, o.w, o.stroke, o.seed, o.brush);
    ctx.restore();
  };
  /* open brush line (ropes, wave lines, cracks, motion lines) */
  K.line = function (ctx, pts, opt) {
    K.shape(ctx, pts, Object.assign({ closed: false, fill: null }, opt || {}));
  };
  K.dot = function (ctx, x, y, r, fill, stroke, w, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 10), { fill, stroke: stroke === undefined ? K.P.ink : stroke, w: w || 2.5, boil: r * 0.04 + 0.3, seed: seed || 5, reg: r > 8, brush: { swell: 0.15 } });
  };

  /* ---------- text: stable (never wobbles). Poster drop shadow optional ---------- */
  K.text = function (ctx, str, x, y, opt) {
    const o = Object.assign({ size: 40, weight: 800, font: K.FONT.display, fill: K.P.ink, stroke: null, w: 0, align: "center", base: "middle", alpha: 1, track: 0, shadow: null }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight} ${o.size}px ${o.font}`; ctx.textAlign = o.align; ctx.textBaseline = o.base;
    if (o.track) ctx.letterSpacing = o.track + "px";
    if (o.shadow) { /* solid offset shadow, like a second screen */
      const sh = o.shadow; ctx.fillStyle = sh.color; ctx.fillText(str, x + (sh.dx || 4), y + (sh.dy || 4));
      if (o.stroke && o.w) { ctx.lineJoin = "round"; ctx.strokeStyle = sh.color; ctx.lineWidth = o.w; ctx.strokeText(str, x + (sh.dx || 4), y + (sh.dy || 4)); }
    }
    if (o.stroke && o.w) { ctx.lineJoin = "round"; ctx.strokeStyle = o.stroke; ctx.lineWidth = o.w; ctx.strokeText(str, x, y); }
    ctx.fillStyle = o.fill; ctx.fillText(str, x, y);
    ctx.restore();
  };
  K.textW = function (ctx, str, size, weight, font) {
    ctx.save(); ctx.font = `${weight || 800} ${size}px ${font || K.FONT.display}`; const w = ctx.measureText(str).width; ctx.restore(); return w;
  };

  /* ---------- glow (soft disc). Only the sun, the lighthouse beam and the forecast glow ---------- */
  K.glow = function (ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save(); ctx.globalAlpha *= a == null ? 1 : a; ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, K.TAU); ctx.fill(); ctx.restore();
  };

  /* ---------- woodgrain: wavy grain lines clipped to a shape (boards, tiki signs) ---------- */
  K.woodgrain = function (ctx, pts, opt) {
    const o = Object.assign({ color: K.P.woodDark, gap: 14, alpha: 0.45, seed: 7, ang: 0, w: 2.2 }, opt || {});
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    ctx.save(); K.pathOf(ctx, pts, true); ctx.clip(); ctx.globalAlpha *= o.alpha;
    ctx.translate((x0 + x1) / 2, (y0 + y1) / 2); ctx.rotate(o.ang);
    const W = Math.hypot(x1 - x0, y1 - y0) / 2 + 10;
    for (let y = -W, i = 0; y <= W; y += o.gap, i++) {
      const line = [];
      for (let x = -W; x <= W; x += W / 8) line.push([x, y + 5 * Math.sin(x * 0.012 + i * 1.7 + o.seed) + 3 * K.fbm(x * 0.01 + i, o.seed, 2)]);
      K.brush(ctx, line, false, o.w * (0.6 + 0.8 * hash(i, o.seed)), o.color, o.seed + i, { swell: 0.5, taper: 0.1 });
      if (hash(i + 40, o.seed) < 0.22) { /* knot */
        const kx = hs(i, o.seed + 3) * W * 0.6, ky = y + o.gap / 2;
        ctx.beginPath(); ctx.ellipse(kx, ky, o.gap * 0.9, o.gap * 0.35, 0, 0, K.TAU); ctx.strokeStyle = o.color; ctx.lineWidth = K.lw(ctx, o.w); ctx.stroke();
      }
    }
    ctx.restore();
  };

  /* ---------- banded (stepped) gradient: poster skies are flat colour bands with wavy edges ---------- */
  K.bands = function (ctx, x, y, w, h, colors, opt) {
    const o = Object.assign({ wave: 10, freq: 0.006, seed: 3, speed: 0.2 }, opt || {});
    const n = colors.length;
    ctx.fillStyle = colors[0]; ctx.fillRect(x, y, w, h);
    for (let i = 1; i < n; i++) {
      const by = y + (h * i) / n, pts = [];
      const wy = (xx) => by + o.wave * Math.sin(xx * o.freq + i * 1.9 + K.now * o.speed + o.seed);
      for (let xx = x - 20; xx < x + w + 20; xx += 60) pts.push([xx, wy(xx)]);
      pts.push([x + w + 20, wy(x + w + 20)]);
      ctx.beginPath(); ctx.moveTo(x - 20, y + h);
      pts.forEach((p) => ctx.lineTo(p[0], p[1]));
      ctx.lineTo(x + w + 20, y + h); ctx.closePath(); ctx.fillStyle = colors[i]; ctx.fill();
    }
  };
})(VK);
