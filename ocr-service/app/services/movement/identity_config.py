from dataclasses import dataclass, field
from typing import Dict, Any

@dataclass
class BicepCurlIdentityConfig:
    """Configurable thresholds for Bicep Curl & Hammer Curl identity validation."""
    max_upper_arm_torso_angle: float = 48.0  # Upper arm deviation from torso line (degrees)
    max_elbow_swing_angle: float = 55.0      # Hard limit above which movement is an arm raise
    min_wrist_to_elbow_excursion_ratio: float = 1.8  # Forearm arc vs elbow translation ratio
    elbow_below_shoulder_margin: float = 0.04  # Elbow must stay below shoulder by margin * torso_scale
    full_extension_angle: float = 135.0      # Starting / return extended arm angle
    peak_inflection_angle: float = 60.0       # Peak contraction elbow angle

@dataclass
class SquatIdentityConfig:
    """Configurable thresholds for Squat identity validation."""
    max_knee_angle_diff: float = 35.0         # Max difference between left and right knees at inflection
    min_hip_descent_ratio: float = 0.08       # Minimum vertical hip drop as fraction of torso_scale
    max_ankle_lift_ratio: float = 0.08        # Maximum allowed ankle lift from ground plane
    min_torso_vertical_angle: float = 45.0    # Torso must be generally upright (not horizontal)
    standing_knee_angle: float = 150.0        # Standing lockout knee angle
    deep_squat_knee_angle: float = 105.0      # Squat depth knee angle

@dataclass
class PushUpIdentityConfig:
    """Configurable thresholds for Push-up identity validation."""
    max_torso_horizontal_angle: float = 40.0  # Body inclination with horizontal (degrees)
    max_wrist_above_shoulder: float = 0.15    # Wrists cannot be significantly higher than shoulders
    top_plank_elbow_angle: float = 145.0      # Top lockout elbow angle
    bottom_chest_elbow_angle: float = 100.0   # Bottom chest-to-floor elbow angle
    min_body_plank_angle: float = 140.0       # Sag threshold for form feedback
    max_body_plank_angle: float = 200.0       # Pike threshold for form feedback

@dataclass
class ShoulderPressIdentityConfig:
    """Configurable thresholds for Shoulder Press identity validation."""
    min_rack_wrist_elevation: float = 0.20    # Wrists must be well above hips at rack position
    min_overhead_lockout_ratio: float = 0.10  # Wrists must reach above head/nose at peak lockout
    rack_elbow_angle: float = 95.0            # Bottom rack elbow angle
    lockout_elbow_angle: float = 150.0        # Overhead lockout elbow angle
    max_arm_asymmetry: float = 28.0           # Symmetry threshold for form feedback

@dataclass
class LateralRaiseIdentityConfig:
    """Configurable thresholds for Lateral Raise identity validation."""
    min_extended_elbow_angle: float = 118.0   # Arm lever must remain extended (not deeply curled)
    min_lateral_wrist_expansion: float = 1.35 # Wrist separation at peak vs shoulder width
    max_wrist_elevation_above_head: float = 0.08  # Hands should stop near shoulder level, not overhead
    arms_down_angle: float = 38.0             # Arms at sides starting angle
    parallel_raised_angle: float = 72.0       # Arms raised parallel to shoulders angle

@dataclass
class LungeIdentityConfig:
    """Configurable thresholds for Lunge identity validation."""
    min_split_ankle_separation: float = 0.16  # Ankle horizontal or Z separation for split stance
    max_lead_ankle_lift: float = 0.08         # Lead foot must stay grounded
    tall_stance_knee_angle: float = 148.0     # Standing tall starting knee angle
    deep_lunge_knee_angle: float = 108.0      # Deep lunge bottom knee angle

@dataclass
class JumpingJacksIdentityConfig:
    """Configurable thresholds for Jumping Jacks whole-body validation."""
    min_wide_ankle_separation: float = 0.32   # Ankle distance when arms are overhead
    max_narrow_ankle_separation: float = 0.26 # Ankle distance when arms are at sides
    arms_down_angle: float = 50.0             # Arm angle at sides
    arms_overhead_angle: float = 125.0        # Arm angle overhead
    min_overhead_wrist_reach: float = 0.0     # Wrists must reach above head height

@dataclass
class PlankIdentityConfig:
    """Configurable thresholds for Plank isometric hold validation."""
    max_torso_horizontal_angle: float = 35.0  # Torso inclination with horizontal (degrees)
    min_horizontal_body_span: float = 0.40    # Horizontal distance between shoulder and ankle
    elbow_ground_support_offset: float = 0.10 # Elbow/wrist near floor support plane
    min_spine_angle: float = 150.0            # Sag threshold
    max_spine_angle: float = 200.0            # Pike threshold

@dataclass
class IdentityConstraintsConfig:
    """
    Centralized Configuration for Exercise Biomechanical Identity Validation.
    All thresholds are configurable here and can be adjusted without changing detector logic.
    """
    temporal_window_size: int = 4
    mismatch_trigger_count: int = 3
    
    bicep_curl: BicepCurlIdentityConfig = field(default_factory=BicepCurlIdentityConfig)
    squat: SquatIdentityConfig = field(default_factory=SquatIdentityConfig)
    pushup: PushUpIdentityConfig = field(default_factory=PushUpIdentityConfig)
    shoulder_press: ShoulderPressIdentityConfig = field(default_factory=ShoulderPressIdentityConfig)
    lateral_raise: LateralRaiseIdentityConfig = field(default_factory=LateralRaiseIdentityConfig)
    lunge: LungeIdentityConfig = field(default_factory=LungeIdentityConfig)
    jumping_jacks: JumpingJacksIdentityConfig = field(default_factory=JumpingJacksIdentityConfig)
    plank: PlankIdentityConfig = field(default_factory=PlankIdentityConfig)
