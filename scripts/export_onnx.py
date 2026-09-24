import os
import sys

# Ensure UTF-8 stdout encoding on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import numpy as np
import torch
import torch.nn as nn

# Ensure ocr-service is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ocr_dir = os.path.join(root_dir, "ocr-service")
if ocr_dir not in sys.path:
    sys.path.insert(0, ocr_dir)

from app.services.movement.body_part_classifier import ResNetBodyPartClassifier

class TorchResNetBlock(nn.Module):
    def __init__(self, dim: int = 32, w1_np=None, b1_np=None, w2_np=None, b2_np=None):
        super().__init__()
        self.fc1 = nn.Linear(dim, dim)
        self.relu1 = nn.ReLU()
        self.fc2 = nn.Linear(dim, dim)
        self.relu2 = nn.ReLU()

        if w1_np is not None:
            self.fc1.weight.data = torch.tensor(w1_np.T, dtype=torch.float32)
            self.fc1.bias.data = torch.tensor(b1_np, dtype=torch.float32)
        if w2_np is not None:
            self.fc2.weight.data = torch.tensor(w2_np.T, dtype=torch.float32)
            self.fc2.bias.data = torch.tensor(b2_np, dtype=torch.float32)

    def forward(self, x):
        residual = x
        h1 = self.relu1(self.fc1(x))
        h2 = self.fc2(h1) + residual
        return self.relu2(h2)

class TorchResNetBodyPartClassifier(nn.Module):
    """
    PyTorch Neural Network for Landmark Anatomical Body-Part Classification:
    Input: [batch_size, 4] -> (x, y, z, visibility)
    Output: [batch_size, 5] -> Softmax Class Probabilities (face, shoulders, arms, torso, legs)
    """
    def __init__(self, in_features: int = 4, hidden_dim: int = 32, num_classes: int = 5):
        super().__init__()
        # Load exact weights from the project's Python ResNetBodyPartClassifier
        numpy_model = ResNetBodyPartClassifier(in_features, hidden_dim, num_classes)

        self.input_layer = nn.Linear(in_features, hidden_dim)
        self.input_layer.weight.data = torch.tensor(numpy_model.w_in.T, dtype=torch.float32)
        self.input_layer.bias.data = torch.tensor(numpy_model.b_in, dtype=torch.float32)
        self.input_relu = nn.ReLU()

        self.res1 = TorchResNetBlock(
            hidden_dim,
            numpy_model.res1.w1, numpy_model.res1.b1,
            numpy_model.res1.w2, numpy_model.res1.b2
        )
        self.res2 = TorchResNetBlock(
            hidden_dim,
            numpy_model.res2.w1, numpy_model.res2.b1,
            numpy_model.res2.w2, numpy_model.res2.b2
        )

        self.output_layer = nn.Linear(hidden_dim, num_classes)
        self.output_layer.weight.data = torch.tensor(numpy_model.w_out.T, dtype=torch.float32)
        self.output_layer.bias.data = torch.tensor(numpy_model.b_out, dtype=torch.float32)
        self.softmax = nn.Softmax(dim=-1)

        self.numpy_model = numpy_model

    def forward(self, x):
        h = self.input_relu(self.input_layer(x))
        h = self.res1(h)
        h = self.res2(h)
        logits = self.output_layer(h)
        return self.softmax(logits)

def export_and_verify():
    print("[INFO] Initializing PyTorch model with exact weights from ResNetBodyPartClassifier...")
    torch_model = TorchResNetBodyPartClassifier()
    torch_model.eval()

    # Output directory for ONNX model in frontend public assets
    output_dir = os.path.join(root_dir, "frontend", "public", "models")
    os.makedirs(output_dir, exist_ok=True)
    onnx_path = os.path.join(output_dir, "body_part_classifier.onnx")

    # Dummy batch of 33 MediaPipe pose landmarks (x, y, z, visibility)
    dummy_input = torch.randn(33, 4, dtype=torch.float32)

    print(f"[EXPORT] Exporting PyTorch model to ONNX: {onnx_path}")
    torch.onnx.export(
        torch_model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=18,
        do_constant_folding=True,
        input_names=["landmarks_input"],
        output_names=["class_probabilities"],
        dynamic_axes={
            "landmarks_input": {0: "batch_size"},
            "class_probabilities": {0: "batch_size"}
        }
    )
    print(f"[OK] Exported ONNX model successfully ({os.path.getsize(onnx_path)} bytes).")

    # Verification with onnxruntime
    import onnxruntime as ort
    session = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])

    # Test with random test vectors
    test_inputs = np.random.randn(33, 4).astype(np.float32)

    # 1. PyTorch inference
    with torch.no_grad():
        torch_out = torch_model(torch.tensor(test_inputs)).numpy()

    # 2. ONNX Runtime inference
    ort_inputs = {"landmarks_input": test_inputs}
    ort_out = session.run(None, ort_inputs)[0]

    # 3. NumPy Reference inference
    numpy_model = torch_model.numpy_model
    numpy_probs = []
    for feat in test_inputs:
        h = np.maximum(0, np.dot(feat, numpy_model.w_in) + numpy_model.b_in)
        h = numpy_model.res1.forward(h)
        h = numpy_model.res2.forward(h)
        logits = np.dot(h, numpy_model.w_out) + numpy_model.b_out
        exp = np.exp(logits - np.max(logits))
        probs = exp / np.sum(exp)
        numpy_probs.append(probs)
    numpy_out = np.array(numpy_probs, dtype=np.float32)

    diff_torch_onnx = float(np.max(np.abs(torch_out - ort_out)))
    diff_numpy_onnx = float(np.max(np.abs(numpy_out - ort_out)))

    print(f"[CHECK] Max absolute difference (PyTorch vs ONNX): {diff_torch_onnx:.2e}")
    print(f"[CHECK] Max absolute difference (NumPy vs ONNX): {diff_numpy_onnx:.2e}")

    assert diff_torch_onnx < 1e-5, f"PyTorch and ONNX differ too much! ({diff_torch_onnx})"
    assert diff_numpy_onnx < 1e-5, f"NumPy and ONNX differ too much! ({diff_numpy_onnx})"
    print("[SUCCESS] Mathematical Parity Verified: ONNX produces IDENTICAL outputs to PyTorch and NumPy models!")

if __name__ == "__main__":
    export_and_verify()
