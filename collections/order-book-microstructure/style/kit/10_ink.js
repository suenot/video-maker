/* ============================================================
   KIT 10 INK: woodcut / block-print canvas primitives + the camera.
   - K.begin(ctx, t, cam) once per frame; everything after reads K.now / K.bf.
   - Contours "boil": vertices jitter by a hash of (vertex, seed, boil frame),
     so the drawing changes 12x per second and is identical on every seek.
   - Woodcut line: chiselled (low-tension curves, close to a polygon), solid
     (no gaps), knotty width 0.8 - 1.3x, with small paper-coloured nicks
     where the knife slipped.
   - Block-print colour: the fill is printed from a second block, offset from
     the key line by K.REG (misregistration), and carries carved gouge marks
     (tapered slivers) instead of pen hatching, plus ink-starved specks.
   - Line widths are world units but never thinner than MIN_PX on screen.
   ============================================================ */
var BK = window.BK || (window.BK = {});
(function (K) {
  const { hs, hash, clamp } = K;
  K.MIN_PX = 2.2;
  K.REG = [3.5, 2.5];           /* colour block offset from the key (ink) block, world px */
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
  K.rectPts = function (x, y, w, h, n) {
    n = n || 3; const out = [];
    for (let i = 0; i < n; i++) out.push([x + (w * i) / n, y]);
    for (let i = 0; i < n; i++) out.push([x + w, y + (h * i) / n]);
    for (let i = 0; i < n; i++) out.push([x + w - (w * i) / n, y + h]);
    for (let i = 0; i < n; i++) out.push([x, y + h - (h * i) / n]);
    return out;
  };
  /* horseshoe arch opening (stall fronts, gates): base at y, springing at y - h */
  K.archPts = function (cx, y, w, h, n) {
    n = n || 9; const rx = w / 2, ry = Math.min(rx, h * 0.4), sy = y - h + ry, out = [[cx - rx, y], [cx - rx, sy]];
    for (let i = 1; i < n; i++) { const a = Math.PI + (i / n) * Math.PI; out.push([cx + Math.cos(a) * rx, sy + Math.sin(a) * ry]); }
    out.push([cx + rx, sy], [cx + rx, y]);
    return out;
  };
  /* ---------- boil ---------- */
  K.boil = function (pts, seed, amp, frameOverride) {
    const f = frameOverride == null ? K.bf : frameOverride, s = (seed | 0) + f * 7919;
    return pts.map((p, i) => [p[0] + hs(i * 2 + 1, s) * amp, p[1] + hs(i * 2 + 2, s) * amp]);
  };

  /* ---------- chiselled path: Catmull-Rom with a tension k (1 = round, 0 = polygon) ---------- */
  function segs(pts, closed, k) {
    const n = pts.length, out = [], q = (k == null ? 0.55 : k) / 6;
    const P = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      out.push([p1, [p1[0] + (p2[0] - p0[0]) * q, p1[1] + (p2[1] - p0[1]) * q], [p2[0] - (p3[0] - p1[0]) * q, p2[1] - (p3[1] - p1[1]) * q], p2]);
    }
    return out;
  }
  K.segs = segs;
  K.pathOf = function (ctx, pts, closed, k) {
    const S = segs(pts, closed, k);
    ctx.beginPath(); ctx.moveTo(S[0][0][0], S[0][0][1]);
    S.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
    if (closed) ctx.closePath();
  };
  /* knotty woodcut stroke: continuous, width varies per segment, a few paper nicks */
  K.inkStroke = function (ctx, pts, closed, w, color, seed, k, nicks) {
    const S = segs(pts, closed, k), s = (seed | 0) + K.bf * 31;
    const base = K.lw(ctx, w);
    ctx.strokeStyle = color;
    for (let i = 0; i < S.length; i++) {
      ctx.beginPath(); ctx.moveTo(S[i][0][0], S[i][0][1]);
      ctx.lineWidth = base * (0.8 + 0.5 * hash(i + 99, seed | 0)) * (0.94 + 0.12 * hash(i, s));
      ctx.bezierCurveTo(S[i][1][0], S[i][1][1], S[i][2][0], S[i][2][1], S[i][3][0], S[i][3][1]);
      ctx.stroke();
    }
    /* nicks: short paper chips across the line (knife slips) */
    const np = nicks == null ? 0.1 : nicks;
    if (np > 0 && S.length > 4 && base * curScale(ctx) > 3) {
      ctx.save(); ctx.strokeStyle = K.P.paper; ctx.lineWidth = base * 0.28;
      for (let i = 0; i < S.length; i++) {
        if (hash(i + 7, seed | 0) > np) continue;
        const a = S[i][0], b = S[i][3], u = 0.3 + 0.4 * hash(i + 3, seed | 0);
        const mx = a[0] + (b[0] - a[0]) * u, my = a[1] + (b[1] - a[1]) * u, L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, d = base * 0.45;
        ctx.beginPath(); ctx.moveTo(mx - nx * d, my - ny * d); ctx.lineTo(mx + nx * d * 0.2, my + ny * d * 0.2); ctx.stroke();
      }
      ctx.restore();
    }
  };

  /* ---------- gouge: carved tapered slivers clipped to a shape (woodcut shading) ---------- */
  K.gouge = function (ctx, pts, opt) {
    const o = Object.assign({ ang: -0.6, gap: 14, w: 5, color: K.P.inkSoft, alpha: 0.5, seed: 3, len: 0.55, side: 0, closed: true, k: null }, opt || {});
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
    ctx.save(); K.pathOf(ctx, pts, o.closed, o.k); ctx.clip();
    ctx.globalAlpha *= o.alpha; ctx.fillStyle = o.color;
    const ca = Math.cos(o.ang), sa = Math.sin(o.ang), s = o.seed + K.bf * 13, ww = K.lw(ctx, o.w);
    ctx.beginPath();
    for (let d = -R, i = 0; d <= R; d += o.gap, i++) {
      const px = cx - sa * (d + hs(i, s) * 1.2), py = cy + ca * (d + hs(i, s) * 1.2);
      /* each sliver starts at the shape edge on the "side" and tapers inward */
      const L = R * o.len * (0.55 + 0.6 * hash(i + 7, o.seed)), st = (o.side || -1) * R;
      const ax = px + ca * st, ay = py + sa * st, bx = ax + ca * L * -Math.sign(st || -1), by = ay + sa * L * -Math.sign(st || -1);
      ctx.moveTo(ax - sa * ww / 2, ay + ca * ww / 2); ctx.lineTo(bx + hs(i + 3, s) * 1.5, by + hs(i + 5, s) * 1.5); ctx.lineTo(ax + sa * ww / 2, ay - ca * ww / 2); ctx.closePath();
    }
    ctx.fill(); ctx.restore();
  };

  /* ---------- textile patterns clipped to a shape ----------
     kind: "stripes" (vertical bands), "zigzag", "dots", "diamonds" */
  K.pattern = function (ctx, pts, opt) {
    const o = Object.assign({ kind: "stripes", color: K.P.paper, gap: 40, w: 18, alpha: 1, seed: 5, ang: 0, k: null }, opt || {});
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    ctx.save(); K.pathOf(ctx, pts, true, o.k); ctx.clip(); ctx.globalAlpha *= o.alpha;
    ctx.fillStyle = o.color; ctx.strokeStyle = o.color; ctx.lineWidth = K.lw(ctx, o.w);
    const s = o.seed + K.bf * 3;
    if (o.kind === "stripes") {
      ctx.beginPath();
      for (let x = x0 + o.gap / 2, i = 0; x < x1 + o.gap; x += o.gap * 2, i++) {
        const j = hs(i, s) * 1.2;
        ctx.moveTo(x + j, y0 - 4); ctx.lineTo(x + o.gap + j, y0 - 4); ctx.lineTo(x + o.gap + hs(i + 9, s) * 1.2, y1 + 4); ctx.lineTo(x + hs(i + 5, s) * 1.2, y1 + 4); ctx.closePath();
      }
      ctx.fill();
    } else if (o.kind === "zigzag") {
      for (let y = y0 + o.gap / 2, r = 0; y < y1 + o.gap; y += o.gap, r++) {
        ctx.beginPath();
        for (let x = x0 - o.gap, i = 0; x < x1 + o.gap; x += o.gap / 2, i++) ctx.lineTo(x + hs(i + r * 50, s) * 0.8, y + (i % 2 ? -o.gap * 0.22 : o.gap * 0.22) + hs(i + r * 50 + 7, s) * 0.8);
        ctx.stroke();
      }
    } else if (o.kind === "dots") {
      ctx.beginPath();
      for (let y = y0 + o.gap / 2, r = 0; y < y1 + o.gap; y += o.gap, r++)
        for (let x = x0 + (r % 2 ? o.gap / 2 : 0), i = 0; x < x1 + o.gap; x += o.gap, i++) { ctx.moveTo(x + o.w / 2, y); ctx.arc(x + hs(i + r * 31, s) * 0.8, y, o.w / 2, 0, K.TAU); }
      ctx.fill();
    } else if (o.kind === "diamonds") {
      ctx.beginPath();
      for (let y = y0, r = 0; y < y1 + o.gap; y += o.gap, r++)
        for (let x = x0 + (r % 2 ? o.gap / 2 : 0), i = 0; x < x1 + o.gap; x += o.gap, i++) {
          const d = o.w; ctx.moveTo(x, y - d); ctx.lineTo(x + d * 0.7, y); ctx.lineTo(x, y + d); ctx.lineTo(x - d * 0.7, y); ctx.closePath();
        }
      ctx.fill();
    }
    ctx.restore();
  };

  /* ---------- the workhorse: printed colour block + woodcut key line ----------
     opt: fill, stroke (default ink), w (outline width), boil (amp), seed,
          shade ({color, dx, dy}: flat shadow band), gouge (K.gouge opts),
          pattern (K.pattern opts or array), specks (count of ink-starved spots),
          reg (false = no misregistration), k (curve tension), nicks, closed, alpha */
  K.shape = function (ctx, pts, opt) {
    const o = Object.assign({ stroke: K.P.ink, w: 5, boil: 1.4, seed: 1, closed: true, reg: true }, opt || {});
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    let fp = o.boil ? K.boil(pts, o.seed + 500, o.boil * 0.5) : pts;
    if (o.reg && o.fill) { const r = K.REG; fp = fp.map((p) => [p[0] + r[0], p[1] + r[1]]); }
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.fill && o.closed !== false) {
      K.pathOf(ctx, fp, true, o.k); ctx.fillStyle = o.fill; ctx.fill();
      if (o.pattern) (Array.isArray(o.pattern) ? o.pattern : [o.pattern]).forEach((pp, i) => K.pattern(ctx, fp, Object.assign({ seed: o.seed + 30 + i, k: o.k }, pp)));
      if (o.shade) {
        const op = fp.map((p) => [p[0] + (o.shade.dx || 0), p[1] + (o.shade.dy || 0)]);
        ctx.save(); K.pathOf(ctx, fp, true, o.k); ctx.clip();
        ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
        const sg = segs(op, true, o.k); ctx.moveTo(sg[0][0][0], sg[0][0][1]);
        sg.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
        ctx.closePath(); ctx.fillStyle = o.shade.color; ctx.fill("evenodd");
        ctx.restore();
      }
      if (o.gouge) K.gouge(ctx, fp, Object.assign({ seed: o.seed + 9, k: o.k }, o.gouge));
      if (o.specks) K.specks(ctx, fp, o.specks, o.seed + 17, o.k);
    }
    if (o.stroke && o.w > 0) K.inkStroke(ctx, bp, o.closed !== false, o.w, o.stroke, o.seed, o.k, o.nicks);
    ctx.restore();
  };
  /* ink-starved specks: little paper holes where the block did not take ink (fixed per seed) */
  K.specks = function (ctx, pts, n, seed, k) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    ctx.save(); K.pathOf(ctx, pts, true, k); ctx.clip(); ctx.globalAlpha *= 0.45; ctx.fillStyle = K.P.paper;
    const r0 = Math.max(1.6, Math.min(x1 - x0, y1 - y0) * 0.018);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * hash(i, seed), y = y0 + (y1 - y0) * hash(i + 50, seed), r = r0 * (0.5 + hash(i + 90, seed));
      ctx.moveTo(x + r, y); ctx.ellipse(x, y, r, r * 0.6, hash(i + 3, seed) * 3, 0, K.TAU);
    }
    ctx.fill(); ctx.restore();
  };
  /* open line (ropes, strings, motion lines) */
  K.line = function (ctx, pts, opt) {
    K.shape(ctx, pts, Object.assign({ closed: false, fill: null, nicks: 0 }, opt || {}));
  };
  K.dot = function (ctx, x, y, r, fill, stroke, w, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 10), { fill, stroke: stroke === undefined ? K.P.ink : stroke, w: w || 3, boil: r * 0.05 + 0.4, seed: seed || 5, nicks: 0, k: 1, reg: r > 10 });
  };

  /* ---------- text: stable (never boils) ---------- */
  K.text = function (ctx, str, x, y, opt) {
    const o = Object.assign({ size: 40, weight: 800, font: K.FONT.label, fill: K.P.ink, stroke: null, w: 0, align: "center", base: "middle", alpha: 1, track: 0 }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight} ${o.size}px ${o.font}`; ctx.textAlign = o.align; ctx.textBaseline = o.base;
    if (o.track) ctx.letterSpacing = o.track + "px";
    if (o.stroke && o.w) { ctx.lineJoin = "round"; ctx.strokeStyle = o.stroke; ctx.lineWidth = o.w; ctx.strokeText(str, x, y); }
    ctx.fillStyle = o.fill; ctx.fillText(str, x, y);
    ctx.restore();
  };
  K.textW = function (ctx, str, size, weight, font) {
    ctx.save(); ctx.font = `${weight || 800} ${size}px ${font || K.FONT.label}`; const w = ctx.measureText(str).width; ctx.restore(); return w;
  };

  /* ---------- glow: lantern light, the sun, a hot level ---------- */
  K.glow = function (ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save(); ctx.globalAlpha *= a == null ? 1 : a; ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, K.TAU); ctx.fill(); ctx.restore();
  };
})(BK);
