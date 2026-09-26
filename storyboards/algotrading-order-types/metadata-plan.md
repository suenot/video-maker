# YouTube metadata plan: Order Types in Algorithmic Trading

Source of truth: `narration-manifest.json` and `product-facts.md` (checked 2026-09-26). The examples are illustrative and venue behavior varies.

## Desktop videos

- EN title: **Market, Limit, Stop Orders Explained: Price, Speed, or No Fill?**
- RU title: **Типы ордеров: цена, скорость или риск неисполнения?**
- Descriptions link only to the matching live article route from the narration manifest. No unverified contacts, playlist, or external links are added.
- Measured EN chapter starts: `0:00` hook, `0:20` book, `0:36` market, `0:59` limit, `1:19` post-only, `1:40` stops, `2:05` IOC/FOK, `2:25` takeaway. Measured RU starts: `0:00`, `0:20`, `0:36`, `0:56`, `1:16`, `1:39`, `2:02`, `2:22`. The descriptions and `timestamps` arrays use these rounded times; every chapter is at least ten seconds long.
- Claims are qualified: orders may partially fill, slip, be rejected, or remain unfilled; no execution or profit is promised.

## Shorts

- EN title: **Market, Limit, Stop: Order Types in 3 Minutes #Shorts**
- RU title: **Типы ордеров за 3 минуты: рынок, лимит, стоп #Shorts**
- Short descriptions link to the matching live article. The desktop video URL remains pending until the desktop video is published; do not invent or reserve a YouTube URL.
- No chapters for Shorts.

## Files

JSON follows `video_youtube_publish/metadata.py`: `title`, `description`, and `tags`. Desktop files also record a `timestamps` array with the scene starts; the publisher reads chapter lines from the description. Optional categorization fields are omitted. The publisher reads the three core fields and applies YouTube title/description sanitization and a 480-character combined tag budget.

The four exact source JSON files are tracked in `metadata/`. Upload copies live under ignored `output/algotrading-order-types/{en,ru}/` as listed in `production-manifest.json`.
