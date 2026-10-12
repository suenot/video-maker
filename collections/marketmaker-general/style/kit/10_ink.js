/* ============================================================
   KIT 10 INK: flat-vector canvas primitives + the camera.
   - K.begin(ctx, t, cam) once per frame; everything after reads K.now / K.bf.
   - Contours "breathe" (a soft boil): vertices drift by a hash of
     (vertex, seed, boil frame) at 12 fps, with a small amplitude so lines
     stay clean and editorial. Outlines are continuous (no broken strokes).
   - Shading is flat: a shadow band (shape minus offset copy), an optional
     flat highlight band, and optional halftone dots. No hatching.
   - Line widths are world units but never thinner than MIN_PX on screen.
   ============================================================ */
var MK = window.MK || (window.MK = {});
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
  };
  /* apply camera with an optional parallax factor p (1 = world plane, 0 = fixed to screen) */
  K.applyCam = function (ctx, p) {
    p = p == null ? 1 : p;
    const c = K.cam, z = 1 + (c.z - 1) * p;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(K.W / 2, K.H / 2);
    if (c.rot) ctx.rotate((c.rot * Math.PI) / 180 * p);
    ctx.scale(z, z);
    ctx.translate(-c.x * p, -c.y * p);
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
  /* rounded rectangle as a point ring (editorial cards are always rounded) */
  K.rrectPts = function (x, y, w, h, r, n) {
    r = Math.min(r, w / 2, h / 2); n = Math.max(6, n || 6); const out = [];
    const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
    out.sharp = true; /* straight edges: a spline would overshoot past the corners */
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

  /* ---------- boil (soft) ---------- */
  K.boil = function (pts, seed, amp, frameOverride) {
    const f = frameOverride == null ? K.bf : frameOverride, s = (seed | 0) + f * 7919;
    return pts.map((p, i) => [p[0] + hs(i * 2 + 1, s) * amp, p[1] + hs(i * 2 + 2, s) * amp]);
  };

  /* ---------- smooth path through points (Catmull-Rom -> Bezier) ---------- */
  function segs(pts, closed, sharp) {
    const n = pts.length, out = [];
    const P = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
    const last = closed ? n : n - 1, k = sharp ? 0 : 1 / 6;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      out.push([p1, [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k], [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k], p2]);
    }
    return out;
  }
  K.segs = segs;
  K.pathOf = function (ctx, pts, closed, sharp) {
    const S = segs(pts, closed, sharp);
    ctx.beginPath(); ctx.moveTo(S[0][0][0], S[0][0][1]);
    S.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
    if (closed) ctx.closePath();
  };
  /* clean continuous stroke; width breathes very slightly per boil frame */
  K.inkStroke = function (ctx, pts, closed, w, color, seed, sharp) {
    ctx.strokeStyle = color;
    ctx.lineWidth = K.lw(ctx, w) * (0.96 + 0.08 * hash(seed | 0, K.bf));
    K.pathOf(ctx, pts, closed, sharp); ctx.stroke();
  };

  /* ---------- halftone: dot grid clipped to a path, dots grow along a direction ----------
     opt: color, alpha, gap (dot pitch), r (max radius), ang (direction the dots grow toward), from/to (0..1 ramp) */
  K.halftone = function (ctx, pts, opt) {
    const o = Object.assign({ color: K.P.ink, alpha: 0.18, gap: 12, r: 3.4, ang: 0.8, from: 0.15, to: 1, closed: true }, opt || {});
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 || 1;
    const ca = Math.cos(o.ang), sa = Math.sin(o.ang);
    ctx.save(); K.pathOf(ctx, pts, o.closed); ctx.clip();
    ctx.globalAlpha *= o.alpha; ctx.fillStyle = o.color; ctx.beginPath();
    let row = 0;
    for (let y = y0 - o.gap; y <= y1 + o.gap; y += o.gap * 0.866, row++) {
      for (let x = x0 - o.gap + (row % 2) * o.gap * 0.5; x <= x1 + o.gap; x += o.gap) {
        const d = ((x - cx) * ca + (y - cy) * sa) / R * 0.5 + 0.5; /* 0 at the light side, 1 at the dark side */
        const k = clamp((d - o.from) / (o.to - o.from), 0, 1), r = o.r * k;
        if (r < 0.35) continue;
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, K.TAU);
      }
    }
    ctx.fill(); ctx.restore();
  };

  /* ---------- the workhorse: flat filled, outlined shape ----------
     opt: fill, stroke (default ink), w (outline width), boil (amp), seed,
          shade ({color, dx, dy}: shadow band = shape minus its offset copy),
          hi ({color, dx, dy}: flat highlight band on the light side),
          dots (object for K.halftone, or null), drop ({dx, dy, color}: flat sticker shadow),
          closed (default true), sharp (straight segments), alpha */
  K.shape = function (ctx, pts, opt) {
    const o = Object.assign({ stroke: K.P.ink, w: 5, boil: 0.9, seed: 1, closed: true }, opt || {});
    if (pts.sharp) o.sharp = true;
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.drop && o.closed !== false) {
      ctx.save(); ctx.translate(o.drop.dx || 0, o.drop.dy == null ? 10 : o.drop.dy);
      K.pathOf(ctx, bp, true, o.sharp); ctx.fillStyle = o.drop.color || "rgba(10,30,80,0.28)"; ctx.fill(); ctx.restore();
    }
    if (o.fill && o.closed !== false) {
      K.pathOf(ctx, bp, true, o.sharp); ctx.fillStyle = o.fill; ctx.fill();
      const band = (b) => {
        const op = bp.map((p) => [p[0] + (b.dx || 0), p[1] + (b.dy || 0)]);
        ctx.save(); K.pathOf(ctx, bp, true, o.sharp); ctx.clip();
        ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
        const seg = segs(op, true, o.sharp); ctx.moveTo(seg[0][0][0], seg[0][0][1]);
        seg.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
        ctx.closePath(); ctx.fillStyle = b.color; ctx.fill("evenodd");
        ctx.restore();
      };
      if (o.shade) band(o.shade);
      if (o.hi) band(o.hi);
      if (o.dots) K.halftone(ctx, bp, o.dots);
    }
    if (o.stroke && o.w > 0) K.inkStroke(ctx, bp, o.closed !== false, o.w, o.stroke, o.seed, o.sharp);
    ctx.restore();
  };
  K.line = function (ctx, pts, opt) {
    K.shape(ctx, pts, Object.assign({ closed: false, fill: null }, opt || {}));
  };
  /* outlined tube: ink stroke, then a colour stroke on top (tentacles, kelp, pipes) */
  K.tube = function (ctx, pts, w, color, seed, opt) {
    const o = opt || {};
    K.line(ctx, pts, { stroke: o.outline || K.P.ink, w: w + (o.ow || 9), boil: o.boil == null ? 0.7 : o.boil, seed });
    K.line(ctx, pts, { stroke: color, w, boil: o.boil == null ? 0.7 : o.boil, seed });
  };
  K.dot = function (ctx, x, y, r, fill, stroke, w, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 12), { fill, stroke: stroke === undefined ? K.P.ink : stroke, w: w || 3, boil: r * 0.03 + 0.3, seed: seed || 5 });
  };

  /* ---------- text: stable (never boils) ---------- */
  K.text = function (ctx, str, x, y, opt) {
    const o = Object.assign({ size: 40, weight: 800, font: K.FONT.text, fill: K.P.ink, stroke: null, w: 0, align: "center", base: "middle", alpha: 1, track: 0 }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight} ${o.size}px ${o.font}`; ctx.textAlign = o.align; ctx.textBaseline = o.base;
    if (o.track) ctx.letterSpacing = o.track + "px";
    if (o.stroke && o.w) { ctx.lineJoin = "round"; ctx.strokeStyle = o.stroke; ctx.lineWidth = o.w; ctx.strokeText(str, x, y); }
    ctx.fillStyle = o.fill; ctx.fillText(str, x, y);
    ctx.restore();
  };
  K.textW = function (ctx, str, size, weight, font) {
    ctx.save(); ctx.font = `${weight || 800} ${size}px ${font || K.FONT.text}`; const w = ctx.measureText(str).width; ctx.restore(); return w;
  };

  /* ---------- soft light (additive disc): light rays, bubbles' sheen, the spread glow ---------- */
  K.glow = function (ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save(); ctx.globalAlpha *= a == null ? 1 : a; ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, K.TAU); ctx.fill(); ctx.restore();
  };
})(MK);
