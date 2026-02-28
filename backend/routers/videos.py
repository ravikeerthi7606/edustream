from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query, Request
from fastapi.responses import StreamingResponse
from datetime import datetime
from typing import Optional
from bson import ObjectId
import math
import os

from database import get_db
from models.schemas import VideoOut, PaginatedVideos
from utils.auth import get_current_user, require_teacher
from utils.storage import storage
from config import settings

router = APIRouter(prefix="/videos", tags=["videos"])

ALLOWED_VIDEO_TYPES = {
    "video/mp4", "video/webm", "video/ogg", "video/avi",
    "video/quicktime", "video/x-matroska", "video/x-ms-wmv"
}


def serialize_video(video: dict, request: Request) -> VideoOut:
    base_url = str(request.base_url).rstrip("/")
    return VideoOut(
        id=str(video["_id"]),
        title=video["title"],
        description=video.get("description", ""),
        subject=video.get("subject", ""),
        filename=video["filename"],
        file_size=video["file_size"],
        duration=video.get("duration"),
        teacher_id=str(video["teacher_id"]),
        teacher_name=video["teacher_name"],
        views=video.get("views", 0),
        created_at=video["created_at"],
        video_url=f"{base_url}/videos/stream/{str(video['_id'])}",
    )


@router.post("/upload", response_model=VideoOut)
async def upload_video(
    request: Request,
    title: str = Form(...),
    description: str = Form(""),
    subject: str = Form(""),
    file: UploadFile = File(...),
    current_user=Depends(require_teacher),
    db=Depends(get_db),
):
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}. Must be a video file.")

    max_size = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
    # Save file
    saved = await storage.save(file, subfolder="")

    if saved["size"] > max_size:
        await storage.delete(saved["filename"])
        raise HTTPException(status_code=413, detail=f"File too large. Max size: {settings.MAX_VIDEO_SIZE_MB}MB")

    video_doc = {
        "title": title,
        "description": description,
        "subject": subject,
        "filename": saved["filename"],
        "original_filename": file.filename,
        "file_size": saved["size"],
        "storage": saved["storage"],
        "teacher_id": ObjectId(current_user["id"]),
        "teacher_name": current_user["name"],
        "views": 0,
        "created_at": datetime.utcnow(),
    }

    result = await db.videos.insert_one(video_doc)
    video_doc["_id"] = result.inserted_id

    return serialize_video(video_doc, request)


@router.get("/stream/{video_id}")
async def stream_video(video_id: str, request: Request, db=Depends(get_db)):
    """
    HTTP Range-based video streaming.
    Works for local storage now. For S3: redirect to presigned URL.
    """
    try:
        video = await db.videos.find_one({"_id": ObjectId(video_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Video not found")

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Increment views (fire-and-forget style)
    await db.videos.update_one({"_id": ObjectId(video_id)}, {"$inc": {"views": 1}})

    # Local storage streaming
    if video.get("storage", "local") == "local":
        file_path = storage.get_path(video["filename"])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Video file not found on disk")

        file_size = os.path.getsize(file_path)
        range_header = request.headers.get("range")

        def iterfile(path, start, end):
            with open(path, "rb") as f:
                f.seek(start)
                remaining = end - start + 1
                chunk_size = 1024 * 1024  # 1MB
                while remaining > 0:
                    chunk = f.read(min(chunk_size, remaining))
                    if not chunk:
                        break
                    remaining -= len(chunk)
                    yield chunk

        if range_header:
            try:
                range_val = range_header.replace("bytes=", "")
                start_str, end_str = range_val.split("-")
                start = int(start_str)
                end = int(end_str) if end_str else file_size - 1
                end = min(end, file_size - 1)
            except Exception:
                start, end = 0, file_size - 1

            content_length = end - start + 1
            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(content_length),
                "Content-Type": "video/mp4",
            }
            return StreamingResponse(
                iterfile(file_path, start, end),
                status_code=206,
                headers=headers,
                media_type="video/mp4",
            )

        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": "video/mp4",
        }
        return StreamingResponse(
            iterfile(file_path, 0, file_size - 1),
            headers=headers,
            media_type="video/mp4",
        )

    # S3 storage: redirect to presigned URL
    # presigned_url = storage.get_presigned_url(video["filename"])
    # from fastapi.responses import RedirectResponse
    # return RedirectResponse(url=presigned_url)
    raise HTTPException(status_code=501, detail="S3 streaming not configured")


@router.get("", response_model=PaginatedVideos)
async def list_videos(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    search: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = {}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    if subject:
        query["subject"] = {"$regex": subject, "$options": "i"}

    total = await db.videos.count_documents(query)
    skip = (page - 1) * per_page

    cursor = db.videos.find(query).sort("created_at", -1).skip(skip).limit(per_page)
    videos = await cursor.to_list(length=per_page)

    return PaginatedVideos(
        videos=[serialize_video(v, request) for v in videos],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total > 0 else 0,
    )


@router.get("/my", response_model=PaginatedVideos)
async def my_videos(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db=Depends(get_db),
    current_user=Depends(require_teacher),
):
    query = {"teacher_id": ObjectId(current_user["id"])}
    total = await db.videos.count_documents(query)
    skip = (page - 1) * per_page
    cursor = db.videos.find(query).sort("created_at", -1).skip(skip).limit(per_page)
    videos = await cursor.to_list(length=per_page)
    return PaginatedVideos(
        videos=[serialize_video(v, request) for v in videos],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total > 0 else 0,
    )


@router.get("/{video_id}", response_model=VideoOut)
async def get_video(video_id: str, request: Request, db=Depends(get_db), current_user=Depends(get_current_user)):
    try:
        video = await db.videos.find_one({"_id": ObjectId(video_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Video not found")
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return serialize_video(video, request)


@router.delete("/{video_id}")
async def delete_video(video_id: str, db=Depends(get_db), current_user=Depends(require_teacher)):
    try:
        video = await db.videos.find_one({"_id": ObjectId(video_id), "teacher_id": ObjectId(current_user["id"])})
    except Exception:
        raise HTTPException(status_code=404, detail="Video not found")

    if not video:
        raise HTTPException(status_code=404, detail="Video not found or not yours")

    await storage.delete(video["filename"])
    await db.videos.delete_one({"_id": ObjectId(video_id)})
    return {"message": "Video deleted successfully"}