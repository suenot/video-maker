/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film (the short song, 24.3 s).
   One paused GSAP timeline drives a proxy whose setter calls render(t).
    0.00 -  5.74  CRT power-on; close-up: Beepo boots, waves hello
    5.74 -  9.96  "Beep boop, the signals run": hop, pull back, cables light
    9.96 - 14.21  "Agents trade till the day is done": ticket line, dusk
   13.66 - 14.21  dive into Beepo's face screen
   14.21 - 18.04  "Observe, decide, then act again": the loop in his face
   18.04 - 18.46  CRT power-off
   18.46 - 24.30  "AI Agents for Trading, here they come!": title card;
                  tag at 20.57 (medallions, confetti); CRT off at the end
   Cuts are diegetic: face dive, CRT off/on (glitch() is the signal-tear
   cut kept for longer cuts, see extra/).
   ============================================================ */
const FACE_SCALE = (2060 / 1920); /* loop scene scale when the face fills the frame */

/* the loop scene drawn inside Beepo's screen during the dive */
function faceLoop(t) {
  return (c, w, h) => { c.save(); c.translate(w / 2, h / 2); const s = w / 1920; c.scale(s, s); c.translate(-960, -540); drawLoopScene(c, t); c.restore(); };
}

/* CRT power-on / power-off: a bright line that opens to the full frame (u 0..1 = open) */
function crtMask(u, draw) {
  K.screen(ctx);
  ctx.fillStyle = "#020208"; ctx.fillRect(0, 0, 1920, 1080);
  if (u <= 0) return;
  const k = K.E.out3(K.clamp(u, 0, 1)), sx = K.clamp(u * 3, 0.02, 1), h = Math.max(3, 1080 * K.clamp((k - 0.15) / 0.85, 0, 1));
  ctx.save(); ctx.beginPath(); ctx.rect(960 - 960 * sx, 540 - h / 2, 1920 * sx, h); ctx.clip();
  draw(); ctx.restore();
  K.screen(ctx);
  const flash = 1 - K.clamp(u * 1.4, 0, 1);
  if (flash > 0) {
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = `rgba(200,240,255,${(0.9 * flash).toFixed(2)})`;
    ctx.fillRect(960 - 960 * sx, 540 - h / 2 - 3, 1920 * sx, h + 6); ctx.restore();
    K.glow(ctx, 960, 540, 700 * sx, "rgba(160,230,255,0.9)", flash);
  }
}
/* squeeze a full-frame drawing into a line, then a dot (u 0..1 = closing) */
function crtOff(u, draw) {
  K.screen(ctx);
  ctx.fillStyle = "#020208"; ctx.fillRect(0, 0, 1920, 1080);
  const sy = u < 0.55 ? K.lerp(1, 0.004, K.E.in3(u / 0.55)) : 0.004, sx = u < 0.55 ? 1 : K.lerp(1, 0.01, K.E.out3((u - 0.55) / 0.45));
  ctx.save(); ctx.translate(960, 540); ctx.scale(sx, sy); ctx.translate(-960, -540); draw(); ctx.restore();
  K.screen(ctx);
  const b = K.clamp(u * 2, 0, 1);
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = `rgba(210,245,255,${(0.85 * b * K.clamp((0.25 - sy) / 0.2, 0, 1)).toFixed(2)})`;
  ctx.fillRect(960 - 960 * sx, 540 - Math.max(2, 540 * sy), 1920 * sx, Math.max(4, 1080 * sy)); ctx.restore();
  K.glow(ctx, 960, 540, 200 + 600 * sx, "rgba(160,230,255,0.9)", K.clamp((0.25 - sy) / 0.2, 0, 1) * (1 - K.inv(0.85, 1, u)));
  return { sx, sy };
}

function drawLoopFull(t) {
  K.screen(ctx); ctx.save(); ctx.translate(960, 540); ctx.scale(FACE_SCALE, FACE_SCALE); ctx.translate(-960, -540);
  drawLoopScene(ctx, t); ctx.restore();
}

/* CRT signal tear: shift horizontal bands of the finished frame (amount 0..1) */
function glitch(amount, t) {
  if (amount <= 0) return;
  K.screen(ctx);
  const f = K.boilFrame(t * 2);
  for (let i = 0; i < 14; i++) {
    const y = Math.floor(K.hash(i, f * 7 + 1) * 1080), h = 12 + Math.floor(K.hash(i, f * 7 + 2) * 90), dx = (K.hash(i, f * 7 + 3) - 0.5) * 260 * amount;
    ctx.drawImage(cv, 0, y, 1920, h, dx, y, 1920, h);
  }
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) { ctx.fillStyle = K.rgba(i % 2 ? P.pink : P.cyan, 0.35 * amount); ctx.fillRect(0, Math.floor(K.hash(i, f * 3 + 9) * 1080), 1920, 3 + 6 * K.hash(i, f + 4)); }
  ctx.restore();
}
function blackFrame(t, t0, t1) { K.screen(ctx); ctx.fillStyle = "#020208"; ctx.fillRect(0, 0, 1920, 1080); K.glow(ctx, 960, 540, 60 * (1 - K.inv(t0, t1, t)), "rgba(160,230,255,0.9)", 1); }

function render(t) {
  try {
    K.begin(ctx, t, { x: 960, y: 540, z: 1 });
    titleEl.style.opacity = "0"; titleEl.style.transform = "";
    let k = null;
    if (t < T.dive[1]) {
      /* intro + chorus 1 on the floor (opens through a CRT power-on) */
      const floor = () => drawFloor(t, camFloor(t));
      if (t < T.powerOn[1]) crtMask(K.inv(T.powerOn[0], T.powerOn[1], t), floor);
      else floor();
    } else if (t < T.crtOff[0]) drawLoopFull(t);
    else if (t < T.title) {
      if (t < T.crtOff[1]) crtOff(K.inv(T.crtOff[0], T.crtOff[1], t), () => drawLoopFull(t));
      else blackFrame(t, T.crtOff[1], T.title);
    } else {
      /* final title card: power-on, and the whole frame powers off over the last 0.4 s */
      k = TITLE_B;
      const endU = K.inv(DUR - 0.42, DUR - 0.02, t);
      if (t < k.start + 0.3) crtMask(K.inv(k.start, k.start + 0.3, t), () => drawTitleSet(t, k));
      else if (endU > 0) {
        const s = crtOff(endU, () => drawTitleSet(t, k));
        titleEl.style.transformOrigin = "960px 540px"; titleEl.style.transform = `scale(${s.sx.toFixed(3)}, ${s.sy.toFixed(3)})`;
      } else drawTitleSet(t, k);
    }
    /* signal-tear cuts between sets */
    let g = 0; CUTS.forEach((c) => { g = Math.max(g, 1 - Math.abs(t - c) / 0.2); });
    glitch(g, t);
    if (k) {
      layoutTitleDom(t, k);
      if (g > 0) titleEl.style.transform = `translateX(${((K.hash(K.boilFrame(t * 2), 5) - 0.5) * 120 * g).toFixed(1)}px)`;
    }
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
  /* logo: one small bounce on the first downbeat, then static */
  const lb = K.inv(at(0), at(0) + 0.35, t), ls = lb > 0 && lb < 1 ? 1 + 0.08 * Math.sin(lb * Math.PI) : 1;
  logoEl.style.transform = ls === 1 ? "" : `scale(${ls.toFixed(3)})`;
  /* rolling CRT bright band, continuous time */
  rollEl.style.transform = `translateY(${(((t * 0.32) % 1) * 1500).toFixed(1)}px)`;
}

const rollEl = document.getElementById("roll"), logoEl = document.getElementById("logo");
const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
