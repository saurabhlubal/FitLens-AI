import pytest
from app.models.movement import LandmarkPoint
from app.services.movement.detector_factory import DetectorFactory

def make_test_landmarks(points_dict):
    landmarks = [LandmarkPoint(x=0.5, y=0.5, z=0.0) for _ in range(33)]
    for idx, (x, y) in points_dict.items():
        landmarks[idx] = LandmarkPoint(x=x, y=y, z=0.0)
    return landmarks

def test_bicep_curl_rep_counter():
    detector = DetectorFactory.get_detector("Bicep Curl")
    assert detector is not None

    # Down position (both arms straight)
    down_landmarks = make_test_landmarks({
        11: (0.5, 0.2), 13: (0.5, 0.5), 15: (0.5, 0.8),
        12: (0.5, 0.2), 14: (0.5, 0.5), 16: (0.5, 0.8),
        23: (0.5, 0.7), 24: (0.5, 0.7)
    })
    res_down = detector.analyze(down_landmarks, current_reps=0, current_stage="up")
    assert res_down.stage == "down"
    assert res_down.repetitionCount == 0

    # Up position (curled arms)
    up_landmarks = make_test_landmarks({
        11: (0.5, 0.2), 13: (0.5, 0.5), 15: (0.5, 0.22),
        12: (0.5, 0.2), 14: (0.5, 0.5), 16: (0.5, 0.22),
        23: (0.5, 0.7), 24: (0.5, 0.7)
    })
    res_up = detector.analyze(up_landmarks, current_reps=0, current_stage="down")
    assert res_up.stage == "up"
    assert res_up.repetitionCount == 1
    assert res_up.repIncremented is True
    assert res_up.isCorrectForm is True

def test_squat_rep_counter():
    detector = DetectorFactory.get_detector("Squat")
    assert detector is not None

    # Deep squat down position (Knee bent < 95 deg)
    # Hip (0.4, 0.5), Knee (0.6, 0.5), Ankle (0.6, 0.7) -> 90 degree angle
    down_landmarks = make_test_landmarks({
        23: (0.4, 0.5), 25: (0.6, 0.5), 27: (0.6, 0.7),
        24: (0.4, 0.5), 26: (0.6, 0.5), 28: (0.6, 0.7),
        11: (0.4, 0.2), 12: (0.4, 0.2)
    })
    res_down = detector.analyze(down_landmarks, current_reps=0, current_stage="up")
    assert res_down.stage == "down"

    # Standing up position (180 deg straight knee: Hip (0.5, 0.3), Knee (0.5, 0.6), Ankle (0.5, 0.9))
    up_landmarks = make_test_landmarks({
        23: (0.5, 0.3), 25: (0.5, 0.6), 27: (0.5, 0.9),
        24: (0.5, 0.3), 26: (0.5, 0.6), 28: (0.5, 0.9),
        11: (0.5, 0.1), 12: (0.5, 0.1)
    })
    res_up = detector.analyze(up_landmarks, current_reps=0, current_stage="down")
    assert res_up.stage == "up"
    assert res_up.repetitionCount == 1
    assert res_up.repIncremented is True
