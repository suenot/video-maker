/* ============================================================
   KIT 30 WORLD: the rainy noir city at night.
   Street set (side view, horizon about y 600):
     nightSky, moon, skyline (far / near layers), street, lamp, cone, pool,
     brickWall, rain, ripples, puddle, fog.
   Interior set (the fox's office): blindsWindow, blindLight, desk, deskLamp.
   Props and people: suspect (full-body lineup figure), lineupWall,
     newspaper, flash (lightning amount).
   Everything is world space unless noted. Rain is screen space and moves on
   continuous time (it does not boil); every contour boils at 12 fps.
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  K.rgba = K.rgba || rgba;

  /* ---------- sky: vertical gradient over a world rect, optional moon + cloud bands ---------- */
  K.nightSky = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ moon: null, moonR: 70, seed: 3, clouds: 4, drift: 0 }, opt || {});
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, P.night); g.addColorStop(0.55, P.nightMid); g.addColorStop(1, P.nightLow);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    if (o.moon) K.moon(ctx, o.moon[0], o.moon[1], o.moonR, o.seed);
    for (let i = 0; i < o.clouds; i++) {
      const cx = x + ((hash(i, o.seed) * w + K.now * (8 + 6 * hash(i, o.seed + 1)) + o.drift) % (w + 600)) - 300;
      const cy = y + h * (0.12 + 0.4 * hash(i, o.seed + 2)), rx = 260 + 200 * hash(i, o.seed + 3);
      ctx.save(); ctx.globalAlpha = 0.85;
      K.shape(ctx, K.blobPts(cx, cy, rx, 34 + 20 * hash(i, o.seed + 4), 14, o.seed + i * 7, 0.22), { fill: i % 2 ? P.cloud : P.cloudLight, stroke: P.ink, w: 3, boil: 1.4, seed: o.seed + 40 + i, shade: { color: P.cloud, dx: 0, dy: -12 }, gap: 0.2 });
      ctx.restore();
    }
  };
  K.moon = function (ctx, x, y, r, seed) {
    K.glow(ctx, x, y, r * 3.2, rgba(P.moonGlow, 0.55), 0.8);
    K.shape(ctx, K.ellipsePts(x, y, r, r, 18), { fill: P.moon, stroke: P.ink, w: 3, boil: 0.8, seed: seed || 7, shade: { color: P.greyLight, dx: 14, dy: 10 }, gap: 0.12 });
    [[-0.3, -0.2, 0.18], [0.25, 0.15, 0.12], [-0.05, 0.4, 0.1]].forEach((c, i) => K.shape(ctx, K.ellipsePts(x + c[0] * r, y + c[1] * r, c[2] * r, c[2] * r * 0.8, 8), { fill: P.greyLight, stroke: null, w: 0, boil: 0.4, seed: 30 + i }));
  };

  /* ---------- skyline: a row of buildings standing on baseY between x0 and x1 ----------
     tone "far" = flat foggy silhouettes; "near" = inked buildings with fire escapes.
     lit 0..1 share of windows that glow amber (the rest are cool and dim). */
  K.skyline = function (ctx, x0, x1, baseY, opt) {
    const o = Object.assign({ seed: 11, tone: "near", hMin: 220, hMax: 520, lit: 0.18, wMin: 140, wMax: 260 }, opt || {});
    const far = o.tone === "far", rnd = K.mulberry(o.seed);
    let x = x0 - 40, i = 0;
    while (x < x1) {
      const bw = lerp(o.wMin, o.wMax, rnd()), bh = lerp(o.hMin, o.hMax, rnd()), top = baseY - bh, kind = rnd();
      const pts = K.rectPts(x, top, bw, bh + 40, 3);
      if (far) {
        ctx.fillStyle = P.bldgLight; ctx.globalAlpha = 0.55; ctx.fillRect(x, top, bw - 6, bh + 40); ctx.globalAlpha = 1;
        if (kind > 0.7) ctx.fillRect(x + bw * 0.45, top - 60, 6, 60);
      } else {
        K.shape(ctx, pts, { fill: P.bldg, w: 4, boil: 1, seed: o.seed + i * 13, shade: { color: P.bldgDark, dx: -22, dy: 0 } });
        /* roof furniture: water tower or antenna or a stepped top */
        if (kind > 0.66) {
          const wx = x + bw * 0.62;
          K.shape(ctx, K.rectPts(wx - 26, top - 70, 52, 50, 2), { fill: P.bldgLight, w: 3, boil: 0.8, seed: o.seed + i * 13 + 1, shade: { color: P.bldgDark, dx: -10, dy: 0 } });
          K.shape(ctx, [[wx - 32, top - 70], [wx, top - 96], [wx + 32, top - 70]], { fill: P.bldgDark, w: 3, boil: 0.8, seed: o.seed + i * 13 + 2 });
          K.line(ctx, [[wx - 20, top - 20], [wx - 22, top]], { w: 3, boil: 0.5, seed: o.seed + i * 13 + 3, taper: false });
          K.line(ctx, [[wx + 20, top - 20], [wx + 22, top]], { w: 3, boil: 0.5, seed: o.seed + i * 13 + 4, taper: false });
        } else if (kind > 0.4) {
          K.line(ctx, [[x + bw * 0.3, top], [x + bw * 0.3, top - 90]], { w: 3, boil: 0.6, seed: o.seed + i * 13 + 5 });
          K.dot(ctx, x + bw * 0.3, top - 92, 4, P.bad, null, 0, o.seed + i);
        }
        /* fire escape zigzag on some */
        if (kind < 0.3) for (let f = 0; f < 3; f++) {
          const fy = top + 80 + f * 110; if (fy > baseY - 60) break;
          K.line(ctx, [[x + 10, fy], [x + bw * 0.55, fy]], { stroke: P.ink, w: 5, boil: 0.6, seed: o.seed + i * 13 + 20 + f, taper: false });
          K.line(ctx, [[x + 10, fy - 22], [x + bw * 0.55, fy - 22]], { stroke: P.ink, w: 2.5, boil: 0.6, seed: o.seed + i * 13 + 25 + f, taper: false });
          K.line(ctx, [[x + bw * 0.45, fy], [x + bw * 0.45, fy + 110]], { stroke: P.ink, w: 2.5, boil: 0.6, seed: o.seed + i * 13 + 30 + f, taper: false });
        }
      }
      /* windows */
      const cols = Math.max(2, Math.floor(bw / 46)), rows = Math.floor((bh - 40) / 58), cw = bw / cols;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const hsh = hash(r * 31 + c + i * 977, o.seed);
        if (hsh < 0.25) continue;
        const lit = hash(r * 17 + c * 5 + i * 131, o.seed + 1) < o.lit;
        const wx = x + c * cw + cw * 0.28, wy = top + 34 + r * 58;
        if (far) { ctx.fillStyle = lit ? rgba(P.amber, 0.55) : rgba(P.night, 0.35); ctx.fillRect(wx, wy, cw * 0.4, 26); continue; }
        if (lit) K.glow(ctx, wx + cw * 0.22, wy + 16, 46, rgba(P.amber, 0.5), 0.6);
        ctx.fillStyle = lit ? P.amber : P.bldgDark; ctx.fillRect(wx, wy, cw * 0.44, 30);
        if (lit) { ctx.fillStyle = P.amberDeep; ctx.fillRect(wx, wy + 18, cw * 0.44, 12); }
      }
      x += bw + (far ? 4 : 10 + 20 * rnd()); i++;
    }
  };

  /* ---------- street: sidewalk from curbY-110 to curbY, wet asphalt below with light reflections ---------- */
  K.street = function (ctx, x0, x1, curbY, opt) {
    const o = Object.assign({ seed: 21, depth: 700, lights: [], walk: 110 }, opt || {});
    /* sidewalk slabs */
    K.shape(ctx, K.rectPts(x0, curbY - o.walk, x1 - x0, o.walk, 8), { fill: P.streetLight, w: 4, boil: 0.8, seed: o.seed, shade: { color: P.street, dx: 0, dy: -18 } });
    for (let x = x0 + 60; x < x1; x += 220) K.line(ctx, [[x, curbY - o.walk + 6], [x - 30, curbY - 6]], { stroke: P.inkSoft, w: 3, boil: 0.6, seed: o.seed + x });
    /* curb */
    K.shape(ctx, K.rectPts(x0, curbY, x1 - x0, 22, 8), { fill: P.curb, w: 4, boil: 0.8, seed: o.seed + 1 });
    /* asphalt */
    const g = ctx.createLinearGradient(0, curbY + 22, 0, curbY + o.depth);
    g.addColorStop(0, P.street); g.addColorStop(1, P.night);
    ctx.fillStyle = g; ctx.fillRect(x0, curbY + 22, x1 - x0, o.depth);
    /* reflections: wobbling vertical streaks under every light */
    o.lights.forEach((L, li) => {
      const lx = L[0], col = L[1] || P.amber, a = L[2] == null ? 1 : L[2];
      for (let k = 0; k < 12; k++) {
        const yy = curbY + 36 + k * 30, wob = 9 * Math.sin(K.now * 3 + k * 1.7 + li), ww = 70 - k * 4;
        ctx.fillStyle = rgba(col, (0.26 - k * 0.02) * a);
        ctx.beginPath(); ctx.ellipse(lx + wob, yy, ww / 2, 7, 0, 0, K.TAU); ctx.fill();
      }
    });
    /* puddle sheen strokes */
    for (let i = 0; i < 9; i++) {
      const px = x0 + hash(i, o.seed) * (x1 - x0), py = curbY + 90 + hash(i, o.seed + 3) * (o.depth * 0.5);
      K.line(ctx, [[px, py], [px + 90 + 60 * hash(i, 9), py + 2]], { stroke: P.puddle, w: 4, boil: 0.8, seed: o.seed + 40 + i, gap: 0.3 });
    }
  };

  /* ---------- light: a cone (lamp, flashlight, projector) and a pool on the ground ---------- */
  K.cone = function (ctx, x, y, ang, len, spread, color, a) {
    if (a <= 0) return;
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy, ny = dx, half = Math.tan(spread / 2) * len;
    const g = ctx.createLinearGradient(x, y, x + dx * len, y + dy * len);
    g.addColorStop(0, rgba(color, 0.55 * a)); g.addColorStop(1, rgba(color, 0));
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x + nx * 10, y + ny * 10); ctx.lineTo(x + dx * len + nx * half, y + dy * len + ny * half);
    ctx.lineTo(x + dx * len - nx * half, y + dy * len - ny * half); ctx.lineTo(x - nx * 10, y - ny * 10); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  K.pool = function (ctx, x, y, rx, ry, color, a) {
    if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, rgba(color, 0.5 * a)); g.addColorStop(1, rgba(color, 0));
    ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, K.TAU); ctx.fill();
    ctx.restore();
  };

  /* ---------- street lamp: (x, y) = foot of the post. on 0..1, flicker adds dropouts ---------- */
  K.lamp = function (ctx, x, y, s, opt) {
    const o = Object.assign({ on: 1, seed: 31, cone: true, h: 520 }, opt || {});
    const H = o.h * s, head = [x + 70 * s, y - H + 20 * s];
    if (o.cone && o.on > 0) { K.cone(ctx, head[0], head[1] + 30 * s, Math.PI / 2, H * 0.98, 0.95, P.amber, o.on); K.pool(ctx, head[0], y + 10, 300 * s, 60 * s, P.amber, o.on); }
    K.shape(ctx, K.rectPts(x - 9 * s, y - H, 18 * s, H, 6), { fill: P.bldgDark, w: 4, boil: 0.8, seed: o.seed, shade: { color: P.ink, dx: -8 * s, dy: 0 } });
    K.shape(ctx, K.rectPts(x - 22 * s, y - 40 * s, 44 * s, 40 * s, 2), { fill: P.bldgDark, w: 4, boil: 0.8, seed: o.seed + 1 });
    K.line(ctx, [[x, y - H + 10 * s], [x + 30 * s, y - H - 16 * s], [x + 70 * s, y - H - 6 * s]], { stroke: P.ink, w: 9 * s, boil: 0.8, seed: o.seed + 2, taper: false });
    /* lantern */
    const lantern = [[head[0] - 34 * s, head[1] + 28 * s], [head[0] - 22 * s, head[1] - 20 * s], [head[0] + 22 * s, head[1] - 20 * s], [head[0] + 34 * s, head[1] + 28 * s]];
    if (o.on > 0) K.glow(ctx, head[0], head[1] + 10 * s, 160 * s, rgba(P.amberGlow, 0.9), o.on);
    K.shape(ctx, lantern, { fill: o.on > 0.3 ? P.amberGlow : P.greyDark, w: 4, boil: 0.8, seed: o.seed + 3 });
    K.shape(ctx, [[head[0] - 42 * s, head[1] - 18 * s], [head[0], head[1] - 44 * s], [head[0] + 42 * s, head[1] - 18 * s]], { fill: P.ink, w: 4, boil: 0.8, seed: o.seed + 4 });
    return head;
  };

  /* ---------- brick wall (alleys, the office outside) ---------- */
  K.brickWall = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ seed: 41, bh: 34, bw: 92 }, opt || {});
    ctx.fillStyle = P.brick; ctx.fillRect(x, y, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    for (let r = 0, yy = y; yy < y + h; r++, yy += o.bh) {
      const off = r % 2 ? o.bw / 2 : 0;
      for (let xx = x - off; xx < x + w; xx += o.bw) {
        const k = hash(r * 101 + Math.round(xx), o.seed);
        if (k < 0.35) { ctx.fillStyle = k < 0.12 ? P.brickDark : P.brickLine; ctx.fillRect(xx + 4, yy + 4, o.bw - 8, o.bh - 8); }
      }
      K.line(ctx, [[x, yy], [x + w, yy]], { stroke: P.brickDark, w: 3, boil: 0.5, seed: o.seed + r, gap: 0.2, taper: false });
      for (let xx = x - off; xx < x + w; xx += o.bw) { ctx.fillStyle = P.brickDark; ctx.fillRect(xx - 1.5, yy, 3, o.bh); }
    }
    ctx.restore();
  };

  /* ---------- rain: screen space, continuous time. call after K.screen(ctx) ---------- */
  K.rain = function (ctx, t, opt) {
    const o = Object.assign({ n: 220, speed: 1500, len: 70, alpha: 0.35, wind: 0.18, seed: 51, w: 1920, h: 1080, width: 2 }, opt || {});
    ctx.save(); ctx.strokeStyle = rgba(P.rain, o.alpha); ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i < o.n; i++) {
      const sp = o.speed * (0.75 + 0.5 * hash(i, o.seed)), L = o.len * (0.6 + 0.8 * hash(i, o.seed + 1));
      const span = o.h + L + 60, yy = ((hash(i, o.seed + 2) * span + t * sp) % span) - L - 30;
      const xx = (hash(i, o.seed + 3) * (o.w + 300)) - 150 + yy * o.wind;
      ctx.moveTo(xx, yy); ctx.lineTo(xx + L * o.wind, yy + L);
    }
    ctx.lineWidth = o.width; ctx.stroke(); ctx.restore();
  };
  /* rain rings on a wet floor band (world space) */
  K.ripples = function (ctx, x0, x1, y0, y1, t, opt) {
    const o = Object.assign({ n: 14, seed: 61, period: 0.9, color: P.rain, alpha: 0.5 }, opt || {});
    ctx.save(); ctx.strokeStyle = rgba(o.color, o.alpha); ctx.lineWidth = K.lw(ctx, 2);
    for (let i = 0; i < o.n; i++) {
      const ph = (t / o.period + hash(i, o.seed)) % 1, cyc = Math.floor(t / o.period + hash(i, o.seed));
      const x = x0 + hash(i * 7 + cyc, o.seed + 1) * (x1 - x0), y = y0 + hash(i * 7 + cyc, o.seed + 2) * (y1 - y0);
      const r = 6 + 34 * ph; ctx.globalAlpha = 1 - ph;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.3, 0, 0, K.TAU); ctx.stroke();
    }
    ctx.restore();
  };
  K.puddle = function (ctx, x, y, rx, ry, seed) {
    K.shape(ctx, K.blobPts(x, y, rx, ry, 14, seed || 71, 0.15), { fill: P.puddle, stroke: P.ink, w: 3, boil: 1, seed: seed || 71, gap: 0.25, shade: { color: P.streetLight, dx: 0, dy: 8 } });
  };
  /* low fog band (world space) */
  K.fog = function (ctx, x, y, w, h, a) {
    const g = ctx.createLinearGradient(0, y - h, 0, y + h);
    g.addColorStop(0, rgba(P.fog, 0)); g.addColorStop(0.5, rgba(P.fog, 0.32 * (a == null ? 1 : a))); g.addColorStop(1, rgba(P.fog, 0));
    ctx.fillStyle = g; ctx.fillRect(x, y - h, w, h * 2);
  };
  /* lightning: brightness 0..1 for a strike at t0 (double flicker) */
  K.flash = function (t, t0) {
    const d = t - t0; if (d < 0 || d > 0.5) return 0;
    return d < 0.06 ? 1 : d < 0.12 ? 0.2 : d < 0.18 ? 0.8 : Math.max(0, 0.8 * (1 - (d - 0.18) / 0.32));
  };

  /* ---------- the office: window with venetian blinds (seen from inside) ----------
     outside(ctx) draws the night city behind the glass (clipped). open 0..1 = slats tilt open */
  K.blindsWindow = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ open: 0.7, slats: 14, seed: 81, outside: null, raised: 0 }, opt || {});
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (o.outside) o.outside(ctx); else { ctx.fillStyle = P.nightMid; ctx.fillRect(x, y, w, h); }
    /* slats: dark bars whose thickness shrinks as they open */
    const sh = h / o.slats, top = y + h * o.raised;
    for (let i = 0; i < o.slats; i++) {
      const yy = top + i * sh; if (yy > y + h) break;
      const th = sh * (1 - 0.72 * o.open);
      K.shape(ctx, K.rectPts(x - 10, yy, w + 20, th, 4), { fill: P.greyDark, w: 3, boil: 0.7, seed: o.seed + i, shade: { color: P.bldgDark, dx: 0, dy: -th * 0.5 } });
    }
    ctx.restore();
    /* frame + cross bar */
    K.shape(ctx, K.rectPts(x, y, w, h, 4), { fill: null, stroke: P.ink, w: 18, boil: 1, seed: o.seed + 50 });
    K.line(ctx, [[x + w / 2, y], [x + w / 2, y + h]], { stroke: P.ink, w: 10, boil: 0.8, seed: o.seed + 51, taper: false });
    K.line(ctx, [[x - 20, y + h + 12], [x + w + 20, y + h + 12]], { stroke: P.ink, w: 16, boil: 0.8, seed: o.seed + 52, taper: false });
  };
  /* stripes of moon/lamp light thrown through blinds across a region (screen or world).
     ang = slant (radians), n stripes, gap ratio; additive. */
  K.blindLight = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ ang: -0.32, n: 7, a: 1, color: P.amberGlow, fill: 0.45, skew: 0.35 }, opt || {});
    if (o.a <= 0) return;
    const sh = h / o.n;
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = rgba(o.color, 0.16 * o.a);
    ctx.translate(x + w / 2, y + h / 2); ctx.transform(1, 0, o.skew, 1, 0, 0); ctx.rotate(o.ang);
    for (let i = -o.n; i < o.n * 2; i++) ctx.fillRect(-w * 1.5, -h / 2 + i * sh, w * 3, sh * o.fill);
    ctx.restore();
  };
  /* desk (front edge at y) and a desk lamp */
  K.desk = function (ctx, x, y, w, seed) {
    seed = seed || 91;
    K.shape(ctx, K.rectPts(x, y - 30, w, 46, 6), { fill: "#3a2a20", w: 5, boil: 1, seed, shade: { color: "#1f1510", dx: 0, dy: -14 } });
    K.shape(ctx, K.rectPts(x + 20, y + 16, w - 40, 400, 4), { fill: "#2a1e18", w: 5, boil: 1, seed: seed + 1, shade: { color: P.ink, dx: -40, dy: 0 } });
    for (let i = 0; i < 2; i++) { K.shape(ctx, K.rectPts(x + 60 + i * (w - 300), y + 60, 180, 90, 2), { fill: "#33241c", w: 4, boil: 0.8, seed: seed + 2 + i }); K.dot(ctx, x + 150 + i * (w - 300), y + 105, 8, P.brass, P.ink, 3, seed + 5 + i); }
  };
  K.deskLamp = function (ctx, x, y, s, on, seed) {
    seed = seed || 95;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (on > 0) { K.cone(ctx, 0, -150, Math.PI / 2 + 0.25, 260, 1.4, P.amber, on); K.glow(ctx, 0, -150, 180, rgba(P.amberGlow, 0.8), on * 0.7); }
    K.shape(ctx, K.ellipsePts(0, -6, 70, 16, 12), { fill: P.brassDark, w: 4, boil: 0.8, seed });
    K.line(ctx, [[0, -10], [-10, -120], [10, -150]], { stroke: P.brass, w: 10, boil: 0.8, seed: seed + 1, taper: false });
    K.shape(ctx, [[-70, -150], [-40, -200], [50, -200], [80, -150]], { fill: "#2f4a3a", w: 5, boil: 0.8, seed: seed + 2, shade: { color: "#1c2e24", dx: 0, dy: -12 } });
    if (on > 0.3) K.shape(ctx, K.ellipsePts(5, -150, 72, 9, 10), { fill: P.amberGlow, w: 3, boil: 0.6, seed: seed + 3 });
    ctx.restore();
  };

  /* ---------- a suspect for the lineup: faceless trench-coat figure, ticker badge ----------
     (x, y) = feet. opt: color (rim light + badge), label, a (pop), hidden (all black,
     glowing eyes), look (-1..1 eye shift), bob (beat bounce px), hat */
  K.suspect = function (ctx, x, y, s, opt) {
    const o = Object.assign({ color: P.A, label: "", a: 1, hidden: 0, look: 0, bob: 0, seed: 101, hat: true, lean: 0 }, opt || {});
    if (o.a <= 0) return;
    const sc = o.a >= 1 ? 1 : K.E.back(o.a, 2);
    ctx.save(); ctx.translate(x, y); ctx.scale(s * sc, s * sc); ctx.rotate(o.lean * Math.PI / 180); ctx.translate(0, -o.bob);
    const body = o.hidden > 0.5 ? P.ink : P.bldgLight, dark = o.hidden > 0.5 ? P.ink : P.bldgDark;
    K.shape(ctx, K.ellipsePts(0, o.bob + 2, 90, 16, 12), { fill: P.ink, stroke: null, w: 0, boil: 0.6, seed: o.seed + 9 });
    /* legs */
    K.limb2(ctx, [[-22, -120], [-26, -4]], 26, dark, o.seed + 1);
    K.limb2(ctx, [[22, -120], [26, -4]], 26, dark, o.seed + 2);
    /* coat */
    K.shape(ctx, [[-64, -330], [64, -330], [84, -110], [0, -100], [-84, -110]], { fill: body, w: 5, boil: 1.2, seed: o.seed + 3, shade: { color: dark, dx: -26, dy: 0 } });
    K.line(ctx, [[0, -320], [0, -104]], { stroke: P.ink, w: 4, boil: 0.8, seed: o.seed + 4 });
    /* rim light in the suspect colour on the left edge */
    if (o.hidden < 0.5) K.line(ctx, [[-60, -322], [-78, -116]], { stroke: o.color, w: 7, boil: 0.8, seed: o.seed + 5 });
    /* head + hat */
    K.shape(ctx, K.ellipsePts(0, -380, 46, 54, 14), { fill: body, w: 5, boil: 1, seed: o.seed + 6, shade: { color: dark, dx: -18, dy: 0 } });
    if (o.hat) {
      K.shape(ctx, K.ellipsePts(0, -410, 82, 14, 14), { fill: P.ink, w: 4, boil: 0.8, seed: o.seed + 7 });
      K.shape(ctx, [[-44, -414], [-40, -462], [0, -452], [40, -462], [44, -414]], { fill: P.ink, w: 4, boil: 0.8, seed: o.seed + 8 });
    }
    /* eyes: glowing slits under the brim */
    const eg = o.hidden > 0.5 ? P.amberGlow : P.greyLight;
    [-1, 1].forEach((sd) => K.shape(ctx, K.ellipsePts(sd * 17 + o.look * 8, -386, 9, 4, 8), { fill: eg, stroke: null, w: 0, boil: 0.4, seed: o.seed + 10 + sd }));
    if (o.hidden > 0.5) K.glow(ctx, 0, -386, 70, rgba(P.amberGlow, 0.6), 0.5);
    /* badge with the ticker */
    if (o.label) {
      K.shape(ctx, K.rectPts(-58, -270, 116, 70, 3), { fill: o.hidden > 0.5 ? P.greyDark : P.paper, w: 4, boil: 0.8, seed: o.seed + 11, shade: { color: P.paperShade, dx: 0, dy: -10 } });
      K.text(ctx, o.label, 0, -234, { size: 46, weight: 700, fill: o.hidden > 0.5 ? P.amberGlow : P.ink, font: K.FONT.mono });
      K.line(ctx, [[-58, -200], [58, -200]], { stroke: o.color, w: 8, boil: 0.5, seed: o.seed + 12, taper: false });
    }
    ctx.restore();
  };
  /* even-width outlined limb: ink under, colour on top */
  K.limb2 = function (ctx, pts, w, color, seed) {
    K.line(ctx, pts, { stroke: P.ink, w: w + 8, boil: 0.9, seed, gap: 0, taper: false });
    K.line(ctx, pts, { stroke: color, w, boil: 0.9, seed, gap: 0, taper: false });
  };
  /* police lineup wall: height lines with mono numbers (language-free) */
  K.lineupWall = function (ctx, x, y, w, h, seed) {
    seed = seed || 111;
    ctx.fillStyle = P.greyDark; ctx.fillRect(x, y, w, h);
    for (let i = 0; i <= 8; i++) {
      const yy = y + h - 60 - i * ((h - 120) / 8);
      K.line(ctx, [[x, yy], [x + w, yy]], { stroke: P.greyLight, w: i % 2 ? 2 : 4, boil: 0.6, seed: seed + i, gap: 0.08, taper: false, alpha: 0.6 });
      if (i % 2 === 0) K.text(ctx, String(150 + i * 10), x + 40, yy - 18, { size: 26, weight: 700, font: K.FONT.mono, fill: P.greyLight, align: "left" });
    }
  };

  /* ---------- newspaper (spinning headline gag). headline(ctx) draws the front page art ---------- */
  K.newspaper = function (ctx, x, y, s, rot, headline, seed) {
    seed = seed || 121;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    K.shape(ctx, K.rectPts(-300, -390, 600, 780, 4), { fill: P.paper, w: 6, boil: 1.2, seed, shade: { color: P.paperShade, dx: 18, dy: 18 } });
    K.line(ctx, [[-270, -300], [270, -300]], { stroke: P.ink, w: 6, boil: 0.8, seed: seed + 1, taper: false });
    K.line(ctx, [[-270, -290], [270, -290]], { stroke: P.ink, w: 2.5, boil: 0.8, seed: seed + 2, taper: false });
    /* body text columns as grey ruled lines */
    for (let c = 0; c < 3; c++) for (let r = 0; r < 9; r++) {
      const xx = -270 + c * 186, yy = 150 + r * 24;
      K.line(ctx, [[xx, yy], [xx + 160 - (r === 8 ? 70 : 0), yy]], { stroke: P.greyDark, w: 4, boil: 0.5, seed: seed + 10 + c * 9 + r, taper: false });
    }
    if (headline) headline(ctx);
    ctx.restore();
  };
})(CK);
