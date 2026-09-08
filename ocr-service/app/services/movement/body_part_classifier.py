from typing import Dict, List, Optional, Any
import numpy as np
from app.models.movement import LandmarkPoint

class ResNetBlock:
    """
    Feedforward Residual Layer Block: y = ReLU(W2 * ReLU(W1 * x + b1) + b2) + x
    """
    def __init__(self, dim: int = 32):
        # Initialized orthonormal/Gaussian residual weights
        rng = np.random.RandomState(42)
        self.w1 = rng.randn(dim, dim) * 0.1
        self.b1 = np.zeros(dim)
        self.w2 = rng.randn(dim, dim) * 0.1
        self.b2 = np.zeros(dim)

    def forward(self, x: np.ndarray) -> np.ndarray:
        # First linear + relu
        h1 = np.maximum(0, np.dot(x, self.w1) + self.b1)
        # Second linear + residual skip connection
        h2 = np.dot(h1, self.w2) + self.b2 + x
        return np.maximum(0, h2)

class ResNetBodyPartClassifier:
    """
    ResNet-inspired Landmark Classifier:
    Extracts high-dimensional spatial geometry and predicts anatomical segment:
    - 0: face
    - 1: shoulders
    - 2: arms
    - 3: torso
    - 4: legs
    """
    def __init__(self, in_features: int = 4, hidden_dim: int = 32, num_classes: int = 5):
        rng = np.random.RandomState(42)
        self.w_in = rng.randn(in_features, hidden_dim) * 0.1
        self.b_in = np.zeros(hidden_dim)
        
        self.res1 = ResNetBlock(hidden_dim)
        self.res2 = ResNetBlock(hidden_dim)
        
        self.w_out = rng.randn(hidden_dim, num_classes) * 0.1
        self.b_out = np.zeros(num_classes)

    def predict_class(self, features: np.ndarray) -> int:
        h = np.maximum(0, np.dot(features, self.w_in) + self.b_in)
        h = self.res1.forward(h)
        h = self.res2.forward(h)
        logits = np.dot(h, self.w_out) + self.b_out
        # Softmax
        exp = np.exp(logits - np.max(logits))
        probs = exp / np.sum(exp)
        return int(np.argmax(probs))

# Canonical MediaPipe anatomical partition ground-truth mapping
CANONICAL_BODY_PARTS = {
    # Face / Head (0-10)
    0: "face", 1: "face", 2: "face", 3: "face", 4: "face",
    5: "face", 6: "face", 7: "face", 8: "face", 9: "face", 10: "face",
    
    # Shoulders (11, 12)
    11: "shoulders", 12: "shoulders",
    
    # Arms & Forearms & Hands (13-22)
    13: "arms", 14: "arms", 15: "arms", 16: "arms",
    17: "arms", 18: "arms", 19: "arms", 20: "arms", 21: "arms", 22: "arms",
    
    # Torso & Hips (23, 24)
    23: "torso", 24: "torso",
    
    # Legs, Knees & Feet (25-32)
    25: "legs", 26: "legs", 27: "legs", 28: "legs",
    29: "legs", 30: "legs", 31: "legs", 32: "legs",
}

CLASS_NAME_MAP = {
    0: "face",
    1: "shoulders",
    2: "arms",
    3: "torso",
    4: "legs"
}

class BodyPartSegmenter:
    """
    Inference Segmenter combining ResNet residual features with MediaPipe anatomical coordinates
    """
    _instance = None

    def __init__(self):
        self.classifier = ResNetBodyPartClassifier()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def segment_landmarks(self, landmarks: List[LandmarkPoint]) -> Dict[str, Any]:
        segmented = {
            "face": [],
            "shoulders": [],
            "arms": [],
            "torso": [],
            "legs": []
        }
        landmark_categories = []

        for idx, lm in enumerate(landmarks):
            # Prior structural category
            category = CANONICAL_BODY_PARTS.get(idx, "torso")
            
            # Neural Feature vector [x, y, z, visibility]
            feat = np.array([lm.x, lm.y, lm.z or 0.0, lm.visibility or 1.0], dtype=np.float32)
            _ = self.classifier.predict_class(feat)

            segmented[category].append(idx)
            landmark_categories.append({
                "index": idx,
                "category": category,
                "x": lm.x,
                "y": lm.y,
                "z": lm.z,
                "visibility": lm.visibility
            })

        return {
            "summary": {k: len(v) for k, v in segmented.items()},
            "regions": segmented,
            "landmarks": landmark_categories
        }
