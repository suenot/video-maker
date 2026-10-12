/* ============================================================
   INTRO 50 BOARD: the cork board (15.67 - 23.38). The fox stands in the
   screen-space foreground on the left; the camera pans along the board.
   15.67 "Find the cause": BTC and ETH mugshots pinned, red string BTC → ETH
   17.58 / 18.31 "test it twice": two green check stamps on the link
   19.53 "Causality": lights out, the flashlight sweeps the dark corner
   20.5  the hidden mugshot "?" in the beam: "!"
   21.46 "and Lead-": lights back; strings Z → BTC, Z → ETH glow amber
   22.43 lightning: the BTC → ETH string snaps, the confounder is unmasked (Z)
   22.9  venetian blinds close (see 70_render.js)
   ============================================================ */
const BOARD = { x: 1700, y: 560, w: 3700, h: 1000 };
const PH = { BTC: [1300, 160], ETH: [2150, 200], Z: [3150, 130] };
const camBoard = K.mkTrack([
  [at(8), { x: 1760, y: 420, z: 0.98 }],
  [at(10), { x: 1800, y: 430, z: 0.95 }],
  [at(10, 2.5), { x: 2330, y: 450, z: 0.7 }],
  [at(11), { x: 2330, y: 450, z: 0.68 }],
  [at(11, 2), { x: 1850, y: 400, z: 0.92 }],
  [at(12), { x: 2250, y: 420, z: 0.82 }],
]);
const FOX_B = { x: 240, y: 1190, s: 1.3 };

function boardDark(t) { return ap(t, at(10), 0.4) * (1 - ap(t, at(11), 0.3)); }
function beamAng(t) { return K.lerp(-0.05, -0.36, K.E.inOut(ap(t, at(10, 0.5), at(10, 2.5) - at(10, 0.5)))) + 0.03 * Math.sin(t * 2.3); }

function drawBoard(t) {
  const cam = Object.assign({ rot: 0 }, camBoard(t));
  K.begin(ctx, t, cam);
  K.screen(ctx); ctx.fillStyle = P.bldgDark; ctx.fillRect(0, 0, 1920, 1080);
  K.applyCam(ctx, 1);
  ctx.fillStyle = P.bldg; ctx.fillRect(-600, -500, 4800, 2100);
  K.corkboard(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { seed: 81 });
  const Z = PH.Z, zIn = ap(t, at(10, 2.5), 0.35), unmask = ap(t, at(11, 2), 0.4);
  const cutBE = t >= at(11, 2);
  /* strings under the photos' pins */
  const e = (A, B, t0, t1, opt) => K.edge(ctx, A, B, Object.assign({ p: K.E.inOut(ap(t, t0, t1 - t0)), sag: 70, w: 6, seed: 600 }, opt));
  e(PH.BTC, PH.ETH, at(8, 1.5), at(8, 3), { label: cutBE ? "" : "lag 2", state: cutBE ? "cut" : "plain", seed: 601, labelSize: 40, lu: 0.45 });
  e(Z, PH.BTC, at(11), at(11, 1), { state: "hot", seed: 604, sag: 150 });
  e(Z, PH.ETH, at(11, 0.5), at(11, 1.5), { state: "hot", seed: 605, sag: 90 });
  K.node(ctx, PH.BTC[0], PH.BTC[1], 1.2, { label: "BTC", color: P.A, a: ap(t, at(8, 0.5)), seed: 610, tilt: -3, hot: ap(t, at(9), 0.3) * (1 - ap(t, at(11, 2), 0.3)) });
  K.node(ctx, PH.ETH[0], PH.ETH[1], 1.2, { label: "ETH", color: P.B, a: ap(t, at(8, 1)), seed: 620, tilt: 4 });
  K.node(ctx, Z[0], Z[1], 1.25, { label: unmask > 0.5 ? "Z" : "?", color: P.Z, a: zIn, seed: 640, tilt: 6, hidden: 1 - unmask, hot: unmask });
  /* "test it twice": two stamps next to the lag tag */
  const tagPt = K.edgePoint(PH.BTC, PH.ETH, 70, 0.45);
  [[at(9), -70, 150], [at(9, 1.5), 90, 175]].forEach(([t0, dx, dy], i) => {
    const u = ap(t, t0, 0.25); if (u <= 0) return;
    const sc = 1 + 0.6 * (1 - K.E.out3(u)), fade = 1 - ap(t, at(11, 2), 0.3);
    ctx.save(); ctx.translate(tagPt[0] + dx, tagPt[1] + dy); ctx.rotate(-0.2 + i * 0.3); ctx.scale(sc, sc); ctx.globalAlpha *= Math.min(1, u * 3) * 0.92 * fade;
    K.shape(ctx, K.ellipsePts(0, 0, 62, 62, 22), { fill: K.rgba(P.ink, 0.3), stroke: P.good, w: 9, boil: 1, seed: 300 + i, gap: 0.08 });
    K.line(ctx, [[-28, 0], [-6, 22], [32, -26]], { stroke: P.good, w: 14, boil: 0.8, seed: 310 + i, gap: 0, taper: false });
    ctx.restore();
  });
  /* the dark room and the flashlight beam (screen space) */
  K.screen(ctx);
  const dk = boardDark(t), fl = K.flash(t, at(11, 2));
  const sp = foxBoardPaw(t), ang = beamAng(t), apex = [sp[0] + Math.cos(ang) * 62 * FOX_B.s, sp[1] + Math.sin(ang) * 62 * FOX_B.s];
  if (dk > 0) {
    const len = 2200, half = Math.tan(0.28) * len;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1920, 1080);
    const on = ap(t, at(10) + 0.15, 0.15);
    if (on > 0) {
      const dx = Math.cos(ang), dy = Math.sin(ang);
      ctx.moveTo(apex[0], apex[1]); ctx.lineTo(apex[0] + dx * len - dy * half, apex[1] + dy * len + dx * half); ctx.lineTo(apex[0] + dx * len + dy * half, apex[1] + dy * len - dx * half); ctx.closePath();
    }
    ctx.fillStyle = K.rgba(P.ink, 0.86 * dk); ctx.fill("evenodd"); ctx.restore();
  }
  if (fl > 0) { ctx.fillStyle = K.rgba(P.moon, 0.6 * fl); ctx.fillRect(0, 0, 1920, 1080); }
  /* moonlight through blinds behind the camera */
  K.blindLight(ctx, 0, 0, 1920, 1080, { color: P.moonGlow, n: 8, a: 0.7 * (1 - dk), ang: -0.2, skew: 0.3 });
  /* the fox */
  K.fox(ctx, FOX_B.x, FOX_B.y, FOX_B.s, foxBoardPose(t));
}
function foxBoardPaw(t) {
  const p = foxBoardPose(t).pawR; return [FOX_B.x + p.x * FOX_B.s, FOX_B.y + p.y * FOX_B.s];
}
function foxBoardPose(t) {
  const panning = t > at(10) && t < at(10, 2.5);
  const torch = ap(t, at(10), 0.25) * (1 - ap(t, at(11), 0.3));
  const found = ap(t, at(10, 2.5), 0.25), snap = ap(t, at(11, 2), 0.2);
  const nod = Math.sin(Math.PI * ap(t, at(9), 0.3)) + Math.sin(Math.PI * ap(t, at(9, 1.5), 0.3));
  const st = {
    seed: 760, light: 0.5 * (1 - torch), squash: 0.07 * K.pulse(t, 1, 6) + 0.12 * nod + 0.15 * Math.sin(Math.PI * snap),
    blink: found > 0 && found < 1 ? 0 : K.blinkAt(t, 17), lid: 0.3,
    turn: 0.35, look: [0.9, -0.3 + 0.3 * nod],
    mouth: snap > 0 ? "grin" : found > 0 ? "o" : nod > 0.2 ? "smile" : "smirk",
    eyeUp: found * (1 - ap(t, at(11), 0.4)), exclaim: found * (1 - ap(t, at(11), 0.3)),
    legWalk: panning ? t * 9 : 0, tail: Math.sin(t * 3),
    pawL: { x: -86, y: -100 },
  };
  if (torch > 0) {
    const ang = beamAng(t);
    st.hold = "flashlight"; st.flashOn = ap(t, at(10) + 0.15, 0.15);
    st.pawR = { x: 150, y: -240, rot: ang * 180 / Math.PI };
  } else {
    st.hold = "magnifier";
    st.pawR = snap > 0 ? { x: 150, y: -330, rot: -40 } : { x: 140, y: -230, rot: -25 };
  }
  return st;
}
