/* ============================================================
   KIT 50 EXPLAINER: slide content as objects of the noir city.
   Never draw a flat slide. Each primitive is a physical thing:
     lead-lag path       -> paw-print trail (two trails, one lagged)  K.paw, K.trail
     graph node          -> suspect photo pinned to the board         K.node, K.pin
     causal edge         -> red evidence string between two pins      K.edge, K.edgePoint
     weight / lag value  -> manila evidence tag                       K.tag
     diagram background  -> cork board in a dark wood frame           K.corkboard
     big number          -> crime-scene evidence placard (tent card)  K.plank
     table               -> case file: folder + typed sheet           K.ledger
     formula             -> precinct chalkboard                       K.slate
     chart               -> chart projected on a pull-down screen     K.screenChart (= K.sailChart)
     bullets             -> detective's spiral notepad                K.notice
     code                -> page in a typewriter                      K.logbook
     scatter / corr      -> clue index card (+ "≠" rubber stamp)      K.scatter
     title               -> art-deco marquee plate                    K.banner
     zoom on evidence    -> magnifying glass                          K.magnify
   All take an `a` (appear 0..1) so they can pop in on a beat.
   Text never boils; frames, strings and paper edges do.
   Light comes from the upper-left: solid dark shadows fall lower-right.
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  const P = K.P, { clamp, lerp, hash, hs } = K;
  const popS = (a) => (a <= 0 ? 0 : a >= 1 ? 1 : K.E.back(a, 2.2));
  const MONO = () => K.FONT.mono, DISP = () => K.FONT.display;
  /* hex token -> rgba string (for gradients that fade a palette colour out) */
  const rgba = (hex, al) => { const h = hex.replace("#", ""), n = parseInt(h, 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${al})`; };
  K.rgba = K.rgba || rgba;
  /* the dark partner of a fill colour (for shade bands) */
  const DARK = {};
  [["amber", "amberDim"], ["amberGlow", "amberDeep"], ["amberDeep", "amberDim"], ["string", "stringDark"], ["paper", "paperShade"], ["cream", "creamShade"],
    ["fur", "furDark"], ["grey", "greyDark"], ["greyLight", "grey"], ["cork", "corkDark"], ["coat", "coatDark"], ["brass", "brassDark"], ["bad", "stringDark"]]
    .forEach((q) => { DARK[P[q[0]]] = P[q[1]]; });
  const darkOf = (c) => DARK[c] || P.inkSoft;
  K.darkOf = darkOf;
  /* code-syntax shades on paper (no palette token is dark enough; add P.codeStr / P.codeNum to override) */
  const CODE_STR = P.codeStr || "#2f6a3c", CODE_NUM = P.codeNum || P.nightLow;

  /* polygon with tight corners: Catmull-Rom would round a 4-point rect into a pillow, so each
     edge is densified and every corner gets two points `e` px either side of it */
  function sharp(pts, step, e) {
    step = step || 60; e = e == null ? 3 : e; const out = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, k = Math.max(1, Math.round(L / step));
      out.push([a[0] + ux * e, a[1] + uy * e]);
      for (let j = 1; j < k; j++) out.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
      out.push([b[0] - ux * e, b[1] - uy * e]);
    }
    return out;
  }
  const RP = (x, y, w, h) => sharp([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 60, Math.min(4, w / 6, h / 6));
  K.sharpPts = sharp; K.rectSharp = RP;

  /* ---------- polyline helpers ---------- */
  function polyLen(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
  function polyAt(pts, cum, d) {
    d = clamp(d, 0, cum[cum.length - 1]);
    let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const a = pts[i - 1], b = pts[i], u = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
    return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[1] - a[1], b[0] - a[0])];
  }

  /* ============================================================
     PRIORITY 1: board, suspects, string, paws
     ============================================================ */

  /* ---------- paw print: main pad + 4 toe beans ----------
     ang = walking direction (radians, toes point that way). a 0..1 = stamp
     (scale 1.4 -> 1, then a squash on contact). */
  const PAD = [[-24, 6], [-12, -4], [0, -6], [12, -4], [24, 6], [22, 20], [10, 26], [0, 21], [-10, 26], [-22, 20]];
  const TOES = [[-27, -14, 8, 10.5, -0.45], [-10, -31, 8.5, 11, -0.12], [10, -31, 8.5, 11, 0.12], [27, -14, 8, 10.5, 0.45]];
  K.paw = function (ctx, x, y, s, ang, color, a) {
    a = a == null ? 1 : a; if (a <= 0) return;
    color = color || P.amber; s = s || 1;
    const u = clamp(a, 0, 1), drop = K.E.out3(clamp(u / 0.65, 0, 1));
    const sc = 1 + 0.4 * (1 - drop), q = u > 0.65 && u < 1 ? Math.sin(Math.PI * (u - 0.65) / 0.35) * 0.16 : 0;
    const sd = darkOf(color), sd0 = (ang || 0) * 7 | 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate((ang || 0) + Math.PI / 2); ctx.scale(s * sc * (1 + q), s * sc * (1 - q));
    ctx.globalAlpha *= clamp(u * 2.5, 0, 1);
    K.shape(ctx, PAD, { fill: color, w: 3.2, boil: 0.7, seed: 11 + sd0, gap: 0, shade: { color: sd, dx: -3, dy: -4 } });
    TOES.forEach((t, i) => K.shape(ctx, K.ellipsePts(t[0], t[1], t[2], t[3], 10, t[4]), { fill: color, w: 2.8, boil: 0.6, seed: 21 + i + sd0, gap: 0, shade: { color: sd, dx: -2, dy: -3 } }));
    ctx.restore();
  };

  /* ---------- walking trail of paw prints along a polyline ----------
     opt: n (prints), shown (0..n, fractional = newest print stamping), color, s, seed, a,
          spread (left/right offset px), fade (older prints dim, 0..1).
     returns [x, y, ang] of the newest print (to place the walker). */
  K.trail = function (ctx, pts, opt) {
    const o = Object.assign({ n: 10, shown: 99, color: P.amber, s: 0.6, seed: 1, a: 1, spread: null, fade: 0.35 }, opt || {});
    if (o.a <= 0 || pts.length < 2) return null;
    const cum = polyLen(pts), L = cum[cum.length - 1], spread = o.spread == null ? 18 * o.s / 0.6 : o.spread;
    const top = Math.min(o.n, o.shown); let head = null;
    for (let i = 0; i < o.n; i++) {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) break;
      const q = polyAt(pts, cum, ((i + 0.5) / o.n) * L), side = i % 2 ? 1 : -1;
      const nx = -Math.sin(q[2]), ny = Math.cos(q[2]);
      const px = q[0] + nx * spread * side, py = q[1] + ny * spread * side, an = q[2] + hs(i, o.seed) * 0.14 + side * 0.08;
      const age = clamp((top - 1 - i) / Math.max(1, o.n - 1), 0, 1);
      ctx.save(); ctx.globalAlpha *= o.a * (1 - o.fade * age);
      K.paw(ctx, px, py, o.s, an, o.color, g);
      ctx.restore();
      head = [px, py, an];
    }
    return head;
  };

  /* ---------- push-pin head (round, shiny) ---------- */
  K.pin = function (ctx, x, y, color, s) {
    color = color || P.string; s = s || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.globalAlpha *= 0.7; ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(6, 8, 12, 8, 0.5, 0, K.TAU); ctx.fill(); ctx.restore(); /* cast shadow */
    K.shape(ctx, K.ellipsePts(0, 0, 13, 13, 12), { fill: color, w: 3, boil: 0.5, seed: 3, gap: 0, shade: { color: darkOf(color), dx: -4, dy: -4 } });
    ctx.fillStyle = P.moon; ctx.globalAlpha *= 0.9; ctx.beginPath(); ctx.ellipse(-4.5, -5, 4, 2.6, -0.6, 0, K.TAU); ctx.fill();
    ctx.restore();
  };

  /* ---------- corkboard (x, y = centre) in a dark wood frame ---------- */
  K.corkboard = function (ctx, x, y, w, h, opt) {
    const o = Object.assign({ a: 1, seed: 81, frame: 30 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const f = o.frame;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    ctx.save(); ctx.globalAlpha *= 0.75; ctx.fillStyle = P.ink; ctx.fillRect(-w / 2 - f + 18, -h / 2 - f + 20, w + 2 * f, h + 2 * f); ctx.restore();
    K.shape(ctx, RP(-w / 2 - f, -h / 2 - f, w + 2 * f, h + 2 * f), { fill: P.boardEdge, w: 5, boil: 1.2, seed: o.seed, shade: { color: P.brickDark, dx: -9, dy: -9 },
      hatch: { ang: 0.03, gap: 9, alpha: 0.35, color: P.ink } });
    K.shape(ctx, RP(-w / 2, -h / 2, w, h), { fill: P.cork, w: 3.5, boil: 1, seed: o.seed + 1, shade: { color: P.corkDark, dx: 14, dy: 14 } });
    /* speckles: fixed (cork does not boil), two tones */
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8); ctx.clip();
    const n = Math.floor((w * h) / 1400);
    [[P.corkDark, 0.75], [P.corkLight, 0.6]].forEach((c, k) => {
      ctx.fillStyle = c[0]; ctx.globalAlpha = c[1]; ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const px = (hash(i, o.seed + k * 31) - 0.5) * w, py = (hash(i + 5000, o.seed + k * 31) - 0.5) * h, r = 1.2 + 2.4 * hash(i + 9000, o.seed + k);
        ctx.moveTo(px + r, py); ctx.ellipse(px, py, r * 1.3, r, hash(i, k + 3) * 3, 0, K.TAU);
      }
      ctx.fill();
    });
    ctx.restore();
    ctx.restore();
  };

  /* ---------- suspect photo (graph node) ----------
     (x, y) = the pin point at top centre. Photo ~220 x 270 at s = 1.
     opt: label, color (suspect tint), a, seed, hot (0..1 amber glow + frame), tilt (deg),
          hidden (0..1 black silhouette, glowing eyes: the confounder), hat, pin (pin colour) */
  K.node = function (ctx, x, y, s, opt) {
    const o = Object.assign({ label: "A", color: P.A, a: 1, seed: 1, hot: 0, tilt: 0, hidden: 0, hat: true, pin: P.string }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const sway = Math.sin(K.now * 1.1 + o.seed) * 0.6;
    ctx.save(); ctx.translate(x, y); ctx.rotate(((o.tilt + sway) * Math.PI) / 180); ctx.scale(s * a, s * a);
    if (o.hot > 0) K.glow(ctx, 0, 110, 210, P.amber, o.hot * 0.45);
    ctx.save(); ctx.globalAlpha *= 0.6; ctx.fillStyle = P.ink; ctx.fillRect(-110 + 14, -22 + 16, 220, 270); ctx.restore(); /* solid drop shadow */
    if (o.hot > 0) K.shape(ctx, RP(-120, -32, 240, 290), { fill: P.amber, w: 4, boil: 1, seed: o.seed + 4, alpha: o.hot, shade: { color: P.amberDeep, dx: -6, dy: -6 } });
    K.shape(ctx, RP(-110, -22, 220, 270), { fill: P.paper, w: 4, boil: 1.1, seed: o.seed, shade: { color: P.paperShade, dx: -7, dy: -7 } });
    /* photo */
    const ph = RP(-94, -6, 188, 182);
    K.shape(ctx, ph, { fill: o.hidden > 0.5 ? P.nightLow : P.bldgDark, stroke: null, boil: 0.4, seed: o.seed + 1 });
    ctx.save(); ctx.beginPath(); ctx.rect(-94, -6, 188, 182); ctx.clip();
    /* mugshot height lines */
    ctx.strokeStyle = P.greyDark; ctx.lineWidth = 2; ctx.globalAlpha = 0.6; ctx.beginPath();
    for (let i = 0; i < 5; i++) { const yy = 10 + i * 34; ctx.moveTo(-94, yy); ctx.lineTo(94, yy); }
    ctx.stroke(); ctx.globalAlpha = 1;
    const bust = [[-96, 182], [-86, 138], [-58, 116], [-24, 106], [24, 106], [58, 116], [86, 138], [96, 182]];
    const head = K.ellipsePts(0, 66, 33, 39, 14);
    const drawBust = (fill, sh, al) => {
      K.shape(ctx, [[-14, 108], [-12, 86], [12, 86], [14, 108]], { fill, w: 3, boil: 0.6, seed: o.seed + 6, alpha: al });
      K.shape(ctx, bust, { fill, w: 3.5, boil: 0.8, seed: o.seed + 7, alpha: al, shade: sh ? { color: sh, dx: -10, dy: -6 } : null });
      K.shape(ctx, head, { fill, w: 3.5, boil: 0.8, seed: o.seed + 8, alpha: al, shade: sh ? { color: sh, dx: -9, dy: -5 } : null });
      if (sh) K.line(ctx, [[-30, 110], [0, 150], [30, 110]], { stroke: P.ink, w: 3, boil: 0.6, seed: o.seed + 9, alpha: al * 0.8 }); /* trench collar */
    };
    if (o.hidden < 1) drawBust(o.color, darkOf(o.color) === P.inkSoft ? P.greyDark : darkOf(o.color), 1);
    if (o.hidden > 0) drawBust(P.ink, null, o.hidden);
    if (o.hat) {
      K.shape(ctx, RP(-30, 8, 60, 28).map((p, i) => [p[0] * (p[1] < 20 ? 0.86 : 1), p[1]]), { fill: P.hatDark, w: 3.5, boil: 0.6, seed: o.seed + 10 });
      K.shape(ctx, K.ellipsePts(0, 36, 56, 9, 14), { fill: P.hatDark, w: 3.5, boil: 0.6, seed: o.seed + 11 });
      K.line(ctx, [[-29, 30], [29, 30]], { stroke: P.hatBand, w: 6, boil: 0.4, seed: o.seed + 12, taper: false });
    }
    if (o.hidden > 0) { /* glowing eyes under the brim */
      const bl = (K.now * 0.7 + o.seed * 0.37) % 3 < 0.08 ? 0.15 : 1;
      [-13, 13].forEach((ex, i) => {
        K.glow(ctx, ex, 60, 20, o.color, o.hidden * 0.5);
        ctx.save(); ctx.globalAlpha *= o.hidden; ctx.fillStyle = P.moon; ctx.beginPath(); ctx.ellipse(ex, 60, 10, 3.6 * bl, i ? -0.3 : 0.3, 0, K.TAU); ctx.fill(); ctx.restore();
      });
    }
    ctx.restore();
    K.shape(ctx, ph, { stroke: P.ink, w: 3, boil: 0.6, seed: o.seed + 2 });
    /* ticker label in the white strip */
    const sz = o.label.length <= 3 ? 50 : o.label.length <= 5 ? 40 : 30;
    K.text(ctx, o.label, 0, 213, { size: sz, weight: 700, font: MONO(), fill: P.ink });
    ctx.restore();
    if (o.pin) K.pin(ctx, x, y, o.pin, s * a);
  };

  /* ---------- red string between two pins ---------- */
  /* point on a sagging string: quadratic whose middle hangs `sag` px below the chord */
  K.edgePoint = function (A, B, sag, u) {
    const C = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 2 * (sag || 0)];
    const v = 1 - u;
    const x = v * v * A[0] + 2 * v * u * C[0] + u * u * B[0], y = v * v * A[1] + 2 * v * u * C[1] + u * u * B[1];
    const tx = 2 * v * (C[0] - A[0]) + 2 * u * (B[0] - C[0]), ty = 2 * v * (C[1] - A[1]) + 2 * u * (B[1] - C[1]);
    return [x, y, Math.atan2(ty, tx)];
  };
  /* twisted cord: ink underlay, coloured cord, dark slanted twist marks */
  function cord(ctx, pts, col, w, seed, alpha) {
    if (pts.length < 2) return;
    const pp = pts.map((q) => [q[0], q[1]]);
    K.line(ctx, pp, { stroke: P.ink, w: w + 4.5, boil: 0.9, seed, gap: 0, alpha, taper: false });
    K.line(ctx, pp, { stroke: col, w, boil: 0.9, seed, gap: 0, alpha, taper: false });
    const cum = polyLen(pp), L = cum[cum.length - 1], step = Math.max(9, w * 2.2);
    ctx.save(); ctx.globalAlpha *= alpha == null ? 1 : alpha; ctx.strokeStyle = col === P.string ? P.stringDark : darkOf(col); ctx.lineWidth = Math.max(1.5, w * 0.32); ctx.lineCap = "round";
    ctx.beginPath();
    for (let d = step * 0.5; d < L - 2; d += step) {
      const q = polyAt(pp, cum, d), an = q[2] + 1.0, r = w * 0.48;
      ctx.moveTo(q[0] - Math.cos(an) * r, q[1] - Math.sin(an) * r); ctx.lineTo(q[0] + Math.cos(an) * r, q[1] + Math.sin(an) * r);
    }
    ctx.stroke(); ctx.restore();
  }
  K.cord = cord;
  /* opt: p (draw progress), state "plain"|"hot"|"dim"|"cut", sag, label, lu, seed, w,
          trim (px free at both ends), arrow (default true: A -> B), pins (redraw pin heads on top) */
  K.edge = function (ctx, A, B, opt) {
    const o = Object.assign({ p: 1, state: "plain", sag: 40, label: "", lu: 0.5, seed: 1, w: 5, trim: 0, arrow: true, pins: false, labelSize: 30, pinColor: P.string }, opt || {});
    if (o.p <= 0) return;
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, u0 = clamp(o.trim / L, 0, 0.45), u1 = 1 - u0;
    const hot = o.state === "hot", dim = o.state === "dim", cut = o.state === "cut";
    const alpha = dim ? 0.35 : 1, w = hot ? o.w * 1.5 : o.w, N = 30;
    if (cut) {
      const hang = Math.min(160, L * 0.28), cu = 0.5, swing = Math.sin(K.now * 1.7 + o.seed) * 6;
      [[A, u0, cu - 0.03, 1], [B, u1, cu + 0.03, -1]].forEach((hf, k) => {
        const pts = [], end = hf[0], n = Math.max(2, Math.round(16 * o.p));
        for (let i = 0; i <= n; i++) {
          const v = (i / 16), q = K.edgePoint(A, B, o.sag, lerp(hf[1], hf[2], v)), pull = Math.pow(v, 1.7);
          pts.push([lerp(q[0], end[0], pull * 0.5) + swing * pull * hf[3], q[1] + pull * hang]);
        }
        cord(ctx, pts, P.bad, w, o.seed + k * 13, alpha);
        if (o.p >= 1) { /* frayed end */
          const e = pts[pts.length - 1], b4 = pts[pts.length - 2], an = Math.atan2(e[1] - b4[1], e[0] - b4[0]);
          for (let j = -1; j <= 1; j++) K.line(ctx, [[e[0], e[1]], [e[0] + Math.cos(an + j * 0.5) * 12, e[1] + Math.sin(an + j * 0.5) * 12]], { stroke: P.bad, w: 2.2, boil: 0.8, seed: o.seed + 40 + j + k * 5, gap: 0 });
        }
      });
    } else {
      const pts = [];
      for (let i = 0; i <= N; i++) pts.push(K.edgePoint(A, B, o.sag, lerp(u0, u1, (i / N) * o.p)));
      if (hot) { ctx.save(); ctx.globalAlpha *= 0.4; K.line(ctx, pts.map((q) => [q[0], q[1]]), { stroke: P.amber, w: w * 4.2, boil: 1.2, seed: o.seed + 5, gap: 0, taper: false }); ctx.restore(); }
      cord(ctx, pts, P.string, w, o.seed, alpha);
      if (o.arrow && o.p >= 1) {
        const q = K.edgePoint(A, B, o.sag, lerp(u0, u1, 0.62)), r = 10 + w * 1.6;
        ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(q[2]);
        K.shape(ctx, [[r, 0], [-r * 0.8, -r * 0.85], [-r * 0.35, 0], [-r * 0.8, r * 0.85]], { fill: hot ? P.amber : P.string, w: 3.5, boil: 0.6, seed: o.seed + 7, gap: 0, alpha, shade: { color: hot ? P.amberDeep : P.stringDark, dx: -3, dy: -3 } });
        ctx.restore();
      }
    }
    if (o.pins) { K.pin(ctx, A[0], A[1], o.pinColor); K.pin(ctx, B[0], B[1], o.pinColor); }
    if (o.label && o.p > 0.6) {
      const la = clamp((o.p - 0.6) / 0.4, 0, 1), q = K.edgePoint(A, B, o.sag, o.lu);
      const qy = cut ? q[1] + 30 : q[1];
      K.tag(ctx, q[0] + 18, qy + o.labelSize * 0.5 + 40, o.label, { a: la, hot, seed: o.seed + 9, size: o.labelSize, anchor: [q[0], qy], alpha: dim ? 0.55 : 1 });
    }
  };

  /* ---------- manila evidence tag (luggage tag with hole + short string) ----------
     opt: a, hot (amber tag), size, seed, anchor ([x, y] the string ties to; default up-left), font, weight */
  K.tag = function (ctx, x, y, str, opt) {
    const o = Object.assign({ a: 1, hot: false, size: 30, seed: 1, font: K.FONT.mono, weight: 700, anchor: null, alpha: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = K.textW(ctx, str, o.size, o.weight, o.font) + 66, h = o.size + 26;
    const rot = hs(o.seed, 2) * 0.06 + Math.sin(K.now * 1.3 + o.seed) * 0.02;
    const hole = [-w / 2 + 17, 0];
    /* hole position in world space, for the string */
    const hx = x + (hole[0] * Math.cos(rot)) * a, hy = y + (hole[0] * Math.sin(rot)) * a;
    const an = o.anchor || [hx - 22, hy - 30];
    ctx.save(); ctx.globalAlpha *= o.alpha;
    K.line(ctx, [[an[0], an[1]], [(an[0] + hx) / 2 - 4, (an[1] + hy) / 2 + 6], [hx, hy]], { stroke: P.greyLight, w: 2.6, boil: 0.8, seed: o.seed + 3, gap: 0, taper: false });
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(a, a);
    const sh = [[-w / 2 + 18, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2 + 18, h / 2], [-w / 2, h / 2 - 15], [-w / 2, -h / 2 + 15]];
    ctx.save(); ctx.globalAlpha *= 0.55; K.pathOf(ctx, sh.map((p) => [p[0] + 6, p[1] + 8]), true); ctx.fillStyle = P.ink; ctx.fill(); ctx.restore();
    K.shape(ctx, sh, { fill: o.hot ? P.amber : P.paper, w: 3.2, boil: 0.9, seed: o.seed, shade: { color: o.hot ? P.amberDeep : P.paperShade, dx: -5, dy: -5 } });
    K.dot(ctx, hole[0], 0, 9, o.hot ? P.amberDeep : P.paperShade, null, 0, o.seed + 1);
    K.dot(ctx, hole[0], 0, 4.5, P.ink, null, 0, o.seed + 2);
    K.text(ctx, str, 12, 2, { size: o.size, weight: o.weight, font: o.font, fill: P.ink });
    ctx.restore();
    /* string tie over the hole */
    K.line(ctx, [[hx - 3, hy - 3], [hx + 3, hy + 2]], { stroke: P.greyLight, w: 2.6, boil: 0.4, seed: o.seed + 4, gap: 0, alpha: o.alpha });
  };

  /* ============================================================
     PRIORITY 2: placards, files, boards, charts, pads, typewriter
     ============================================================ */

  /* ---------- evidence placard: folded tent card with big numbers ----------
     opt: a, size, seed, colors[], font, weight */
  K.plank = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 54, seed: 11, colors: [], font: K.FONT.mono, weight: 700 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    /* ground shadow */
    ctx.save(); ctx.globalAlpha *= 0.7; ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(18, h / 2 + 6, w * 0.56, 16, 0, 0, K.TAU); ctx.fill(); ctx.restore();
    /* back panel peeking over the fold */
    K.shape(ctx, sharp([[-w / 2 + 22, -h / 2], [-w / 2 + 34, -h / 2 - 20], [w / 2 - 34, -h / 2 - 20], [w / 2 - 22, -h / 2]]), { fill: P.amberDim, w: 3.5, boil: 0.9, seed: o.seed + 1 });
    const face = sharp([[-w / 2 + 14, -h / 2], [w / 2 - 14, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]);
    K.shape(ctx, face, { fill: P.paper, w: 4.5, boil: 1.1, seed: o.seed, shade: { color: P.paperShade, dx: -8, dy: -8 } });
    /* amber header band across the fold */
    K.shape(ctx, sharp([[-w / 2 + 15, -h / 2 + 2], [w / 2 - 15, -h / 2 + 2], [w / 2 - 13.4, -h / 2 + 16], [-w / 2 + 13.4, -h / 2 + 16]], 60, 2), { fill: P.amber, stroke: null, boil: 0.5, seed: o.seed + 2 });
    K.line(ctx, [[-w / 2 + 13, -h / 2 + 17], [w / 2 - 13, -h / 2 + 17]], { stroke: P.ink, w: 2.5, boil: 0.6, seed: o.seed + 3, taper: false });
    const lh = o.size * 1.15, top = 8 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => K.text(ctx, ln, 0, top + i * lh + 2, { size: o.size, weight: o.weight, font: o.font, fill: o.colors[i] || P.ink }));
    ctx.restore();
  };

  /* ---------- case file: manila folder with a typed table sheet ----------
     rows: arrays of strings, row 0 = header. opt: a, size, rowH, seed, hi (row index, amber marker),
     reveal (0..1 rows), title (folder tab text) */
  K.ledger = function (ctx, x, y, cols, rows, opt) {
    const o = Object.assign({ a: 1, size: 28, rowH: 50, seed: 21, hi: -1, reveal: 1, title: "" }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const w = cols.reduce((s, c) => s + c, 0) + 40, h = rows.length * o.rowH + 40;
    const fw = w + 70, fh = h + 70;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    ctx.save(); ctx.globalAlpha *= 0.6; ctx.fillStyle = P.ink; ctx.fillRect(-fw / 2 + 16, -fh / 2 + 18, fw, fh); ctx.restore();
    /* folder back with tab */
    const tw = Math.max(150, o.title ? K.textW(ctx, o.title, 26, 700, DISP()) + 50 : 150);
    K.shape(ctx, sharp([[-fw / 2, -fh / 2], [-fw / 2 + 20, -fh / 2 - 34], [-fw / 2 + 20 + tw, -fh / 2 - 34], [-fw / 2 + 40 + tw, -fh / 2], [fw / 2, -fh / 2], [fw / 2, fh / 2], [-fw / 2, fh / 2]]),
      { fill: P.creamShade, w: 4.5, boil: 1.1, seed: o.seed, shade: { color: P.coat, dx: -8, dy: -8 } });
    if (o.title) K.text(ctx, o.title, -fw / 2 + 20 + tw / 2 + 10, -fh / 2 - 15, { size: 26, weight: 700, font: DISP(), fill: P.ink, track: 1 });
    /* typed sheet */
    ctx.save(); ctx.rotate(hs(o.seed, 5) * 0.012);
    K.shape(ctx, RP(-w / 2, -h / 2, w, h), { fill: P.paper, w: 3.5, boil: 1, seed: o.seed + 1, shade: { color: P.paperShade, dx: -6, dy: -6 } });
    const shown = Math.ceil(rows.length * o.reveal);
    rows.slice(0, shown).forEach((r, ri) => {
      const ry = -h / 2 + 20 + ri * o.rowH + o.rowH / 2;
      if (ri === o.hi) { /* amber highlighter stroke */
        ctx.save(); ctx.globalAlpha *= 0.6;
        K.shape(ctx, sharp([[-w / 2 + 12, ry - o.rowH / 2 + 7], [w / 2 - 10, ry - o.rowH / 2 + 4], [w / 2 - 14, ry + o.rowH / 2 - 5], [-w / 2 + 14, ry + o.rowH / 2 - 7]], 60, 6), { fill: P.amber, stroke: null, boil: 0.8, seed: o.seed + ri });
        ctx.restore();
      }
      let cx = -w / 2 + 20;
      r.forEach((cell, ci) => {
        K.text(ctx, cell, cx + cols[ci] / 2, ry, { size: ri === 0 ? o.size * 1.15 : o.size, weight: 700, font: ri === 0 ? DISP() : MONO(), fill: P.ink });
        cx += cols[ci];
      });
      if (ri === 0) K.line(ctx, [[-w / 2 + 16, ry + o.rowH / 2], [w / 2 - 16, ry + o.rowH / 2]], { stroke: P.ink, w: 3, boil: 0.8, seed: o.seed + 50, taper: false });
    });
    /* paperclip at top-left */
    const cx0 = -w / 2 + 44, cy0 = -h / 2 - 22;
    K.line(ctx, [[cx0 - 8, cy0 + 56], [cx0 - 8, cy0 + 6], [cx0, cy0 - 4], [cx0 + 8, cy0 + 6], [cx0 + 8, cy0 + 46], [cx0 + 2, cy0 + 52], [cx0 - 3, cy0 + 46], [cx0 - 3, cy0 + 14]],
      { stroke: P.greyLight, w: 4, boil: 0.5, seed: o.seed + 60, gap: 0, taper: false });
    ctx.restore();
    ctx.restore();
  };

  /* ---------- precinct chalkboard (formulas, 1-3 lines, chalk mono) ----------
     lines: strings or {t, c}. opt: a, size, seed, write (0..1 letter by letter), font */
  K.slate = function (ctx, x, y, w, h, lines, opt) {
    const o = Object.assign({ a: 1, size: 52, seed: 31, write: 1, font: K.FONT.mono }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    ctx.save(); ctx.globalAlpha *= 0.65; ctx.fillStyle = P.ink; ctx.fillRect(-w / 2 - 18 + 16, -h / 2 - 18 + 18, w + 36, h + 36); ctx.restore();
    K.shape(ctx, RP(-w / 2 - 20, -h / 2 - 20, w + 40, h + 40), { fill: P.boardEdge, w: 5, boil: 1.2, seed: o.seed, shade: { color: P.brickDark, dx: -7, dy: -7 }, hatch: { ang: 0.02, gap: 8, alpha: 0.3, color: P.ink } });
    K.shape(ctx, RP(-w / 2, -h / 2, w, h), { fill: P.board, w: 3.5, boil: 1, seed: o.seed + 1 });
    /* chalk smudges (erased writing) */
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12); ctx.clip(); ctx.globalAlpha *= 0.05; ctx.fillStyle = P.chalk;
    for (let i = 0; i < 4; i++) { K.pathOf(ctx, K.blobPts(hs(i, o.seed) * w * 0.32, hs(i + 9, o.seed) * h * 0.3, 70, 16, 9, i + o.seed, 0.3), true); ctx.fill(); }
    ctx.restore();
    /* chalk tray + a stick of chalk */
    K.shape(ctx, RP(-w / 2 - 8, h / 2 + 18, w + 16, 14), { fill: P.boardEdge, w: 3.5, boil: 0.8, seed: o.seed + 2 });
    K.shape(ctx, RP(w / 2 - 120, h / 2 + 8, 46, 11), { fill: P.chalk, w: 2.5, boil: 0.5, seed: o.seed + 3 });
    const lh = o.size * 1.32, top = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      const str = typeof ln === "string" ? ln : ln.t, col = typeof ln === "string" ? P.chalk : ln.c || P.chalk;
      const n = Math.floor(str.length * clamp(o.write * lines.length - i, 0, 1));
      if (n > 0) K.text(ctx, str.slice(0, n), -w / 2 + 36, top + i * lh, { size: o.size, weight: 400, font: o.font, fill: col, align: "left" });
    });
    ctx.restore();
  };

  /* ---------- chart projected on a pull-down screen ----------
     series: [{ data:[..], color, kind:"line"|"bar" }]. opt: a, draw (0..1), yMin, yMax, xLabels,
     title, seed, lagMark {i0, i1, label} (bracket "Δt" between two x indices), beam (projector cone 0..1) */
  K.screenChart = function (ctx, x, y, w, h, series, opt) {
    const o = Object.assign({ a: 1, draw: 1, seed: 41, yMin: null, yMax: null, xLabels: [], title: "", lagMark: null, beam: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    /* pull-down: the cloth unrolls with a */
    const hh = h * K.E.out3(clamp(o.a * 1.2, 0, 1));
    ctx.save(); ctx.globalAlpha *= 0.55; ctx.fillStyle = P.ink; ctx.fillRect(-w / 2 + 16, -h / 2 + 16, w, hh); ctx.restore();
    K.shape(ctx, RP(-w / 2, -h / 2, w, hh), { fill: P.paper, w: 4, boil: 1.1, seed: o.seed, shade: { color: P.paperShade, dx: -10, dy: 0 } });
    /* bottom batten + pull ring */
    K.shape(ctx, RP(-w / 2 - 4, -h / 2 + hh - 6, w + 8, 12), { fill: P.greyDark, w: 3, boil: 0.6, seed: o.seed + 1 });
    K.line(ctx, [[0, -h / 2 + hh + 6], [0, -h / 2 + hh + 30]], { stroke: P.greyLight, w: 2.5, boil: 0.5, seed: o.seed + 2, taper: false });
    K.shape(ctx, K.ellipsePts(0, -h / 2 + hh + 38, 8, 8, 10), { stroke: P.greyLight, w: 3, boil: 0.4, seed: o.seed + 3 });
    /* roller case on top */
    K.shape(ctx, RP(-w / 2 - 26, -h / 2 - 28, w + 52, 30), { fill: P.greyDark, w: 4.5, boil: 0.9, seed: o.seed + 4, shade: { color: P.inkSoft, dx: 0, dy: -9 } });
    [-1, 1].forEach((sd, i) => K.shape(ctx, K.ellipsePts(sd * (w / 2 + 26), -h / 2 - 13, 9, 17, 10), { fill: P.grey, w: 3.5, boil: 0.6, seed: o.seed + 5 + i }));
    if (hh > h * 0.98) {
      const pl = -w / 2 + 72, pr = w / 2 - 36, pt = -h / 2 + (o.title ? 84 : 44) + (o.lagMark ? 52 : 0), pb = h / 2 - 58;
      if (o.title) K.text(ctx, o.title, 0, -h / 2 + 44, { size: 38, weight: 700, font: DISP(), fill: P.ink });
      K.line(ctx, [[pl, pt - 10], [pl, pb]], { stroke: P.ink, w: 4, boil: 0.8, seed: o.seed + 9 });
      K.line(ctx, [[pl, pb], [pr, pb]], { stroke: P.ink, w: 4, boil: 0.8, seed: o.seed + 8 });
      let mn = o.yMin, mx = o.yMax;
      if (mn == null || mx == null) { const all = series.flatMap((s) => s.data); mn = mn == null ? Math.min(...all) : mn; mx = mx == null ? Math.max(...all) : mx; }
      const nMax = Math.max(...series.map((s) => s.data.length), o.xLabels.length, 2);
      const X = (i) => pl + 22 + ((pr - pl - 44) * i) / (nMax - 1), Y = (v) => pb - ((v - mn) / (mx - mn || 1)) * (pb - pt);
      series.forEach((s, si) => {
        const n = s.data.length, k = o.draw * (n - 1), col = s.color || P.ink;
        if (s.kind === "bar") {
          const bw = ((pr - pl) / nMax) * 0.55;
          s.data.forEach((v, i) => { const g = clamp(o.draw * n - i, 0, 1); if (g <= 0) return; const top = lerp(pb, Y(v), K.E.back(g, 1.4)); K.shape(ctx, RP(X(i) - bw / 2, top, bw, Math.max(1, pb - top)), { fill: col, w: 3.5, boil: 0.8, seed: o.seed + 20 + i, shade: { color: darkOf(col), dx: -6, dy: 0 } }); });
        } else {
          const pts = [];
          for (let i = 0; i <= Math.floor(k); i++) pts.push([X(i), Y(s.data[i])]);
          const fr = k - Math.floor(k), i0 = Math.floor(k);
          if (i0 < n - 1 && fr > 0) pts.push([lerp(X(i0), X(i0 + 1), fr), lerp(Y(s.data[i0]), Y(s.data[i0 + 1]), fr)]);
          if (pts.length > 1) { K.line(ctx, pts, { stroke: P.ink, w: 10, boil: 0.9, seed: o.seed + 30 + si, gap: 0, taper: false }); K.line(ctx, pts, { stroke: col, w: 5.5, boil: 0.9, seed: o.seed + 30 + si, gap: 0, taper: false }); }
          const head = pts[pts.length - 1]; if (head) K.dot(ctx, head[0], head[1], 8, col, P.ink, 3, o.seed + 40 + si);
        }
      });
      o.xLabels.forEach((lb, i) => K.text(ctx, lb, X(i), pb + 30, { size: 24, weight: 400, font: MONO(), fill: P.inkSoft }));
      if (o.lagMark && o.draw > 0.5) {
        const m = o.lagMark, x0 = X(m.i0), x1 = X(m.i1), by = pt - 26, al = clamp((o.draw - 0.5) * 3, 0, 1);
        ctx.save(); ctx.globalAlpha *= al;
        ctx.setLineDash([6, 8]); ctx.strokeStyle = P.inkSoft; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0, by); ctx.lineTo(x0, pb); ctx.moveTo(x1, by); ctx.lineTo(x1, pb); ctx.stroke(); ctx.setLineDash([]);
        K.line(ctx, [[x0, by + 10], [x0, by]], { stroke: P.ink, w: 3.5, boil: 0.4, seed: o.seed + 60 });
        K.line(ctx, [[x0, by], [x1, by]], { stroke: P.ink, w: 3.5, boil: 0.4, seed: o.seed + 61, taper: false });
        K.line(ctx, [[x1, by], [x1, by + 10]], { stroke: P.ink, w: 3.5, boil: 0.4, seed: o.seed + 62 });
        const lb = m.label || "Δt", lw = K.textW(ctx, lb, 30, 700, MONO()) + 16;
        ctx.fillStyle = P.paper; ctx.fillRect((x0 + x1) / 2 - lw / 2, by - 36, lw, 32);
        K.text(ctx, lb, (x0 + x1) / 2, by - 19, { size: 30, weight: 700, font: MONO(), fill: P.amberDim });
        ctx.restore();
      }
    }
    ctx.restore();
    /* projector cone from off-screen right (additive, faint) */
    if (o.beam > 0 && a > 0.5) {
      const sx = x + w / 2 + 900, sy = y - h * 0.1, g = ctx.createLinearGradient(sx, sy, x, y);
      g.addColorStop(0, rgba(P.amberGlow, 0.22 * o.beam)); g.addColorStop(1, rgba(P.amberGlow, 0.04 * o.beam));
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(sx, sy - 10); ctx.lineTo(x - (w / 2) * a, y - (h / 2) * a); ctx.lineTo(x - (w / 2) * a, y + (h / 2) * a); ctx.lineTo(sx, sy + 10); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  };
  K.sailChart = K.screenChart;

  /* ---------- detective's spiral notepad (bullets as paw prints) ----------
     items: strings. opt: a, size, seed, shown (items visible, fractional = popping), title, lineH, paw (colour) */
  K.notice = function (ctx, x, y, w, items, opt) {
    const o = Object.assign({ a: 1, size: 38, seed: 51, shown: 99, title: "", lineH: null, paw: P.amberDeep }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.lineH || o.size * 1.6, h = items.length * lh + (o.title ? 120 : 70);
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(hs(o.seed, 1) * 0.02);
    ctx.save(); ctx.globalAlpha *= 0.6; ctx.fillStyle = P.ink; ctx.fillRect(-w / 2 + 14, -h / 2 + 16, w, h); ctx.restore();
    K.shape(ctx, RP(-w / 2 - 6, -h / 2 - 14, w + 12, 30), { fill: P.inkSoft, w: 3.5, boil: 0.8, seed: o.seed + 1 }); /* cover lip */
    K.shape(ctx, RP(-w / 2, -h / 2, w, h), { fill: P.paper, w: 4, boil: 1.1, seed: o.seed, shade: { color: P.paperShade, dx: -7, dy: -7 } });
    /* ruled lines + margin */
    ctx.save(); ctx.globalAlpha *= 0.45; ctx.strokeStyle = P.B; ctx.lineWidth = 2; ctx.beginPath();
    for (let yy = -h / 2 + 64; yy < h / 2 - 10; yy += lh / 2) { ctx.moveTo(-w / 2 + 8, yy); ctx.lineTo(w / 2 - 8, yy); }
    ctx.stroke(); ctx.globalAlpha = 0.5; ctx.strokeStyle = P.string; ctx.beginPath(); ctx.moveTo(-w / 2 + 34, -h / 2 + 30); ctx.lineTo(-w / 2 + 34, h / 2 - 4); ctx.stroke(); ctx.restore();
    /* spiral */
    const nr = Math.max(4, Math.floor(w / 38));
    for (let i = 0; i < nr; i++) {
      const rx = -w / 2 + 24 + (i * (w - 48)) / (nr - 1);
      K.dot(ctx, rx, -h / 2 + 12, 5, P.ink, null, 0, o.seed + 20 + i);
      K.line(ctx, [[rx - 5, -h / 2 + 12], [rx - 7, -h / 2 - 8], [rx + 3, -h / 2 - 16], [rx + 4, -h / 2 + 8]], { stroke: P.greyLight, w: 3.5, boil: 0.4, seed: o.seed + 40 + i, gap: 0, taper: false });
    }
    let yy = -h / 2 + 40 + lh / 2;
    if (o.title) {
      K.text(ctx, o.title, -w / 2 + 52, -h / 2 + 64, { size: o.size * 1.1, weight: 700, font: DISP(), fill: P.ink, align: "left" });
      K.line(ctx, [[-w / 2 + 50, -h / 2 + 88], [-w / 2 + 60 + K.textW(ctx, o.title, o.size * 1.1, 700, DISP()), -h / 2 + 86]], { stroke: P.amberDeep, w: 4, boil: 0.6, seed: o.seed + 5 });
      yy += 50;
    }
    items.forEach((it, i) => {
      const g = clamp(o.shown - i, 0, 1); if (g <= 0) return;
      K.paw(ctx, -w / 2 + 70, yy + i * lh, o.size * 0.011, -Math.PI / 2 + 0.25, o.paw, g);
      ctx.save(); ctx.globalAlpha *= clamp(g * 2, 0, 1);
      K.text(ctx, it, -w / 2 + 104, yy + i * lh + 2, { size: o.size, weight: 500, font: DISP(), fill: P.ink, align: "left" });
      ctx.restore();
    });
    ctx.restore();
  };

  /* ---------- typewriter page (code), Python highlighting ----------
     opt: a, size, seed, typed (0..1 of all characters) */
  const KW = /^(def|for|in|if|elif|else|return|import|from|as|class|while|lambda|None|True|False|and|or|not|with|yield)$/;
  K.logbook = function (ctx, x, y, w, lines, opt) {
    const o = Object.assign({ a: 1, size: 26, seed: 61, typed: 1 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const lh = o.size * 1.45, h = lines.length * lh + 64;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a);
    /* page (above the platen at y = h/2) */
    const pg = sharp([[-w / 2, -h / 2], [w / 2, -h / 2 + 2], [w / 2 - 2, h / 2], [-w / 2 + 2, h / 2]]);
    ctx.save(); ctx.globalAlpha *= 0.5; ctx.fillStyle = P.ink; ctx.fillRect(-w / 2 + 14, -h / 2 + 14, w, h); ctx.restore();
    K.shape(ctx, pg, { fill: P.paper, w: 3.5, boil: 1, seed: o.seed + 1, shade: { color: P.paperShade, dx: -8, dy: 0 } });
    /* typewriter top: platen roller, knobs, body with key rows */
    const bw = w + 120, by = h / 2;
    K.shape(ctx, sharp([[-bw / 2 + 30, by + 20], [bw / 2 - 30, by + 20], [bw / 2, by + 120], [-bw / 2, by + 120]], 60, 10), { fill: P.hatDark, w: 5, boil: 1, seed: o.seed + 2, shade: { color: P.ink, dx: -10, dy: -10 } });
    for (let r = 0; r < 2; r++) for (let i = 0; i < 11; i++) {
      const kx = -bw / 2 + 60 + r * 22 + (i * (bw - 140)) / 10, ky = by + 62 + r * 30;
      K.dot(ctx, kx, ky, 9, P.greyDark, P.ink, 2, o.seed + 70 + r * 11 + i);
    }
    K.shape(ctx, RP(-w / 2 - 30, by - 8, w + 60, 32), { fill: P.ink, w: 3.5, boil: 0.6, seed: o.seed + 3, stroke: P.inkSoft });
    K.line(ctx, [[-w / 2 - 22, by - 1], [w / 2 + 22, by - 1]], { stroke: P.greyDark, w: 3, boil: 0.3, seed: o.seed + 4, alpha: 0.8 });
    [-1, 1].forEach((sd, i) => K.shape(ctx, K.ellipsePts(sd * (w / 2 + 46), by + 8, 16, 22, 12), { fill: P.greyDark, w: 3.5, boil: 0.6, seed: o.seed + 5 + i, shade: { color: P.inkSoft, dx: -4, dy: -4 } }));
    /* typed code */
    ctx.save(); ctx.font = `400 ${o.size}px ${K.FONT.mono}`; const cw = ctx.measureText("M").width; ctx.restore();
    const total = lines.reduce((s, l) => s + l.length, 0); let budget = Math.floor(total * o.typed), caret = null;
    lines.forEach((ln, i) => {
      const yy = -h / 2 + 34 + lh / 2 + i * lh;
      if (budget <= 0) { if (!caret) caret = [-w / 2 + 34, yy]; return; }
      const vis = ln.slice(0, budget); budget -= ln.length; let col = 0;
      const toks = vis.match(/#.*$|"[^"]*"?|'[^']*'?|[A-Za-z_][A-Za-z0-9_]*|[0-9][0-9_.]*|\s+|./g) || [];
      toks.forEach((tk) => {
        const kw = KW.test(tk);
        const c = tk.startsWith("#") ? P.greyDark : kw ? P.amberDim : /^[0-9]/.test(tk) ? CODE_NUM : /^["']/.test(tk) ? CODE_STR : P.ink;
        K.text(ctx, tk, -w / 2 + 34 + col * cw, yy, { size: o.size, weight: kw ? 700 : 400, font: K.FONT.mono, fill: c, align: "left" });
        col += tk.length;
      });
      if (vis.length < ln.length || (budget <= 0 && o.typed < 1)) caret = [-w / 2 + 34 + col * cw, yy];
    });
    if (caret && o.typed < 1 && Math.floor(K.now * 3) % 2 === 0) { ctx.fillStyle = P.ink; ctx.fillRect(caret[0] + 2, caret[1] + o.size * 0.42, cw * 0.9, 3); }
    ctx.restore();
  };

  /* ---------- clue index card with a scatter plot ----------
     pts: [[x, y], ...] in data units (auto range). opt: a, seed, color, title, fit (0..1 draw
     the least-squares line), stamp (0..1: big "≠" rubber stamp in P.bad), dotR */
  K.scatter = function (ctx, x, y, w, h, pts, opt) {
    const o = Object.assign({ a: 1, seed: 91, color: P.B, title: "", fit: 0, stamp: 0, dotR: 7 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); ctx.rotate(hs(o.seed, 4) * 0.025);
    ctx.save(); ctx.globalAlpha *= 0.6; ctx.fillStyle = P.ink; ctx.fillRect(-w / 2 + 14, -h / 2 + 16, w, h); ctx.restore();
    K.shape(ctx, RP(-w / 2, -h / 2, w, h), { fill: P.paper, w: 4, boil: 1, seed: o.seed, shade: { color: P.paperShade, dx: -7, dy: -7 } });
    const head = o.title ? 58 : 18;
    ctx.save(); ctx.globalAlpha *= 0.55; ctx.strokeStyle = P.string; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-w / 2 + 6, -h / 2 + head); ctx.lineTo(w / 2 - 6, -h / 2 + head); ctx.stroke(); ctx.restore();
    if (o.title) K.text(ctx, o.title, 0, -h / 2 + 32, { size: 32, weight: 700, font: DISP(), fill: P.ink });
    const pl = -w / 2 + 40, pr = w / 2 - 28, pt = -h / 2 + head + 22, pb = h / 2 - 30;
    K.line(ctx, [[pl, pt], [pl, pb]], { stroke: P.ink, w: 3.5, boil: 0.7, seed: o.seed + 1 });
    K.line(ctx, [[pl, pb], [pr, pb]], { stroke: P.ink, w: 3.5, boil: 0.7, seed: o.seed + 2 });
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const X = (v) => pl + 18 + ((v - x0) / (x1 - x0 || 1)) * (pr - pl - 30), Y = (v) => pb - 14 - ((v - y0) / (y1 - y0 || 1)) * (pb - pt - 24);
    pts.forEach((p, i) => { const g = clamp(o.a * 1.6 - (i / pts.length) * 0.6, 0, 1); if (g > 0) K.dot(ctx, X(p[0]), Y(p[1]), o.dotR * K.E.back(g, 2), o.color, P.ink, 2.5, o.seed + 10 + i); });
    if (o.fit > 0 && pts.length > 1) {
      const n = pts.length, mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
      let sxy = 0, sxx = 0; pts.forEach((p) => { sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) * (p[0] - mx); });
      const b = sxx ? sxy / sxx : 0, c = my - b * mx, ex = lerp(x0, x1, o.fit);
      K.line(ctx, [[X(x0), Y(b * x0 + c)], [X(ex), Y(b * ex + c)]], { stroke: P.ink, w: 6, boil: 0.7, seed: o.seed + 3, gap: 0, taper: false });
      K.line(ctx, [[X(x0), Y(b * x0 + c)], [X(ex), Y(b * ex + c)]], { stroke: P.amberDeep, w: 3, boil: 0.7, seed: o.seed + 3, gap: 0, taper: false });
    }
    if (o.stamp > 0) { /* rubber stamp: drops 1.5 -> 1 */
      const u = o.stamp, sc = 1 + 0.5 * (1 - K.E.out3(clamp(u / 0.7, 0, 1))), R = Math.min(w, h) * 0.3;
      ctx.save(); ctx.translate(w * 0.16, h * 0.04); ctx.rotate(-0.22); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(u * 2.5, 0, 1) * 0.88;
      K.shape(ctx, K.ellipsePts(0, 0, R, R, 22), { stroke: P.bad, w: 9, boil: 1, seed: o.seed + 50, gap: 0.08 });
      K.shape(ctx, K.ellipsePts(0, 0, R * 0.82, R * 0.82, 20), { stroke: P.bad, w: 4, boil: 1, seed: o.seed + 51, gap: 0.08 });
      const q = R * 0.42;
      K.line(ctx, [[-q, -q * 0.36], [q, -q * 0.36]], { stroke: P.bad, w: 13, boil: 0.8, seed: o.seed + 52, taper: false, gap: 0 });
      K.line(ctx, [[-q, q * 0.36], [q, q * 0.36]], { stroke: P.bad, w: 13, boil: 0.8, seed: o.seed + 53, taper: false, gap: 0 });
      K.line(ctx, [[-q * 0.45, q * 1.05], [q * 0.45, -q * 1.05]], { stroke: P.bad, w: 13, boil: 0.8, seed: o.seed + 54, taper: false, gap: 0 });
      ctx.restore();
    }
    ctx.restore();
  };

  /* ---------- art-deco marquee title plate. u = unfold 0..1. returns the text box ---------- */
  K.banner = function (ctx, cx, cy, w, h, u, opt) {
    const o = Object.assign({ seed: 71, fill: P.hatDark, trim: P.amber, bulbs: true }, opt || {});
    if (u <= 0) return null;
    const ww = w * K.E.out3(clamp(u, 0, 1)), hh = h * K.E.out3(clamp(u * 1.5, 0, 1)), x0 = cx - ww / 2, y0 = cy - hh / 2;
    ctx.save(); ctx.globalAlpha *= 0.7; ctx.fillStyle = P.ink; ctx.fillRect(x0 + 16, y0 + 18, ww, hh); ctx.restore();
    K.shape(ctx, RP(x0, y0, ww, hh), { fill: o.fill, w: 5, boil: 1.1, seed: o.seed, shade: { color: P.ink, dx: -8, dy: -8 } });
    if (u > 0.4) {
      const al = clamp((u - 0.4) / 0.4, 0, 1);
      ctx.save(); ctx.globalAlpha *= al;
      K.shape(ctx, RP(x0 + 12, y0 + 12, ww - 24, hh - 24), { stroke: o.trim, w: 4, boil: 0.8, seed: o.seed + 1 });
      K.shape(ctx, RP(x0 + 22, y0 + 22, ww - 44, hh - 44), { stroke: P.amberDim, w: 2.5, boil: 0.8, seed: o.seed + 2 });
      /* deco corner fans */
      [[x0 + 22, y0 + 22, 0], [x0 + ww - 22, y0 + 22, Math.PI / 2], [x0 + ww - 22, y0 + hh - 22, Math.PI], [x0 + 22, y0 + hh - 22, -Math.PI / 2]].forEach((c, i) => {
        ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(c[2]);
        ctx.fillStyle = o.trim; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 30, 0, Math.PI / 2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = o.fill; ctx.lineWidth = 3; ctx.beginPath();
        for (let k = 1; k < 4; k++) { const an = (k * Math.PI) / 8; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an) * 30, Math.sin(an) * 30); }
        ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI / 2); ctx.stroke();
        ctx.restore();
      });
      /* marquee bulbs, chasing at the boil rate */
      if (o.bulbs) {
        const nb = Math.max(3, Math.floor((ww - 120) / 46)), ch = Math.floor(K.bf / 2);
        for (let i = 0; i < nb; i++) [y0, y0 + hh].forEach((by, r) => {
          const bx = x0 + 60 + (i * (ww - 120)) / (nb - 1), on = (i + ch + r) % 3 !== 0;
          if (on) K.glow(ctx, bx, by, 26, P.amber, 0.55);
          K.dot(ctx, bx, by, 7, on ? P.amberGlow : P.amberDim, P.ink, 2, o.seed + 10 + i + r * 50);
        });
      }
      ctx.restore();
    }
    return { x: x0 + 40, y: y0 + 30, w: ww - 80, h: hh - 60 };
  };

  /* ---------- magnifying glass: zoom drawInside(ctx) 1.8x about (x, y) ----------
     opt: a (pop), zoom, handle (angle, radians; default lower-right) */
  K.magnify = function (ctx, x, y, r, drawInside, opt) {
    const o = Object.assign({ a: 1, zoom: 1.8, handle: 0.75, seed: 101 }, opt || {});
    const a = popS(o.a); if (a <= 0) return;
    const R = r * a;
    /* handle (behind the rim) */
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.handle); ctx.scale(a, a);
    ctx.save(); ctx.globalAlpha *= 0.6; ctx.fillStyle = P.ink; ctx.fillRect(r + 14, -10, r * 1.25, 34); ctx.restore();
    K.shape(ctx, RP(r + 4, -12, r * 0.28, 24), { fill: P.brass, w: 3.5, boil: 0.6, seed: o.seed + 1, shade: { color: P.brassDark, dx: 0, dy: -6 } });
    K.shape(ctx, sharp([[r + r * 0.28, -14], [r * 2.3, -18], [r * 2.4, 0], [r * 2.3, 18], [r + r * 0.28, 14]], 60, 3), { fill: P.hatDark, w: 4, boil: 0.8, seed: o.seed + 2, shade: { color: P.ink, dx: 0, dy: -8 } });
    ctx.restore();
    /* lens content */
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, K.TAU); ctx.clip();
    ctx.fillStyle = P.night; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    ctx.save(); ctx.translate(x, y); ctx.scale(o.zoom, o.zoom); ctx.translate(-x, -y); drawInside(ctx); ctx.restore();
    ctx.globalAlpha = 0.1; ctx.fillStyle = P.glass; ctx.fillRect(x - R, y - R, 2 * R, 2 * R); ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.45; ctx.strokeStyle = P.moon; ctx.lineWidth = R * 0.07; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(x, y, R * 0.78, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
    ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.arc(x, y, R * 0.78, Math.PI * 1.5, Math.PI * 1.56); ctx.stroke();
    ctx.restore();
    /* brass rim */
    const ring = K.ellipsePts(x, y, R + 9, R + 9, 24);
    ctx.save(); ctx.lineWidth = 18; ctx.strokeStyle = P.brass; ctx.beginPath(); ctx.arc(x, y, R + 9, 0, K.TAU); ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = P.brassDark; ctx.beginPath(); ctx.arc(x + 2, y + 2, R + 13, -0.4, Math.PI * 0.9); ctx.stroke(); ctx.restore();
    K.shape(ctx, ring.map((p) => [x + (p[0] - x) * (R + 18) / (R + 9), y + (p[1] - y) * (R + 18) / (R + 9)]), { stroke: P.ink, w: 4, boil: 0.7, seed: o.seed + 3 });
    K.shape(ctx, K.ellipsePts(x, y, R, R, 24), { stroke: P.ink, w: 3, boil: 0.6, seed: o.seed + 4 });
  };
})(CK);
