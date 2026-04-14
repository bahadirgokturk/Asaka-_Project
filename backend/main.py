from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routers import uretim, kalite, repro, emboss, siparis, planlama, ozet
import auth  # YENİ

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Asakai Hedef Takip", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(uretim.router,   prefix="/api/uretim",   tags=["Üretim"])
app.include_router(kalite.router,   prefix="/api/kalite",   tags=["Kalite"])
app.include_router(repro.router,    prefix="/api/repro",    tags=["Repro"])
app.include_router(emboss.router,   prefix="/api/emboss",   tags=["Emboss"])
app.include_router(siparis.router,  prefix="/api/siparis",  tags=["Sipariş"])
app.include_router(planlama.router, prefix="/api/planlama", tags=["Planlama"])
app.include_router(ozet.router,     prefix="/api/ozet",     tags=["Özet"])
app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])  # YENİ

@app.get("/api/health")
def health():
    return {"status": "ok"}