/* ============================================================
   KIT 10 PRINT: screen-print poster primitives + the camera.
   The look is a 1950s two-plate print:
     - a flat colour plate (fill), printed slightly out of register,
     - a thin charcoal key plate (outline) on top, clean and unbroken,
     - halftone dots instead of hatching for shadow and tone.
   Contours still "boil" at 12 fps (vertex jitter from a hash of
   vertex, seed and boil frame), but gently: this is ink on paper, not
   a pencil test. Text never boils.
   ============================================================ */
var SK = window.SK || (window.SK = {});
(function (K) {
  const { hs, hash, clamp } = K;
  K.MIN_PX = 1.6;
  K.REG = 3.2; /* misregistration of the colour plate, world px */
  K.now = 0; K.bf = 0; K.zoom = 1;

  /* ---------- camera: world -> screen. cam = {x, y, z, rot} (centre, zoom, degrees) ---------- */
  K.W = 1920; K.H = 1080;
  K.begin = function (ctx, t, cam) {
    K.ctx = ctx; K.now = t; K.bf = K.boilFrame(t); K.cam = cam; K.zoom = cam.z;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
  };
  /* apply camera with an optional parallax factor p (1 = world plane, 0 = fixed to screen).
     A layer with p < 1 moves p times as far as the camera, measured from K.REF: when the
     camera sits at K.REF every layer lines up with world coordinates, so backgrounds
     are laid out in the same numbers as the foreground (horizon at y 760 means 760). */
  K.REF = { x: 960, y: 540 };
  K.applyCam = function (ctx, p) {
    p = p == null ? 1 : p;
    const c = K.cam, z = 1 + (c.z - 1) * p;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(K.W / 2, K.H / 2);
    if (c.rot) ctx.rotate((c.rot * Math.PI) / 180 * p);
    ctx.scale(z, z);
    ctx.translate(-(K.REF.x + (c.x - K.REF.x) * p), -(K.REF.y + (c.y - K.REF.y) * p));
    K.zoom = z;
  };
  K.screen = function (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); K.zoom = 1; };
  K.toScreen = function (x, y) {
    const c = K.cam, r = ((c.rot || 0) * Math.PI) / 180, dx = (x - c.x) * c.z, dy = (y - c.y) * c.z;
    return [K.W / 2 + dx * Math.cos(r) - dy * Math.sin(r), K.H / 2 + dx * Math.sin(r) + dy * Math.cos(r)];
  };
  const curScale = (ctx) => { const m = ctx.getTransform(); return Math.sqrt(m.a * m.a + m.b * m.b) || 1; };
  K.lw = (ctx, w) => Math.max(w, K.MIN_PX / curScale(ctx));

  /* ---------- point generators (geometric first: this world is built from shapes) ---------- */
  K.ellipsePts = function (cx, cy, rx, ry, n, rot) {
    const out = [], r = rot || 0, cr = Math.cos(r), sr = Math.sin(r);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * K.TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      out.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
    }
    return out;
  };
  K.arcPts = function (cx, cy, r, a0, a1, n) {
    const out = [];
    for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return out;
  };
  K.rectPts = function (x, y, w, h, n) {
    n = n || 2; const out = [];
    for (let i = 0; i < n; i++) out.push([x + (w * i) / n, y]);
    for (let i = 0; i < n; i++) out.push([x + w, y + (h * i) / n]);
    for (let i = 0; i < n; i++) out.push([x + w - (w * i) / n, y + h]);
    for (let i = 0; i < n; i++) out.push([x, y + h - (h * i) / n]);
    return out;
  };
  /* rounded rectangle as a polyline (corner arcs of radius r, k points each) */
  K.rrectPts = function (x, y, w, h, r, k) {
    r = Math.min(r, w / 2, h / 2); k = k || 4; const out = [];
    const C = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
    C.forEach((c) => { for (let i = 0; i <= k; i++) { const a = c[2] + (i / k) * (Math.PI / 2); out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } });
    return out;
  };
  K.polyPts = function (cx, cy, r, n, rot) {
    const out = [];
    for (let i = 0; i < n; i++) { const a = (rot || 0) + (i / n) * K.TAU; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return out;
  };
  /* irregular closed blob (puffs, bushes): fixed by seed, not by time */
  K.blobPts = function (cx, cy, rx, ry, n, seed, irr) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * K.TAU, k = 1 + (irr || 0.18) * (K.fbm(i * 0.9, seed, 2) * 2 - 1);
      out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return out;
  };

  /* ---------- boil ---------- */
  K.boil = function (pts, seed, amp, frameOverride) {
    const f = frameOverride == null ? K.bf : frameOverride, s = (seed | 0) + f * 7919;
    return pts.map((p, i) => [p[0] + hs(i * 2 + 1, s) * amp, p[1] + hs(i * 2 + 2, s) * amp]);
  };

  /* ---------- paths: polyline (geometric, default) or Catmull-Rom (organic) ---------- */
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
  K.pathOf = function (ctx, pts, closed, smooth, dx, dy) {
    dx = dx || 0; dy = dy || 0;
    ctx.beginPath();
    if (!smooth) {
      ctx.moveTo(pts[0][0] + dx, pts[0][1] + dy);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + dx, pts[i][1] + dy);
    } else {
      const S = segs(pts, closed); ctx.moveTo(S[0][0][0] + dx, S[0][0][1] + dy);
      S.forEach((s) => ctx.bezierCurveTo(s[1][0] + dx, s[1][1] + dy, s[2][0] + dx, s[2][1] + dy, s[3][0] + dx, s[3][1] + dy));
    }
    if (closed) ctx.closePath();
  };

  /* world-space box of the visible screen under the current transform */
  function visibleBox(ctx) {
    const m = ctx.getTransform().inverse();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    [[0, 0], [K.W, 0], [0, K.H], [K.W, K.H]].forEach(([sx, sy]) => {
      const x = m.a * sx + m.c * sy + m.e, y = m.b * sx + m.d * sy + m.f;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    });
    return [x0, y0, x1, y1];
  }
  /* ---------- halftone: a rotated dot screen clipped to a path ----------
     opt: color, gap (dot pitch), r (dot radius at the light end), r2 (at the
     dark end), dir (angle of the light->dark ramp), ang (screen angle, 15 deg),
     alpha. Dots do not boil (it is a printed screen), they only follow the plate. */
  K.halftone = function (ctx, pts, opt) {
    const o = Object.assign({ color: K.P.ink, gap: 11, r: 1.2, r2: 4.2, dir: Math.PI * 0.25, ang: 0.26, alpha: 0.35, smooth: false, dx: 0, dy: 0 }, opt || {});
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + o.gap;
    /* only dots inside both the shape box and the visible screen (big skies stay cheap) */
    const v = visibleBox(ctx), bx0 = Math.max(x0, v[0]) - o.gap, by0 = Math.max(y0, v[1]) - o.gap, bx1 = Math.min(x1, v[2]) + o.gap, by1 = Math.min(y1, v[3]) + o.gap;
    if (bx0 >= bx1 || by0 >= by1) return;
    const ca = Math.cos(o.ang), sa = Math.sin(o.ang), cd = Math.cos(o.dir), sd = Math.sin(o.dir);
    ctx.save(); K.pathOf(ctx, pts, true, o.smooth); ctx.clip();
    ctx.globalAlpha *= o.alpha; ctx.fillStyle = o.color; ctx.beginPath();
    /* lattice coordinates of the visible box corners -> index ranges */
    let i0 = 1e9, i1 = -1e9, j0 = 1e9, j1 = -1e9;
    [[bx0, by0], [bx1, by0], [bx0, by1], [bx1, by1]].forEach(([qx, qy]) => {
      const dx = qx - cx - o.dx, dy = qy - cy - o.dy, li = (dx * ca + dy * sa) / o.gap, lj = (-dx * sa + dy * ca) / o.gap;
      i0 = Math.min(i0, li); i1 = Math.max(i1, li); j0 = Math.min(j0, lj); j1 = Math.max(j1, lj);
    });
    for (let i = Math.floor(i0) - 1; i <= Math.ceil(i1) + 1; i++) for (let j = Math.floor(j0) - 1; j <= Math.ceil(j1) + 1; j++) {
      const lx = i * o.gap, ly = j * o.gap + (i & 1 ? o.gap / 2 : 0);
      const x = cx + lx * ca - ly * sa + o.dx, y = cy + lx * sa + ly * ca + o.dy;
      const u = clamp(((x - cx) * cd + (y - cy) * sd) / R * 0.5 + 0.5, 0, 1); /* 0 light .. 1 dark */
      const r = o.r + (o.r2 - o.r) * u;
      if (r < 0.35) continue;
      ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, K.TAU);
    }
    ctx.fill(); ctx.restore();
  };

  /* plate offset for a seed: fixed direction per object, tiny drift per boil frame */
  K.regOf = function (seed, amt) {
    const a = hash(seed, 77) * K.TAU, d = amt == null ? K.REG : amt;
    return [Math.cos(a) * d + hs(K.bf, seed + 3) * 0.5, Math.sin(a) * d * 0.7 + hs(K.bf, seed + 5) * 0.5];
  };

  /* ---------- the workhorse: colour plate + shade band + halftone + key line ----------
     opt: fill, key (outline colour, null = none), w (key width), boil (amp), seed,
          smooth (organic curve instead of polyline), shade ({color, dx, dy}: flat
          shadow band = shape minus its offset copy), tone (halftone opts; band: true
          limits the dots to the shade band), reg (misregistration px), closed, alpha */
  K.shape = function (ctx, pts, opt) {
    const o = Object.assign({ key: K.P.ink, w: 3, boil: 0.9, seed: 1, closed: true, smooth: false }, opt || {});
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    const fp = o.boil ? K.boil(pts, o.seed + 500, o.boil * 0.6) : pts;
    const rg = o.reg === 0 || !o.fill ? [0, 0] : K.regOf(o.seed, o.reg);
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.fill && o.closed !== false) {
      K.pathOf(ctx, fp, true, o.smooth, rg[0], rg[1]); ctx.fillStyle = o.fill; ctx.fill();
      if (o.shade) {
        ctx.save(); K.pathOf(ctx, fp, true, o.smooth, rg[0], rg[1]); ctx.clip();
        ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
        const op = fp.map((p) => [p[0] + rg[0] + (o.shade.dx || 0), p[1] + rg[1] + (o.shade.dy || 0)]);
        if (o.smooth) { const S = segs(op, true); ctx.moveTo(S[0][0][0], S[0][0][1]); S.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1])); }
        else { ctx.moveTo(op[0][0], op[0][1]); op.forEach((p) => ctx.lineTo(p[0], p[1])); }
        ctx.closePath(); ctx.fillStyle = o.shade.color; ctx.fill("evenodd");
        ctx.restore();
      }
      if (o.tone) K.halftone(ctx, fp.map((p) => [p[0] + rg[0], p[1] + rg[1]]), Object.assign({ smooth: o.smooth }, o.tone));
    }
    if (o.key && o.w > 0) {
      ctx.strokeStyle = o.key; ctx.lineWidth = K.lw(ctx, o.w);
      K.pathOf(ctx, bp, o.closed !== false, o.smooth); ctx.stroke();
    }
    ctx.restore();
  };
  /* open line (rails, wires, motion lines) */
  K.line = function (ctx, pts, opt) {
    const o = Object.assign({ key: K.P.ink, w: 3, boil: 0.7, seed: 1, smooth: false }, opt || {});
    if (o.color) o.key = o.color;
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.dash) ctx.setLineDash(o.dash.map((d) => d)), ctx.lineDashOffset = o.dashOffset || 0;
    ctx.lineCap = o.cap || "round";
    ctx.strokeStyle = o.key; ctx.lineWidth = K.lw(ctx, o.w);
    K.pathOf(ctx, bp, false, o.smooth); ctx.stroke(); ctx.restore();
  };
  K.dot = function (ctx, x, y, r, fill, key, w, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, Math.max(10, Math.min(28, Math.round(r / 2)))), { fill, key: key === undefined ? K.P.ink : key, w: w || 2.5, boil: Math.min(1.2, r * 0.04 + 0.3), seed: seed || 5, smooth: true, reg: Math.min(K.REG, r * 0.2) });
  };

  /* ---------- atomic-age ornaments ---------- */
  /* four- or eight-point sparkle star (the "atomic" star of 50s posters) */
  K.star = function (ctx, x, y, r, opt) {
    const o = Object.assign({ color: K.P.mustard, n: 4, a: 1, rot: 0, seed: 1, key: K.P.ink, w: 2.2 }, opt || {});
    if (o.a <= 0 || r <= 0.5) return;
    const pts = [];
    for (let i = 0; i < o.n * 2; i++) { const a = o.rot + (i / (o.n * 2)) * K.TAU - Math.PI / 2, rr = i % 2 ? r * 0.22 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    K.shape(ctx, pts, { fill: o.color, key: o.key, w: o.w, boil: 0.4, seed: o.seed, alpha: o.a, reg: 1.5 });
  };
  /* radiating thin rays (sunburst) */
  K.rays = function (ctx, x, y, r0, r1, n, opt) {
    const o = Object.assign({ color: K.P.ink, w: 2.4, rot: 0, alpha: 1, seed: 3 }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha; ctx.strokeStyle = o.color; ctx.lineWidth = K.lw(ctx, o.w); ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = o.rot + (i / n) * K.TAU, j = hs(i, o.seed + K.bf * 3) * 2;
      ctx.moveTo(x + Math.cos(a) * (r0 + j), y + Math.sin(a) * (r0 + j)); ctx.lineTo(x + Math.cos(a) * (r1 + j), y + Math.sin(a) * (r1 + j));
    }
    ctx.stroke(); ctx.restore();
  };

  /* ---------- text: stable (never boils) ---------- */
  K.text = function (ctx, str, x, y, opt) {
    const o = Object.assign({ size: 40, weight: 700, font: K.FONT.display, fill: K.P.ink, stroke: null, w: 0, align: "center", base: "middle", alpha: 1, track: 0 }, opt || {});
    ctx.save(); ctx.globalAlpha *= o.alpha;
    ctx.font = `${o.weight} ${o.size}px ${o.font}`; ctx.textAlign = o.align; ctx.textBaseline = o.base;
    if (o.track) ctx.letterSpacing = o.track + "px";
    if (o.stroke && o.w) { ctx.lineJoin = "round"; ctx.strokeStyle = o.stroke; ctx.lineWidth = o.w; ctx.strokeText(str, x, y); }
    ctx.fillStyle = o.fill; ctx.fillText(str, x, y);
    ctx.restore();
  };
  K.textW = function (ctx, str, size, weight, font) {
    ctx.save(); ctx.font = `${weight || 700} ${size}px ${font || K.FONT.display}`; const w = ctx.measureText(str).width; ctx.restore(); return w;
  };
})(SK);
