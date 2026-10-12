#!/usr/bin/env python3
"""Download the CJK glyph subsets the end card needs into assets/fonts/.

The shared kit ships Noto Sans SC/TC subsets with only the intro-title glyphs,
so the end card fetches its own Google Fonts `text=` subsets (a few KB each).
Re-run after changing any Chinese string in src/10_copy.js.
"""
import os, re, urllib.parse, urllib.request

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "fonts")
SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "10_copy.js")


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read()


def main():
    js = open(SRC, encoding="utf-8").read()
    cjk = sorted(set(ch for ch in js if ord(ch) > 0x2e7f))
    text = "".join(cjk) + "0123456789"
    os.makedirs(OUT, exist_ok=True)
    for fam, w, name in [("Noto Sans SC", 900, "EC-SC-900"), ("Noto Sans TC", 900, "EC-TC-900"),
                         ("Noto Sans SC", 700, "EC-SC-700"), ("Noto Sans TC", 700, "EC-TC-700")]:
        q = f"family={fam.replace(' ', '+')}:wght@{w}&display=block&text={urllib.parse.quote(text)}"
        css = get("https://fonts.googleapis.com/css2?" + q).decode()
        url = re.search(r"url\((https://[^)]+)\)", css).group(1)
        open(os.path.join(OUT, name + ".woff2"), "wb").write(get(url))
        print(name, len(cjk), "glyphs")


if __name__ == "__main__":
    main()
