import json
import pytest
from selfmade import schema


def test_resolve_data_ref_reads_nested_value():
    results = {"marginal_coverage": {"iid": {"split_abs": {"coverage": 0.9007}}}}
    assert schema.resolve_data_ref("marginal_coverage.iid.split_abs.coverage", results) == 0.9007


def test_resolve_data_ref_rejects_missing_path():
    with pytest.raises(KeyError):
        schema.resolve_data_ref("marginal_coverage.nope.split_abs.coverage", {"marginal_coverage": {}})


def test_resolve_data_ref_list_form_reaches_dotted_key():
    results = {"marginal_coverage": {"garch": {"aci_abs_g0.05": {"coverage": 0.873}}}}
    assert schema.resolve_data_ref(
        ["marginal_coverage", "garch", "aci_abs_g0.05", "coverage"], results
    ) == 0.873


def test_resolve_data_ref_string_form_still_works():
    results = {"marginal_coverage": {"garch": {"split_abs": {"coverage": 0.91}}}}
    assert schema.resolve_data_ref("marginal_coverage.garch.split_abs.coverage", results) == 0.91


def test_resolve_data_ref_list_form_rejects_missing_path():
    with pytest.raises(KeyError):
        schema.resolve_data_ref(["marginal_coverage", "nope", "coverage"], {"marginal_coverage": {}})


def test_resolve_data_ref_rejects_wrong_type():
    with pytest.raises(TypeError, match="42"):
        schema.resolve_data_ref(42, {})


def test_load_script_accepts_valid(tmp_path):
    p = tmp_path / "s.json"
    p.write_text(json.dumps({
        "slug": "x", "lang": "en", "voice": "en-US-AndrewNeural",
        "scenes": [{"id": "01_hook", "title": "T", "narration": "Words here.",
                    "visual": "title_card", "data_refs": {}}],
    }))
    assert schema.load_script(p)["scenes"][0]["id"] == "01_hook"


def test_load_script_rejects_duplicate_scene_ids(tmp_path):
    p = tmp_path / "s.json"
    p.write_text(json.dumps({
        "slug": "x", "lang": "en", "voice": "v",
        "scenes": [
            {"id": "dup", "title": "A", "narration": "a", "visual": "title_card", "data_refs": {}},
            {"id": "dup", "title": "B", "narration": "b", "visual": "title_card", "data_refs": {}},
        ],
    }))
    with pytest.raises(ValueError, match="duplicate"):
        schema.load_script(p)


def test_load_script_rejects_empty_narration(tmp_path):
    p = tmp_path / "s.json"
    p.write_text(json.dumps({
        "slug": "x", "lang": "en", "voice": "v",
        "scenes": [{"id": "a", "title": "A", "narration": "  ", "visual": "title_card", "data_refs": {}}],
    }))
    with pytest.raises(ValueError, match="narration"):
        schema.load_script(p)


def test_load_script_rejects_bullets_without_lines(tmp_path):
    p = tmp_path / "s.json"
    p.write_text(json.dumps({
        "slug": "x", "lang": "en", "voice": "v",
        "scenes": [{"id": "b1", "title": "T", "narration": "Words here.",
                    "visual": "bullets", "data_refs": {}}],
    }))
    with pytest.raises(ValueError, match="b1"):
        schema.load_script(p)


def test_load_script_accepts_bullets_with_lines(tmp_path):
    p = tmp_path / "s.json"
    p.write_text(json.dumps({
        "slug": "x", "lang": "en", "voice": "v",
        "scenes": [{"id": "b1", "title": "T", "narration": "Words here.",
                    "visual": "bullets", "data_refs": {}, "lines": ["one", "two"]}],
    }))
    assert schema.load_script(p)["scenes"][0]["lines"] == ["one", "two"]


def test_validate_data_refs_counts_mixed_string_and_list_refs():
    results = {"a": {"b": 1}, "c": {"d.e": 2}}
    script = {"scenes": [
        {"data_refs": {"x": "a.b"}},
        {"data_refs": {"y": ["c", "d.e"]}},
    ]}
    assert schema.validate_data_refs(script, results) == 2


def test_validate_data_refs_propagates_key_error():
    results = {"a": {}}
    script = {"scenes": [{"data_refs": {"x": "a.missing"}}]}
    with pytest.raises(KeyError):
        schema.validate_data_refs(script, results)


def test_resolve_data_ref_rejects_empty_list():
    with pytest.raises(TypeError, match="must be a str or a list"):
        schema.resolve_data_ref([], {"a": 1})


def test_resolve_data_ref_non_empty_list_regression():
    results = {"x": {"y": 42}}
    assert schema.resolve_data_ref(["x", "y"], results) == 42
