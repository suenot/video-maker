/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
   Scenes (draw(c, t) functions) follow each other on the song's downbeats;
   between two scenes a diegetic transition renders both into offscreen
   buffers and composites them: a split-flap board, a wall of steam, or a
   railway tunnel. Never a crossfade.
     0.0  yard (intro + verse)     flap   9.1  quote booths
    10.9  train "Choo choo"         tunnel 14.6  order-book board
    18.3  balance "inventory"       flap  21.9  title, "All aboard" to 27.1
   ============================================================ */
const bufA = document.createElement("canvas"), bufB = document.createElement("canvas");
bufA.width = bufB.width = 1920; bufA.height = bufB.height = 1080;
const ctxA = bufA.getContext("2d"), ctxB = bufB.getContext("2d");

const sLadder = (c, t) => drawLadder(c, t, T.L2, "+0.04", BOOK1);
const sBal = (c, t) => drawBalance(c, t, T.B2);
/* [window, from, to, kind] in time order; a scene runs from the middle of one window to the middle of the next */
const CUTS = [
  [T.flap1, drawYard, drawQuotes, "flap"],
  [T.steam, drawQuotes, drawTrain, "steam"],
  [T.tunnel3, drawTrain, sLadder, "tunnel"],
  [T.steam2, sLadder, sBal, "steam"],
  [T.flap2, sBal, drawTitleSet, "flap"],
];

/* scene for time t (outside transitions) */
function sceneAt(t) {
  let sc = drawYard;
  CUTS.forEach((q) => { if (t >= (q[0][0] + q[0][1]) / 2) sc = q[2]; });
  return sc;
}

/* railway tunnel: an arch closes to black on the old scene and opens on the new one */
function tunnelWipe(c, u) {
  const closing = u < 0.5, k = closing ? 1 - K.E.in3(u * 2) : K.E.out3((u - 0.5) * 2);
  const r = 40 + 1280 * k, cx = 960, cy = 620;
  K.screen(c);
  c.fillStyle = P.ink; c.fillRect(0, 0, 1920, 1080);
  if (k > 0.002) {
    const arch = () => { c.beginPath(); c.moveTo(cx - r, 1200); c.lineTo(cx - r, cy); c.arc(cx, cy, r, Math.PI, 0); c.lineTo(cx + r, 1200); c.closePath(); };
    c.save(); arch(); c.clip(); c.drawImage(closing ? bufA : bufB, 0, 0); c.restore();
    /* brick ring of the portal */
    c.save(); c.strokeStyle = P.tomatoDark; c.lineWidth = 34; arch(); c.stroke();
    c.strokeStyle = P.ink; c.lineWidth = 4; c.beginPath();
    for (let i = 0; i <= 14; i++) { const a = Math.PI + (i / 14) * Math.PI; c.moveTo(cx + Math.cos(a) * (r - 17), cy + Math.sin(a) * (r - 17)); c.lineTo(cx + Math.cos(a) * (r + 17), cy + Math.sin(a) * (r + 17)); }
    c.stroke(); c.restore();
  }
}

/* split-flap wipe: tiles flip column by column, left to right */
function flapWipe(c, u) {
  const COLS = 8, ROWS = 4, w = 1920 / COLS, h = 1080 / ROWS;
  K.screen(c);
  for (let col = 0; col < COLS; col++) for (let row = 0; row < ROWS; row++) {
    const d = (col / (COLS - 1)) * 0.55 + (row / (ROWS - 1)) * 0.08 + K.hash(col * 7 + row, 3) * 0.04;
    const f = K.clamp((u - d) / 0.33, 0, 1), x = col * w, y = row * h, hh = h / 2, cy = y + hh;
    /* top half: new picture behind, old flap falling over it */
    c.drawImage(f > 0 ? bufB : bufA, x, y, w, hh, x, y, w, hh);
    /* bottom half: old picture until the flap lands on it */
    c.drawImage(bufA, x, cy, w, hh, x, cy, w, hh);
    if (f > 0 && f < 0.5) {
      const k = Math.cos(f * Math.PI);
      c.drawImage(bufA, x, y, w, hh, x, cy - hh * k, w, hh * k);
      c.fillStyle = `rgba(20,20,24,${(0.45 * (1 - k)).toFixed(3)})`; c.fillRect(x, cy - hh * k, w, hh * k);
    } else if (f >= 0.5) {
      const k = -Math.cos(f * Math.PI);
      c.drawImage(bufB, x, cy, w, hh, x, cy, w, hh * k);
      if (f < 1) { c.fillStyle = `rgba(20,20,24,${(0.4 * (1 - k)).toFixed(3)})`; c.fillRect(x, cy, w, hh * k); }
    }
  }
  /* the board itself: tile gaps and hinges, strongest mid-wipe */
  const a = Math.sin(Math.PI * K.clamp(u, 0, 1));
  c.save(); c.globalAlpha = 0.85 * a; c.strokeStyle = P.ink;
  c.lineWidth = 6; c.beginPath();
  for (let col = 1; col < COLS; col++) { c.moveTo(col * w, 0); c.lineTo(col * w, 1080); }
  for (let row = 1; row < ROWS; row++) { c.moveTo(0, row * h); c.lineTo(1920, row * h); }
  c.stroke();
  c.lineWidth = 2.5; c.beginPath();
  for (let row = 0; row < ROWS; row++) { c.moveTo(0, row * h + h / 2); c.lineTo(1920, row * h + h / 2); }
  c.stroke(); c.restore();
}

/* steam wipe: a wall of puffs rolls left to right; behind it is the next scene */
function steamWipe(c, u) {
  const x = K.lerp(-520, 2500, K.E.inOut(u));
  K.screen(c);
  c.drawImage(bufA, 0, 0);
  c.save(); c.beginPath(); c.rect(0, 0, Math.max(0, x - 120), 1080); c.clip(); c.drawImage(bufB, 0, 0); c.restore();
  for (let i = 0; i < 9; i++) {
    const y = -40 + i * 145, j = K.hash(i, 5);
    K.puff(c, x - 120 - 140 * j, y + 30 * Math.sin(i + K.now * 4), 190 + 60 * j, 0.5, 2700 + i);
    K.puff(c, x + 30 - 90 * K.hash(i, 6), y + 70, 120 + 40 * j, 0.45, 2720 + i);
  }
}

function render(t) {
  let box = null;
  try {
    const cut = CUTS.find((q) => t >= q[0][0] && t < q[0][1]);
    if (cut) {
      const u = K.inv(cut[0][0], cut[0][1], t);
      cut[1](ctxA, t);
      const r = cut[2](ctxB, t);
      if (cut[2] === drawTitleSet) box = r;
      if (cut[3] === "flap") flapWipe(ctx, u); else if (cut[3] === "steam") steamWipe(ctx, u); else tunnelWipe(ctx, u);
    } else {
      const sc = sceneAt(t);
      const r = sc(ctx, t);
      if (sc === drawTitleSet) box = r;
    }
  } catch (err) {
    /* never leave a blank frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "26px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 150), 20, 50);
  }
  layoutTitleDom(t, t >= T.flap2[1] ? box : null);
  /* logo: one small bounce on the first downbeats, then static */
  const lb = K.inv(0.05, 0.5, t), bounce = lb > 0 && lb < 1 ? Math.sin(Math.PI * lb) : 0;
  logoEl.style.transform = `translateY(${(-10 * bounce).toFixed(2)}px) scale(${(1 + 0.05 * bounce).toFixed(3)})`;
  /* paper grain steps at the boil rate */
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain"), logoEl = document.getElementById("logo");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .3  0 0 0 1.4 -.2'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
