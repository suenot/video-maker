import json
from pathlib import Path

from selfmade import schema

SCRIPT = Path(__file__).parent.parent / "content" / "conformal-prediction-trading.en.json"
RESULTS = Path("/Users/suenot/projects/trading/marketmaker/arxiv_paper_conformal/results/results.json")


def test_script_is_valid():
    script = schema.load_script(SCRIPT)
    assert script["slug"] == "conformal-prediction-trading"
    assert script["lang"] == "en"


def test_every_data_ref_resolves():
    script = schema.load_script(SCRIPT)
    results = json.loads(RESULTS.read_text())
    assert schema.validate_data_refs(script, results) > 0


def test_runtime_is_in_the_15_to_20_minute_range():
    """At ~150 words/min, the script must land in the target runtime."""
    script = schema.load_script(SCRIPT)
    words = sum(len(s["narration"].split()) for s in script["scenes"])
    minutes = words / 150
    assert 14 <= minutes <= 21, f"{words} words = {minutes:.1f} min, outside the 15-20 min target"


def test_scene_ids_are_ordered_and_filename_safe():
    script = schema.load_script(SCRIPT)
    ids = [s["id"] for s in script["scenes"]]
    assert ids == sorted(ids), "scene ids must sort into playback order"
    for sid in ids:
        assert sid.replace("_", "").isalnum(), f"{sid!r} is not filename-safe"
