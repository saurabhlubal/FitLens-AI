"""
Live Biomechanical Identity Smoke Test
Tests all 10 required real-world vs impostor runtime cases directly against
the running FastAPI endpoint (http://127.0.0.1:8001/api/ai/movement/detect-landmarks).
"""
import requests
import json

ENDPOINT = "http://127.0.0.1:8001/api/ai/movement/detect-landmarks"

def create_base_landmarks():
    # 33 landmarks default standing
    lm = [{"x": 0.5, "y": 0.5, "z": 0.0, "visibility": 0.95} for _ in range(33)]
    # Set standard anatomical hierarchy
    # 11: left shoulder, 12: right shoulder
    lm[11] = {"x": 0.45, "y": 0.30, "z": 0.0, "visibility": 0.95}
    lm[12] = {"x": 0.55, "y": 0.30, "z": 0.0, "visibility": 0.95}
    # 23: left hip, 24: right hip
    lm[23] = {"x": 0.46, "y": 0.60, "z": 0.0, "visibility": 0.95}
    lm[24] = {"x": 0.54, "y": 0.60, "z": 0.0, "visibility": 0.95}
    # 25: left knee, 26: right knee
    lm[25] = {"x": 0.46, "y": 0.78, "z": 0.0, "visibility": 0.95}
    lm[26] = {"x": 0.54, "y": 0.78, "z": 0.0, "visibility": 0.95}
    # 27: left ankle, 28: right ankle
    lm[27] = {"x": 0.46, "y": 0.95, "z": 0.0, "visibility": 0.95}
    lm[28] = {"x": 0.54, "y": 0.95, "z": 0.0, "visibility": 0.95}
    # 13: left elbow, 14: right elbow
    lm[13] = {"x": 0.42, "y": 0.45, "z": 0.0, "visibility": 0.95}
    lm[14] = {"x": 0.58, "y": 0.45, "z": 0.0, "visibility": 0.95}
    # 15: left wrist, 16: right wrist
    lm[15] = {"x": 0.42, "y": 0.60, "z": 0.0, "visibility": 0.95}
    lm[16] = {"x": 0.58, "y": 0.60, "z": 0.0, "visibility": 0.95}
    return lm

def run_case(name, exercise, frame_generator, num_frames=6):
    print(f"\n--- Testing: {name} (Exercise: {exercise}) ---")
    session_data = {}
    rep_count = 0
    final_state = None
    rep_incremented_ever = False
    last_feedback = ""
    stage = "up"
    
    for i in range(num_frames):
        lms = frame_generator(i, num_frames)
        payload = {
            "exerciseName": exercise,
            "landmarks": lms,
            "currentReps": rep_count,
            "currentStage": stage,
            "sessionData": session_data
        }
        res = requests.post(ENDPOINT, json=payload, timeout=5)
        if res.status_code != 200:
            print(f"Error frame {i}: {res.status_code} {res.text}")
            return False, f"HTTP Error {res.status_code}"
        
        data = res.json()
        session_data = data.get("sessionData") or {}
        final_state = data.get("aiState")
        stage = data.get("stage", stage)
        last_feedback = data.get("feedback", "")
        if data.get("repIncremented"):
            rep_incremented_ever = True
            rep_count = data.get("repetitionCount", rep_count + 1)
        else:
            rep_count = data.get("repetitionCount", rep_count)
            
    return True, {
        "final_state": final_state,
        "rep_count": rep_count,
        "rep_incremented": rep_incremented_ever,
        "feedback": last_feedback
    }

# 1. Bicep Curl: Real curl (shoulder anchored, elbow flexes)
def gen_real_curl(i, total):
    lm = create_base_landmarks()
    frac = i / (total - 1)
    # wrist starts at hip (y=0.60), curls up to chest (y=0.32), goes back to 0.60
    if frac <= 0.5:
        progress = frac * 2.0
    else:
        progress = (1.0 - frac) * 2.0
    # Elbow stationary at (0.42, 0.45)
    lm[15]["y"] = 0.60 - progress * 0.28
    return lm

# 2. Bicep Curl Impostor: Arm raise (shoulder swings forward/up > 55 deg)
def gen_arm_raise(i, total):
    lm = create_base_landmarks()
    frac = i / (total - 1)
    # Straight arm swinging up: elbow and wrist move forward/up
    lm[13]["x"] = 0.42 + frac * 0.25
    lm[13]["y"] = 0.45 - frac * 0.20 # elbow rises to shoulder height
    lm[15]["x"] = 0.42 + frac * 0.40
    lm[15]["y"] = 0.60 - frac * 0.35 # wrist rises with elbow (straight arm)
    return lm

# 3. Pushup: Real horizontal pushup
def gen_real_pushup(i, total):
    lm = create_base_landmarks()
    # Horizontal prone body orientation
    lm[11] = {"x": 0.25, "y": 0.70, "z": 0.0, "visibility": 0.95}
    lm[12] = {"x": 0.25, "y": 0.70, "z": 0.0, "visibility": 0.95}
    lm[23] = {"x": 0.55, "y": 0.72, "z": 0.0, "visibility": 0.95}
    lm[24] = {"x": 0.55, "y": 0.72, "z": 0.0, "visibility": 0.95}
    lm[27] = {"x": 0.85, "y": 0.75, "z": 0.0, "visibility": 0.95}
    lm[28] = {"x": 0.85, "y": 0.75, "z": 0.0, "visibility": 0.95}
    # Wrists on floor under shoulders
    lm[15] = {"x": 0.25, "y": 0.88, "z": 0.0, "visibility": 0.95}
    lm[16] = {"x": 0.25, "y": 0.88, "z": 0.0, "visibility": 0.95}
    # Elbows bend
    frac = i / (total - 1)
    bend = 0.12 if (0.2 < frac < 0.8) else 0.0
    lm[13] = {"x": 0.25, "y": 0.76 + bend, "z": 0.0, "visibility": 0.95}
    lm[14] = {"x": 0.25, "y": 0.76 + bend, "z": 0.0, "visibility": 0.95}
    return lm

# 4. Pushup Impostor: Standing upright doing chest press in the air
def gen_standing_pushup(i, total):
    lm = create_base_landmarks()
    # Upright torso (vertical)
    return lm

# 5. Shoulder Press: Real overhead press
def gen_real_shoulder_press(i, total):
    lm = create_base_landmarks()
    frac = i / (total - 1)
    h = 0.35 - (frac if frac <= 0.5 else (1.0 - frac)) * 0.40 # reaches 0.15 (overhead)
    lm[15] = {"x": 0.42, "y": h, "z": 0.0, "visibility": 0.95}
    lm[16] = {"x": 0.58, "y": h, "z": 0.0, "visibility": 0.95}
    lm[13] = {"x": 0.40, "y": (h + 0.40)/2, "z": 0.0, "visibility": 0.95}
    lm[14] = {"x": 0.60, "y": (h + 0.40)/2, "z": 0.0, "visibility": 0.95}
    return lm

# 6. Shoulder Press Impostor: Curls at waist height
def gen_waist_curls(i, total):
    lm = create_base_landmarks()
    # Wrists stay below shoulders (y=0.55 to 0.40, while shoulder is 0.30)
    frac = i / (total - 1)
    lm[15]["y"] = 0.60 - frac * 0.20
    lm[16]["y"] = 0.60 - frac * 0.20
    return lm

# 7. Jumping Jack: Real coordinated whole body
def gen_real_jj(i, total):
    lm = create_base_landmarks()
    frac = i / (total - 1)
    spread = 1.0 if (0.2 < frac < 0.8) else 0.0
    # Arms overhead
    lm[13] = {"x": 0.42 - spread * 0.15, "y": 0.45 - spread * 0.25, "z": 0.0, "visibility": 0.95}
    lm[14] = {"x": 0.58 + spread * 0.15, "y": 0.45 - spread * 0.25, "z": 0.0, "visibility": 0.95}
    lm[15] = {"x": 0.40 - spread * 0.10, "y": 0.60 - spread * 0.50, "z": 0.0, "visibility": 0.95}
    lm[16] = {"x": 0.60 + spread * 0.10, "y": 0.60 - spread * 0.50, "z": 0.0, "visibility": 0.95}
    # Legs spread wide
    lm[27] = {"x": 0.46 - spread * 0.20, "y": 0.95, "z": 0.0, "visibility": 0.95}
    lm[28] = {"x": 0.54 + spread * 0.20, "y": 0.95, "z": 0.0, "visibility": 0.95}
    return lm

# 8. Jumping Jack Impostor: Arm waving only (legs motionless together)
def gen_arm_only_jj(i, total):
    lm = create_base_landmarks()
    frac = i / (total - 1)
    # Wrists and elbows well overhead
    lm[13] = {"x": 0.35, "y": 0.20, "z": 0.0, "visibility": 0.95}
    lm[14] = {"x": 0.65, "y": 0.20, "z": 0.0, "visibility": 0.95}
    lm[15] = {"x": 0.35 + frac * 0.05, "y": 0.10, "z": 0.0, "visibility": 0.95}
    lm[16] = {"x": 0.65 - frac * 0.05, "y": 0.10, "z": 0.0, "visibility": 0.95}
    # Legs stay pinned together (no jumping jack leg spread)
    lm[27] = {"x": 0.49, "y": 0.95, "z": 0.0, "visibility": 0.95}
    lm[28] = {"x": 0.51, "y": 0.95, "z": 0.0, "visibility": 0.95}
    return lm

# 9. Plank: Real horizontal plank hold
def gen_real_plank(i, total):
    lm = create_base_landmarks()
    # Horizontal prone
    lm[11] = {"x": 0.25, "y": 0.75, "z": 0.0, "visibility": 0.95}
    lm[12] = {"x": 0.25, "y": 0.75, "z": 0.0, "visibility": 0.95}
    lm[23] = {"x": 0.55, "y": 0.76, "z": 0.0, "visibility": 0.95}
    lm[24] = {"x": 0.55, "y": 0.76, "z": 0.0, "visibility": 0.95}
    lm[27] = {"x": 0.85, "y": 0.77, "z": 0.0, "visibility": 0.95}
    lm[28] = {"x": 0.85, "y": 0.77, "z": 0.0, "visibility": 0.95}
    # Elbows directly under shoulders
    lm[13] = {"x": 0.25, "y": 0.85, "z": 0.0, "visibility": 0.95}
    lm[14] = {"x": 0.25, "y": 0.85, "z": 0.0, "visibility": 0.95}
    return lm

# 10. Plank Impostor: Standing upright
def gen_standing_plank(i, total):
    lm = create_base_landmarks()
    # Upright standing
    return lm

def main():
    cases = [
        ("1. Real Bicep Curl", "BICEP_CURL", gen_real_curl, 6, True),
        ("2. Arm Raise Impostor (Curl)", "BICEP_CURL", gen_arm_raise, 6, False),
        ("3. Real Push-up", "PUSH_UP", gen_real_pushup, 6, True),
        ("4. Standing Push-up Impostor", "PUSH_UP", gen_standing_pushup, 6, False),
        ("5. Real Shoulder Press", "SHOULDER_PRESS", gen_real_shoulder_press, 6, True),
        ("6. Waist Curls Impostor (Press)", "SHOULDER_PRESS", gen_waist_curls, 6, False),
        ("7. Real Jumping Jack", "JUMPING_JACKS", gen_real_jj, 6, True),
        ("8. Arm-only JJ Impostor", "JUMPING_JACKS", gen_arm_only_jj, 6, False),
        ("9. Real Plank Hold", "PLANK", gen_real_plank, 6, True),
        ("10. Standing Plank Impostor", "PLANK", gen_standing_plank, 6, False),
    ]
    
    all_passed = True
    results_summary = []
    
    for name, ex, gen, frames, expect_valid in cases:
        success, res = run_case(name, ex, gen, frames)
        if not success:
            print(f"FAILED: {name} -> {res}")
            all_passed = False
            results_summary.append((name, f"FAIL ({res})", False))
            continue
            
        final_state = res["final_state"]
        rep_count = res["rep_count"]
        rep_inc = res["rep_incremented"]
        feedback = res["feedback"]
        
        if expect_valid:
            # Expect either valid counting or valid tracking, but NOT EXERCISE_MISMATCH
            passed = final_state != "EXERCISE_MISMATCH"
            verdict = f"PASS ({final_state})" if passed else f"FAIL (unexpected mismatch: {feedback})"
        else:
            # Expect EXERCISE_MISMATCH and rep_count == 0
            passed = (final_state == "EXERCISE_MISMATCH" and rep_count == 0 and not rep_inc)
            verdict = "PASS (rejected as mismatch)" if passed else f"FAIL (state={final_state}, reps={rep_count})"
            
        if not passed:
            all_passed = False
        print(f"Result for {name}: {verdict} [State: {final_state}, Reps: {rep_count}, Feedback: {feedback[:35]}]")
        results_summary.append((name, verdict, passed))
        
    print("\n================== SUMMARY ==================")
    for name, verdict, passed in results_summary:
        status_sym = "[OK]" if passed else "[FAIL]"
        print(f"{status_sym} {name}: {verdict}")
        
    if all_passed:
        print("\nALL 10 SMOKE TEST CASES PASSED PERFECTLY!")
    else:
        print("\nSOME CASES FAILED. CHECK LOGS.")

if __name__ == "__main__":
    main()
