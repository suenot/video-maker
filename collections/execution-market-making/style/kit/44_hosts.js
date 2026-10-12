/* ============================================================
   KIT 44 HOSTS: Mr. Tick (host A, the explainer) + Dash (host B, the
   curious co-host) acting together. Pure functions of time + inputs, so
   an episode can drive them from its narration data (loudness per frame,
   who is talking, stressed-syllable times) without the kit knowing about it.

   K.mousePose(t, o)   -> pose object for K.mouse
   K.pigeonPose(t, o)  -> pose object for K.pigeon
   K.duo(ctx, t, o)    draws both hosts in SCREEN space (call after K.screen(ctx))
                       and returns their anchors (see below).

   Per-host inputs (o for the pose functions, o.a / o.b for K.duo):
     talk      0..1 loudness of this host's own voice this frame (mouth + body)
     viseme    force a mouth shape ("a" | "e" | "o" | "m"); auto when omitted
     listen    0..1 the partner is talking: look at them, lean in, nod
     nodAt     [sec] partner's stressed syllables -> a nod on each (listening)
     accents   [sec] own stressed syllables -> a beat gesture on each (talking)
     gest      [{ at, kind, dur }] scripted gestures (global seconds), kinds:
               point | nod | surprise | think | shrug | wave | grin | worry
               mouse also: thumbs | watch | whistle;  pigeon also: flap | tape | ticket
     point     [sx, sy] screen point to aim the nearer hand at; pointAmt 0..1;
               pointUp rad minimum arm elevation (K.duo sets 0.6 for Dash so he
               points over Mr. Tick's head)
     carry     { draw(ctx, x, y, ang), amt } a prop carried in the outer hand
               (drawn in rig space at the hand; amt raises the hand to the chest)
     seed      blink / viseme seed
   Layout for K.duo (all optional):
     layout    "left" (default: hosts bottom-left, room on the right; Dash on the
               outer side so Mr. Tick points at the content unobstructed),
               "right" (mirror), "flank" (hosts at both edges, prop in the middle)
     x, y      Mr. Tick's feet (screen px); s his scale (default 1.15 = 345 px tall)
     gap       px between the two hosts (default 250 * s)
     bs        Dash's scale relative to s (default 1.05, so ~285 px tall at s 1.15)
     speaker   "a" | "b" | null: who talks now (sets listen on the other one;
               inferred from a.talk / b.talk when omitted)
     stage     "platform" (default) | "none"   appear 0..1 (pops the pair in)
     a, b      per-host inputs (above); false hides that host
   Returns { a: { x, y, s, head:[x,y], hand:[x,y] }, b: { ... } } in screen px.
   ============================================================ */
var SK = window.SK || (window.SK = {});
(function (K) {
  const { clamp, lerp, ss } = K;
  const mix = (a, b, u) => ({ ...b, x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), open: lerp(a.open || 0, b.open || 0, u), hold: u > 0.5 ? b.hold : a.hold, rot: u > 0.5 ? b.rot : a.rot, draw: u > 0.5 ? b.draw : a.draw });
  /* gesture envelope: rises 0.18 s, holds, falls 0.3 s */
  const env = (t, r) => { const d = r.dur || 1.6; return ss(r.at - 0.18, r.at, t) * (1 - ss(r.at + d - 0.3, r.at + d, t)); };
  K.gestEnv = env;
  /* the last time in `list` at or before t (index), lists are sorted seconds */
  const lastIdx = (list, t) => { let k = -1; if (list) for (let i = 0; i < list.length; i++) if (list[i] <= t + 0.08) k = i; else break; return k; };
  /* nod curve: one dip per accent (0..1) */
  const nodOf = (list, t) => { const k = lastIdx(list, t); if (k < 0) return 0; const d = t - list[k]; return d < 0.45 ? Math.sin((d / 0.45) * Math.PI) : 0; };
  /* aim a hand from the shoulder (local) towards a screen point; returns a local target */
  function aim(o, sh, reach, side) {
    const sx = o.x + sh[0] * o.s, sy = o.y + sh[1] * o.s;
    /* pointUp (rad) raises the arm when the partner stands between host and target */
    const e = Math.max(Math.atan2(sy - o.point[1], Math.abs(o.point[0] - sx)), o.pointUp || -9);
    const ang = side > 0 ? -e : e - Math.PI;
    return { x: sh[0] + Math.cos(ang) * reach, y: sh[1] + Math.sin(ang) * reach, side };
  }

  /* ---------------- Mr. Tick ---------------- */
  const MBEAT = [
    { R: { x: 92, y: -150, open: 1 } },                                   /* right hand up */
    { L: { x: -98, y: -110 }, R: { x: 98, y: -110 } },                    /* both out, palms up */
    { L: { x: -92, y: -150 } },                                           /* left hand up */
    { R: { x: 60, y: -170, hold: "point" } },                             /* finger up: "listen" */
  ];
  K.mousePose = function (t, o) {
    o = o || {};
    const tk = clamp(o.talk || 0, 0, 1), ls = clamp(o.listen || 0, 0, 1), tw = o.toward || 1, seed = o.seed || 2;
    const st = { blink: K.blinkAt(t, seed), talk: tk, viseme: o.viseme, mouth: "smile", look: [0.12 * Math.sin(t * 0.7), -0.05] };
    st.squash = 0.03 * Math.sin(t * 2.3) + 0.1 * tk * (0.5 + 0.5 * Math.sin(t * 17));  /* idle breath + talking bounce */
    st.tail = t * 2.2;
    let L = { x: -62 + 4 * Math.sin(t * 1.9), y: -66 + 5 * Math.sin(t * 2.6) }, R = { x: 62 + 4 * Math.sin(t * 2.1 + 1), y: -66 + 5 * Math.sin(t * 2.4 + 2) };
    /* talking: a beat gesture on each stressed syllable */
    const k = lastIdx(o.accents, t);
    if (k >= 0 && tk > 0.02) {
      const ta = o.accents[k], w = ss(ta - 0.1, ta + 0.14, t) * (1 - ss(ta + 0.7, ta + 1.2, t)), G = MBEAT[Math.floor(K.hash(k, 77) * MBEAT.length)];
      if (G.L) L = mix(L, G.L, w); if (G.R) R = mix(R, G.R, w);
      st.brow = 0.6 * w;
    }
    if (tk > 0.04) st.look = [0.3 * tw + 0.15 * Math.sin(t * 0.9), -0.1];
    /* listening: look at the partner, lean in, nod on their accents (or a slow nod) */
    if (ls > 0) {
      const nd = o.nodAt ? nodOf(o.nodAt, t) : 0.5 + 0.5 * Math.sin(t * 5.2);
      st.look = [lerp(st.look[0], 0.95 * tw, ls), lerp(st.look[1], -0.15, ls)];
      st.lean = 3 * tw * ls; st.tilt = 6 * tw * ls; st.nod = 7 * nd * ls; st.brow = 0.3 * ls;
      st.ear = 0.6 * ls;
    }
    /* point at a screen target with the nearer hand */
    if (o.point && o.pointAmt !== 0) {
      const amt = o.pointAmt == null ? 1 : o.pointAmt, sd = o.point[0] >= o.x ? 1 : -1;
      const tg = aim(o, [sd * 34, -144], 68, sd); tg.hold = "point";
      if (sd > 0) R = mix(R, tg, amt); else L = mix(L, tg, amt);
      st.look = [lerp(st.look[0], sd * 0.9, amt), lerp(st.look[1], clamp((o.point[1] - (o.y - 210 * o.s)) / 300, -1, 1), amt)];
    }
    /* carry a prop in the outer hand, raised to the chest */
    if (o.carry) {
      const amt = o.carry.amt == null ? 1 : o.carry.amt, sd = -tw;
      const c = { x: sd * 58, y: -118, open: 0, draw: o.carry.draw, rot: o.carry.rot };
      if (sd > 0) R = mix(R, c, amt); else L = mix(L, c, amt);
    }
    (o.gest || []).forEach((r) => {
      const e = env(t, r); if (e <= 0) return;
      const u = K.inv(r.at - 0.18, r.at + (r.dur || 1.6), t);
      if (r.kind === "surprise") {
        st.blink = 0; st.eyeUp = 6 * e; st.brow = 1.5 * e; st.exclaim = e; st.ear = e;
        if (tk < 0.1) st.mouth = "open";
        st.hop = 18 * Math.max(0, Math.sin(K.inv(r.at, r.at + 0.35, t) * Math.PI)); st.squash -= 0.18 * e;
        L = mix(L, { x: -84, y: -150, open: 1 }, e); R = mix(R, { x: 84, y: -150, open: 1 }, e);
      } else if (r.kind === "nod") { st.nod = (st.nod || 0) + 10 * Math.max(0, Math.sin((t - r.at) * 11)) * e; st.blink = Math.max(st.blink, 0.5 * e); }
      else if (r.kind === "think") {
        R = mix(R, { x: 26, y: -170, hold: "thumb", rot: -100 }, e); L = mix(L, { x: -20, y: -110 }, e);
        st.look = [lerp(st.look[0], -0.6, e), lerp(st.look[1], -0.9, e)]; st.brow = 1 * e; st.tilt = -8 * e; st.ponder = e; if (tk < 0.1) st.mouth = "o";
      } else if (r.kind === "shrug") { L = mix(L, { x: -100, y: -120, open: 1 }, e); R = mix(R, { x: 100, y: -120, open: 1 }, e); st.brow = 1.1 * e; st.squash += 0.08 * e; st.tilt = 6 * e; }
      else if (r.kind === "wave") { R = mix(R, { x: 86 + 14 * Math.sin((t - r.at) * 12), y: -186 }, e); st.mouth = "grin"; }
      else if (r.kind === "thumbs") { R = mix(R, { x: 90, y: -150, hold: "thumb", rot: -90 }, e); st.mouth = "grin"; }
      else if (r.kind === "grin") { st.mouth = "grin"; st.brow = 0.8 * e; }
      else if (r.kind === "worry") { st.brow = -1 * e; if (tk < 0.1) st.mouth = "o"; L = mix(L, { x: -40, y: -96 }, e); R = mix(R, { x: 40, y: -96 }, e); st.squash -= 0.05 * e; }
      else if (r.kind === "watch") { R = mix(R, { x: 60, y: -132, hold: "watch", lid: 1 - K.inv(0.1, 0.35, u) }, e); st.look = [0.5, 0.6]; }
      else if (r.kind === "whistle") { R = mix(R, { x: 22, y: -196, hold: "whistle" }, e); st.mouth = "whistle"; st.puff = 0.8 * e; }
      else if (r.kind === "point" && !o.point) { R = mix(R, { x: 100, y: -150, hold: "point" }, e); st.look = [0.9, -0.3]; }
    });
    st.handL = L; st.handR = R;
    return st;
  };

  /* ---------------- Dash ---------------- */
  K.pigeonPose = function (t, o) {
    o = o || {};
    const tk = clamp(o.talk || 0, 0, 1), ls = clamp(o.listen || 0, 0, 1), f = o.face || -1, seed = o.seed || 11;
    const st = { face: f, blink: K.blinkAt(t, seed), talk: tk, viseme: o.viseme, look: [0.25 * f, 0], seed: 900 };
    /* idle: breathing, and the pigeon head-bob (a quick thrust, slow return) */
    const bp = (t * 0.9) % 1, bob = bp < 0.18 ? Math.sin((bp / 0.18) * Math.PI * 0.5) : Math.cos(((bp - 0.18) / 0.82) * Math.PI * 0.5);
    st.peck = 7 * bob * (1 - 0.6 * tk);
    st.squash = 0.04 * Math.sin(t * 2.9 + 1) + 0.12 * tk * (0.5 + 0.5 * Math.sin(t * 19));
    st.head = 4 * Math.sin(t * 0.8);
    let L = { x: -62 + 4 * Math.sin(t * 2), y: -70 + 4 * Math.sin(t * 2.7), open: 0.3 }, R = { x: 62 + 4 * Math.sin(t * 2.2 + 1), y: -70 + 4 * Math.sin(t * 2.5), open: 0.3 };
    const k = lastIdx(o.accents, t);
    if (k >= 0 && tk > 0.02) {
      const ta = o.accents[k], w = ss(ta - 0.08, ta + 0.12, t) * (1 - ss(ta + 0.5, ta + 0.95, t)), h = K.hash(k, 91);
      const up = { x: f * 84, y: -160, open: 1 }, both = [{ x: -90, y: -130, open: 1 }, { x: 90, y: -130, open: 1 }];
      if (h < 0.5) { if (f > 0) R = mix(R, up, w); else L = mix(L, up, w); }
      else { L = mix(L, both[0], w); R = mix(R, both[1], w); }
      st.hop = 8 * w * (h > 0.75 ? 1 : 0); st.brow = 0.7 * w;
    }
    if (ls > 0) {
      const nd = o.nodAt ? nodOf(o.nodAt, t) : 0.5 + 0.5 * Math.sin(t * 5.6);
      st.look = [lerp(st.look[0], 0.95 * f, ls), lerp(st.look[1], -0.25, ls)];
      st.head = lerp(st.head, -10, ls); st.nod = 8 * nd * ls; st.lean = 3 * f * ls; st.peck *= 1 - 0.5 * ls;
    }
    if (o.point && o.pointAmt !== 0) {
      const amt = o.pointAmt == null ? 1 : o.pointAmt, sd = o.point[0] >= o.x ? 1 : -1;
      const tg = aim(o, [sd * 46, -142], 62, sd); tg.hold = "point";
      if (sd > 0) R = mix(R, tg, amt); else L = mix(L, tg, amt);
      st.look = [lerp(st.look[0], sd, amt), lerp(st.look[1], clamp((o.point[1] - (o.y - 204 * o.s)) / 300, -1, 1), amt)];
    }
    if (o.carry) {
      const amt = o.carry.amt == null ? 1 : o.carry.amt, sd = -f;
      const c = { x: sd * 52, y: -110, open: 0.1, draw: o.carry.draw, rot: o.carry.rot };
      if (sd > 0) R = mix(R, c, amt); else L = mix(L, c, amt);
    }
    (o.gest || []).forEach((r) => {
      const e = env(t, r); if (e <= 0) return;
      if (r.kind === "surprise") {
        st.blink = 0; st.brow = 1.5 * e; st.exclaim = e; st.peck = -6 * e; st.squash -= 0.2 * e;
        st.hop = 16 * Math.max(0, Math.sin(K.inv(r.at, r.at + 0.32, t) * Math.PI));
        L = mix(L, { x: -96, y: -150, open: 1 }, e); R = mix(R, { x: 96, y: -150, open: 1 }, e);
        if (tk < 0.1) st.talk = 0.5 * e, st.viseme = "o";
      } else if (r.kind === "nod") { st.nod = (st.nod || 0) + 10 * Math.max(0, Math.sin((t - r.at) * 11)) * e; st.peck = 6 * e; }
      else if (r.kind === "think") {
        const tip = { x: f * 34, y: -168, open: 0, rot: f > 0 ? -60 : -120 };
        if (f > 0) R = mix(R, tip, e); else L = mix(L, tip, e);
        st.look = [lerp(st.look[0], -0.4 * f, e), lerp(st.look[1], -0.9, e)]; st.head = 14 * e; st.ponder = e; st.brow = 0.9 * e;
      } else if (r.kind === "shrug") { L = mix(L, { x: -96, y: -122, open: 1 }, e); R = mix(R, { x: 96, y: -122, open: 1 }, e); st.brow = 1.1 * e; st.head = 10 * e; }
      else if (r.kind === "wave") { const w = { x: f * (90 + 14 * Math.sin((t - r.at) * 12)), y: -180, open: 1 }; if (f > 0) R = mix(R, w, e); else L = mix(L, w, e); }
      else if (r.kind === "flap") { const fl = 0.5 + 0.5 * Math.sin((t - r.at) * 24); L = mix(L, { x: -100, y: -110 - 60 * fl, open: 1 }, e); R = mix(R, { x: 100, y: -110 - 60 * fl, open: 1 }, e); st.hop = 22 * e; }
      else if (r.kind === "grin") { st.brow = 0.9 * e; st.head = 10 * e; st.viseme = tk > 0.04 ? st.viseme : "e"; }
      else if (r.kind === "worry") { st.brow = -1 * e; st.head = -14 * e; L = mix(L, { x: -40, y: -100, open: 0 }, e); R = mix(R, { x: 40, y: -100, open: 0 }, e); }
      else if (r.kind === "tape") { const u = K.inv(r.at, r.at + (r.dur || 1.6) * 0.7, t), w = { x: -f * 40, y: -120, open: 0.2, hold: "tape", unroll: u }; if (f > 0) L = mix(L, w, e); else R = mix(R, w, e); st.look = [-f * 0.3, 0.8]; }
      else if (r.kind === "ticket") { const w = { x: f * 92, y: -150, open: 0.1, hold: "ticket", label: r.label }; if (f > 0) R = mix(R, w, e); else L = mix(L, w, e); }
      else if (r.kind === "point" && !o.point) { const w = { x: f * 100, y: -150, hold: "point" }; if (f > 0) R = mix(R, w, e); else L = mix(L, w, e); st.look = [f, -0.3]; }
    });
    st.wingL = L; st.wingR = R;
    return st;
  };

  /* ---------------- the pair ---------------- */
  K.duo = function (ctx, t, o) {
    o = o || {};
    const lay = o.layout || "left", s = o.s || 1.15, bsk = s * (o.bs || 1.05), gap = o.gap == null ? 250 * s : o.gap;
    let ax, bx; const y = o.y == null ? 1000 : o.y;
    /* Dash stands on the outer side so Mr. Tick's pointing hand faces the content */
    if (lay === "right") { ax = o.x == null ? 1500 : o.x; bx = ax + gap; }
    else if (lay === "flank") { ax = o.x == null ? 250 : o.x; bx = o.bx == null ? 1670 : o.bx; }
    else { ax = o.x == null ? 470 : o.x; bx = ax - gap; }
    const A = Object.assign({}, o.a || {}), B = Object.assign({}, o.b || {});
    const ta = A.talk || 0, tb = B.talk || 0;
    const spk = o.speaker !== undefined ? o.speaker : ta > 0.08 && ta >= tb ? "a" : tb > 0.08 ? "b" : null;
    if (A.listen == null) A.listen = spk === "b" ? 1 : 0;
    if (B.listen == null) B.listen = spk === "a" ? 1 : 0;
    A.toward = bx >= ax ? 1 : -1; B.face = bx >= ax ? -1 : 1;
    const ap = o.appear == null ? 1 : o.appear;
    const pa = K.E.back(clamp(ap, 0, 1), 1.8);
    if (pa <= 0) return null;
    if (o.stage !== "none") {
      const x0 = Math.min(ax, bx) - 170 * s, x1 = lay === "flank" ? ax + 190 * s : Math.max(ax, bx) + 190 * s;
      ctx.save(); ctx.globalAlpha *= clamp(ap * 3, 0, 1);
      K.platform(ctx, x0, x1, y + 6, { h: 90, seed: 61 });
      if (lay === "flank") K.platform(ctx, bx - 170 * s, bx + 190 * s, y + 6, { h: 90, seed: 63 });
      ctx.restore();
    }
    const at = (x, yy) => { ctx.save(); ctx.translate(x, yy); ctx.scale(pa, pa); ctx.translate(-x, -yy); };
    A.x = ax; A.y = y; A.s = s; B.x = bx; B.y = y; B.s = bsk;
    if (lay !== "flank" && B.pointUp == null) B.pointUp = 0.6;
    const sa = K.mousePose(t, A), sb = K.pigeonPose(t, B);
    if (o.b !== false) { at(bx, y); K.pigeon(ctx, bx, y, bsk, sb); ctx.restore(); }
    if (o.a !== false) { at(ax, y); K.mouse(ctx, ax, y, s, sa); ctx.restore(); }
    const hand = (st, k, x, s_) => { const h = st[k]; return h ? [x + h.x * s_, y + h.y * s_] : null; };
    return {
      a: { x: ax, y, s, head: [ax, y - 212 * s], hand: hand(sa, A.toward > 0 ? "handR" : "handL", ax, s), pose: sa },
      b: { x: bx, y, s: bsk, head: [bx, y - 204 * bsk], hand: hand(sb, B.face > 0 ? "wingR" : "wingL", bx, bsk), pose: sb },
      speaker: spk,
    };
  };
})(SK);
