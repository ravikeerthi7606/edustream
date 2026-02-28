from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, disconnect_db, get_db
from routers import auth, videos
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="LMS API",
    description="Learning Management System with Video Streaming",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Accept-Ranges", "Content-Length"],
)

app.include_router(auth.router)
app.include_router(videos.router)


@app.get("/health")
async def health():
    return {"status": "ok", "storage": settings.STORAGE_BACKEND}


@app.get("/")
async def root():
    return {"message": "LMS API v1.0.0 — Visit /docs for API documentation"}