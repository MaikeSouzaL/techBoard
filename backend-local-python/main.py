# ========================================
# RepairHub — Backend Entry Point
# ========================================
# FastAPI application with CORS support.
# Run: python main.py
# Or:  uvicorn main:app --reload --port 8000

import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import HOST, PORT, CORS_ORIGINS
from routes.health import router as health_router
from routes.images import router as images_router

# ===== Lifespan ======
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 50)
    print("  RepairHub Backend v1.0.0")
    print(f"  http://{HOST}:{PORT}")
    print(f"  Docs: http://{HOST}:{PORT}/docs")
    print("=" * 50)
    yield

# ===== App =====
app = FastAPI(
    title="RepairHub API",
    description="Backend para o sistema RepairHub — Assistência Técnica",
    version="1.0.0",
    lifespan=lifespan
)

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Routes =====
app.include_router(health_router)
app.include_router(images_router)





# ===== Run =====
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True,
    )
