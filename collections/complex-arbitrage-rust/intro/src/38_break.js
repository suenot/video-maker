/* ============================================================
   INTRO 38 INSTRUMENTAL BREAK (33.0 - 44.45 s): one ship at sunset.
     jig  : the crab plays the accordion, notes float up on every beat
     sail : a sail-cloth chart rises: futures converge to spot (the basis)
     log  : dusk; the captain's logbook types a Rust cycle finder, then
            the spyglass comes up and an iris opens on chorus 2
   ============================================================ */
const JIG_SHIP = { x: 900, y: 1000, s: 1.45 };

function crabBreak(t) {
  if (t < T.sail[0] - 0.2) return crabJig(t);
  const b = pulseB(t), st = { seed: 500, blink: K.blinkAt(t, 29), mouth: "smile", look: [0.8, -1], squash: 0.08 * b - 0.03 };
  st.clawL = { x: -72, y: -42, open: 0.15 };
  st.clawR = { x: 70, y: -180, open: 0.1, rot: -60 }; /* points up at the chart / the book */
  if (t > T.log[0]) { st.look = [1, -0.8]; st.clawR = { x: 92, y: -70 - 18 * b, open: 0.3 + 0.4 * b }; st.mouth = "o"; }
  const up = K.ss(T.spyUp2 - 0.25, T.spyUp2 + 0.2, t);
  if (up > 0) { st.hold = "spyglass"; st.clawR = { x: K.lerp(92, 38, up), y: K.lerp(-70, -150, up), open: 0.05, rot: K.lerp(-30, -14, up) }; st.look = [1, -0.6]; st.lean = -4 * up; st.mouth = "smile"; }
  return st;
}

function musicNotes(t, bob) {
  /* one note born on each beat, drifting up from the accordion */
  const cx = JIG_SHIP.x - 95 * JIG_SHIP.s, cy = JIG_SHIP.y + bob - 160;
  for (let k = 0; k < 6; k++) {
    const i = Math.floor((t - T.jig[0]) / K.beatLen()) - k, born = T.jig[0] + bl(i), d = t - born;
    if (i < 0 || d > 2.6 || born > T.jig[1] - 0.3) continue;
    const x = cx + (K.hash(i, 3) - 0.3) * 160 + d * 60, y = cy - d * 150 - 30, a = Math.min(1, d * 4) * (1 - K.inv(1.8, 2.6, d));
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(Math.sin(d * 3 + i) * 0.25);
    K.shape(ctx, K.ellipsePts(0, 0, 13, 10, 10, -0.4), { fill: P.ink, w: 2.5, boil: 0.6, seed: 1000 + i, gap: 0 });
    K.line(ctx, [[11, -3], [11, -52]], { stroke: P.ink, w: 4.5, boil: 0.6, seed: 1010 + i, gap: 0 });
    if (i % 2) K.line(ctx, [[11, -52], [26, -40], [24, -26]], { stroke: P.ink, w: 4.5, boil: 0.6, seed: 1020 + i, gap: 0 });
    ctx.restore();
  }
}

const SIDE_BREAK = (t) => {
  const dusk = K.ss(T.log[0] - 0.5, T.log[0] + 1.5, t);
  return {
    horizon: 640, warm: 0.9, sunX: 1520, sunY: K.lerp(470, 600, dusk), drift: 900,
    zoom: K.tw(t, T.jig[0], T.log[1], 1.25, 1.45, K.E.inOut), fx: 700, fy: 760,
    shipX: JIG_SHIP.x, shipY: JIG_SHIP.y, shipS: JIG_SHIP.s, crabS: 1.25, crab: crabBreak, coins: 15,
    notes: (tt, bob) => musicNotes(tt, bob),
    over: () => {
      if (dusk <= 0) return;
      K.screen(ctx); ctx.save(); ctx.globalAlpha = 0.38 * dusk; ctx.fillStyle = "#1c2a5a"; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
      for (let i = 0; i < 26; i++) {
        const x = K.hash(i, 61) * 1920, y = K.hash(i, 62) * 420, tw = 0.6 + 0.4 * Math.sin(t * 2 + i);
        K.sparkle(ctx, x, y, 7 + 5 * K.hash(i, 63), dusk * tw, 1100 + i);
      }
    },
  };
};

/* the sail-cloth chart: futures (rust) converge to spot (green) at expiry */
const SPOT = [100, 101.4, 100.7, 102.5, 103.0, 102.2, 103.8, 104.4];
const FUTS = SPOT.map((v, i) => v + 3.4 * (1 - i / (SPOT.length - 1)));
function drawSailChart(t) {
  const inA = K.inv(T.sail[0] - 0.45, T.sail[0], t), outA = K.inv(T.log[0] - 0.4, T.log[0], t);
  if (inA <= 0 || outA >= 1) return;
  const x = K.lerp(1000, 1150, inA) - 1800 * K.E.in3(outA), y = K.lerp(900, 285, K.E.out3(inA));
  K.screen(ctx);
  K.sailChart(ctx, x, y, 1060, 480, [{ data: SPOT, color: P.USDT }, { data: FUTS, color: P.rust }],
    { a: inA, draw: K.inv(T.sail[0] + 0.2, T.sail[0] + 2.6, t), seed: 1200, yMin: 99, yMax: 106, xLabels: ["1", "2", "3", "4", "5", "6", "7", "8"] });
  /* the basis shrinks: a gold bracket between the line ends */
  const g = K.inv(T.sail[0] + 2.6, T.sail[0] + 3.0, t);
  if (g > 0) { K.tag(ctx, x - 420, y - 130, "+3.4", { a: g, hot: true, size: 36, seed: 1210 }); K.tag(ctx, x + 440, y - 160, "0.0", { a: K.inv(T.sail[0] + 2.9, T.sail[0] + 3.3, t), hot: true, size: 36, seed: 1211 }); }
}

const RUST_LINES = [
  "fn find_cycle(g: &Graph) -> Option<Cycle> {",
  "    let w = g.map(|rate| -rate.ln());",
  "    bellman_ford(&w).negative_cycle()",
  "}",
];
function drawLogbook(t) {
  const inA = K.inv(T.log[0] - 0.35, T.log[0] + 0.1, t), outA = K.inv(T.iris2[0] - 0.1, T.iris2[0] + 0.3, t);
  if (inA <= 0 || outA >= 1) return;
  const x = K.lerp(2400, 1220, K.E.out3(inA)) + 1300 * K.E.in3(outA);
  K.screen(ctx);
  K.logbook(ctx, x, 360, 1020, RUST_LINES, { a: 1, size: 34, seed: 1300, typed: K.inv(T.log[0] + 0.2, T.log[0] + 2.4, t) });
}
