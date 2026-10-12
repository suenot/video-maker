/* ============================================================
   KIT 00 CORE: math, seeded random, noise, splines, beat grid, boil clock
   Every frame is a pure function of time t (seconds). No Math.random,
   no Date.now, no performance.now anywhere in the kit.
   ============================================================ */
var MK = window.MK || (window.MK = {});
(function (K) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const inv = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
  const ss = (a, b, t) => { const u = inv(a, b, t); return u * u * (3 - 2 * u); };
  const f1 = (n) => Math.round(n * 10) / 10;
  const f2 = (n) => Math.round(n * 100) / 100;

  /* eases (u in 0..1) */
  const E = {
    inOut: (u) => u * u * (3 - 2 * u),
    out3: (u) => 1 - Math.pow(1 - u, 3),
    in3: (u) => u * u * u,
    back: (u, s) => { s = s == null ? 1.7 : s; const v = u - 1; return 1 + v * v * ((s + 1) * v + s); },
    elastic: (u) => (u <= 0 ? 0 : u >= 1 ? 1 : Math.pow(2, -9 * u) * Math.sin((u * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
  };
  /* tween value from a to b during [t0, t1] with an ease */
  const tw = (t, t0, t1, a, b, ease) => lerp(a, b, (ease || E.inOut)(inv(t0, t1, t)));

  /* seeded PRNG (mulberry32) */
  function mulberry(seed) {
    let s = seed | 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      let q = Math.imul(s ^ (s >>> 15), 1 | s);
      q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q;
      return ((q ^ (q >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* stateless hash -> [0,1) for (i, seed) */
  function hash(i, s) {
    let h = (Math.imul(i | 0, 374761393) + Math.imul(s | 0, 668265263)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const hs = (i, s) => hash(i, s) * 2 - 1; /* signed */
  function vnoise(x, s) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, s), hash(i + 1, s), u); }
  function fbm(x, s, oct) { let a = 0.5, v = 0, fr = 1, n = 0; for (let k = 0; k < (oct || 3); k++) { v += a * vnoise(x * fr, s + k * 17); n += a; a *= 0.5; fr *= 2.03; } return v / n; }

  /* monotone cubic Hermite spline through [[t, v], ...] (no overshoot) */
  function mkSpline(pts) {
    const n = pts.length, T = pts.map((p) => p[0]), V = pts.map((p) => p[1]);
    if (n === 1) return () => V[0];
    const d = [], m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d[i] = (V[i + 1] - V[i]) / (T[i + 1] - T[i]);
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const tau = 3 / Math.sqrt(s); m[i] = tau * a * d[i]; m[i + 1] = tau * b * d[i]; }
    }
    return function (x) {
      x = clamp(x, T[0], T[n - 1]);
      let i = 0; while (i < n - 2 && x >= T[i + 1]) i++;
      const h = T[i + 1] - T[i], u = (x - T[i]) / h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * V[i] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * V[i + 1] + (u3 - u2) * h * m[i + 1];
    };
  }
  /* keys: [[t, {a:.., b:..}], ...] -> fn(t) -> {a, b} (one spline per channel) */
  function mkTrack(keys) {
    const names = Object.keys(keys[0][1]), sp = {};
    names.forEach((k) => { sp[k] = mkSpline(keys.map((q) => [q[0], q[1][k]])); });
    return (t) => { const o = {}; names.forEach((k) => (o[k] = sp[k](t))); return o; };
  }

  /* ---------- beat grid (retime to the real song by changing BPM/OFFSET or BARS) ----------
     BARS: optional list of measured downbeat times (seconds). Songs cut from
     several takes drift a few ms per splice, so measured downbeats beat a
     single OFFSET. Past the list, bars extrapolate at BPM. */
  const G = { BPM: 120, OFFSET: 0, BEATS_PER_ACCENT: 4, BARS: null };
  const beatLen = () => 60 / G.BPM;
  const barLen = () => beatLen() * G.BEATS_PER_ACCENT;
  function barStart(b) {
    const B = G.BARS;
    if (!B || !B.length) return G.OFFSET + b * barLen();
    if (b < 0) return B[0] + b * barLen();
    if (b < B.length) return B[b];
    return B[B.length - 1] + (b - B.length + 1) * barLen();
  }
  /* time of bar b (0-based, an "accent" = 4 beats) plus beat k (fractional ok) */
  const at = (bar, beat) => barStart(Math.floor(bar)) + ((bar - Math.floor(bar)) * G.BEATS_PER_ACCENT + (beat || 0)) * beatLen();
  /* index of the bar containing t (-1 before the first downbeat) */
  function barAt(t) {
    if (t < barStart(0)) return -1;
    let b = 0; while (barStart(b + 1) <= t) b++;
    return b;
  }
  /* 1 on the beat, decaying to 0 before the next beat (k = sharpness) */
  function pulse(t, everyBeats, k) {
    const b = barAt(t); if (b < 0) return 0;
    const L = beatLen() * (everyBeats || 1), x = t - barStart(b);
    return Math.exp(-(k || 7) * ((x % L) / L));
  }
  const beatIndex = (t) => { const b = barAt(t); return b < 0 ? -1 : b * G.BEATS_PER_ACCENT + Math.floor((t - barStart(b)) / beatLen()); };

  /* ---------- line boil clock: drawings change 12 times per second ---------- */
  const BOIL_FPS = 12;
  const boilFrame = (t) => Math.floor(t * BOIL_FPS);

  Object.assign(K, { clamp, lerp, inv, ss, f1, f2, E, tw, mulberry, hash, hs, vnoise, fbm, mkSpline, mkTrack,
    G, beatLen, barLen, barStart, barAt, at, pulse, beatIndex, BOIL_FPS, boilFrame, TAU: Math.PI * 2 });
})(MK);
