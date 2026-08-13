import pytest

from scripts.sync_slides import manual_timeline


def test_manual_timeline_keeps_every_slide_in_order():
    starts = [0, 8.5, 17, 25.25, 34, 44, 54, 65, 77, 90]

    timeline = manual_timeline(starts, slide_count=10, total=104.28)

    assert [segment["slide"] for segment in timeline] == list(range(10))
    assert timeline[0] == {"slide": 0, "start": 0.0, "end": 8.5}
    assert timeline[-1] == {"slide": 9, "start": 90.0, "end": 104.28}
    assert all(
        left["end"] == right["start"]
        for left, right in zip(timeline, timeline[1:])
    )


def test_manual_timeline_requires_one_start_per_slide():
    with pytest.raises(ValueError, match="Expected 3 slide start times, got 2"):
        manual_timeline([0, 5], slide_count=3, total=10)


@pytest.mark.parametrize("starts", [[1, 5], [0, 5, 5], [0, 10]])
def test_manual_timeline_rejects_invalid_boundaries(starts):
    with pytest.raises(ValueError):
        manual_timeline(starts, slide_count=len(starts), total=10)
