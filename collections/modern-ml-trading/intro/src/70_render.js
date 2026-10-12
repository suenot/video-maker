/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film (26.6 s, the short song).
   One paused GSAP timeline drives a proxy whose setter calls render(t).
   0.0 - 3.6   deco iris opens on a dark lab; lamps flicker on; owl's back to us
   3.61        head swivels 180 to face us, waves; 5.41 train-accuracy gauge
   7.22        a bar of swing dance
   9.02 - 10.8 data seed tossed into the pot, data drizzle, sprout, data points
   11.7 - 14.4 "Fit it RIGHT, don't overfit": overfit vine -> snip -> smooth fit -> band
   15.3 - 16.2 truck to the flasks; "Validate every little bit": ticks
   17.0 - 17.9 leap to the garden bench; "Trees and nets that learn and grow"
   19.85       marquee title "Modern ML for Trading"; 21.65 "steal the show": bow, medals
   23.46       "An owl in a lab with a data seed": seed held high, wink; 25.26 final hit
   The marketmaker.cc plate (DOM, top-right) stays on screen the whole time.
   ============================================================ */
function drawIris(t) {
  const u = K.inv(T.iris[0], T.iris[1], t);
  if (u >= 1) return;
  const r = 1250 * K.E.inOut(u) + 2, cx = 1180, cy = 460;
  K.screen(ctx); ctx.save();
  ctx.fillStyle = "#16100a"; ctx.beginPath(); ctx.rect(-10, -10, 1940, 1100); ctx.arc(cx, cy, r, 0, K.TAU, true); ctx.fill("evenodd");
  /* brass deco ring with rays */
  ctx.lineWidth = 18; ctx.strokeStyle = P.brass; ctx.beginPath(); ctx.arc(cx, cy, r + 9, 0, K.TAU); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 20, 0, K.TAU); ctx.stroke();
  for (let i = 0; i < 24; i++) { const a = (i / 24) * K.TAU + u; ctx.strokeStyle = P.brassDark; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r + 26), cy + Math.sin(a) * (r + 26)); ctx.lineTo(cx + Math.cos(a) * (r + 60), cy + Math.sin(a) * (r + 60)); ctx.stroke(); }
  ctx.restore();
}

/* 1930s print: flicker and a few hairline scratches, stepped at the boil rate */
function drawFilm(t) {
  const f = K.boilFrame(t);
  flickEl.style.opacity = (0.02 + 0.05 * K.hash(f, 77)).toFixed(3);
  K.screen(ctx); ctx.save();
  for (let i = 0; i < 2; i++) {
    if (K.hash(f * 3 + i, 91) > 0.3) continue;
    const x = 80 + K.hash(f * 5 + i, 92) * 1760, y0 = K.hash(f * 7 + i, 93) * 500, len = 200 + K.hash(f + i, 94) * 600;
    ctx.globalAlpha = 0.28; ctx.strokeStyle = "#fff6dc"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 6 * K.hs(f, 95), y0 + len); ctx.stroke();
  }
  ctx.restore();
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

function render(t) {
  try {
    K.begin(ctx, t, cam(t));
    drawLab(t);
    K.applyCam(ctx, 1);
    drawOwl(t);
    drawForeground();
    /* the lab before the lamps come on */
    const dark = 1 - lampsOn(t);
    if (dark > 0) { K.screen(ctx); ctx.fillStyle = `rgba(26,16,6,${(0.62 * dark).toFixed(3)})`; ctx.fillRect(0, 0, 1920, 1080); }
    const m = drawTitleCanvas(t);
    layoutTitleDom(t, m);
    drawIris(t);
  } catch (err) {
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
  drawFilm(t);
  /* the marketmaker.cc plate: one small bounce on the second downbeat, then static */
  const lb = t > K.at(1) ? Math.exp(-(t - K.at(1)) * 7) * Math.sin((t - K.at(1)) * 18) : 0;
  logoEl.style.transform = `scale(${(1 + 0.08 * lb).toFixed(3)})`;
}

const grainEl = document.getElementById("grain"), flickEl = document.getElementById("flick"), logoEl = document.getElementById("logo");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .38  0 0 0 0 .22  0 0 0 1.5 -.25'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
