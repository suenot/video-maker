/* ============================================================
   VAUDEVILLE KIT 10 INK: brush-inked canvas primitives + the camera.
   Line treatment (different from a sketchy pen): 1920s studio ink.
   - Outlines are continuous, bold and even (no broken gaps).
   - Open lines are BRUSH strokes: filled ribbons that taper at both
     ends (K.brush), the signature of a hand-inked cel.
   - Black shapes carry a white SHINE crescent (K.shape opt.shine), the
     rubber-hose highlight, instead of hatching.
   - Contours boil at 12 fps (hash of vertex, seed, boil frame), small
     amplitude: the ink trembles, it does not scribble.
   Line widths are world units, never thinner than MIN_PX on screen.
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const { hs, hash, clamp } = K;
  K.MIN_PX = 2.0;
  K.now = 0; K.bf = 0; K.zoom = 1;

  /* ---------- camera: world -> screen. cam = {x, y, z, rot} (centre, zoom, degrees) ---------- */
  K.W = 1920; K.H = 1080;
  K.weave = [0, 0]; /* film gate weave, screen px, set per frame by K.begin */
  K.begin = function (ctx, t, cam) {
    K.ctx = ctx; K.now = t; K.bf = K.boilFrame(t); K.cam = cam; K.zoom = cam.z;
    K.weave = [hs(K.bf, 4417) * 1.6, hs(K.bf, 4423) * 1.2];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
  };
  /* apply camera with an optional parallax factor p (1 = world plane, 0 = fixed to screen) */
  K.applyCam = function (ctx, p) {
    p = p == null ? 1 : p;
    const c = K.cam, z = 1 + (c.z - 1) * p;
    ctx.setTransform(1, 0, 0, 1, K.weave[0], K.weave[1]);
    ctx.translate(K.W / 2, K.H / 2);
    if (c.rot) ctx.rotate((c.rot * Math.PI) / 180 * p);
    ctx.scale(z, z);
    ctx.translate(-c.x * p - (K.W / 2) * (1 - p), -c.y * p - (K.H / 2) * (1 - p));
    K.zoom = z;
  };
  K.screen = function (ctx) { ctx.setTransform(1, 0, 0, 1, K.weave[0], K.weave[1]); K.zoom = 1; };
  K.toScreen = function (x, y) {
    const c = K.cam, r = ((c.rot || 0) * Math.PI) / 180, dx = (x - c.x) * c.z, dy = (y - c.y) * c.z;
    return [K.W / 2 + dx * Math.cos(r) - dy * Math.sin(r) + K.weave[0], K.H / 2 + dx * Math.sin(r) + dy * Math.cos(r) + K.weave[1]];
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
    n = n || 3; const out = [];
    for (let i = 0; i < n; i++) out.push([x + (w * i) / n, y]);
    for (let i = 0; i < n; i++) out.push([x + w, y + (h * i) / n]);
    for (let i = 0; i < n; i++) out.push([x + w - (w * i) / n, y + h]);
    for (let i = 0; i < n; i++) out.push([x, y + h - (h * i) / n]);
    return out;
  };
  /* rounded rectangle as points (corner radius r): cards, frames, keys */
  K.roundPts = function (x, y, w, h, r, k) {
    k = k || 3; r = Math.min(r, w / 2, h / 2); const out = [];
    const C = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
    /* straight edges get evenly spaced points too: Catmull-Rom overshoots
       when a long edge sits between two tightly packed corner points */
    const step = Math.max(8, (r * Math.PI) / 2 / k);
    C.forEach((c, ci) => {
      for (let i = 0; i <= k; i++) { const a = c[2] + (i / k) * (Math.PI / 2); out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); }
      const a1 = c[2] + Math.PI / 2, n = C[(ci + 1) % 4], e = [c[0] + Math.cos(a1) * r, c[1] + Math.sin(a1) * r], f = [n[0] + Math.cos(a1) * r, n[1] + Math.sin(a1) * r];
      const m = Math.floor(Math.hypot(f[0] - e[0], f[1] - e[1]) / step);
      for (let j = 1; j < m; j++) out.push([K.lerp(e[0], f[0], j / m), K.lerp(e[1], f[1], j / m)]);
    });
    return out;
  };

  /* ---------- boil ---------- */
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
  K.pathOf = function (ctx, pts, closed) {
    const S = segs(pts, closed);
    ctx.beginPath(); ctx.moveTo(S[0][0][0], S[0][0][1]);
    S.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
    if (closed) ctx.closePath();
  };
  /* flatten the smooth path to k points per segment (for brush ribbons) */
  K.sample = function (pts, closed, k) {
    const S = segs(pts, closed), out = []; k = k || 6;
    S.forEach((s, si) => {
      for (let i = si === 0 ? 0 : 1; i <= k; i++) {
        const u = i / k, v = 1 - u;
        out.push([v * v * v * s[0][0] + 3 * v * v * u * s[1][0] + 3 * v * u * u * s[2][0] + u * u * u * s[3][0],
          v * v * v * s[0][1] + 3 * v * v * u * s[1][1] + 3 * v * u * u * s[2][1] + u * u * u * s[3][1]]);
      }
    });
    return out;
  };
  /* continuous, even ink outline (tiny width wobble per boil frame) */
  K.inkStroke = function (ctx, pts, closed, w, color, seed) {
    ctx.strokeStyle = color;
    ctx.lineWidth = K.lw(ctx, w) * (0.95 + 0.1 * hash(seed | 0, K.bf));
    K.pathOf(ctx, pts, closed); ctx.stroke();
  };
  /* tapered brush ribbon along an open path: width w in the middle, taper at ends.
     taper: [start, end] fraction of w at the tips (0 = sharp point) */
  K.brush = function (ctx, pts, opt) {
    const o = Object.assign({ w: 6, color: K.P.ink, boil: 1, seed: 1, taper: [0.15, 0.15], alpha: 1 }, opt || {});
    if (pts.length === 2) { const [a, b] = pts; pts = [0, 0.33, 0.66, 1].map((u) => [K.lerp(a[0], b[0], u), K.lerp(a[1], b[1], u)]); }
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    const S = pts.length > 2 ? K.sample(bp, false, 5) : bp;
    const n = S.length; if (n < 2) return;
    const W = K.lw(ctx, o.w), L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = S[Math.max(0, i - 1)], b = S[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const u = i / (n - 1), prof = u < 0.5 ? K.lerp(o.taper[0], 1, Math.sin(Math.min(1, u / 0.35) * Math.PI / 2)) : K.lerp(o.taper[1], 1, Math.sin(Math.min(1, (1 - u) / 0.35) * Math.PI / 2));
      const hw = (W / 2) * prof * (0.94 + 0.12 * hash(i, o.seed + K.bf));
      L.push([S[i][0] - dy * hw, S[i][1] + dx * hw]); R.push([S[i][0] + dy * hw, S[i][1] - dx * hw]);
    }
    ctx.save(); ctx.globalAlpha *= o.alpha; ctx.fillStyle = o.color;
    ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
    ctx.closePath(); ctx.fill();
    /* round caps */
    [[S[0], W * o.taper[0] / 2], [S[n - 1], W * o.taper[1] / 2]].forEach(([p, r]) => { if (r > 0.6) { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, K.TAU); ctx.fill(); } });
    ctx.restore();
  };

  /* ---------- the workhorse: filled, shaded, shined, ink-outlined shape ----------
     opt: fill, stroke (default ink), w, boil, seed, closed,
          shade {color, dx, dy}: flat shadow band (shape minus its offset copy)
          shine {dx, dy, s, a}: white crescent highlight on dark shapes (rubber-hose shine)
          alpha */
  function band(ctx, fp, dx, dy, color) {
    const op = fp.map((p) => [p[0] + dx, p[1] + dy]);
    ctx.save(); K.pathOf(ctx, fp, true); ctx.clip();
    ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
    const seg = segs(op, true); ctx.moveTo(seg[0][0][0], seg[0][0][1]);
    seg.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill("evenodd");
    ctx.restore();
  }
  K.shape = function (ctx, pts, opt) {
    const o = Object.assign({ stroke: K.P.ink, w: 5, boil: 1.1, seed: 1, closed: true }, opt || {});
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    const fp = o.boil ? K.boil(pts, o.seed + 500, o.boil * 0.5) : pts;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.fill && o.closed !== false) {
      K.pathOf(ctx, fp, true); ctx.fillStyle = o.fill; ctx.fill();
      if (o.shade) band(ctx, fp, o.shade.dx || 0, o.shade.dy || 0, o.shade.color);
      if (o.shine) { /* crescent: shape scaled to s around its centre, minus an offset copy */
        let cx = 0, cy = 0; fp.forEach((p) => { cx += p[0]; cy += p[1]; }); cx /= fp.length; cy /= fp.length;
        const s = o.shine.s || 0.78, ip = fp.map((p) => [cx + (p[0] - cx) * s, cy + (p[1] - cy) * s]);
        ctx.save(); K.pathOf(ctx, ip, true); ctx.clip();
        ctx.globalAlpha *= o.shine.a == null ? 0.9 : o.shine.a;
        band(ctx, ip, o.shine.dx == null ? 7 : o.shine.dx, o.shine.dy == null ? 9 : o.shine.dy, K.P.shine);
        ctx.restore();
      }
    }
    if (o.stroke && o.w > 0) K.inkStroke(ctx, bp, o.closed !== false, o.w, o.stroke, o.seed);
    ctx.restore();
  };
  /* open line: tapered brush by default (set brush:false for an even stroke) */
  K.line = function (ctx, pts, opt) {
    const o = Object.assign({ stroke: K.P.ink, w: 5, boil: 1, seed: 1, brush: true }, opt || {});
    if (o.brush) return K.brush(ctx, pts, { w: o.w, color: o.stroke, boil: o.boil, seed: o.seed, taper: o.taper || [0.35, 0.35], alpha: o.alpha == null ? 1 : o.alpha });
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    K.inkStroke(ctx, o.boil ? K.boil(pts, o.seed, o.boil) : pts, false, o.w, o.stroke, o.seed);
    ctx.restore();
  };
  /* even-width limb (rubber hose): ink casing, then a fill core */
  K.hose = function (ctx, pts, w, color, seed, edge) {
    const bp = K.boil(pts, seed, 0.8);
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = K.P.ink; ctx.lineWidth = K.lw(ctx, w + (edge == null ? 8 : edge)); K.pathOf(ctx, bp, false); ctx.stroke();
    if (color !== K.P.ink) { ctx.strokeStyle = color; ctx.lineWidth = w; K.pathOf(ctx, bp, false); ctx.stroke(); }
    ctx.restore();
  };
  K.dot = function (ctx, x, y, r, fill, stroke, w, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 12), { fill, stroke: stroke === undefined ? K.P.ink : stroke, w: w || 3, boil: r * 0.04 + 0.3, seed: seed || 5 });
  };

  /* ---------- text: stable (never boils) ---------- */
  K.text = function (ctx, str, x, y, opt) {
    const o = Object.assign({ size: 40, weight: 700, font: K.FONT.label, fill: K.P.ink, stroke: null, w: 0, align: "center", base: "middle", alpha: 1, track: 0 }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight} ${o.size}px ${o.font}`; ctx.textAlign = o.align; ctx.textBaseline = o.base;
    if (o.track) ctx.letterSpacing = o.track + "px";
    if (o.stroke && o.w) { ctx.lineJoin = "round"; ctx.strokeStyle = o.stroke; ctx.lineWidth = o.w; ctx.strokeText(str, x, y); }
    ctx.fillStyle = o.fill; ctx.fillText(str, x, y);
    ctx.restore();
  };
  K.textW = function (ctx, str, size, weight, font, track) {
    ctx.save(); ctx.font = `${weight || 700} ${size}px ${font || K.FONT.label}`; if (track) ctx.letterSpacing = track + "px"; const w = ctx.measureText(str).width; ctx.restore(); return w;
  };

  /* ---------- light: additive soft disc (spotlights, bulbs, the gold glow) ---------- */
  K.glow = function (ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save(); ctx.globalAlpha *= a == null ? 1 : a; ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, K.TAU); ctx.fill(); ctx.restore();
  };
  /* four-point twinkle (white by default; gold only for money) */
  K.twinkle = function (ctx, x, y, r, a, color, seed) {
    if (a <= 0 || r <= 0) return;
    const pts = []; for (let i = 0; i < 8; i++) { const ang = (i / 8) * K.TAU - Math.PI / 2, rr = i % 2 ? r * 0.22 : r; pts.push([x + Math.cos(ang) * rr, y + Math.sin(ang) * rr]); }
    ctx.save(); ctx.globalAlpha *= a;
    K.shape(ctx, pts, { fill: color || K.P.paper, w: Math.max(2, r * 0.12), boil: 0.4, seed: seed || 1 });
    ctx.restore();
  };
})(VK);
