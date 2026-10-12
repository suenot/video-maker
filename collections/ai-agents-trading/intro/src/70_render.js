/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t).
    0.00 -  2.24  CRT power-on; close-up: Beepo boots (static, eyes, look)
    2.24 -  6.46  "Beep boop, the signals run": hop, pull back to the floor,
                  candles draw, cables light, pulses run to the team
    6.46 - 10.15  "Agents trade till the day is done": Beepo hops over and
                  conducts; tickets go analyst -> risk (stamp) -> trader ->
                  tube; dusk falls, the clock runs 09:30 -> 16:00
   10.15 - 10.70  dive into Beepo's face screen (diegetic transition)
   10.70 - 14.53  "Observe, decide, then act again": the agent loop ring
   14.53 - 14.95  CRT power-off squeeze
   14.95 - 20.50  "AI Agents for Trading, here they come!": neon sign title
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

function render(t) {
  try {
    K.begin(ctx, t, { x: 960, y: 540, z: 1 });
    titleEl.style.opacity = "0"; titleEl.style.transform = "";
    if (t < T.dive[1]) {
      /* 1-3: the floor (opens through a CRT power-on) */
      const floor = () => drawFloor(t, camFloor(t));
      if (t < T.powerOn[1]) crtMask(K.inv(T.powerOn[0], T.powerOn[1], t), floor);
      else floor();
    } else if (t < T.crtOff[0]) {
      drawLoopFull(t);
    } else if (t < T.title) {
      if (t < T.crtOff[1]) crtOff(K.inv(T.crtOff[0], T.crtOff[1], t), () => drawLoopFull(t));
      else { K.screen(ctx); ctx.fillStyle = "#020208"; ctx.fillRect(0, 0, 1920, 1080); K.glow(ctx, 960, 540, 60 * (1 - K.inv(T.crtOff[1], T.title, t)), "rgba(160,230,255,0.9)", 1); }
    } else {
      /* 5: title set, opens with a power-on; the whole frame powers off over the last 0.4 s */
      const endU = K.inv(DUR - 0.42, DUR - 0.02, t);
      if (t < T.title + 0.3) crtMask(K.inv(T.title, T.title + 0.3, t), () => drawTitleSet(t));
      else if (endU > 0) {
        const s = crtOff(endU, () => drawTitleSet(t));
        titleEl.style.transformOrigin = "960px 540px"; titleEl.style.transform = `scale(${s.sx.toFixed(3)}, ${s.sy.toFixed(3)})`;
      } else drawTitleSet(t);
      layoutTitleDom(t);
    }
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
  /* rolling CRT bright band, continuous time */
  rollEl.style.transform = `translateY(${(((t * 0.32) % 1) * 1500).toFixed(1)}px)`;
}

const rollEl = document.getElementById("roll");
const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
