/* ============================================================
   KIT 10 INK: hand-drawn canvas primitives + the camera.
   - K.begin(ctx, t, cam) once per frame; everything after reads K.now / K.bf.
   - Contours "boil": vertices jitter by a hash of (vertex, seed, boil frame),
     so the drawing changes 12x per second and is identical on every seek.
   - Strokes are broken (small gaps) and slightly vary in width.
   - Line widths are world units but never thinner than MIN_PX on screen.
   ============================================================ */
var CK = window.CK || (window.CK = {});
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
  /* current transform scale (works inside nested save/translate/scale) */
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
  /* irregular closed blob (islands, clouds): fixed by seed, not by time */
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
  /* jitter each vertex by amp (world units); frame-stepped at 12 fps */
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
  /* broken, width-varying ink stroke along the smooth path */
  K.inkStroke = function (ctx, pts, closed, w, color, seed, gapP) {
    const S = segs(pts, closed), s = (seed | 0) + K.bf * 31;
    const base = K.lw(ctx, w);
    ctx.strokeStyle = color;
    let open = false;
    for (let i = 0; i < S.length; i++) {
      const gap = S.length > 6 && hash(i, s) < (gapP == null ? 0.07 : gapP);
      if (gap) { if (open) { ctx.stroke(); open = false; } continue; }
      if (!open) { ctx.beginPath(); ctx.moveTo(S[i][0][0], S[i][0][1]); ctx.lineWidth = base * (0.86 + 0.28 * hash(i + 99, s)); open = true; }
      ctx.bezierCurveTo(S[i][1][0], S[i][1][1], S[i][2][0], S[i][2][1], S[i][3][0], S[i][3][1]);
    }
    if (open) ctx.stroke();
  };

  /* ---------- hatching: parallel boiled strokes clipped to a path ---------- */
  K.hatch = function (ctx, pts, opt) {
    const o = Object.assign({ ang: -0.9, gap: 10, w: 1.6, color: K.P.inkSoft, alpha: 0.55, seed: 3, amp: 1.2, closed: true }, opt || {});
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
    ctx.save(); K.pathOf(ctx, pts, o.closed); ctx.clip();
    ctx.globalAlpha *= o.alpha; ctx.strokeStyle = o.color; ctx.lineWidth = K.lw(ctx, o.w);
    const ca = Math.cos(o.ang), sa = Math.sin(o.ang), s = o.seed + K.bf * 13;
    ctx.beginPath();
    for (let d = -R, i = 0; d <= R; d += o.gap, i++) {
      const j = hs(i, s) * o.amp, L = R * (0.85 + 0.15 * hash(i + 7, s));
      const px = cx - sa * (d + j), py = cy + ca * (d + j);
      ctx.moveTo(px - ca * L, py - sa * L); ctx.lineTo(px + ca * L + hs(i + 3, s) * o.amp, py + sa * L + hs(i + 5, s) * o.amp);
    }
    ctx.stroke(); ctx.restore();
  };

  /* ---------- the workhorse: filled, hatched, boiled, ink-outlined shape ----------
     opt: fill, stroke (default ink), w (outline width), boil (amp), seed,
          hatch (object for K.hatch, or null), shade ({color, dx, dy}: inner shadow band),
          gap (break probability), closed (default true), alpha */
  K.shape = function (ctx, pts, opt) {
    const o = Object.assign({ stroke: K.P.ink, w: 4, boil: 1.6, seed: 1, closed: true }, opt || {});
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    const fp = o.boil ? K.boil(pts, o.seed + 500, o.boil * 0.5) : pts;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.fill && o.closed !== false) {
      K.pathOf(ctx, fp, true); ctx.fillStyle = o.fill; ctx.fill();
      if (o.shade) { /* flat shadow band: the shape minus its own offset copy */
        const op = fp.map((p) => [p[0] + (o.shade.dx || 0), p[1] + (o.shade.dy || 0)]);
        ctx.save(); K.pathOf(ctx, fp, true); ctx.clip();
        ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
        const seg = segs(op, true); ctx.moveTo(seg[0][0][0], seg[0][0][1]);
        seg.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
        ctx.closePath(); ctx.fillStyle = o.shade.color; ctx.fill("evenodd");
        ctx.restore();
      }
      if (o.hatch) K.hatch(ctx, fp, Object.assign({ seed: o.seed + 9 }, o.hatch));
    }
    if (o.stroke && o.w > 0) K.inkStroke(ctx, bp, o.closed !== false, o.w, o.stroke, o.seed, o.gap);
    ctx.restore();
  };
  /* open boiled line (ropes, cracks, motion lines) */
  K.line = function (ctx, pts, opt) {
    K.shape(ctx, pts, Object.assign({ closed: false, fill: null, gap: 0.04 }, opt || {}));
  };
  K.dot = function (ctx, x, y, r, fill, stroke, w, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 10), { fill, stroke: stroke === undefined ? K.P.ink : stroke, w: w || 2.5, boil: r * 0.06 + 0.4, seed: seed || 5, gap: 0 });
  };

  /* ---------- text: stable (never boils), ink outline under fill ---------- */
  K.text = function (ctx, str, x, y, opt) {
    const o = Object.assign({ size: 40, weight: 800, font: K.FONT.display, fill: K.P.ink, stroke: null, w: 0, align: "center", base: "middle", alpha: 1, track: 0 }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight} ${o.size}px ${o.font}`; ctx.textAlign = o.align; ctx.textBaseline = o.base;
    if (o.track) ctx.letterSpacing = o.track + "px";
    if (o.stroke && o.w) { ctx.lineJoin = "round"; ctx.strokeStyle = o.stroke; ctx.lineWidth = o.w; ctx.strokeText(str, x, y); }
    ctx.fillStyle = o.fill; ctx.fillText(str, x, y);
    ctx.restore();
  };
  K.textW = function (ctx, str, size, weight, font) {
    ctx.save(); ctx.font = `${weight || 800} ${size}px ${font || K.FONT.display}`; const w = ctx.measureText(str).width; ctx.restore(); return w;
  };

  /* ---------- glow (additive soft disc), used for route light and sun ---------- */
  K.glow = function (ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save(); ctx.globalAlpha *= a == null ? 1 : a; ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, K.TAU); ctx.fill(); ctx.restore();
  };
})(CK);
