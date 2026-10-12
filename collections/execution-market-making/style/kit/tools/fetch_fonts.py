#!/usr/bin/env python3
"""Download the kit fonts as local woff2 and write fonts/fonts.css.

Latin + Cyrillic: full Google Fonts subsets (latin, latin-ext, cyrillic, cyrillic-ext).
CJK: Google Fonts `text=` subsets that contain only the glyphs we pass, so a
title costs ~10 KB instead of ~5 MB. Re-run with more text when an episode
needs more Chinese glyphs:  fetch_fonts.py --cjk-text "执行与做市 ..."
"""
import argparse, os, re, urllib.parse, urllib.request

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "fonts")
KEEP = {"latin", "latin-ext", "cyrillic", "cyrillic-ext"}
FAMILIES = [("Jost", [500, 700, 800]), ("IBM Plex Mono", [500, 700])]
CJK = [("Noto Sans SC", "CJK SC", 900), ("Noto Sans TC", "CJK TC", 900)]
DEFAULT_CJK = "执行与做市執行與造市 0123456789"


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read()


def css_url(family, weights, text=None):
    q = "family=" + family.replace(" ", "+") + ":wght@" + ";".join(map(str, weights)) + "&display=block"
    if text:
        q += "&text=" + urllib.parse.quote(text)
    return "https://fonts.googleapis.com/css2?" + q


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cjk-text", default=DEFAULT_CJK)
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    rules = []
    for fam, weights in FAMILIES:
        css = get(css_url(fam, weights)).decode()
        for sub, body in re.findall(r"/\* ([\w-]+) \*/\s*@font-face \{(.*?)\}", css, re.S):
            if sub not in KEEP:
                continue
            w = re.search(r"font-weight: (\d+)", body).group(1)
            url = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
            ur = re.search(r"unicode-range: ([^;]+);", body).group(1)
            name = f"{fam.replace(' ', '')}-{w}-{sub}.woff2"
            path = os.path.join(OUT, name)
            if not os.path.exists(path):
                open(path, "wb").write(get(url))
            rules.append(f'@font-face {{ font-family: "{fam}"; font-weight: {w}; font-display: block;\n'
                         f'  src: url("FONTDIR/{name}") format("woff2"); unicode-range: {ur}; }}')
    for fam, alias, w in CJK:
        css = get(css_url(fam, [w], a.cjk_text)).decode()
        url = re.search(r"url\((https://[^)]+)\)", css).group(1)
        name = f"{fam.replace(' ', '')}-{w}-subset.woff2"
        open(os.path.join(OUT, name), "wb").write(get(url))
        rules.append(f'@font-face {{ font-family: "{alias}"; font-weight: {w}; font-display: block;\n'
                     f'  src: url("FONTDIR/{name}") format("woff2"); }}')
    open(os.path.join(OUT, "fonts.css"), "w").write("\n".join(rules) + "\n")
    print(len(rules), "font-face rules ->", os.path.join(OUT, "fonts.css"))


if __name__ == "__main__":
    main()
