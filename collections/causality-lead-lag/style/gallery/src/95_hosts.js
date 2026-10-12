/* KIT GALLERY pages 3-4: the two hosts.
   Page 3 (6-9 s): a duo scene on the evidence board. The fox talks (6.0-7.5 s) and
   points at the string while the hound listens and writes; then the hound asks
   (7.5-9 s) and points at the chart while the fox listens and nods. The loudness
   here is synthetic; episodes feed the narration-sync values.
   Page 4 (9-12 s): the gesture sheet, fox on top, hound below. */
const win = (t, a, b) => K.ss(a, a + 0.15, t) * (1 - K.ss(b - 0.15, b, t));
const loud = (t, k) => K.clamp(0.55 + 0.45 * Math.sin(t * 13.1 + k) * Math.sin(t * 5.3 + 2 * k), 0, 1);
const acc = (t) => Math.exp(-7 * ((t % 0.5) / 0.5));

function page3(t) {
  const u = t - 6;
  K.corkboard(ctx, 1180, 330, 1340, 520, { a: pop(u, 0), seed: 9 });
  const A = [760, 150], B = [1260, 170];
  K.node(ctx, A[0], A[1], 0.8, { label: "BTC", color: P.A, a: pop(u, 0.1), seed: 3, tilt: -3, hot: win(t, 6.3, 7.5) });
  K.node(ctx, B[0], B[1], 0.8, { label: "ETH", color: P.B, a: pop(u, 0.2), seed: 7, tilt: 3 });
  K.edge(ctx, A, B, { p: K.inv(6.2, 6.8, t), sag: 50, label: "lag 2", seed: 21, pins: true, lu: 0.5, labelSize: 32 });
  K.screenChart(ctx, 1600, 360, 420, 300, [{ data: [1, 1.2, 3, 2.6, 3.4, 3.1], color: P.amberDeep }, { data: [1, 1, 1.2, 2.9, 2.6, 3.3], color: P.nightLow }],
    { a: pop(u, 0.3), draw: K.inv(6.4, 7.4, t), title: "", xLabels: ["1", "2", "3", "4", "5", "6"], lagMark: { i0: 2, i1: 3 } });
  const tA = win(t, 6.0, 7.5) * loud(t, 0), tB = win(t, 7.5, 9.0) * loud(t, 1.7);
  const tagPt = K.edgePoint(A, B, 50, 0.5);
  K.duo(ctx, {
    x: 330, y: 1070, s: 1.2,
    talkA: tA, talkB: tB, accentA: win(t, 6.0, 7.5) * acc(t), accentB: win(t, 7.5, 9.0) * acc(t + 0.2),
    accentIdxA: Math.floor(t * 2), accentIdxB: Math.floor(t * 2) + 1,
    point: [tagPt[0] + 20, tagPt[1] + 80], pointAmt: win(t, 6.4, 7.4),
    hpoint: [1600, 360], hpointAmt: win(t, 7.9, 8.9),
    gestB: { name: "write", amt: win(t, 6.2, 7.4) },
  });
  /* who is talking: a small speaker cue for QA only */
  K.text(ctx, tA > tB ? "A talks, B listens" : "B talks, A listens", 1500, 1010, { size: 40, weight: 700, fill: P.greyLight });
}

const GEST = ["point", "nod", "surprise", "think", "present"];
function page4(t) {
  const u = t - 9;
  GEST.forEach((g, i) => {
    const x = 210 + i * 370, amt = K.inv(9.2 + i * 0.12, 9.6 + i * 0.12, t);
    [["fox", 500, 0.95], ["hound", 1010, 0.95]].forEach(([who, y, s], r) => {
      K.pool(ctx, x, y, 220, 40, P.amberGlow, 0.7);
      const st = K.hostPose(who, t, { toward: 1 });
      if (g === "point") { st._point = [260, -300]; K.gesturePose(who, st, "point", amt); }
      else K.gesturePose(who, st, g === "nod" ? "nod" : g, amt);
      if (g === "nod") st.nod = amt * Math.max(0, Math.sin(t * 9));
      (who === "fox" ? K.fox : K.hound)(ctx, x, y, s, st);
      K.text(ctx, g, x, y + 40, { size: 34, weight: 700, fill: P.greyLight });
    });
  });
}
