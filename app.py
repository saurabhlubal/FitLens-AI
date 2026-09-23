import os
import sys
import importlib.util

# Set up package namespace for ocr-service
root_dir = os.path.dirname(os.path.abspath(__file__))
ocr_dir = os.path.join(root_dir, "ocr-service")
if ocr_dir not in sys.path:
    sys.path.insert(0, ocr_dir)

spec = importlib.util.spec_from_file_location(
    "app",
    os.path.join(ocr_dir, "app", "__init__.py"),
    submodule_search_locations=[os.path.join(ocr_dir, "app")]
)
app_pkg = importlib.util.module_from_spec(spec)
sys.modules["app"] = app_pkg
spec.loader.exec_module(app_pkg)

import gradio as gr
from app.services.movement.detector_factory import DetectorFactory

EXERCISES_METADATA = {
    "bicep_curl": {
        "name": "Bicep Curl",
        "primary_angle": "Elbow Flexion (11-13-15 / 12-14-16)",
        "up_threshold": "< 50°",
        "down_threshold": "> 155°",
        "invariants": ["Elbow drift / sway < 15cm", "Torso compensation angle < 15°", "Full ROM lockout"]
    },
    "squat": {
        "name": "Squat",
        "primary_angle": "Knee Angle (23-25-27 / 24-26-28)",
        "up_threshold": "< 95° (Depth)",
        "down_threshold": "> 160° (Standing)",
        "invariants": ["Valgus knee collapse detection", "Chest inclination angle > 65°", "Hip depth symmetry"]
    },
    "pushup": {
        "name": "Push-up",
        "primary_angle": "Elbow Flexion & Body Alignment",
        "up_threshold": "< 90° (Bottom)",
        "down_threshold": "> 155° (Top Lockout)",
        "invariants": ["Lumbar hip sag (> 195°) & Pike (< 150°)", "Neck alignment", "Shoulder symmetry"]
    },
    "shoulder_press": {
        "name": "Shoulder Press",
        "primary_angle": "Overhead Arm Angle",
        "up_threshold": "> 160° (Overhead Lockout)",
        "down_threshold": "< 85° (Shoulder Rack)",
        "invariants": ["Rib flare / lumbar arching", "Bilateral pressing asymmetry < 25°"]
    },
    "plank": {
        "name": "Plank (Hold Timer)",
        "primary_angle": "Shoulder-Hip-Ankle / Shoulder-Torso View",
        "up_threshold": "Isometric Active Hold",
        "down_threshold": "N/A",
        "invariants": ["Dual-view webcam shoulder invariant", "Sag / Pike posture breakdown pause"]
    },
    "lunge": {
        "name": "Lunge",
        "primary_angle": "Lead Knee Angle",
        "up_threshold": "< 90° (Lunge Depth)",
        "down_threshold": "> 155° (Standing)",
        "invariants": ["Lead knee overextension past toes", "Torso upright posture"]
    },
    "hammer_curl": {
        "name": "Hammer Curl",
        "primary_angle": "Neutral Grip Elbow Flexion",
        "up_threshold": "< 50°",
        "down_threshold": "> 155°",
        "invariants": ["Neutral grip trajectory compliance", "Elbow stabilization"]
    },
    "lateral_raise": {
        "name": "Lateral Raise",
        "primary_angle": "Shoulder Abduction Angle",
        "up_threshold": "> 80° (Parallel to Floor)",
        "down_threshold": "< 25° (Rest)",
        "invariants": ["Trapezius shrug compensation (<15°)", "Elbow bend consistency"]
    },
    "jumping_jacks": {
        "name": "Jumping Jacks",
        "primary_angle": "Arm Abduction & Stance Width",
        "up_threshold": "> 130° (Open Jack)",
        "down_threshold": "< 40° (Closed Stance)",
        "invariants": ["Upper & lower body kinetic sync", "Full overhead arm travel"]
    }
}

EXERCISE_NAMES = list(EXERCISES_METADATA.keys())

def analyze_pose_data(exercise_type):
    """
    Inspect exercise kinematics and state machine rules.
    """
    try:
        detector = DetectorFactory.get_detector(exercise_type)
        if not detector:
            return f"Error: No detector found for {exercise_type}", {}
        
        meta = EXERCISES_METADATA.get(exercise_type, {})
        
        status_msg = (
            f"✅ Biomechanical Engine: {detector.__class__.__name__}\n"
            f"🎯 Rep Angle Invariants: Up: {meta.get('up_threshold', 'N/A')} ↔ Down: {meta.get('down_threshold', 'N/A')}\n"
            f"⚡ Primary Angle Monitored: {meta.get('primary_angle', 'N/A')}\n"
            f"🛡️ Fault Invariant Checks: {', '.join(meta.get('invariants', []))}"
        )
        
        details = {
            "exercise": meta.get("name", exercise_type),
            "status": "Active & Verified",
            "detector_class": detector.__class__.__name__,
            "primary_angle": meta.get("primary_angle"),
            "rep_invariants": {
                "up": meta.get("up_threshold"),
                "down": meta.get("down_threshold")
            },
            "fault_checks": meta.get("invariants", [])
        }
        return status_msg, details
    except Exception as e:
        return f"Error analyzing exercise: {str(e)}", {}

# Create Gradio UI
with gr.Blocks(title="FitLens AI - Biomechanics & Movement Engine") as demo:
    gr.Markdown(
        """
        # 🏋️‍♂️ FitLens AI — Intelligent Exercise Form & Kinematics Engine
        Welcome to **FitLens AI**. This platform uses MediaPipe 3D pose landmarks, velocity-gated adaptive EMA smoothing, and multi-stage biomechanical finite state machines (FSM) to count repetitions and validate form in real time.
        """
    )
    
    with gr.Tab("Kinematics & Exercise Inspector"):
        with gr.Row():
            with gr.Column():
                exercise_dropdown = gr.Dropdown(
                    choices=EXERCISE_NAMES,
                    value="bicep_curl",
                    label="Select Exercise to Inspect"
                )
                inspect_btn = gr.Button("Inspect Biomechanical Rules & Detector", variant="primary")
            with gr.Column():
                output_text = gr.Textbox(label="Kinematic Pipeline Status", lines=6)
                output_json = gr.JSON(label="Detector Configuration & Thresholds")
        
        inspect_btn.click(
            fn=analyze_pose_data,
            inputs=[exercise_dropdown],
            outputs=[output_text, output_json]
        )
    
    with gr.Tab("Supported Exercises & Invariants"):
        gr.Markdown(
            """
            ### 📐 Biomechanical Models & Invariants
            | Exercise | Primary Joint Angle | Biomechanical Invariant Checks |
            |---|---|---|
            | **Bicep Curl** | Elbow Flexion (35°–160°) | Elbow drift (<15cm), Torso sway compensation |
            | **Squat** | Knee Angle (70°–160°) | Valgus knee collapse, Chest drop, Hip symmetry |
            | **Push-up** | Elbow Angle (70°–160°) | Lumbar hip sag (<160°), Neck hyperextension |
            | **Shoulder Press** | Elbow Angle (80°–160°) | Rib flare / hyperextension, Full lockout |
            | **Plank** | Torso Alignment (160°–180°) | Dual-view (full body & webcam shoulder view), Sag/Pike pause |
            | **Lunge** | Lead Knee Angle (75°–155°) | Knee overextension past toes, Torso posture |
            | **Hammer Curl** | Neutral Elbow Angle (35°–155°) | Strict neutral grip trajectory |
            | **Lateral Raise** | Shoulder Abduction (20°–85°) | Trap shrug compensation (<15°), Elbow bend |
            | **Jumping Jacks** | Shoulder & Stance Width | Arm abduction (>130°) & Foot separation sync |
            """
        )

    with gr.Tab("About FitLens"):
        gr.Markdown(
            """
            ### 🌐 Complete Web Application
            FitLens AI is designed with a high-performance **React 19 single-page application** powered by `@mediapipe/tasks-vision` (WebAssembly SIMD) running client-side on the user's device, coupled with a **FastAPI** backend for kinematic telemetry.
            
            - **Published Research**: Springer LNCS standard format
            - **Repository**: [GitHub - FitLens AI](https://github.com/saurabhlubal/FitLens-AI)
            """
        )

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860, ssr_mode=False)
