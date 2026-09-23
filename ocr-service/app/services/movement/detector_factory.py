from typing import Dict, Type, Optional
from app.services.movement.base_detector import BaseExerciseDetector
from app.services.movement.bicep_curl import BicepCurlDetector
from app.services.movement.squat import SquatDetector
from app.services.movement.pushup import PushUpDetector
from app.services.movement.shoulder_press import ShoulderPressDetector
from app.services.movement.lateral_raise import LateralRaiseDetector
from app.services.movement.lunge import LungeDetector
from app.services.movement.jumping_jacks import JumpingJackDetector
from app.services.movement.plank import PlankDetector
from app.services.movement.hammer_curl import HammerCurlDetector

class DetectorFactory:
    """
    Modular Factory & Registry for Exercise Movement Detectors.
    Allows dynamic registration and retrieval of exercise models.
    """
    _registry: Dict[str, BaseExerciseDetector] = {
        # 1. Bicep Curl
        "bicep curl": BicepCurlDetector(),
        "bicep curls": BicepCurlDetector(),
        
        # 2. Squat
        "squat": SquatDetector(),
        "squats": SquatDetector(),
        
        # 3. Push-up
        "push up": PushUpDetector(),
        "push-up": PushUpDetector(),
        "pushups": PushUpDetector(),
        
        # 4. Shoulder Press
        "shoulder press": ShoulderPressDetector(),
        "overhead press": ShoulderPressDetector(),
        
        # 5. Lateral Raise
        "lateral raise": LateralRaiseDetector(),
        "lateral raises": LateralRaiseDetector(),
        "side lateral raise": LateralRaiseDetector(),
        
        # 6. Lunge
        "lunge": LungeDetector(),
        "lunges": LungeDetector(),
        "forward lunge": LungeDetector(),
        
        # 7. Jumping Jacks
        "jumping jack": JumpingJackDetector(),
        "jumping jacks": JumpingJackDetector(),
        
        # 8. Plank
        "plank": PlankDetector(),
        "plank hold": PlankDetector(),
        
        # 9. Hammer Curl
        "hammer curl": HammerCurlDetector(),
        "hammer curls": HammerCurlDetector(),
    }

    @classmethod
    def get_detector(cls, exercise_name: str) -> Optional[BaseExerciseDetector]:
        normalized = exercise_name.strip().lower()
        if normalized in cls._registry:
            return cls._registry[normalized]
        # Partial match fallback
        for key, detector in cls._registry.items():
            if key in normalized or normalized in key:
                return detector
        return cls._registry["bicep curl"]

    @classmethod
    def register_detector(cls, key: str, detector: BaseExerciseDetector) -> None:
        cls._registry[key.strip().lower()] = detector
