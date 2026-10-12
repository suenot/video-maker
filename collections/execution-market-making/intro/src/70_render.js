/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
   0.00 - 9.08   the yard (20_station.js), with a whip pan at 7.24
   8.66 - 9.38   departure-board wipe (split flaps) to the quote booths
   9.08 - 10.91  "Quote both sides" (30_quotes.js)
   10.41 - 11.23 steam wipe to the train
   10.91 - 14.58 "Choo choo, keep the slippage low" (40_train.js)
   14.16 - 14.88 departure-board wipe to the title
   14.58 - 19.80 "Execution and Market Making, on deck!" (50_title.js)
   Transitions are diegetic: a split-flap board and a wall of steam,
   never a crossfade. Both sides of a wipe render to offscreen buffers.
   ============================================================ */
const bufA = document.createElement("canvas"), bufB = document.createElement("canvas");
bufA.width = bufB.width = 1920; bufA.height = bufB.height = 1080;
const ctxA = bufA.getContext("2d"), ctxB = bufB.getContext("2d");

/* scene for time t (outside transitions) */
function sceneAt(t) {
  if (t < (T.flap1[0] + T.flap1[1]) / 2) return drawYard;
  if (t < (T.steam[0] + T.steam[1]) / 2) return drawQuotes;
  if (t < (T.flap2[0] + T.flap2[1]) / 2) return drawTrain;
  return drawTitleSet;
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
    const inFlap1 = t >= T.flap1[0] && t < T.flap1[1], inSteam = t >= T.steam[0] && t < T.steam[1], inFlap2 = t >= T.flap2[0] && t < T.flap2[1];
    if (inFlap1) { drawYard(ctxA, t); drawQuotes(ctxB, t); flapWipe(ctx, K.inv(T.flap1[0], T.flap1[1], t)); }
    else if (inSteam) { drawQuotes(ctxA, t); drawTrain(ctxB, t); steamWipe(ctx, K.inv(T.steam[0], T.steam[1], t)); }
    else if (inFlap2) { drawTrain(ctxA, t); box = drawTitleSet(ctxB, t); flapWipe(ctx, K.inv(T.flap2[0], T.flap2[1], t)); }
    else {
      const sc = sceneAt(t);
      const r = sc(ctx, t);
      if (sc === drawTitleSet) box = r;
    }
  } catch (err) {
    /* never leave a blank frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "26px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 150), 20, 50);
  }
  layoutTitleDom(t, t >= T.flap2[1] ? box : null);
  /* paper grain steps at the boil rate */
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .3  0 0 0 1.4 -.2'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
