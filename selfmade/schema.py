"""Load and validate a video script, and resolve its references into results.json."""

import json
from pathlib import Path

VISUALS = {
    "title_card",
    "coverage_bars",
    "tercile_drift",
    "break_trajectory",
    "residual_quantile",
    "width_scatter",
    "bullets",
}

REQUIRED_SCENE_KEYS = {"id", "title", "narration", "visual", "data_refs"}


def resolve_data_ref(ref, results):
    """Resolve a dotted path into results.json. Raises KeyError if it does not exist."""
    node = results
    for part in ref.split("."):
        if not isinstance(node, dict) or part not in node:
            raise KeyError(f"data_ref {ref!r} does not resolve: missing {part!r}")
        node = node[part]
    return node


def load_script(path):
    """Load a script file, validating its shape. Raises ValueError on any problem."""
    data = json.loads(Path(path).read_text())

    for key in ("slug", "lang", "voice", "scenes"):
        if key not in data:
            raise ValueError(f"script missing top-level key {key!r}")
    if not data["scenes"]:
        raise ValueError("script has no scenes")

    seen = set()
    for i, scene in enumerate(data["scenes"]):
        missing = REQUIRED_SCENE_KEYS - set(scene)
        if missing:
            raise ValueError(f"scene {i} missing keys: {sorted(missing)}")
        if scene["id"] in seen:
            raise ValueError(f"duplicate scene id {scene['id']!r}")
        seen.add(scene["id"])
        if not scene["narration"].strip():
            raise ValueError(f"scene {scene['id']!r} has empty narration")
        if scene["visual"] not in VISUALS:
            raise ValueError(f"scene {scene['id']!r} has unknown visual {scene['visual']!r}")
        if scene["visual"] == "bullets":
            lines = scene.get("lines")
            if not lines or not isinstance(lines, list) or not all(isinstance(x, str) for x in lines):
                raise ValueError(f"scene {scene['id']!r} has visual 'bullets' but no non-empty 'lines' list of strings")

    return data


def validate_data_refs(script, results):
    """Every data_ref in the script must resolve. Returns the number checked."""
    n = 0
    for scene in script["scenes"]:
        for name, ref in scene["data_refs"].items():
            resolve_data_ref(ref, results)
            n += 1
    return n
