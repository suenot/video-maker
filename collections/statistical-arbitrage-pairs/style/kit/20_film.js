/* ============================================================
   VAUDEVILLE KIT 20 FILM: the projector. Drawn in screen space on top
   of the scene, all stepped at the 12 fps boil clock so it reads as
   old nitrate film, and all seeded (identical on every seek).
     K.film(ctx, t, opt)    flicker + scratches + dust + hairs + vignette
     K.iris(ctx, cx, cy, r) the classic iris: black frame, round hole
     K.irisT(t, t0, t1, closing)  radius curve for an iris move
   The fine grain is a CSS SVG-noise layer (#grain) stepped in render().
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  const P = K.P, { hash, hs } = K;

  K.film = function (ctx, t, opt) {
    const o = Object.assign({ flicker: 0.05, scratches: 1, dust: 1, vignette: 0.62 }, opt || {});
    const f = K.boilFrame(t);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    /* exposure flicker: a thin veil of black or white per film frame */
    const fl = hs(f, 71) * o.flicker;
    ctx.fillStyle = fl > 0 ? "rgba(255,250,236," + (fl * 0.6).toFixed(3) + ")" : "rgba(10,9,8," + (-fl).toFixed(3) + ")";
    ctx.fillRect(0, 0, K.W, K.H);
    /* vignette: burnt corners of an old print */
    const g = ctx.createRadialGradient(K.W / 2, K.H / 2, K.H * 0.38, K.W / 2, K.H / 2, K.H * 1.02);
    g.addColorStop(0, "rgba(12,10,8,0)"); g.addColorStop(1, "rgba(12,10,8," + o.vignette + ")");
    ctx.fillStyle = g; ctx.fillRect(0, 0, K.W, K.H);
    /* vertical scratches: live for 3-6 film frames, wander a little */
    if (o.scratches) for (let k = 0; k < 3; k++) {
      const life = 3 + Math.floor(hash(k, 5) * 4), slot = Math.floor(f / life), on = hash(slot * 3 + k, 91) < 0.55 * o.scratches;
      if (!on) continue;
      const x = 80 + hash(slot * 7 + k, 93) * (K.W - 160) + hs(f, 97 + k) * 3, y0 = hash(slot, 99 + k) * 300 - 100, y1 = y0 + 500 + hash(slot, 101 + k) * 700;
      const light = hash(slot + k, 103) < 0.6;
      ctx.strokeStyle = light ? "rgba(245,240,226,0.55)" : "rgba(12,10,8,0.5)"; ctx.lineWidth = 1.2 + hash(slot, 107) * 1.6;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.bezierCurveTo(x + 4, y0 + 200, x - 3, y1 - 200, x + 2, y1); ctx.stroke();
    }
    /* dust specks and hairs: new every film frame */
    if (o.dust) for (let i = 0; i < 9; i++) {
      if (hash(i, f * 13 + 1) > 0.42 * o.dust) continue;
      const x = hash(i, f * 13 + 2) * K.W, y = hash(i, f * 13 + 3) * K.H, r = 1.5 + hash(i, f * 13 + 4) * 4.5;
      const dark = hash(i, f * 13 + 5) < 0.7;
      ctx.fillStyle = dark ? "rgba(12,10,8,0.75)" : "rgba(250,246,232,0.8)";
      if (hash(i, f * 13 + 6) < 0.18) { /* a hair */
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + 30, y - 20, x + 10, y + 40, x + 50, y + 30); ctx.stroke();
      } else { ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.6 + 0.4 * hash(i, f + 9)), hash(i, f) * 3, 0, K.TAU); ctx.fill(); }
    }
    ctx.restore();
  };

  /* iris: everything black except a circle of radius r around (cx, cy) */
  K.iris = function (ctx, cx, cy, r) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.beginPath(); ctx.rect(-10, -10, K.W + 20, K.H + 20); ctx.arc(cx, cy, Math.max(0, r), 0, K.TAU, true);
    ctx.fillStyle = P.ink; ctx.fill("evenodd");
    /* a soft inner edge, like a real iris blade slightly out of focus */
    if (r > 2) { ctx.strokeStyle = "rgba(20,19,18,0.45)"; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(cx, cy, r + 2, 0, K.TAU); ctx.stroke(); }
    ctx.restore();
  };
  /* radius for an iris: opening (closing=false) from 0 to full frame, or closing */
  K.irisT = function (t, t0, t1, closing, rMax) {
    const u = K.E.inOut(K.inv(t0, t1, t)), R = rMax || 1200;
    return closing ? R * (1 - u) : R * u;
  };
})(VK);
