import uvicorn
import sys
import io

# Ensure UTF-8 output encoding on Windows consoles
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

if __name__ == "__main__":
    print("[INFO] Starting FitLens AI Movement & Kinematics Engine on http://localhost:8001 ...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=False)
