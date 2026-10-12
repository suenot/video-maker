/* ============================================================
   INTRO 30 ACTORS: Beepo's poses, the team's poses, the ticket pipeline.
   Every pose is a pure function of t. Big actions have anticipation
   (crouch before a hop) and squash on landing.
   ============================================================ */
const pulseB = (t) => K.pulse(t, 1, 6);       /* every beat */
const pulseA = (t) => K.pulse(t, 4, 5);       /* every bar */
const hopArc = (t, t0, t1, h) => { const u = K.inv(t0, t1, t); return u > 0 && u < 1 ? 4 * h * u * (1 - u) : 0; };
/* landing squash: a quick squash then rebound after time tl */
const land = (t, tl, k) => { const d = t - tl; return d < 0 || d > 0.5 ? 0 : (k || 0.4) * Math.exp(-d * 9) * Math.cos(d * 22); };

/* ---------- Beepo ---------- */
function beepoPos(t) {
  const u = K.E.inOut(K.inv(T.hopOver[0], T.hopOver[1], t));
  return [K.lerp(BEEPO_A[0], BEEPO_B[0], u), K.lerp(BEEPO_A[1], BEEPO_B[1], u)];
}
function beepoPose(t) {
  const b = pulseB(t);
  const st = { kind: "lead", seed: 700, blink: K.blinkAt(t, 3), mouth: "smile", look: [0, 0], squash: 0.08 * b - 0.03, bulb: 0.25 + 0.75 * b, chest: 0.3 + 0.7 * pulseA(t) };
  st.armL = { x: -104, y: -150 + 6 * Math.sin(t * 3), open: 0.2 };
  st.armR = { x: 104, y: -150 - 6 * Math.sin(t * 3 + 1), open: 0.2 };
  /* boot: static, then eyes pop on, look around */
  if (t < T.eyesOn) {
    st.screen = (c, w, h) => {
      const f = K.bf, cell = 6;
      for (let y = 0; y < h; y += cell) for (let x = 0; x < w; x += cell) { const v = K.hash(x * 31 + y, f * 13 + 5); c.fillStyle = `rgba(93,255,216,${(v * v * 0.85).toFixed(2)})`; c.fillRect(x, y, cell - 1, cell - 1); }
    };
    st.bulb = 0.1; st.squash = -0.02;
  } else if (t < T.hop) {
    const k = t - T.eyesOn;
    st.eyes = k < 0.18 ? "wide" : "dot";
    st.look = [K.tw(t, T.eyesOn + 0.25, T.eyesOn + 0.45, 0, -0.9) + K.tw(t, T.eyesOn + 0.6, T.eyesOn + 0.8, 0, 1.6), -0.1];
    st.blink = k < 0.2 ? 0 : st.blink;
  }
  /* anticipation crouch, then the hop on the "Beep boop" downbeat */
  const crouch = K.ss(T.crouch, T.hop, t) * (1 - K.ss(T.hop, T.hop + 0.08, t));
  st.squash += 0.32 * crouch;
  if (crouch > 0) { st.armL.y += 30 * crouch; st.armR.y += 30 * crouch; st.eyes = "happy"; }
  st.hop = hopArc(t, T.hop, T.hop + 0.5, 110);
  st.squash += land(t, T.hop + 0.5, 0.42);
  if (st.hop > 0) { st.squash -= 0.18; st.armL = { x: -130, y: -330, open: 0.8 }; st.armR = { x: 130, y: -330, open: 0.8 }; st.eyes = "happy"; st.mouth = "open"; }
  /* singing "beep boop": waveform mouth, bulb flashes on each beat */
  if (t >= T.hop && t < T.trade) {
    st.mouth = "talk"; st.talk = 0.35 + 0.65 * b; st.bulb = b;
    if (st.hop <= 0 && t > T.hop + 0.6) { /* point at the cables when the signals run */
      const pt = K.ss(T.signals - 0.3, T.signals, t);
      st.armR = { x: K.lerp(104, 160, pt), y: K.lerp(-150, -250, pt), open: 0.15 }; st.look = [pt, -0.2 * pt];
      st.armL = { x: -104, y: -150 - 40 * b, open: 0.4 * b };
      if (t > T.signals) st.eyes = "wide";
      if (t > T.signals + 0.5) st.eyes = "dot";
    }
    if (t > T.follow[0]) st.look = [1, -0.1];
  }
  /* hop over to the team, then conduct with a neon baton */
  const hv = hopArc(t, T.hopOver[0], T.hopOver[1], 120);
  if (hv > 0) { st.hop = hv; st.squash = -0.15; st.armL = { x: -140, y: -300, open: 0.7 }; st.armR = { x: 140, y: -300, open: 0.7 }; st.eyes = "happy"; }
  st.squash += land(t, T.hopOver[1], 0.38);
  if (t >= T.hopOver[1]) {
    const c = Math.sin((t - T.trade) / BEAT * Math.PI); /* baton swings once per beat */
    st.hold = { R: "baton" }; st.armR = { x: 100 + 30 * c, y: -230 - 40 * Math.abs(c), open: 0.05 };
    st.armL = { x: -110, y: -170 - 30 * b, open: 0.3 };
    st.look = [0.9, -0.2]; st.mouth = "talk"; st.talk = 0.3 + 0.5 * b; st.lean = 3 * c;
    st.eyes = t > T.dayEnd[1] - 1.2 ? "dollar" : "dot";
  }
  /* calm pose while the camera dives into the face (no squash: the target must not move) */
  if (t >= T.dive[0] - 0.1) { st.squash = 0; st.lean = 0; st.hop = 0; st.blink = 0; st.eyes = "wide"; st.mouth = "o"; st.hold = null; st.armR = { x: 104, y: -160, open: 0.3 }; st.armL = { x: -104, y: -160, open: 0.3 }; }
  if (t >= T.dive[0] - 0.35) { st.screen = faceLoop(t); st.noScan = true; }
  return st;
}

/* ---------- team ---------- */
function teamPose(i, t) {
  const m = TEAM[i], b = K.pulse(t - i * 0.06, 1, 6);
  const st = { kind: m.kind, seed: m.seed, blink: K.blinkAt(t, 11 + i * 7), mouth: "smile", look: [-0.3, 0], squash: 0.07 * b - 0.03, bulb: 0.2 + 0.8 * b, chest: 0.4 + 0.6 * b };
  st.armL = { x: -104, y: -140, open: 0.2 };
  st.armR = { x: 104, y: -140 - 10 * b, open: 0.2 };
  if (m.kind === "analyst") { st.hold = { L: "lens" }; st.armL = { x: -120, y: -230 + 10 * Math.sin(t * 2), open: 0.1, rot: 200 }; st.look = [-0.8, -0.4]; }
  if (m.kind === "risk") st.hold = { L: "shield" };
  /* signals arrive: everyone wakes */
  const wake = K.ss(T.signals + 0.6 + i * 0.25, T.signals + 0.9 + i * 0.25, t);
  if (t < T.signals + 0.6 + i * 0.25) { st.blink = 1; st.mouth = "flat"; st.bulb = 0; st.chest = 0; st.squash = 0.06; }
  else if (wake < 1) { st.eyes = "wide"; st.squash = -0.2 * (1 - wake); }
  /* ticket handling: reach for incoming tickets, stamp, throw */
  TICKETS.forEach((tk) => {
    if (i === 1) { /* risk stamps on beat 2 of each ticket */
      const ts = tk.t + 2 * BEAT, r = K.ss(ts - 0.25, ts, t) * (1 - K.ss(ts + 0.05, ts + 0.3, t));
      if (r > 0) { st.armR = { x: K.lerp(104, 120, r), y: K.lerp(-140, -260, r * (t < ts ? 1 : 0.2)), open: 0.1 }; st.squash += 0.12 * K.inv(ts, ts + 0.05, t) * (1 - K.inv(ts + 0.05, ts + 0.3, t)); st.eyes = "happy"; }
    }
    if (i === 2) { /* trader throws into the tube on beat 4 */
      const tt = tk.t + 4 * BEAT, r = K.ss(tt - 0.35, tt - 0.05, t) * (1 - K.ss(tt + 0.1, tt + 0.4, t));
      if (r > 0) { st.armR = { x: K.lerp(80, 170, r), y: K.lerp(-120, -290, r), open: t > tt - 0.05 ? 0.9 : 0.1 }; st.lean = 8 * r; st.look = [1, -0.6]; }
    }
  });
  if (t > T.dayEnd[1] - 1.2) st.eyes = i === 2 ? "dollar" : "happy";
  return st;
}

/* ---------- ticket pipeline: analyst -> risk (stamp) -> trader -> tube ---------- */
function ticketState(tk, t) {
  const d = (t - tk.t) / BEAT; /* in beats since spawn */
  if (d < 0 || d > 5) return null;
  const A = HAND(0), B = HAND(1), C = HAND(2), Tb = [TUBE.x, 760];
  const arc = (p, q, u, h) => [K.lerp(p[0], q[0], u), K.lerp(p[1], q[1], u) - 4 * h * u * (1 - u)];
  let pos, rot = 0, a = 1;
  if (d < 1) { pos = A; a = K.inv(0, 0.35, d); rot = 0.1 * Math.sin(d * 6); }
  else if (d < 1.6) { const u = K.E.inOut(K.inv(1, 1.6, d)); pos = arc(A, B, u, 120); rot = u * K.TAU * 0.5; }
  else if (d < 3) pos = B;
  else if (d < 3.6) { const u = K.E.inOut(K.inv(3, 3.6, d)); pos = arc(B, C, u, 120); rot = -u * K.TAU * 0.5; }
  else if (d < 4) pos = C;
  else { const u = K.E.in3(K.inv(4, 4.6, d)); pos = arc(C, Tb, u, 160); a = 1 - K.inv(4.45, 4.6, d); rot = u * 3; }
  return { x: pos[0], y: pos[1], rot, a, stamp: K.inv(2, 2.25, d) };
}
/* PnL shown on the scoreboard: the last ticket to reach the tube */
function pnlAt(t) {
  let v = "+0.0", bump = 0;
  TICKETS.forEach((tk) => { const ti = tk.t + 4.6 * BEAT; if (t >= ti) { v = tk.pnl; bump = K.inv(ti, ti + 0.35, t); } });
  return { v: v + "%", bump };
}
