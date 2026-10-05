import subprocess
import sys
import os

# Ensure UTF-8 output on Windows consoles to prevent charmap errors
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")

if not os.path.exists(venv_python):
    venv_python = sys.executable

cmd = [
    venv_python,
    "-m", "uvicorn",
    "app.main:app",
    "--reload",
    "--port", "8000",
    "--app-dir", backend_dir
]

print("=" * 60)
print("[STARTING] Yash AI Backend Server...")
print("[API URL]  http://localhost:8000")
print("[SWAGGER]  http://localhost:8000/docs")
print("=" * 60)

try:
    subprocess.run(cmd)
except KeyboardInterrupt:
    print("\nServer stopped.")
