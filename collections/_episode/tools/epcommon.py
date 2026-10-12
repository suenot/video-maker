"""Shared paths for the episode engine (collections/_episode).

An episode lives at  collections/<collection>/episodes/<slug>/<lang>/episode/
  scenes.json, data/sync.json, scenes/<id>/src/*.js, renders/ (git-ignored), REVIEW.md
next to its prep/ (SCENES.md, subtitles.json, slide_starts.json, slides/).
The collection supplies  style/kit/*.js  (drawing kit, its own namespace: CK, AK, SK, ...)
and  style/episode/*.js  (mascot hosts, signs, transitions; a file there with the same
name as an engine lib file replaces it). Audio: video_maker/input/notebooklm-sources/<slug>/<lang>/audio.m4a.
"""
import json, os, re, sys

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # collections/_episode
COLLECTIONS = os.path.dirname(ENGINE)
VM = os.path.dirname(COLLECTIONS)                                        # video_maker


class Episode:
    def __init__(self, path):
        self.dir = os.path.abspath(path)
        if not os.path.basename(self.dir) == "episode":
            sys.exit(f"not an episode dir (must end in /episode): {self.dir}")
        self.lang_dir = os.path.dirname(self.dir)
        self.lang = os.path.basename(self.lang_dir)
        self.slug = os.path.basename(os.path.dirname(self.lang_dir))
        self.collection_dir = os.path.dirname(os.path.dirname(os.path.dirname(self.lang_dir)))
        self.collection = os.path.basename(self.collection_dir)
        self.kit = os.path.join(self.collection_dir, "style", "kit")
        self.coll_lib = os.path.join(self.collection_dir, "style", "episode")
        self.prep = os.path.join(self.lang_dir, "prep")
        self.audio = os.path.join(VM, "input", "notebooklm-sources", self.slug, self.lang, "audio.m4a")
        self.subs = os.path.join(self.prep, "subtitles.json")
        self.renders = os.path.join(self.dir, "renders")

    def namespace(self):
        src = open(os.path.join(self.kit, "00_core.js"), encoding="utf-8").read()
        m = re.search(r"var\s+([A-Z]{2})\s*=\s*window\.\1", src)
        if not m: sys.exit("cannot find the kit namespace (var XX = window.XX) in " + self.kit + "/00_core.js")
        return m.group(1)

    def manifest(self):
        m = json.load(open(os.path.join(self.dir, "scenes.json"), encoding="utf-8"))
        sc = m["scenes"]
        for i, s in enumerate(sc):
            s["in"] = sc[i - 1]["out"] if i > 0 else s.get("in", "cut")
            if i > 0 and abs(sc[i - 1]["end"] - s["start"]) > 1e-6:
                sys.exit(f"scenes.json: {sc[i-1]['id']} ends at {sc[i-1]['end']} but {s['id']} starts at {s['start']}")
        return m

    def scene(self, key):
        for s in self.manifest()["scenes"]:
            if s["id"] == key or s["id"].startswith(key + "_"):
                return s
        sys.exit(f"no scene '{key}' in scenes.json")


def episode_from_args(argv):
    """first positional arg is the episode dir if it is one; otherwise the cwd (or a parent) must be."""
    if argv and os.path.isfile(os.path.join(argv[0], "scenes.json")):
        return Episode(argv[0]), argv[1:]
    d = os.getcwd()
    while d != "/":
        if os.path.isfile(os.path.join(d, "scenes.json")) and os.path.basename(d) == "episode":
            return Episode(d), argv
        d = os.path.dirname(d)
    sys.exit("run inside an episode dir or pass it as the first argument")
