/* ============================================================
   ENDCARD 10 COPY: every string on the card, the channel list, the
   contacts and their glyphs. The only file to edit when a link changes.
   Chinese glyphs are subset into assets/fonts by tools/fetch_cjk.py,
   which reads this file: re-run it after changing any Chinese text.
   ============================================================ */
const COPY = {
  en: { head: "Thanks for watching — subscribe!", next: "Watch next", sub: "Subscribe" },
  ru: { head: "Спасибо за просмотр — подписывайтесь!", next: "Смотрите дальше", sub: "Подписаться" },
  "zh-CN": { head: "感谢观看，欢迎订阅！", next: "下一个视频", sub: "订阅" },
  "zh-TW": { head: "感謝觀看，歡迎訂閱！", next: "下一部影片", sub: "訂閱" },
};

/* YouTube channels, in sign order: top-left, top-right, bottom-left, bottom-right */
const CHANNELS = [
  { lang: "en", label: "English", handle: "@marketmaker-cc" },
  { lang: "zh-CN", label: "简体中文", handle: "@marketmaker-zh" },
  { lang: "zh-TW", label: "繁體中文", handle: "@marketmaker-zh-hant" },
  { lang: "ru", label: "Русский", handle: "@marketmaker-ru" },
];

/* glyphs: 24 x 24 SVG path data, stroked (s) and/or filled (f) in cream on a coloured disc */
const ICON = {
  web: { s: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M3.4 9h17.2 M3.4 15h17.2 M12 3c-3.4 3.4-3.4 14.6 0 18 M12 3c3.4 3.4 3.4 14.6 0 18" },
  mail: { s: "M3.5 6h17v12h-17z M4 6.6l8 6.4l8-6.4" },
  plane: { s: "M20.5 4.2L3.3 11l5.4 2.1l9.1-6.3l-6.9 7.6v5.3l3-3.4l3.9 3z" },
  x: { s: "M5 4.5l14 15 M19 4.5l-14 15" },
  chat: { s: "M6.2 7.3c3.7-1.7 7.9-1.7 11.6 0c1.7 2.6 2.5 5.5 2.6 8.7c-1.7 1.3-3.3 2.1-5 2.5l-1-1.9c-1.6.4-3.2.4-4.8 0l-1 1.9c-1.7-.4-3.3-1.2-5-2.5c.1-3.2.9-6.1 2.6-8.7z", f: "M9.4 11.4a1.5 1.7 0 1 0 0.01 0z M14.6 11.4a1.5 1.7 0 1 0 0.01 0z" },
  branch: { s: "M7 4a2 2 0 1 0 0.01 0z M7 16a2 2 0 1 0 0.01 0z M17 6.5a2 2 0 1 0 0.01 0z M7 8v8 M17 10.5c0 4.2-10 2-10 5.5" },
  f: { s: "M15.6 4.2h-2.3a3 3 0 0 0-3 3V20.5 M7.4 11.2h7.4" },
};

/* contacts from the marketmaker.cc footer; tag = small pill after the text.
   Order = reading order of the two panel rows (balanced widths): web, email, X,
   Discord / both Telegrams, GitHub, Facebook. */
const CONTACTS = [
  { icon: "web", color: "kelp", text: "marketmaker.cc" },
  { icon: "mail", color: "coral", text: "suenot@marketmaker.cc" },
  { icon: "x", color: "ink", text: "x.com/suenot" },
  { icon: "chat", color: "fan", text: "discord.com/invite/2PtuMAg" },
  { icon: "plane", color: "bid", text: "t.me/suenot" },
  { icon: "plane", color: "bid", text: "t.me/suenot_dev", tag: "RU" },
  { icon: "branch", color: "inkSoft", text: "github.com/suenot" },
  { icon: "f", color: "fishB", text: "facebook.com/soloviov.evgeniy" },
];
