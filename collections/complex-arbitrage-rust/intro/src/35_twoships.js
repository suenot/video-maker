/* ============================================================
   INTRO 35 "Futures, spot and copula sea": side set with two ships.
   Our ship (cog sail) is spot; the hourglass ship is the future.
   A gold rope between them carries the basis; then one swell lifts
   both ships together: dependence you can see.
   ============================================================ */
const FUT = { y: 845, s: 0.98 };
const futX = (t) => K.tw(t, T.twoShips - 0.4, T.twoShips + 0.9, 2350, 1360, K.E.out3);
const hourglass = (c, x, y) => {
  K.coin(c, x, y, 34, { color: P.ETH, seed: 870 });
  K.shape(c, [[x - 13, y - 18], [x + 13, y - 18], [x, y], [x + 13, y + 18], [x - 13, y + 18], [x, y]], { fill: P.paper, w: 3, boil: 0.6, seed: 871, gap: 0 });
};

function crabTwoShips(t) {
  const b = pulseB(t), st = { seed: 500, blink: K.blinkAt(t, 21), mouth: "smile", look: [1, -0.3], squash: 0.1 * b - 0.03 };
  st.clawL = { x: -72, y: -42, open: 0.15 };
  st.clawR = { x: 92, y: -70 - 18 * b, open: 0.3 + 0.4 * b };
  const p = K.ss(T.basis - 0.3, T.basis, t) * (1 - K.ss(T.swell - 0.2, T.swell + 0.1, t));
  if (p > 0) { st.clawR = { x: K.lerp(92, 118, p), y: K.lerp(-70, -120, p), open: 0.05, rot: -18 }; st.mouth = "o"; st.brow = 0.8 * p; }
  const sw = K.ss(T.swell - 0.1, T.swell + 0.3, t);
  if (sw > 0) {
    st.mouth = "grin"; st.look = [0.2, -1];
    st.clawL = { x: -100, y: K.lerp(-42, -150 - 20 * b, sw), open: 0.3 + 0.6 * b };
    st.clawR = { x: 100, y: K.lerp(-70, -150 - 20 * K.pulse(t + 0.24, 1, 6), sw), open: 0.3 + 0.6 * b };
  }
  return st;
}

const SIDE_TWO = (t) => {
  const sw = K.ss(T.swell - 0.15, T.swell + 0.6, t);
  const our = { x: 640, y: 930, s: 1.4 };
  return {
    horizon: 600, warm: 0.25, zoom: K.tw(t, T.irisOut[0], T.wipe[1], 1.0, 1.08, K.E.inOut), fx: 960, fy: 700, drift: 300,
    shipX: our.x, shipY: our.y, shipS: our.s, crabS: 1.15, crab: crabTwoShips, coins: 15, swell: sw,
    behind: (tt, bob, rock) => {
      K.ship(ctx, futX(tt), FUT.y + bob * 0.9, FUT.s, { rock, sail: 1, flagColor: P.ETH, emblem: hourglass, seed: 700 });
    },
    front: (tt, bob) => {
      /* basis rope between the masts (sags, bobs with both ships) */
      const ra = K.inv(T.basis - 0.1, T.basis + 0.4, tt); if (ra <= 0) return;
      const A = [our.x + 40 * our.s, our.y + bob - 250 * our.s], B = [futX(tt) + 40 * FUT.s, FUT.y + bob * 0.9 - 250 * FUT.s];
      const pts = [];
      for (let i = 0; i <= 12; i++) { const u = (i / 12) * K.E.out3(ra); pts.push([K.lerp(A[0], B[0], u), K.lerp(A[1], B[1], u) + Math.sin(u * Math.PI) * 60]); }
      K.line(ctx, pts, { stroke: P.ink, w: 12, boil: 1.2, seed: 880, gap: 0 });
      K.line(ctx, pts, { stroke: P.profit, w: 6, boil: 1.2, seed: 881, gap: 0.15 });
      const m = [K.lerp(A[0], B[0], 0.5), K.lerp(A[1], B[1], 0.5) + 60];
      K.tag(ctx, m[0], m[1] - 6, "+0.8 %", { a: K.inv(T.basis + 0.2, T.basis + 0.6, tt), hot: true, size: 44, seed: 882 });
      /* one swell, two ships: matching bob marks */
      const sw = K.ss(T.swell - 0.15, T.swell + 0.6, tt);
      if (sw > 0) [our.x, futX(tt)].forEach((x, i) => {
        const y = (i ? FUT.y : our.y) + bob * (i ? 0.9 : 1) + 60;
        K.line(ctx, [[x - 120, y], [x - 40, y - 14], [x + 40, y - 14], [x + 120, y]], { stroke: P.foam, w: 6, boil: 1.6, seed: 890 + i, gap: 0, alpha: sw });
      });
    },
  };
};
