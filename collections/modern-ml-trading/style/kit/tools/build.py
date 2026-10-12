#!/usr/bin/env python3
"""Assemble a HyperFrames project from the shared kit + the project's own scenes.

usage: python3 style/kit/tools/build.py <project_dir>

  <project_dir>/tools/shell.html   page skeleton with two markers:
      /*__FONTS__*/   replaced by kit/fonts/fonts.css (paths -> assets/fonts/)
      /*__SCRIPT__*/  replaced by kit/*.js (sorted) + <project_dir>/src/*.js (sorted)
      <!--__LOGO__-->  (optional) replaced by kit/assets/logo.svg inline (marketmaker.cc mark)
  writes <project_dir>/index.html and copies fonts + gsap into <project_dir>/assets/.

Everything is inlined so `hyperframes lint` sees the timeline registration in
index.html and the page makes no requests except local fonts and gsap.
"""
import glob, os, shutil, sys

KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    proj = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    parts = sorted(glob.glob(os.path.join(KIT, "*.js"))) + sorted(glob.glob(os.path.join(proj, "src", "*.js")))
    js = "\n".join(open(f, encoding="utf-8").read() for f in parts)
    fonts = open(os.path.join(KIT, "fonts", "fonts.css"), encoding="utf-8").read().replace("FONTDIR/", "assets/fonts/")
    shell = open(os.path.join(proj, "tools", "shell.html"), encoding="utf-8").read()
    out = shell.replace("/*__FONTS__*/", fonts).replace("/*__SCRIPT__*/", js)
    logo = os.path.join(KIT, "assets", "logo.svg")
    if "<!--__LOGO__-->" in out and os.path.exists(logo):  # marketmaker.cc mark, fill="currentColor"
        svg = open(logo, encoding="utf-8").read()
        svg = svg[svg.index("<svg"):].replace('width="1024" height="1024"', 'class="mk" aria-hidden="true"')
        out = out.replace("<!--__LOGO__-->", svg)
    open(os.path.join(proj, "index.html"), "w", encoding="utf-8").write(out)
    fd = os.path.join(proj, "assets", "fonts")
    os.makedirs(fd, exist_ok=True)
    for f in glob.glob(os.path.join(KIT, "fonts", "*.woff2")):
        shutil.copy2(f, fd)
    shutil.copy2(os.path.join(KIT, "vendor", "gsap.min.js"), os.path.join(proj, "assets", "gsap.min.js"))
    print("index.html", len(out) // 1024, "KB from", len(parts), "scripts")


if __name__ == "__main__":
    main()
