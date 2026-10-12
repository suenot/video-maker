/* ============================================================
   KIT 40 ROBOT: "Beepo", the lead agent, and the specialist bots.
   Local space: feet on y = 0, faces the viewer. Scale 1 sizes:
     coil legs 44 tall, boots 46 x 20 at x = +/-30
     torso 124 x 100 (centre y -94), chest LED panel
     neck 16, CRT head 176 x 134 (centre y -228), screen 132 x 92
     antenna: coil spring 54 + bulb r 11 (lights on beats)
     arms: two-bone IK 46 + 44 rubber hose, mitt hand with a 2-finger clamp
   Pose state (all optional):
     kind      "lead" | "analyst" | "risk" | "trader"
     squash    -0.6..0.6 (+ = squashed wide), volume kept; coil legs compress
     lean      deg around the feet;  hop  px lift (legs dangle and stretch)
     headTilt  deg;  look [dx, dy] -1..1;  blink 0..1
     eyes      "dot" | "happy" | "wide" | "heart" | "dollar" | "x"
     mouth     "smile" | "open" | "flat" | "talk" | "o";  talk 0..1 (waveform)
     faceIcon  pixel icon name shown big instead of the face; iconColor
     screen    fn(ctx, w, h) draws custom screen content (origin top-left); noScan hides the glass
     bulb      0..1 antenna light;  chest  0..1 chest LED pulse
     armL/armR { x, y, open 0..1 }  target of the hand in local space
     hold      { R: "ticket"|"lens"|"shield"|"baton", L: ... }; holdSym ticker
     exclaim   0..1 pixel "!" pop;  heartPop 0..1
   Host additions (episodes; all optional, absent = the intro's look):
     kind "cohost"  Ping, the sidekick: hover thruster, round eyes, bow tie
     mouth "speak"  viseme mouth driven by talk 0..1 (loudness); vis overrides
                    the shape ({ open, wide, round }, see K.viseme)
     brow      -1..1.5 pixel brows (-1 worried, + raised);  headDip px (nod)
     think     0..1 thought bubble with "?" (thinkIcon swaps the glyph)
     hold.R/L  may be a function(ctx, ang, st) that draws any kit prop at the hand
   K.faceRect is set to the screen-space quad of the screen (dive transitions).
   ============================================================ */
var AK = window.AK || (window.AK = {});
(function (K) {
  const P = K.P, { clamp, lerp } = K;

  K.ik2 = function (S, T, a, b, bend) {
    let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy);
    const dm = clamp(d, Math.abs(a - b) + 0.01, a + b - 0.01);
    if (d < 1e-6) { dx = 1; dy = 0; d = 1; }
    const ux = dx / d, uy = dy / d;
    const ca = clamp((a * a + dm * dm - b * b) / (2 * a * dm), -1, 1), A = Math.acos(ca) * (bend || 1);
    const ex = S[0] + a * (ux * Math.cos(A) - uy * Math.sin(A)), ey = S[1] + a * (ux * Math.sin(A) + uy * Math.cos(A));
    return { elbow: [ex, ey], end: [S[0] + ux * dm, S[1] + uy * dm] };
  };
  /* rubber hose limb: navy outline, plastic fill, ring bands */
  K.hose = function (ctx, pts, w, color, seed, rings) {
    K.line(ctx, pts, { stroke: P.ink, w: w + 8, boil: 0.7, seed });
    K.line(ctx, pts, { stroke: color, w, boil: 0.7, seed });
    if (rings) for (let i = 1; i < rings; i++) {
      const q = K.polyAt(pts, i / rings), nx = -Math.sin(q[2]) * w * 0.5, ny = Math.cos(q[2]) * w * 0.5;
      K.line(ctx, [[q[0] - nx, q[1] - ny], [q[0] + nx, q[1] + ny]], { stroke: P.ink, w: 2.5, boil: 0.3, seed: seed + i });
    }
  };
  /* coil spring between two points (legs, antenna) */
  K.coil = function (ctx, A, B, wdt, turns, color, seed) {
    const pts = [], n = turns * 2;
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    for (let i = 0; i <= n; i++) { const u = i / n, s = i === 0 || i === n ? 0 : i % 2 ? 1 : -1; pts.push([A[0] + dx * u + nx * s * wdt / 2, A[1] + dy * u + ny * s * wdt / 2]); }
    K.line(ctx, pts, { stroke: P.ink, w: 11, boil: 0.5, seed });
    K.line(ctx, pts, { stroke: color, w: 5, boil: 0.5, seed });
  };
  /* mitt hand with a two-finger clamp, pointing along ang */
  K.mitt = function (ctx, x, y, ang, open, color, seed, flip) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1, flip || 1);
    const o = 0.12 + 0.6 * clamp(open, 0, 1);
    ctx.save(); ctx.translate(10, -8); ctx.rotate(-o);
    K.shape(ctx, K.rrPts(0, -7, 30, 14, 7, 2), { fill: color, w: 4.5, boil: 0.5, seed: seed + 1 });
    ctx.restore();
    ctx.save(); ctx.translate(10, 8); ctx.rotate(o * 0.7);
    K.shape(ctx, K.rrPts(0, -7, 26, 14, 7, 2), { fill: color, w: 4.5, boil: 0.5, seed: seed + 2 });
    ctx.restore();
    K.shape(ctx, K.ellipsePts(0, 0, 19, 17, 12), { fill: color, w: 5, boil: 0.6, seed, shade: { color: P.shellDark, dx: -5, dy: -6 }, gloss: 0.5 });
    ctx.restore();
  };

  const KINDS = {
    lead: { body: P.shell, dark: P.shellShade, rim: P.cyan, head: "crt", ant: "spring", accent: P.pink },
    analyst: { body: P.analyst, dark: P.analystDark, rim: "#c9f6ff", head: "dome", ant: "dish", accent: P.cyan },
    risk: { body: P.risk, dark: P.riskDark, rim: "#fff1c7", head: "box", ant: "beacon", accent: P.orange },
    trader: { body: P.trader, dark: P.traderDark, rim: "#ffd1ea", head: "crt", ant: "none", accent: P.pink, headset: true },
    /* Ping, the co-host (host B): the analyst promoted, but hovering, with round eyes and a bow tie */
    cohost: { body: P.analyst, dark: P.analystDark, rim: "#c9f6ff", head: "dome", ant: "dish", accent: P.pink, legs: "hover", face: "round", ph: P.pingGlow, bow: P.pink, arm: P.analyst },
  };
  K.ROBOT_KINDS = KINDS;

  /* ---------- the screen face ---------- */
  function face(ctx, w, h, st, seed, kd) {
    const ph = kd.ph || P.phosphor, look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1);
    if (st.screen) { st.screen(ctx, w, h); return; }
    if (st.faceIcon) { K.pix(ctx, st.faceIcon, w / 2, h / 2, Math.min(w, h) / 9, st.iconColor || ph, { glow: 1 }); return; }
    if (kd.face === "round") { roundFace(ctx, w, h, st, seed, ph); return; }
    const c = Math.max(4, w / 22); /* face pixel cell */
    const ex = [w * 0.31, w * 0.69], ey = h * 0.42 + look[1] * c * 0.8, lx = look[0] * c * 1.1;
    ctx.save(); ctx.shadowColor = ph; ctx.shadowBlur = c * 1.6; ctx.fillStyle = ph;
    const R = (x, y, ww, hh) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, ww, hh, c * 0.35) : ctx.rect(x, y, ww, hh); ctx.fill(); };
    const eyes = st.eyes || "dot";
    ex.forEach((x0, i) => {
      const x = x0 + lx;
      if (eyes === "heart") { K.pix(ctx, "heart", x, ey, c * 0.9, P.pink, { glow: 1 }); return; }
      if (eyes === "dollar") { K.pix(ctx, "dollar", x, ey, c * 0.8, P.yellow, { glow: 1 }); return; }
      if (eyes === "x") { K.pix(ctx, "cross", x, ey, c * 0.9, ph, { glow: 1 }); return; }
      if (blink > 0.55) { R(x - c * 1.6, ey, c * 3.2, c * 0.8); return; }
      if (eyes === "happy") { /* ^ ^ */
        R(x - c * 1.8, ey + c * 0.2, c, c); R(x - c * 0.9, ey - c * 0.7, c * 1.8, c); R(x + c * 0.8, ey + c * 0.2, c, c); return;
      }
      const big = eyes === "wide" ? 1.35 : 1, ew = c * 2.2 * big, eh = c * 3.2 * big * (1 - blink * 0.85);
      R(x - ew / 2, ey - eh / 2, ew, eh);
      /* pupil highlight: a dark notch that moves with look */
      ctx.save(); ctx.shadowBlur = 0; ctx.fillStyle = P.screen;
      ctx.fillRect(x - ew / 2 + ew * 0.55 + look[0] * c * 0.3, ey - eh / 2 + c * 0.45, c * 0.7, c * 0.7 * (1 - blink));
      ctx.restore();
      void i;
    });
    if (st.brow != null) { /* pixel brows: two cells per brow, raised (+) or knitted (-) */
      const br = clamp(st.brow, -1, 1.5);
      ex.forEach((x0, i) => {
        const sd = i ? 1 : -1, x = x0 + lx, by = ey - c * 2.9 - br * c * 0.7, tilt = -br * sd * c * 0.35;
        R(x - c * 1.5, by - tilt, c * 1.5, c * 0.75); R(x, by + tilt, c * 1.5, c * 0.75);
      });
    }
    /* cheeks */
    ctx.save(); ctx.shadowBlur = 0; ctx.globalAlpha = 0.55; ctx.fillStyle = P.pink;
    R(w * 0.13, h * 0.62, c * 1.6, c * 0.8); R(w * 0.87 - c * 1.6, h * 0.62, c * 1.6, c * 0.8); ctx.restore();
    /* mouth */
    const m = st.mouth || "smile", my = h * 0.7, mx = w / 2;
    if (m === "smile") { R(mx - c * 2.5, my - c * 0.5, c, c); R(mx - c * 1.5, my + c * 0.3, c * 3, c); R(mx + c * 1.5, my - c * 0.5, c, c); }
    else if (m === "open") R(mx - c * 1.6, my - c * 0.6, c * 3.2, c * 2.2);
    else if (m === "o") R(mx - c * 0.8, my - c * 0.4, c * 1.6, c * 1.8);
    else if (m === "flat") R(mx - c * 2, my, c * 4, c * 0.8);
    else if (m === "speak") { /* viseme mouth: closed line, wide "e", tall "a", round "o"/"u" */
      const v = st.vis || K.viseme(st.talk || 0, K.now, seed), mw = c * (2.4 + 2.4 * v.wide - 0.9 * v.round), mh = c * (0.75 + 3.1 * v.open);
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(mx - mw / 2, my - mh / 2 + c * 0.3, mw, mh, v.round > 0.5 ? mh / 2 : c * 0.4) : ctx.rect(mx - mw / 2, my - mh / 2 + c * 0.3, mw, mh); ctx.fill();
      if (v.open > 0.22) { /* dark mouth inside, a phosphor tooth row on top */
        ctx.save(); ctx.shadowBlur = 0; ctx.fillStyle = P.screen;
        const iw = mw - c * 0.9, ih = mh - c * 0.9;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(mx - iw / 2, my - ih / 2 + c * 0.3, iw, ih, v.round > 0.5 ? ih / 2 : c * 0.25) : ctx.rect(mx - iw / 2, my - ih / 2 + c * 0.3, iw, ih); ctx.fill();
        if (v.wide > 0.4) { ctx.fillStyle = ph; ctx.fillRect(mx - iw / 2 + c * 0.3, my - ih / 2 + c * 0.3, iw - c * 0.6, c * 0.45); }
        ctx.restore();
      }
    }
    else if (m === "talk") { /* waveform mouth: amplitude follows st.talk (singing) */
      const amp = clamp(st.talk == null ? 0.6 : st.talk, 0, 1), n = 7;
      for (let i = 0; i < n; i++) {
        const k = Math.sin(i * 1.9 + K.bf * 1.7) * 0.5 + 0.5, hh = c * (0.6 + 2.4 * amp * k * Math.sin((i / (n - 1)) * Math.PI));
        R(mx - (n * c * 0.8) / 2 + i * c * 0.8, my - hh / 2 + c * 0.3, c * 0.55, hh);
      }
    }
    ctx.restore();
  }

  K.robot = function (ctx, x, y, s, st) {
    st = st || {};
    const kd = KINDS[st.kind || "lead"], seed = st.seed || 700 + (st.kind || "lead").length * 37;
    const sq = clamp(st.squash || 0, -0.6, 0.6), sxk = 1 + sq * 0.5, syk = 1 / sxk;
    const hop = st.hop || 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(((st.lean || 0) * Math.PI) / 180);
    /* ---- legs: coil springs that compress with squash and stretch in the air ---- */
    const hover = kd.legs === "hover", hv = hover ? K.hoverLift(K.now, seed) : 0;
    const legH = hover ? hv * syk : 44 * syk * (1 + clamp(hop / 120, 0, 0.35)), hipY = -legH - hop;
    if (hover) hoverBase(ctx, hipY, sxk, kd, seed, hop + hv);
    else [-1, 1].forEach((sd, i) => {
      const fx = sd * 30 * sxk, fy = -hop * 0.15;
      K.coil(ctx, [sd * 26 * sxk, hipY + 4], [fx, fy - 12], 22, 4, P.metal, seed + 2 + i);
      K.shape(ctx, K.rrPts(fx - 25, fy - 18, 50, 20, 9, 2), { fill: P.rubber, w: 5, boil: 0.5, seed: seed + 4 + i, rim: { color: kd.rim, dx: 0, dy: 4, a: 0.5 } });
    });
    /* ---- torso (squash around the hips) ---- */
    ctx.save(); ctx.translate(0, hipY); ctx.scale(sxk, syk);
    const TW = 124, TH = 100;
    K.shape(ctx, K.rrPts(-TW / 2, -TH, TW, TH, 30, 3), { fill: kd.body, w: 6, boil: 0.9, seed: seed + 10, shade: { color: kd.dark, dx: -12, dy: -10 }, rim: { color: kd.rim, dx: 6, dy: 6, a: 0.8 }, dots: { gap: 10, r: 2.2, alpha: 0.25, color: P.ink } });
    /* chest panel: 3 LEDs + mini bar meter */
    K.shape(ctx, K.rrPts(-36, -TH + 26, 72, 44, 10, 2), { fill: P.screen, w: 4, boil: 0.5, seed: seed + 11 });
    const ch = clamp(st.chest == null ? 0.5 : st.chest, 0, 1);
    [P.pink, P.yellow, P.green].forEach((c, i) => { const lit = i / 2 <= ch + 0.01; ctx.save(); ctx.fillStyle = lit ? c : K.rgba(c, 0.18); if (lit) { ctx.shadowColor = c; ctx.shadowBlur = 10; } ctx.beginPath(); ctx.arc(-20 + i * 20, -TH + 40, 6, 0, K.TAU); ctx.fill(); ctx.restore(); });
    ctx.save(); ctx.fillStyle = P.cyan; ctx.shadowColor = P.cyan; ctx.shadowBlur = 8; ctx.fillRect(-26, -TH + 54, 52 * (0.25 + 0.75 * ch), 6); ctx.restore();
    /* neck (accordion) */
    K.shape(ctx, K.rrPts(-20, -TH - 18, 40, 22, 6, 2), { fill: P.metal, w: 4.5, boil: 0.5, seed: seed + 12 });
    K.line(ctx, [[-18, -TH - 8], [18, -TH - 8]], { w: 3, boil: 0.3, seed: seed + 13 });
    if (kd.bow) { /* co-host bow tie, just under the neck */
      [-1, 1].forEach((sd, i) => K.shape(ctx, [[0, -TH + 4], [sd * 30, -TH - 10], [sd * 34, -TH + 4], [sd * 30, -TH + 18]], { fill: kd.bow, w: 4.5, boil: 0.5, seed: seed + 14 + i, rim: { color: "#ffd1ea", dx: 0, dy: 3, a: 0.6 } }));
      K.dot(ctx, 0, -TH + 4, 8, P.pinkDeep, P.ink, 4, seed + 16);
    }
    /* ---- head ---- */
    const HW = 176, HH = 134, hcY = -TH - 16 - HH / 2;
    ctx.save(); ctx.translate(0, hcY + (st.headDip || 0)); ctx.rotate(((st.headTilt || 0) * Math.PI) / 180);
    /* antenna (behind the head) */
    const wob = Math.sin(K.now * 7.5) * 4 * (1 + Math.abs(sq) * 4) + (st.antLean || 0), bulb = clamp(st.bulb || 0, 0, 1);
    if (kd.ant === "spring") {
      const tip = [wob * 2.2, -HH / 2 - 62];
      K.coil(ctx, [0, -HH / 2 + 4], [tip[0] * 0.9, tip[1] + 10], 14, 5, P.metal, seed + 20);
      K.glow(ctx, tip[0], tip[1], 46, K.rgba(kd.accent, 0.95), 0.25 + 0.75 * bulb);
      K.dot(ctx, tip[0], tip[1], 12, bulb > 0.3 ? "#ffd2ec" : kd.accent, P.ink, 4.5, seed + 21);
    } else if (kd.ant === "dish") {
      K.line(ctx, [[0, -HH / 2], [wob, -HH / 2 - 34]], { w: 6, boil: 0.4, seed: seed + 22 });
      ctx.save(); ctx.translate(wob, -HH / 2 - 40); ctx.rotate(-0.5 + Math.sin(K.now * 2) * 0.3);
      K.shape(ctx, [[-26, -4], [26, -4], [14, 12], [-14, 12]], { fill: P.shell, w: 4.5, boil: 0.5, seed: seed + 23, rim: { color: kd.rim, a: 0.6 } });
      ctx.restore();
      K.glow(ctx, wob, -HH / 2 - 44, 30, K.rgba(P.cyan, 0.9), bulb);
    } else if (kd.ant === "beacon") {
      K.shape(ctx, K.rrPts(-18, -HH / 2 - 30, 36, 34, 12, 2), { fill: bulb > 0.3 ? "#ffe0a8" : P.orange, w: 4.5, boil: 0.5, seed: seed + 24 });
      K.glow(ctx, 0, -HH / 2 - 16, 70, K.rgba(P.orange, 0.9), 0.2 + 0.8 * bulb);
    }
    /* ear dials */
    [-1, 1].forEach((sd, i) => { K.shape(ctx, K.rrPts(sd * HW / 2 - (sd < 0 ? 18 : 0), -24, 18, 48, 8, 2), { fill: P.metalDark, w: 4.5, boil: 0.5, seed: seed + 26 + i }); });
    /* shell */
    const headPts = kd.head === "dome" ? K.ellipsePts(0, 0, HW / 2 + 4, HH / 2 + 10, 22) : K.rrPts(-HW / 2, -HH / 2, HW, HH, kd.head === "box" ? 20 : 38, 3);
    K.shape(ctx, headPts, { fill: kd.body, w: 6, boil: 0.9, seed: seed + 30, shade: { color: kd.dark, dx: -12, dy: -12 }, rim: { color: kd.rim, dx: 6, dy: 6, a: 0.85 }, gloss: 0.35 });
    if (st.kind === "risk") K.shape(ctx, K.rrPts(-HW / 2 + 4, -HH / 2 + 2, HW - 8, 22, 10, 2), { fill: P.riskDark, w: 4, boil: 0.5, seed: seed + 31 }); /* helmet stripe */
    /* screen */
    const SW = 132, SH = 92, sx = -SW / 2, sy = -SH / 2 + 6;
    const scrPts = kd.head === "dome" ? K.ellipsePts(0, sy + SH / 2, SW / 2, SH / 2, 20) : K.rrPts(sx, sy, SW, SH, 20, 3);
    K.shape(ctx, scrPts, { fill: P.screen, w: 5, boil: 0.5, seed: seed + 32 });
    ctx.save(); K.pathOf(ctx, scrPts, true); ctx.clip();
    const sg = ctx.createRadialGradient(0, sy + SH / 2, 4, 0, sy + SH / 2, SW * 0.7); sg.addColorStop(0, P.screenShade); sg.addColorStop(1, P.screen);
    ctx.fillStyle = sg; ctx.fillRect(sx, sy, SW, SH);
    ctx.save(); ctx.translate(sx, sy); face(ctx, SW, SH, st, seed, kd); ctx.restore();
    if (!st.noScan) { /* glass: scanlines + glare (off when the camera dives into the screen) */
      ctx.fillStyle = "rgba(0,0,0,0.3)"; for (let yy = sy; yy < sy + SH; yy += 4) ctx.fillRect(sx, yy, SW, 1.5);
      ctx.fillStyle = "rgba(255,255,255,0.08)"; K.pathOf(ctx, K.ellipsePts(sx + SW * 0.3, sy + SH * 0.2, SW * 0.3, SH * 0.12, 10, -0.2), true); ctx.fill();
    }
    /* screen quad in screen space (for "dive into the face" transitions) */
    const m = ctx.getTransform();
    K.faceRect = [[sx, sy], [sx + SW, sy], [sx + SW, sy + SH], [sx, sy + SH]].map((q) => { const p = m.transformPoint(new DOMPoint(q[0], q[1])); return [p.x, p.y]; });
    ctx.restore();
    if (kd.headset) { /* trader's headset: band over the head, mic boom */
      K.line(ctx, [[-HW / 2 - 6, -6], [-HW / 2 + 10, -HH / 2 - 14], [HW / 2 - 10, -HH / 2 - 14], [HW / 2 + 6, -6]], { stroke: P.ink, w: 12, boil: 0.5, seed: seed + 40 });
      K.shape(ctx, K.rrPts(-HW / 2 - 16, -24, 26, 52, 10, 2), { fill: P.rubber, w: 4.5, boil: 0.5, seed: seed + 41 });
      K.line(ctx, [[-HW / 2 - 4, 18], [-HW / 2 + 14, 52], [-34, 60]], { stroke: P.ink, w: 6, boil: 0.5, seed: seed + 42 });
      K.dot(ctx, -34, 60, 8, P.rubber, P.ink, 3.5, seed + 43);
    }
    /* "!" pixel pop */
    if (st.exclaim > 0) {
      const a = K.E.back(clamp(st.exclaim, 0, 1), 2.5);
      ctx.save(); ctx.translate(HW / 2 + 30, -HH / 2 - 20); ctx.rotate(0.2); ctx.scale(a, a);
      ctx.fillStyle = P.yellow; ctx.shadowColor = P.yellow; ctx.shadowBlur = 14;
      ctx.fillRect(-8, -54, 16, 36); ctx.fillRect(-8, -10, 16, 16); ctx.restore();
    }
    if (st.heartPop > 0) {
      const a = clamp(st.heartPop, 0, 1);
      K.pix(ctx, "heart", HW / 2 + 26, -HH / 2 - 30 - a * 40, 6, P.pink, { glow: 1, a: 1 - a * a });
    }
    if (st.think > 0) thinkBubble(ctx, HW, HH, clamp(st.think, 0, 1), st, seed);
    ctx.restore(); /* head */
    ctx.restore(); /* torso scale */
    /* ---- arms (unscaled space so mitts keep their shape) ---- */
    [["L", -1], ["R", 1]].forEach(([k, sd]) => {
      const c = st["arm" + k] || { x: sd * 108, y: hipY - 30, open: 0.2 };
      const S = [sd * 60 * sxk, hipY - 78 * syk];
      const r = K.ik2(S, [c.x, c.y - hop], 46, 44, sd > 0 ? -1 : 1);
      K.hose(ctx, [S, r.elbow, r.end], 14, kd.arm || kd.dark, seed + 50 + sd, 0);
      const ang = c.rot != null ? (c.rot * Math.PI) / 180 : Math.atan2(r.end[1] - r.elbow[1], r.end[0] - r.elbow[0]);
      const held = st.hold && st.hold[k];
      if (held) holdProp(ctx, held, r.end, ang, st, seed + 60 + sd);
      K.mitt(ctx, r.end[0], r.end[1], ang, c.open == null ? 0.2 : c.open, kd.body, seed + 70 + sd * 5, sd < 0 ? -1 : 1);
      const m = ctx.getTransform(), q = m.transformPoint(new DOMPoint(r.end[0] + 22 * Math.cos(ang), r.end[1] + 22 * Math.sin(ang)));
      K.hands[k] = [q.x, q.y]; /* screen point of the fingertips (laser pointer, carried props) */
    });
    ctx.restore();
  };
  K.hands = { L: [0, 0], R: [0, 0] };
  /* hover height of a "hover" bot (Ping) at time t; the pose helpers need it for the hip */
  K.hoverLift = (t, seed) => 50 + 7 * Math.sin(t * 2.6 + seed);
  /* convenience: the mascot */
  K.beepo = (ctx, x, y, s, st) => K.robot(ctx, x, y, s, Object.assign({ kind: "lead" }, st || {}));

  function holdProp(ctx, what, p, ang, st, seed) {
    ctx.save(); ctx.translate(p[0], p[1]);
    if (typeof what === "function") what(ctx, ang, st);
    else if (what === "ticket") K.ticket(ctx, 40 * Math.cos(ang), 40 * Math.sin(ang) - 10, 0.75, { sym: st.holdSym || "NVDA", dir: st.holdDir || "up", qty: st.holdQty || "100", stamp: st.holdStamp || 0, seed, rot: ang * 0.2 });
    else if (what === "lens") { /* analyst's magnifier */
      ctx.rotate(ang);
      K.shape(ctx, K.rrPts(10, -6, 50, 12, 6, 2), { fill: P.metalDark, w: 4, boil: 0.4, seed });
      K.shape(ctx, K.ellipsePts(88, 0, 30, 30, 16), { fill: K.rgba(P.cyan, 0.25), w: 7, boil: 0.5, seed: seed + 1, gloss: 0.6 });
    } else if (what === "shield") {
      K.shape(ctx, [[-40, -50], [40, -50], [40, 0], [0, 54], [-40, 0]], { fill: P.riskDark, w: 6, boil: 0.6, seed, rim: { color: "#fff1c7", a: 0.7 } });
      K.pix(ctx, "check", 0, -6, 7, P.green, { glow: 0.8 });
    } else if (what === "baton") {
      ctx.rotate(ang - 0.6);
      K.neon(ctx, [[0, 0], [86, 0]], { color: P.yellow, w: 7, seed });
    }
    ctx.restore();
  }

  /* Ping's round face: big glowing ring eyes with pupils and lids, soft brows, round mouth */
  function roundFace(ctx, w, h, st, seed, ph) {
    const look = st.look || [0, 0], blink = clamp(st.blink || 0, 0, 1), c = Math.max(4, w / 22), eyes = st.eyes || "dot";
    const ex = [w * 0.31, w * 0.69], ey = h * 0.4 + look[1] * c * 0.5, r = c * 2.45 * (eyes === "wide" ? 1.2 : 1);
    ctx.save(); ctx.shadowColor = ph; ctx.shadowBlur = c * 1.8; ctx.fillStyle = ph; ctx.strokeStyle = ph; ctx.lineCap = "round"; ctx.lineWidth = c * 0.8;
    ex.forEach((x0, i) => {
      const x = x0 + look[0] * c * 0.5;
      if (eyes === "heart") { K.pix(ctx, "heart", x, ey, c * 0.85, P.pink, { glow: 1 }); return; }
      if (eyes === "dollar") { K.pix(ctx, "dollar", x, ey, c * 0.8, P.yellow, { glow: 1 }); return; }
      if (eyes === "x") { K.pix(ctx, "cross", x, ey, c * 0.9, ph, { glow: 1 }); return; }
      if (eyes === "happy" || blink > 0.6) { /* closed: a smiling arc (happy) or a flat lid line (blink) */
        ctx.beginPath(); if (eyes === "happy") ctx.arc(x, ey + r * 0.35, r * 0.75, Math.PI * 1.15, Math.PI * 1.85); else { ctx.moveTo(x - r * 0.8, ey); ctx.lineTo(x + r * 0.8, ey); }
        ctx.stroke(); return;
      }
      const ry = r * (1 - 0.85 * blink);
      ctx.beginPath(); ctx.ellipse(x, ey, r, ry, 0, 0, K.TAU); ctx.fill();
      ctx.save(); ctx.shadowBlur = 0; ctx.fillStyle = P.screen;
      const pr = r * 0.52, px = x + look[0] * (r - pr) * 0.75, py = ey + look[1] * (ry - pr) * 0.6;
      ctx.beginPath(); ctx.ellipse(px, py, pr, Math.min(pr, ry * 0.8), 0, 0, K.TAU); ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(px + pr * 0.35, py - pr * 0.35, pr * 0.3, 0, K.TAU); ctx.fill();
      ctx.restore();
      void i;
    });
    { /* brows: always on (Ping is the expressive one) */
      const br = clamp(st.brow || 0, -1, 1.5);
      ex.forEach((x0, i) => {
        const sd = i ? 1 : -1, x = x0 + look[0] * c * 0.5, by = ey - r - c * 1.1 - br * c * 0.8, tl = -br * sd * c * 0.45;
        ctx.beginPath(); ctx.moveTo(x - c * 1.4, by - tl); ctx.lineTo(x + c * 1.4, by + tl); ctx.stroke();
      });
    }
    /* mouth */
    const m = st.mouth || "smile", mx = w / 2, my = h * 0.77;
    if (m === "speak" || m === "open" || m === "o" || m === "talk") {
      const v = m === "speak" || m === "talk" ? (st.vis || K.viseme(st.talk || 0, K.now, seed)) : m === "o" ? { open: 0.7, wide: 0.2, round: 1 } : { open: 1, wide: 0.6, round: 0 };
      const rx = c * (1.5 + 1.5 * v.wide - 0.45 * v.round), ryM = c * (0.35 + 1.6 * v.open);
      if (v.open < 0.12) { ctx.beginPath(); ctx.arc(mx, my - c * 1.2, c * 1.6, Math.PI * 0.3, Math.PI * 0.7); ctx.stroke(); }
      else {
        ctx.beginPath(); ctx.ellipse(mx, my, rx, ryM, 0, 0, K.TAU); ctx.fill();
        ctx.save(); ctx.shadowBlur = 0; ctx.fillStyle = P.screen;
        ctx.beginPath(); ctx.ellipse(mx, my, rx - c * 0.45, Math.max(1, ryM - c * 0.45), 0, 0, K.TAU); ctx.fill();
        ctx.fillStyle = P.pink; ctx.beginPath(); ctx.ellipse(mx, my + ryM * 0.45, rx * 0.5, ryM * 0.3, 0, 0, K.TAU); ctx.fill();
        ctx.restore();
      }
    } else if (m === "flat") { ctx.beginPath(); ctx.moveTo(mx - c * 1.4, my); ctx.lineTo(mx + c * 1.4, my); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(mx, my - c * 1.4, c * 1.9, Math.PI * 0.25, Math.PI * 0.75); ctx.stroke(); }
    ctx.restore();
  }
  /* hover base: a thruster skirt with a flickering jet and a glow pool on the floor */
  function hoverBase(ctx, hipY, sxk, kd, seed, lift) {
    const fl = 0.75 + 0.25 * Math.sin(K.now * 31 + seed) * Math.sin(K.now * 13);
    ctx.save(); ctx.globalAlpha = clamp(1.1 - lift / 160, 0.25, 0.9);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 80); g.addColorStop(0, K.rgba(P.cyan, 0.55)); g.addColorStop(1, K.rgba(P.cyan, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 80, 18, 0, 0, K.TAU); ctx.fill(); ctx.restore();
    K.neon(ctx, [[-12 * sxk, hipY + 12], [0, hipY + 12 + 30 * fl], [12 * sxk, hipY + 12]], { color: P.cyan, w: 8, seed: seed + 3, core: 1 });
    K.shape(ctx, [[-40 * sxk, hipY - 4], [40 * sxk, hipY - 4], [24 * sxk, hipY + 16], [-24 * sxk, hipY + 16]], { fill: P.rubber, w: 5, boil: 0.5, seed: seed + 4, rim: { color: kd.rim, dx: 0, dy: 4, a: 0.5 } });
  }
  /* thought bubble with a "?" (or st.thinkIcon), rising dots first */
  function thinkBubble(ctx, HW, HH, a, st, seed) {
    const bx = HW / 2 + 70, by = -HH / 2 - 70;
    [[HW / 2 + 6, -HH / 2 + 2, 7], [HW / 2 + 26, -HH / 2 - 22, 10]].forEach((d, i) => { if (a > 0.15 + i * 0.2) K.dot(ctx, d[0], d[1], d[2], P.shell, P.ink, 4, seed + 80 + i); });
    const u = K.E.back(K.inv(0.5, 1, a), 2);
    if (u <= 0) return;
    ctx.save(); ctx.translate(bx, by); ctx.scale(u, u);
    K.shape(ctx, K.blobPts(0, 0, 54, 44, 14, seed + 82, 0.1), { fill: P.shell, w: 5, boil: 0.8, seed: seed + 83, shade: { color: P.shellShade, dx: -6, dy: -6 } });
    K.pix(ctx, st.thinkIcon || "quest", 0, 0, 8, P.violet, { glow: 0 });
    ctx.restore();
  }
  /* viseme-ish mouth shape from a 0..1 loudness: syllables at about 8 per second pick
     a / e / o / u, blended over the first third of each syllable. Silence = closed. */
  const VIS = [{ open: 1, wide: 0.55, round: 0 }, { open: 0.5, wide: 1, round: 0 }, { open: 0.8, wide: 0.3, round: 1 }, { open: 0.45, wide: 0.1, round: 1 }];
  K.VISEMES = { m: { open: 0, wide: 0.5, round: 0 }, a: VIS[0], e: VIS[1], o: VIS[2], u: VIS[3] }; /* named shapes for st.vis */
  const visPick = (k, sd) => { const h = K.hash(k, 313 + (sd | 0)); return VIS[h < 0.4 ? 0 : h < 0.65 ? 1 : h < 0.85 ? 2 : 3]; };
  K.viseme = function (talk, t, seed) {
    const a = clamp(talk || 0, 0, 1);
    if (a < 0.05) return { open: 0, wide: 0.5, round: 0 };
    const x = t * 8 + (seed | 0) * 0.37, k = Math.floor(x), w = K.ss(0, 0.35, x - k), A = visPick(k - 1, seed), B = visPick(k, seed);
    const amp = Math.pow(a, 0.85);
    return { open: lerp(A.open, B.open, w) * amp, wide: lerp(A.wide, B.wide, w), round: lerp(A.round, B.round, w) };
  };

  /* seeded blink curve, about one blink per 2.1 s */
  K.blinkAt = function (t, seed) {
    let b = 0;
    const i0 = Math.max(0, Math.floor((t - 2.2) / 2.1) - 1); /* only the blinks near t (episodes run for minutes) */
    for (let i = i0; i < i0 + 4; i++) {
      const tb = 0.9 + i * 2.1 + K.hash(i, seed || 7) * 1.2, d = t - tb;
      if (d > 0 && d < 0.14) b = Math.max(b, Math.sin((d / 0.14) * Math.PI));
    }
    return b;
  };
})(AK);
