/* ============================================================
   KIT 10 INK: 1950s comic-print canvas primitives + the camera.
   - K.begin(ctx, t, cam) once per frame; everything after reads K.now / K.bf.
   - Contours "boil": vertices jitter by a hash of (vertex, seed, boil frame),
     so the drawing changes 12x per second and is identical on every seek.
   - Outlines are BRUSH strokes: one filled ribbon whose width swells and
     thins along the path (open lines taper at both ends). No broken gaps.
   - Shading is printed: a Ben-Day dot screen inside the shadow band, and the
     colour fill sits slightly off-register from the black plate (K.MISREG).
   - Line widths are world units but never thinner than MIN_PX on screen.
   ============================================================ */
var DK = window.DK || (window.DK = {});
(function (K) {
  const { hs, hash, clamp } = K;
  K.MIN_PX = 2.0;
  K.MISREG = [-2.5, 2]; /* colour plate offset from the black plate (world px) */
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
  K.curScale = curScale;
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
  /* irregular closed blob: fixed by seed, not by time */
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
  /* rounded rectangle (diner chrome, trays, tickets): r = corner radius */
  K.roundRectPts = function (x, y, w, h, r, nc) {
    nc = nc || 4; r = Math.min(r, w / 2, h / 2); const out = [];
    const C = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
    C.forEach((c) => { for (let i = 0; i <= nc; i++) { const a = c[2] + (i / nc) * Math.PI / 2; out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } });
    return out;
  };

  /* ---------- boil ---------- */
  K.boil = function (pts, seed, amp, frameOverride) {
    const f = frameOverride == null ? K.bf : frameOverride, s = (seed | 0) + f * 7919;
    return pts.map((p, i) => [p[0] + hs(i * 2 + 1, s) * amp, p[1] + hs(i * 2 + 2, s) * amp]);
  };

  /* ---------- smooth path through points (Catmull-Rom -> Bezier, handles capped at 1/3 seg) ---------- */
  function segs(pts, closed) {
    const n = pts.length, out = [];
    const P = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      let ax = (p2[0] - p0[0]) / 6, ay = (p2[1] - p0[1]) / 6, bx = (p3[0] - p1[0]) / 6, by = (p3[1] - p1[1]) / 6;
      const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by), cap = L / 3;
      if (la > cap) { ax *= cap / la; ay *= cap / la; }
      if (lb > cap) { bx *= cap / lb; by *= cap / lb; }
      out.push([p1, [p1[0] + ax, p1[1] + ay], [p2[0] - bx, p2[1] - by], p2]);
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
  /* sample the smooth path into a dense polyline */
  function sample(pts, closed, per) {
    const S = segs(pts, closed), out = [];
    S.forEach((s, k) => {
      for (let i = k === 0 ? 0 : 1; i <= per; i++) {
        const u = i / per, v = 1 - u;
        out.push([v * v * v * s[0][0] + 3 * v * v * u * s[1][0] + 3 * v * u * u * s[2][0] + u * u * u * s[3][0],
          v * v * v * s[0][1] + 3 * v * v * u * s[1][1] + 3 * v * u * u * s[2][1] + u * u * u * s[3][1]]);
      }
    });
    return out;
  }
  K.samplePath = sample;

  /* brush stroke: a filled ribbon. Width swells along the length (seeded per boil
     frame) and open strokes taper at both ends like a loaded brush. */
  K.inkStroke = function (ctx, pts, closed, w, color, seed, taper) {
    if (pts.length < 2) return;
    const per = pts.length > 24 ? 3 : 6, Q = sample(pts, closed, per), n = Q.length;
    if (n < 2) return;
    const base = K.lw(ctx, w) / 2, s = (seed | 0) + K.bf * 31;
    const tp = taper == null ? (closed ? 0 : 1) : taper;
    let len = 0; const acc = [0];
    for (let i = 1; i < n; i++) { len += Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]); acc.push(len); }
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = Q[Math.max(0, i - 1)], b = Q[Math.min(n - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const u = len ? acc[i] / len : 0;
      const swell = 0.78 + 0.44 * K.vnoise(u * 5.5 + (closed ? 0 : 0.3), s);
      const end = tp ? Math.min(1, Math.min(u, 1 - u) * 7 + 0.18) : 1;
      const hw = Math.max(K.MIN_PX / curScale(ctx) / 2, base * swell * (tp ? lerpE(end) : 1));
      L.push([Q[i][0] - ty * hw, Q[i][1] + tx * hw]); R.push([Q[i][0] + ty * hw, Q[i][1] - tx * hw]);
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(L[i][0], L[i][1]);
    if (closed) { ctx.closePath(); ctx.moveTo(R[n - 1][0], R[n - 1][1]); for (let i = n - 2; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); ctx.fill("nonzero"); }
    else { for (let i = n - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath(); ctx.fill(); }
    /* round caps / joints for very thick strokes so ribbons never look cut */
    if (!closed && !tp) { [Q[0], Q[n - 1]].forEach((p) => { ctx.beginPath(); ctx.arc(p[0], p[1], base * 0.95, 0, K.TAU); ctx.fill(); }); }
    if (closed) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = base * 1.4; K.pathOf(ctx, Q.filter((_, i) => i % 3 === 0), true); ctx.stroke(); ctx.restore(); }
  };
  const lerpE = (u) => u * u * (3 - 2 * u);

  /* ---------- Ben-Day dots: a printed dot screen, cached per colour/size ---------- */
  const dotCache = {};
  K.dotPattern = function (ctx, color, r, gap) {
    const key = color + "|" + r + "|" + gap;
    if (!dotCache[key]) {
      const c = document.createElement("canvas"), g = Math.round(gap); c.width = g; c.height = g;
      const x = c.getContext("2d"); x.fillStyle = color;
      [[g / 4, g / 4], [(3 * g) / 4, (3 * g) / 4]].forEach((p) => { x.beginPath(); x.arc(p[0], p[1], r, 0, K.TAU); x.fill(); });
      dotCache[key] = c;
    }
    return ctx.createPattern(dotCache[key], "repeat");
  };
  /* fill the current clip/path area with dots (call inside a clip) */
  K.dotFill = function (ctx, pts, opt) {
    const o = Object.assign({ color: "rgba(0,0,0,0.35)", r: 2.6, gap: 11, alpha: 1 }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha;
    K.pathOf(ctx, pts, true); ctx.fillStyle = K.dotPattern(ctx, o.color, o.r, o.gap); ctx.fill();
    ctx.restore();
  };

  /* ---------- the workhorse: printed, off-register, brush-outlined shape ----------
     opt: fill, stroke (default ink), w (outline width), boil (amp), seed,
          shade ({color, dx, dy, dots}: flat shadow band; dots = Ben-Day screen in the band),
          dots ({color, r, gap}: dot screen over the whole fill), shine (white highlight
          stroke along the upper-left), closed (default true), alpha, misreg (false = on register) */
  K.shape = function (ctx, pts, opt) {
    const o = Object.assign({ stroke: K.P.ink, w: 4, boil: 1.6, seed: 1, closed: true, misreg: true }, opt || {});
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    const mr = o.misreg && o.fill ? K.MISREG : [0, 0];
    const fp0 = o.boil ? K.boil(pts, o.seed + 500, o.boil * 0.5) : pts;
    const fp = fp0.map((p) => [p[0] + mr[0], p[1] + mr[1]]);
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.fill && o.closed !== false) {
      K.pathOf(ctx, fp, true); ctx.fillStyle = o.fill; ctx.fill();
      if (o.dots) K.dotFill(ctx, fp, o.dots);
      if (o.shade) { /* flat shadow band: the shape minus its own offset copy */
        const op = fp.map((p) => [p[0] + (o.shade.dx || 0), p[1] + (o.shade.dy || 0)]);
        ctx.save(); K.pathOf(ctx, fp, true); ctx.clip();
        ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
        const seg = segs(op, true); ctx.moveTo(seg[0][0][0], seg[0][0][1]);
        seg.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
        ctx.closePath();
        if (o.shade.color) { ctx.fillStyle = o.shade.color; ctx.fill("evenodd"); }
        if (o.shade.dots !== false) { ctx.fillStyle = K.dotPattern(ctx, o.shade.dotColor || "rgba(26,18,22,0.32)", o.shade.r || 2.4, o.shade.gap || 10); ctx.fill("evenodd"); }
        ctx.restore();
      }
      if (o.shine) { /* glossy enamel highlight: short white brush strokes inside the upper-left edge */
        ctx.save(); K.pathOf(ctx, fp, true); ctx.clip();
        const sp = o.shine === true ? {} : o.shine;
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        fp.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
        const W = x1 - x0, H = y1 - y0, cx = x0 + W * (sp.x || 0.3), cy = y0 + H * (sp.y || 0.26);
        ctx.globalAlpha *= sp.alpha || 0.75;
        K.inkStroke(ctx, [[cx - W * 0.16, cy + H * 0.08], [cx - W * 0.06, cy - H * 0.04], [cx + W * 0.1, cy - H * 0.08]], false, Math.max(3, Math.min(W, H) * 0.07), sp.color || "#ffffff", o.seed + 77, 1);
        ctx.restore();
      }
    }
    if (o.stroke && o.w > 0) K.inkStroke(ctx, bp, o.closed !== false, o.w, o.stroke, o.seed, o.taper);
    ctx.restore();
  };
  /* open brush line (ropes, chains, motion lines, steam) */
  K.line = function (ctx, pts, opt) {
    K.shape(ctx, pts, Object.assign({ closed: false, fill: null }, opt || {}));
  };
  /* constant-width line (rails, chrome edges, graph axes): taper off */
  K.rule = function (ctx, pts, opt) {
    K.shape(ctx, pts, Object.assign({ closed: false, fill: null, taper: 0 }, opt || {}));
  };
  K.dot = function (ctx, x, y, r, fill, stroke, w, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 10), { fill, stroke: stroke === undefined ? K.P.ink : stroke, w: w || 2.5, boil: r * 0.05 + 0.4, seed: seed || 5, misreg: r > 8 });
  };

  /* ---------- text: stable (never boils). opt.drop = offset print shadow ---------- */
  K.text = function (ctx, str, x, y, opt) {
    const o = Object.assign({ size: 40, weight: 800, font: K.FONT.display, fill: K.P.ink, stroke: null, w: 0, align: "center", base: "middle", alpha: 1, track: 0, drop: null }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight} ${o.size}px ${o.font}`; ctx.textAlign = o.align; ctx.textBaseline = o.base;
    if (o.track) ctx.letterSpacing = o.track + "px";
    if (o.drop) { ctx.fillStyle = o.drop.color || K.P.ink; ctx.fillText(str, x + (o.drop.dx || 4), y + (o.drop.dy || 4)); }
    if (o.stroke && o.w) { ctx.lineJoin = "round"; ctx.strokeStyle = o.stroke; ctx.lineWidth = o.w; ctx.strokeText(str, x, y); }
    ctx.fillStyle = o.fill; ctx.fillText(str, x, y);
    ctx.restore();
  };
  K.textW = function (ctx, str, size, weight, font) {
    ctx.save(); ctx.font = `${weight || 800} ${size}px ${font || K.FONT.display}`; const w = ctx.measureText(str).width; ctx.restore(); return w;
  };

  /* ---------- glow (soft disc). Only neon tubes, the bell flash and the hot order glow ---------- */
  K.glow = function (ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save(); ctx.globalAlpha *= a == null ? 1 : a; ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, K.TAU); ctx.fill(); ctx.restore();
  };
})(DK);
