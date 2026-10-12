/* ============================================================
   KIT 10 INK: "neon cel" canvas primitives + the camera.
   - K.begin(ctx, t, cam) once per frame; everything after reads K.now / K.bf.
   - Contours boil gently: vertices jitter by a hash of (vertex, seed, boil
     frame), so the drawing changes 12x per second and is identical on seek.
   - Unlike a pen line, outlines here are chunky, continuous and navy; light
     comes from the neon: every lit shape gets a coloured RIM band on the side
     facing the light and a navy SHADE band on the far side, plus optional
     halftone dots (80s print) instead of hatching.
   - Line widths are world units but never thinner than MIN_PX on screen.
   ============================================================ */
var AK = window.AK || (window.AK = {});
(function (K) {
  const { hs, hash, clamp } = K;
  K.MIN_PX = 2.0;
  K.now = 0; K.bf = 0; K.zoom = 1;

  /* ---------- camera: world -> screen. cam = {x, y, z, rot} (centre, zoom, degrees) ---------- */
  K.W = 1920; K.H = 1080;
  K.begin = function (ctx, t, cam) {
    K.ctx = ctx; K.now = t; K.bf = K.boilFrame(t); K.cam = cam; K.zoom = cam.z;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  };
  /* apply camera with an optional parallax factor p (1 = world plane, 0 = fixed to screen) */
  K.applyCam = function (ctx, p) {
    p = p == null ? 1 : p;
    const c = K.cam, z = 1 + (c.z - 1) * p;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(K.W / 2, K.H / 2);
    if (c.rot) ctx.rotate((c.rot * Math.PI) / 180 * p);
    ctx.scale(z, z);
    ctx.translate(-c.x * p - (1 - p) * 960, -c.y * p - (1 - p) * 540);
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
  /* rounded rectangle (the house shape of this world: chunky, soft corners) */
  K.rrPts = function (x, y, w, h, r, n) {
    r = Math.min(r, w / 2, h / 2); n = n || 3; const out = [];
    const C = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
    C.forEach((c) => { for (let i = 0; i <= n; i++) { const a = c[2] + (i / n) * (Math.PI / 2); out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } });
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

  /* ---------- boil ---------- */
  K.boil = function (pts, seed, amp, frameOverride) {
    const f = frameOverride == null ? K.bf : frameOverride, s = (seed | 0) + f * 7919;
    return pts.map((p, i) => [p[0] + hs(i * 2 + 1, s) * amp, p[1] + hs(i * 2 + 2, s) * amp]);
  };

  /* ---------- smooth path (Catmull-Rom -> Bezier) ---------- */
  function segs(pts, closed) {
    const n = pts.length, out = [];
    const P = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      /* handles are capped at 1/3 of the segment, so a long edge next to a
         tight rounded corner never overshoots into a spike */
      const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), cap = (hx, hy) => { const l = Math.hypot(hx, hy), k = l > d / 3 ? d / 3 / l : 1; return [hx * k, hy * k]; };
      const h1 = cap((p2[0] - p0[0]) / 6, (p2[1] - p0[1]) / 6), h2 = cap((p3[0] - p1[0]) / 6, (p3[1] - p1[1]) / 6);
      out.push([p1, [p1[0] + h1[0], p1[1] + h1[1]], [p2[0] - h2[0], p2[1] - h2[1]], p2]);
    }
    return out;
  }
  K.segs = segs;
  K.pathOf = function (ctx, pts, closed) {
    const S = segs(pts, closed);
    ctx.beginPath(); ctx.moveTo(S[0][0][0], S[0][0][1]);
    S.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
    if (closed) ctx.closePath();
  };
  /* chunky outline: continuous by default, width breathes 0.94 - 1.06x per boil frame */
  K.inkStroke = function (ctx, pts, closed, w, color, seed, gapP) {
    const base = K.lw(ctx, w) * (0.94 + 0.12 * hash(seed | 0, K.bf * 31));
    ctx.strokeStyle = color; ctx.lineWidth = base;
    if (!gapP) { K.pathOf(ctx, pts, closed); ctx.stroke(); return; }
    const S = segs(pts, closed), s = (seed | 0) + K.bf * 31; let open = false;
    for (let i = 0; i < S.length; i++) {
      if (S.length > 6 && hash(i, s) < gapP) { if (open) { ctx.stroke(); open = false; } continue; }
      if (!open) { ctx.beginPath(); ctx.moveTo(S[i][0][0], S[i][0][1]); open = true; }
      ctx.bezierCurveTo(S[i][1][0], S[i][1][1], S[i][2][0], S[i][2][1], S[i][3][0], S[i][3][1]);
    }
    if (open) ctx.stroke();
  };

  /* ---------- halftone: dot screen clipped to a path (replaces hatching) ---------- */
  K.halftone = function (ctx, pts, opt) {
    const o = Object.assign({ gap: 12, r: 2.6, color: K.P.ink, alpha: 0.35, ang: 0.5, fade: null }, opt || {});
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    ctx.save(); K.pathOf(ctx, pts, true); ctx.clip();
    ctx.globalAlpha *= o.alpha; ctx.fillStyle = o.color; ctx.beginPath();
    const ca = Math.cos(o.ang), sa = Math.sin(o.ang), R = Math.hypot(x1 - x0, y1 - y0) / 2 + o.gap, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    for (let u = -R; u <= R; u += o.gap) for (let v = -R; v <= R; v += o.gap) {
      const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
      /* dots grow toward the lower right (away from the light) unless fade says otherwise */
      const k = o.fade ? o.fade(x, y) : clamp(((x - x0) / (x1 - x0 || 1) + (y - y0) / (y1 - y0 || 1)) / 2, 0, 1);
      const r = o.r * k; if (r < 0.4) continue;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, K.TAU);
    }
    ctx.fill(); ctx.restore();
  };

  /* band = shape minus its own offset copy, filled (used for shade and rim light) */
  function band(ctx, fp, dx, dy, color, alpha, comp) {
    const op = fp.map((p) => [p[0] + dx, p[1] + dy]);
    ctx.save(); K.pathOf(ctx, fp, true); ctx.clip();
    ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
    const seg = segs(op, true); ctx.moveTo(seg[0][0][0], seg[0][0][1]);
    seg.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
    ctx.closePath(); if (alpha != null) ctx.globalAlpha *= alpha; if (comp) ctx.globalCompositeOperation = comp;
    ctx.fillStyle = color; ctx.fill("evenodd");
    ctx.restore();
  }

  /* ---------- the workhorse: filled, cel-shaded, rim-lit, boiled, navy-outlined shape ----------
     opt: fill, stroke (default ink), w (outline width), boil (amp), seed,
          shade {color, dx, dy}   dark band on the far side (default lower right)
          rim   {color, dx, dy, a} neon light band on the near side (upper left)
          dots  object for K.halftone (or null), gloss (0..1 white highlight),
          glow  neon colour drawn as an outer halo, gap (break probability), closed, alpha */
  K.shape = function (ctx, pts, opt) {
    const o = Object.assign({ stroke: K.P.ink, w: 5, boil: 1.0, seed: 1, closed: true }, opt || {});
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    const fp = o.boil ? K.boil(pts, o.seed + 500, o.boil * 0.5) : pts;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.glow) { ctx.save(); ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowR || 28; K.pathOf(ctx, fp, true); ctx.fillStyle = o.fill || o.glow; ctx.fill(); ctx.restore(); }
    if (o.fill && o.closed !== false) {
      K.pathOf(ctx, fp, true); ctx.fillStyle = o.fill; ctx.fill();
      if (o.shade) band(ctx, fp, o.shade.dx == null ? -10 : o.shade.dx, o.shade.dy == null ? -10 : o.shade.dy, o.shade.color, o.shade.a);
      if (o.dots) K.halftone(ctx, fp, o.dots);
      if (o.rim) band(ctx, fp, o.rim.dx == null ? 5 : o.rim.dx, o.rim.dy == null ? 5 : o.rim.dy, o.rim.color, o.rim.a == null ? 0.9 : o.rim.a);
      if (o.gloss) {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        fp.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
        const w = x1 - x0, h = y1 - y0;
        ctx.save(); K.pathOf(ctx, fp, true); ctx.clip(); ctx.globalAlpha *= o.gloss; ctx.fillStyle = "#ffffff";
        K.pathOf(ctx, K.ellipsePts(x0 + w * 0.3, y0 + h * 0.22, w * 0.16, h * 0.07, 10, -0.35), true); ctx.fill(); ctx.restore();
      }
    }
    if (o.stroke && o.w > 0) K.inkStroke(ctx, bp, o.closed !== false, o.w, o.stroke, o.seed, o.gap);
    ctx.restore();
  };
  K.line = function (ctx, pts, opt) {
    K.shape(ctx, pts, Object.assign({ closed: false, fill: null }, opt || {}));
  };
  K.dot = function (ctx, x, y, r, fill, stroke, w, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 10), { fill, stroke: stroke === undefined ? K.P.ink : stroke, w: w || 3, boil: r * 0.04 + 0.3, seed: seed || 5 });
  };

  /* ---------- neon tube: halo + coloured tube + hot white core ----------
     opt: color, w (tube width), closed, on (0..1 brightness), seed */
  K.flick = function (t, seed, depth) {
    /* stepped at the boil rate: mostly lit, rare short dips (deterministic) */
    const f = K.boilFrame(t), h = hash(f, (seed || 1) * 97);
    return h < 0.06 ? 1 - (depth == null ? 0.55 : depth) : 0.92 + 0.08 * hash(f + 3, seed || 1);
  };
  K.neon = function (ctx, pts, opt) {
    const o = Object.assign({ color: K.P.pink, w: 8, closed: false, on: 1, seed: 1, boil: 0.5, core: "#ffffff" }, opt || {});
    if (o.on <= 0.01) return;
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts, lw = K.lw(ctx, o.w);
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.globalAlpha *= o.on;
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = o.color;
    ctx.globalAlpha *= 0.16; ctx.lineWidth = lw * 5; K.pathOf(ctx, bp, o.closed); ctx.stroke();
    ctx.globalAlpha /= 0.16; ctx.globalAlpha *= 0.28; ctx.lineWidth = lw * 2.6; ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = o.color; ctx.lineWidth = lw; K.pathOf(ctx, bp, o.closed); ctx.stroke();
    ctx.globalAlpha *= 0.85; ctx.strokeStyle = o.core; ctx.lineWidth = Math.max(1, lw * 0.32); ctx.stroke();
    ctx.restore();
  };

  /* ---------- text: stable (never boils); optional neon glow ---------- */
  K.text = function (ctx, str, x, y, opt) {
    const o = Object.assign({ size: 40, weight: 400, font: K.FONT.display, fill: K.P.ink, stroke: null, w: 0, align: "center", base: "middle", alpha: 1, track: 0, glow: null }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight} ${o.size}px ${o.font}`; ctx.textAlign = o.align; ctx.textBaseline = o.base;
    if (o.track) ctx.letterSpacing = o.track + "px";
    if (o.stroke && o.w) { ctx.lineJoin = "round"; ctx.strokeStyle = o.stroke; ctx.lineWidth = o.w; ctx.strokeText(str, x, y); }
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowR || 16; }
    ctx.fillStyle = o.fill; ctx.fillText(str, x, y);
    ctx.restore();
  };
  K.textW = function (ctx, str, size, weight, font) {
    ctx.save(); ctx.font = `${weight || 400} ${size}px ${font || K.FONT.display}`; const w = ctx.measureText(str).width; ctx.restore(); return w;
  };

  /* ---------- glow (additive soft disc): lamps, screens, signal pulses ---------- */
  K.glow = function (ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save(); ctx.globalAlpha *= a == null ? 1 : a; ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, K.TAU); ctx.fill(); ctx.restore();
  };
  /* hex colour -> rgba string */
  K.rgba = function (hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
})(AK);
