/* ============================================================
   LAB KIT 10 INK: 1930s rubber-hose line + the camera.
   - K.begin(ctx, t, cam) once per frame; everything after reads K.now / K.bf.
   - Contours "boil" at 12 fps: vertices jitter by hash(vertex, seed, frame).
   - Line = a continuous brush ribbon (no gaps, unlike the crab kit): width
     swells and thins along the path and tapers at open ends, like a
     dip pen on animation paper.
   - Shading = flat shadow band + halftone stipple (vintage print), plus a
     thin cream rim light on the upper-left. No hatching.
   ============================================================ */
var LK = window.LK || (window.LK = {});
(function (K) {
  const { hs, hash, clamp } = K;
  K.MIN_PX = 2.2;
  K.now = 0; K.bf = 0; K.zoom = 1;

  /* ---------- camera: world -> screen. cam = {x, y, z, rot} ---------- */
  K.W = 1920; K.H = 1080;
  K.begin = function (ctx, t, cam) {
    K.ctx = ctx; K.now = t; K.bf = K.boilFrame(t); K.cam = cam; K.zoom = cam.z;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
  };
  /* p = parallax (1 world plane, <1 farther away, 0 fixed to screen) */
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
  /* rounded rectangle (art-deco cards, frames): r = corner radius */
  K.rrectPts = function (x, y, w, h, r, n) {
    n = n || 4; r = Math.min(r, w / 2, h / 2); const out = [];
    const C = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]];
    C.forEach((c) => { for (let i = 0; i <= n; i++) { const a = c[2] + (i / n) * (Math.PI / 2); out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } });
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
      out.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
    }
    return out;
  }
  K.segs = segs;
  K.pathOf = function (ctx, pts, closed) {
    if (pts.length < 2) return;
    const S = segs(pts, closed);
    ctx.beginPath(); ctx.moveTo(S[0][0][0], S[0][0][1]);
    S.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
    if (closed) ctx.closePath();
  };
  /* sample the smooth path into a dense polyline (k samples per segment) */
  K.sample = function (pts, closed, k) {
    const S = segs(pts, closed), out = []; k = k || 6;
    S.forEach((s, si) => {
      for (let j = 0; j < k; j++) {
        const u = j / k, v = 1 - u;
        out.push([v * v * v * s[0][0] + 3 * v * v * u * s[1][0] + 3 * v * u * u * s[2][0] + u * u * u * s[3][0],
          v * v * v * s[0][1] + 3 * v * v * u * s[1][1] + 3 * v * u * u * s[2][1] + u * u * u * s[3][1]]);
      }
      if (!closed && si === S.length - 1) out.push(s[3]);
    });
    return out;
  };

  /* ---------- the brush: a filled ribbon with swelling width ----------
     taper: open ends thin to 30 % (pen lift). Width noise is smooth along the
     path and re-seeded at 12 fps so it boils with the vertices. */
  K.brush = function (ctx, pts, closed, w, color, seed, taper) {
    if (pts.length < 2) return;
    if (closed) return K.ring(ctx, pts, w, color, seed);
    const q = K.sample(pts, closed, 6), n = q.length;
    if (n < 2) return;
    const base = K.lw(ctx, w), s = (seed | 0) + K.bf * 31;
    let L = 0; const acc = [0];
    for (let i = 1; i < n; i++) { L += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); acc.push(L); }
    const left = [], right = [];
    for (let i = 0; i < n; i++) {
      const a = q[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = q[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const d = Math.hypot(nx, ny) || 1; nx /= d; ny /= d;
      let k = 0.78 + 0.44 * K.vnoise(acc[i] / 70, s);
      if (!closed && taper !== false) { const e = Math.min(acc[i], L - acc[i]); k *= 0.3 + 0.7 * clamp(e / Math.min(40, L * 0.3 + 1), 0, 1); }
      const hw = (base * k) / 2;
      left.push([q[i][0] + nx * hw, q[i][1] + ny * hw]); right.push([q[i][0] - nx * hw, q[i][1] - ny * hw]);
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(left[0][0], left[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath(); ctx.fill();
    /* round pen caps */
    [[q[0], left[0], right[0]], [q[n - 1], left[n - 1], right[n - 1]]].forEach((c) => {
      const r = Math.hypot(c[1][0] - c[2][0], c[1][1] - c[2][1]) / 2;
      ctx.beginPath(); ctx.arc(c[0][0], c[0][1], r, 0, K.TAU); ctx.fill();
    });
  };
  /* closed contour as a variable-width ring: drawn as a polyline stroke whose
     width steps along the path in short runs (cheap, no winding problems) */
  K.ring = function (ctx, pts, w, color, seed) {
    const q = K.sample(pts, true, 6), n = q.length, base = K.lw(ctx, w), s = (seed | 0) + K.bf * 31;
    ctx.strokeStyle = color; ctx.lineCap = "round"; ctx.lineJoin = "round";
    const RUN = 4; let acc = 0;
    for (let i = 0; i < n; i += RUN) {
      ctx.beginPath(); ctx.moveTo(q[i][0], q[i][1]);
      for (let j = 1; j <= RUN; j++) { const p = q[(i + j) % n]; ctx.lineTo(p[0], p[1]); }
      acc += 1;
      ctx.lineWidth = base * (0.78 + 0.44 * K.vnoise(acc * 0.45, s));
      ctx.stroke();
    }
  };

  /* ---------- stipple: halftone dots clipped to a region ---------- */
  K.stipple = function (ctx, pts, opt) {
    const o = Object.assign({ gap: 9, r: 1.7, color: K.P.inkSoft, alpha: 0.35, seed: 3, ang: 0.5 }, opt || {});
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    ctx.save(); K.pathOf(ctx, pts, true); ctx.clip();
    ctx.globalAlpha *= o.alpha; ctx.fillStyle = o.color; ctx.beginPath();
    const r = Math.max(o.r, 0.9 / curScale(ctx)), s = o.seed + K.bf * 3;
    let row = 0;
    for (let y = y0; y <= y1 + o.gap; y += o.gap * 0.87, row++) {
      const off = (row % 2) * o.gap * 0.5;
      for (let x = x0 - o.gap + off, c = 0; x <= x1 + o.gap; x += o.gap, c++) {
        const j = hs(row * 131 + c, s) * 0.8;
        ctx.moveTo(x + j + r, y); ctx.arc(x + j, y, r, 0, K.TAU);
      }
    }
    ctx.fill(); ctx.restore();
  };

  /* ---------- the workhorse: filled, toned, boiled, ink-outlined shape ----------
     opt: fill, stroke (default ink), w, boil, seed,
          shade ({color, dx, dy}: flat shadow band = shape minus offset copy),
          dots ({...stipple opts}: halftone in the shadow band),
          rim (cream rim light width, upper-left), closed, alpha */
  K.shape = function (ctx, pts, opt) {
    const o = Object.assign({ stroke: K.P.ink, w: 4, boil: 1.1, seed: 1, closed: true }, opt || {});
    const bp = o.boil ? K.boil(pts, o.seed, o.boil) : pts;
    const fp = o.boil ? K.boil(pts, o.seed + 500, o.boil * 0.5) : pts;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.fill && o.closed !== false) {
      K.pathOf(ctx, fp, true); ctx.fillStyle = o.fill; ctx.fill();
      if (o.shade || o.rim) {
        ctx.save(); K.pathOf(ctx, fp, true); ctx.clip();
        if (o.shade) {
          const op = fp.map((p) => [p[0] + (o.shade.dx || 0), p[1] + (o.shade.dy || 0)]);
          ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5);
          const sg = segs(op, true); ctx.moveTo(sg[0][0][0], sg[0][0][1]);
          sg.forEach((s) => ctx.bezierCurveTo(s[1][0], s[1][1], s[2][0], s[2][1], s[3][0], s[3][1]));
          ctx.closePath(); ctx.fillStyle = o.shade.color; ctx.fill("evenodd");
          if (o.dots) { /* halftone only inside the band: clip to the band, then stipple the bbox */
            ctx.beginPath(); ctx.rect(-1e5, -1e5, 2e5, 2e5); K.pathOf(ctx, op, true); ctx.clip("evenodd");
            K.stipple(ctx, fp, Object.assign({ seed: o.seed + 9 }, o.dots));
          }
        }
        if (o.rim) { /* rim light: the outline shifted down-right, drawn in cream, clipped inside */
          ctx.globalAlpha *= 0.7;
          K.pathOf(ctx, fp.map((p) => [p[0] + o.rim * 1.6, p[1] + o.rim * 1.6]), true);
          ctx.strokeStyle = o.rimColor || "rgba(255,250,232,0.85)"; ctx.lineWidth = K.lw(ctx, o.rim); ctx.stroke();
        }
        ctx.restore();
      }
    }
    if (o.stroke && o.w > 0) {
      if (o.closed !== false) K.ring(ctx, bp, o.w, o.stroke, o.seed);
      else K.brush(ctx, bp, false, o.w, o.stroke, o.seed, o.taper);
    }
    ctx.restore();
  };
  /* open brush line (stems, tubes, motion lines) */
  K.line = function (ctx, pts, opt) {
    K.shape(ctx, pts, Object.assign({ closed: false, fill: null }, opt || {}));
  };
  K.dot = function (ctx, x, y, r, fill, stroke, w, seed) {
    K.shape(ctx, K.ellipsePts(x, y, r, r, 10), { fill, stroke: stroke === undefined ? K.P.ink : stroke, w: w || 2.5, boil: r * 0.05 + 0.3, seed: seed || 5 });
  };
  /* rubber-hose limb: ink brush underlay then a colour brush on top (smooth noodle) */
  K.hose = function (ctx, pts, w, color, seed, outline) {
    K.line(ctx, pts, { stroke: K.P.ink, w: w + (outline || 7), boil: 0.8, seed, taper: false });
    K.line(ctx, pts, { stroke: color, w, boil: 0.8, seed: seed + 1, taper: false });
  };

  /* ---------- text: never boils ---------- */
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

  /* ---------- glow (lamp light, the data seed, a validated flask) ---------- */
  K.glow = function (ctx, x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save(); ctx.globalAlpha *= a == null ? 1 : a; ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, K.TAU); ctx.fill(); ctx.restore();
  };
})(LK);
