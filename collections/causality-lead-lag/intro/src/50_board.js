/* ============================================================
   INTRO 50 BOARD: the cork board (31.84 - 53.84). The fox stands in the
   screen-space foreground on the left; the camera pans along the board.
   31.84 "Correlation's a clue": the clue card, dots, fit line
   33.84 "but not proof": the ≠ stamp slams; head shake; "keep in mind": tap
   35.84 "Lead and lag": BTC and ETH photos pinned
   37.86 "step by step": red string BTC → ETH, tag "lag 2"
   39.85 "follow the trail": SOL pinned, ETH → SOL, BTC → SOL (dim)
   43.85 "find the cause": lights out, flashlight sweeps the dark corner
   45.85 the hidden photo Z in the beam: "!"
   47.84 "Causality and lead-lag": strings Z → BTC, Z → ETH glow amber
   49.84 the BTC → ETH string snaps (it was the confounder all along)
   51.84 lightning: lights on, Z unmasked
   ============================================================ */
const BOARD = { x: 1700, y: 560, w: 3700, h: 1000 };
const PH = { BTC: [1300, 160], ETH: [2150, 200], SOL: [2650, 600], Z: [3200, 130] };
const camBoard = K.mkTrack([
  [at(15), { x: 820, y: 560, z: 1.0 }],
  [at(17), { x: 840, y: 560, z: 1.0 }],
  [at(17, 2), { x: 1760, y: 520, z: 0.95 }],
  [at(19), { x: 1800, y: 520, z: 0.95 }],
  [at(20), { x: 2200, y: 540, z: 0.8 }],
  [at(21), { x: 2250, y: 540, z: 0.78 }],
  [at(22), { x: 2380, y: 520, z: 0.68 }],
  [at(23), { x: 2380, y: 520, z: 0.66 }],
  [at(23, 3), { x: 2250, y: 470, z: 0.8 }],
  [at(24, 1), { x: 1800, y: 420, z: 1.0 }],
  [at(25), { x: 2500, y: 420, z: 0.85 }],
  [at(26), { x: 2550, y: 420, z: 0.9 }],
]);
const SCATTER = [[1, 2.1], [2, 2.6], [2.5, 3.9], [3, 3.2], [3.5, 4.4], [4, 4.1], [4.6, 5.2], [5, 4.6], [5.5, 6.1], [6, 5.8], [6.4, 6.9], [7, 6.5]];
const FOX_B = { x: 240, y: 1190, s: 1.3 };

function boardDark(t) { return ap(t, at(21), 0.5) * (1 - ap(t, at(23), 0.3)); }
function beamAng(t) { return K.lerp(-0.05, -0.36, K.E.inOut(ap(t, at(21, 1), at(22) - at(21, 1)))) + 0.03 * Math.sin(t * 2.3); }

function drawBoard(t) {
  const cam = Object.assign({ rot: 0 }, camBoard(t));
  K.begin(ctx, t, cam);
  K.screen(ctx); ctx.fillStyle = P.bldgDark; ctx.fillRect(0, 0, 1920, 1080);
  K.applyCam(ctx, 1);
  ctx.fillStyle = P.bldg; ctx.fillRect(-600, -500, 4800, 2100);
  K.corkboard(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, { seed: 81 });
  /* the clue card */
  K.scatter(ctx, 980, 560, 640, 560, SCATTER, { a: ap(t, at(15), 0.5), seed: 91, color: P.B, title: "", fit: ap(t, at(15, 1), at(15, 3) - at(15, 1)), stamp: ap(t, at(16), 0.35) });
  K.pin(ctx, 980, 300, P.string, 1.2 * K.E.back(ap(t, at(15), 0.4), 2));
  /* photos (graph nodes) */
  const Z = PH.Z, zIn = ap(t, at(22), 0.35), unmask = ap(t, at(25), 0.4);
  const cutBE = t >= at(24);
  /* strings under the photos' pins */
  const e = (A, B, t0, t1, opt) => K.edge(ctx, A, B, Object.assign({ p: K.E.inOut(ap(t, t0, t1 - t0)), sag: 70, w: 6, seed: 600 }, opt));
  e(PH.BTC, PH.ETH, at(18), at(18, 2), { label: cutBE ? "" : "lag 2", state: cutBE ? "cut" : "plain", seed: 601, labelSize: 40, lu: 0.45 });
  e(PH.ETH, PH.SOL, at(19, 2), at(20), { label: "lag 1", seed: 602, labelSize: 38, lu: 0.55 });
  e(PH.BTC, PH.SOL, at(20, 2), at(21), { state: "dim", seed: 603, sag: 120 });
  e(Z, PH.BTC, at(23), at(23, 2), { state: "hot", seed: 604, sag: 150 });
  e(Z, PH.ETH, at(23, 2), at(24), { state: "hot", seed: 605, sag: 90 });
  K.node(ctx, PH.BTC[0], PH.BTC[1], 1.2, { label: "BTC", color: P.A, a: ap(t, at(17, 0.5)), seed: 610, tilt: -3, hot: ap(t, at(18, 2), 0.3) * (1 - ap(t, at(24), 0.3)) });
  K.node(ctx, PH.ETH[0], PH.ETH[1], 1.2, { label: "ETH", color: P.B, a: ap(t, at(17, 2)), seed: 620, tilt: 4 });
  K.node(ctx, PH.SOL[0], PH.SOL[1], 1.1, { label: "SOL", color: P.C, a: ap(t, at(19)), seed: 630, tilt: -5 });
  K.node(ctx, Z[0], Z[1], 1.25, { label: unmask > 0.5 ? "Z" : "?", color: P.Z, a: zIn, seed: 640, tilt: 6, hidden: 1 - unmask, hot: unmask * (1 - ap(t, at(25, 2), 0.3)) });
  /* the dark room and the flashlight beam (screen space) */
  K.screen(ctx);
  const dk = boardDark(t), fl = K.flash(t, at(25));
  const sp = foxBoardPaw(t), ang = beamAng(t), apex = [sp[0] + Math.cos(ang) * 62 * FOX_B.s, sp[1] + Math.sin(ang) * 62 * FOX_B.s];
  if (dk > 0) {
    const len = 2200, half = Math.tan(0.28) * len;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1920, 1080);
    const on = ap(t, at(21) + 0.2, 0.15);
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
  const shake = ap(t, at(16), 0.2) * (1 - ap(t, at(16, 2), 0.2));
  const tap = ap(t, at(16, 2.5), 0.25) * (1 - ap(t, at(17), 0.25));
  const panning = (t > at(17) && t < at(17, 2)) || (t > at(19) && t < at(20)) || (t > at(21) && t < at(22));
  const torch = ap(t, at(21), 0.3) * (1 - ap(t, at(23), 0.3));
  const found = ap(t, at(22), 0.25), snap = ap(t, at(24), 0.2), unm = ap(t, at(25), 0.3);
  const st = {
    seed: 760, light: 0.5 * (1 - torch), squash: 0.07 * K.pulse(t, 1, 6) + 0.15 * Math.sin(Math.PI * ap(t, at(24), 0.3)),
    blink: found > 0 && found < 1 ? 0 : K.blinkAt(t, 17), lid: 0.3,
    turn: 0.35 + shake * 0.6 * Math.sin((t - at(16)) * 18), look: [0.9, -0.3],
    mouth: unm > 0 ? "grin" : snap > 0 ? "grin" : found > 0 ? "o" : shake > 0 ? "flat" : "smirk",
    eyeUp: found * (1 - ap(t, at(23), 0.4)), exclaim: found * (1 - ap(t, at(23), 0.3)),
    browTilt: tap > 0 ? 0.8 : 0, legWalk: panning ? t * 9 : 0, tail: Math.sin(t * 3),
    pawL: tap > 0 ? { x: -30, y: -330 } : shake > 0 ? { x: -70, y: -250 + 20 * Math.sin((t - at(16)) * 18) } : { x: -86, y: -100 },
  };
  if (torch > 0) {
    const ang = beamAng(t);
    st.hold = "flashlight"; st.flashOn = ap(t, at(21) + 0.2, 0.15);
    st.pawR = { x: 150, y: -240, rot: ang * 180 / Math.PI };
  } else {
    st.hold = "magnifier";
    st.pawR = unm > 0 ? { x: 150, y: -330, rot: -40 } : { x: 140, y: -230, rot: -25 };
  }
  return st;
}
