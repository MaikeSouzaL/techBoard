# ========================================
# RepairHub — Backend Configuration
# ========================================

import os

# Server
HOST = os.getenv("REPAIRHUB_HOST", "0.0.0.0")
PORT = int(os.getenv("REPAIRHUB_PORT", "8000"))

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

# Create directories
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# CORS
CORS_ORIGINS = [
    "http://localhost:3000",   # Next.js dev
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "app://*",                 # Electron
    "file://*",                # Electron file protocol
]
