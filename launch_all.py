import os
import sys
import subprocess
import time
import webbrowser

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
frontend_dir = os.path.join(root_dir, "frontend")
venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")

if not os.path.exists(venv_python):
    venv_python = sys.executable

print("=" * 60)
print("       Starting Yash AI 2.0 (Full-Stack Engine)")
print("=" * 60)

# Start Backend
backend_cmd = [
    venv_python,
    "-m", "uvicorn",
    "app.main:app",
    "--reload",
    "--port", "8000",
    "--app-dir", backend_dir
]
print("[1/2] Launching Backend on http://localhost:8000...")
backend_proc = subprocess.Popen(backend_cmd)

# Start Frontend
print("[2/2] Launching Frontend on http://localhost:3000...")
npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=frontend_dir)

time.sleep(3)
print("\n" + "=" * 60)
print("Yash AI 2.0 is live!")
print("- Frontend Web UI: http://localhost:3000")
print("- API Swagger:     http://localhost:8000/docs")
print("=" * 60)

try:
    webbrowser.open("http://localhost:3000")
    backend_proc.wait()
    frontend_proc.wait()
except KeyboardInterrupt:
    print("\nShutting down servers...")
    backend_proc.terminate()
    frontend_proc.terminate()
