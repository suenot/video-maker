/* ============================================================
   INTRO 47 BALANCE: "Mind your inventory, keep it all in check"
   (chorus 1: 22.2 s, chorus 2: 44.2 s). A big freight balance in the yard:
   crates (inventory) land in the left pan one by one and the beam tips;
   Mr. Tick, balancing on top of the pivot, flings crates across to the cash
   pan where they turn into coins, and the beam comes level on "check".
   The flap in the corner shows the inventory: +0 -> +3 -> +1.
   ============================================================ */
const BAL = { px: 960, py: 470, arm: 560, panDrop: 230, fx: 470, fy: 200 };

function balanceState(t, B) {
  const dropped = B.drops.filter((d) => t >= d + 0.35).length;
  const sold = B.sells.filter((d) => t >= d + 0.4).length;
  const inv = dropped - sold;
  /* tilt eases toward its target after every event (back ease = a little wobble) */
  let ang = 0;
  const events = B.drops.map((d) => [d + 0.35, 1]).concat(B.sells.map((d) => [d + 0.4, -1])).sort((a, b) => a[0] - b[0]);
  let level = 0;
  events.forEach(([te, dv]) => { const u = K.E.back(K.inv(te, te + 0.4, t), 2.2); ang += -0.075 * dv * u; level += dv; });
  /* "check": the last nudge to level */
  const fix = K.E.back(K.inv(B.level, B.level + 0.4, t), 2);
  ang = K.lerp(ang, 0, fix);
  return { inv, ang, sold, dropped };
}

function drawBalance(c, t, B) {
  K.begin(c, t, { x: 960, y: 520, z: K.tw(t, B.t0 - 0.4, B.end, 1.1, 1.16, K.E.inOut), rot: 0 });
  K.applyCam(c, 0.3);
  K.sky(c, { horizon: 790, sun: [1600, 220], sunR: 110 });
  K.cloud(c, 760, 120, 240, 71); K.cloud(c, 1300, 210, 220, 74);
  K.applyCam(c, 0.7);
  K.hills(c, -400, 2400, 820, { h: 160, color: P.hillMid, seed: 77, n: 7 });
  K.applyCam(c, 1);
  K.shape(c, [[-300, 950], [2300, 950], [2300, 1500], [-300, 1500]], { fill: P.creamShade, w: 3, seed: 3300, tone: { color: P.ink, gap: 10, r: 0.6, r2: 2.4, dir: Math.PI / 2, alpha: 0.22 } });
  const S = balanceState(t, B), { px, py, arm } = BAL;
  /* pivot tower */
  K.shape(c, [[px - 150, 950], [px - 26, py + 10], [px + 26, py + 10], [px + 150, 950]], { fill: P.teal, w: 3.5, seed: 3310, shade: { color: P.tealDark, dx: -40, dy: 0 }, tone: { color: P.ink, gap: 11, r: 0, r2: 2.4, dir: 0, alpha: 0.2 } });
  K.gear(c, px, py + 250, 70, 10, t * 0.8 + S.ang * 6, { seed: 3311 });
  /* beam ends after rotation */
  const ca = Math.cos(S.ang), sa = Math.sin(S.ang);
  const end = (sd) => [px + sd * arm * ca, py + sd * arm * sa];
  /* pans hang straight down from the beam ends */
  const pan = (sd, seed) => {
    const [ex, ey] = end(sd), y = ey + BAL.panDrop;
    K.line(c, [[ex, ey], [ex - 140, y]], { w: 3, seed }); K.line(c, [[ex, ey], [ex + 140, y]], { w: 3, seed: seed + 1 });
    K.shape(c, [[ex - 170, y], [ex + 170, y], [ex + 130, y + 40], [ex - 130, y + 40]], { fill: sd < 0 ? P.tomato : P.mustard, w: 3.5, seed: seed + 2, shade: { color: sd < 0 ? P.tomatoDark : P.mustardDark, dx: 0, dy: 14 } });
    return [ex, y];
  };
  const [lx, ly] = pan(-1, 3320), [rx, ry] = pan(1, 3330);
  /* the beam */
  c.save(); c.translate(px, py); c.rotate(S.ang);
  K.shape(c, K.rrectPts(-arm - 20, -16, arm * 2 + 40, 32, 12, 3), { fill: P.mustard, w: 3.5, seed: 3340, shade: { color: P.mustardDark, dx: 0, dy: -10 } });
  for (let i = -6; i <= 6; i++) K.line(c, [[i * 80, -16], [i * 80, -4]], { w: 2.5, seed: 3341 + i });
  c.restore();
  K.dot(c, px, py, 16, P.ink, P.ink, 2, 3355);
  /* crates in the left pan: a pile that grows with each drop, minus the ones sold */
  const slots = [[-70, 0], [70, 0], [0, -84], [0, -168]];
  for (let i = 0; i < B.drops.length; i++) {
    const d = B.drops[i], u = K.inv(d - 0.1, d + 0.35, t); if (u <= 0) continue;
    const soldIdx = B.drops.length - 1 - i; /* the top crate is flung first */
    const sellT = soldIdx < B.sells.length ? B.sells[soldIdx] : 1e9, su = K.inv(sellT, sellT + 0.4, t);
    const q = slots[i], hx = lx + q[0], hy = ly + q[1];
    if (su >= 1) continue;
    if (su > 0) {
      /* flung across, turning into a coin stack */
      const fx = K.lerp(hx, rx + (soldIdx ? 60 : -60), su), fy = K.lerp(hy, ry, su) - 360 * Math.sin(Math.PI * su);
      c.save(); c.translate(fx, fy); c.rotate(su * 6);
      K.crate(c, 0, 42, 130 * (1 - su * 0.5), 84 * (1 - su * 0.5), { seed: 3360 + i * 3 });
      c.restore(); continue;
    }
    const fall = K.E.out3(u), yy = K.lerp(hy - 500, hy, fall);
    K.crate(c, hx, yy, 130, 84, { seed: 3360 + i * 3, label: CHILD, labelSize: 34 });
  }
  /* coin stacks in the right pan (one per sold crate, plus the starting cash) */
  const stacks = 1 + S.sold;
  for (let k = 0; k < stacks; k++) {
    const sx = rx + (k - (stacks - 1) / 2) * 80, n = 5;
    for (let j = 0; j < n; j++) {
      const yy = ry - 12 - j * 14;
      K.shape(c, K.ellipsePts(sx, yy, 34, 10, 16), { fill: P.mustard, w: 2.2, smooth: true, seed: 3380 + k * 9 + j, shade: { color: P.mustardDark, dx: 0, dy: 4 } });
    }
  }
  /* inventory flap on a post over the pivot */
  const inv = S.inv, prevInv = Math.max(0, inv - 1);
  const flipT = Math.max(...B.drops.concat(B.sells).map((d) => (t >= d + 0.3 ? d + 0.3 : -1)));
  const label = "+" + inv;
  K.flap(c, BAL.fx, BAL.fy, label, { h: 110, prev: "+" + (inv > prevInv ? prevInv : inv + 1), flip: flipT > 0 ? K.inv(flipT, flipT + 0.3, t) : 1, seed: 3400, colors: [inv > 1 ? P.tomatoLight : P.tealPale, inv > 1 ? P.tomatoLight : P.tealPale] });
  const ok = K.inv(B.level, B.level + 0.3, t);
  if (ok > 0) for (let k = 0; k < 6; k++) { const ang = (k / 6) * K.TAU, d = 0.5 * K.E.out3(K.inv(B.level, B.level + 0.6, t)); K.star(c, BAL.fx + Math.cos(ang) * (130 + 220 * d), BAL.fy + Math.sin(ang) * (70 + 120 * d), 30 * (1 - K.inv(B.level + 0.4, B.level + 0.9, t)), { seed: 3410 + k }); }
  /* Mr. Tick balances on the pivot: leans against the tilt, flings on each sell */
  const pulse = K.pulse(t, 1, 6), st = { blink: K.blinkAt(t, 71), seed: 700, squash: 0.06 * pulse, mouth: "smile", look: [-0.8, 0.6] };
  st.lean = -S.ang * 180 / Math.PI * 1.4;
  st.handL = { x: -110, y: -150 + 20 * Math.sin(t * 5), open: 1 }; st.handR = { x: 110, y: -150 - 20 * Math.sin(t * 5), open: 1 };
  if (S.dropped > 0 && t < B.sells[0]) { st.mouth = "o"; st.brow = 1.2; st.eyeUp = 3; }
  B.sells.forEach((d) => { const u = K.inv(d - 0.15, d + 0.25, t); if (u > 0 && u < 1) { st.handR = { x: 120, y: -230 + 60 * u, hold: "point" }; st.look = [1, -0.4]; st.squash = -0.15 * Math.sin(Math.PI * u); } });
  if (ok > 0) { st.handR = { x: 100, y: -160 - 40 * K.E.back(ok, 2), hold: "thumb" }; st.mouth = "grin"; st.look = [0, -0.5]; st.lean = 0; }
  c.save(); c.translate(px, py - 16); c.rotate(S.ang); K.mouse(c, 0, 0, 1.0, st); c.restore();
}
