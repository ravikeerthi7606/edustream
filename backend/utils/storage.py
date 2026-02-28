"""
Storage abstraction layer.
Currently supports: local filesystem
Cloud-ready: AWS S3 (uncomment and configure when scaling)
"""
import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile
from config import settings


class LocalStorage:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def save(self, file: UploadFile, subfolder: str = "") -> dict:
        folder = self.base_path / subfolder
        folder.mkdir(parents=True, exist_ok=True)

        ext = Path(file.filename).suffix.lower()
        unique_name = f"{uuid.uuid4()}{ext}"
        file_path = folder / unique_name

        size = 0
        async with aiofiles.open(file_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                await f.write(chunk)
                size += len(chunk)

        return {
            "filename": unique_name,
            "path": str(file_path),
            "size": size,
            "storage": "local",
        }

    async def delete(self, filename: str, subfolder: str = "") -> bool:
        file_path = self.base_path / subfolder / filename
        if file_path.exists():
            file_path.unlink()
            return True
        return False

    def get_path(self, filename: str, subfolder: str = "") -> Path:
        return self.base_path / subfolder / filename

    def exists(self, filename: str, subfolder: str = "") -> bool:
        return (self.base_path / subfolder / filename).exists()


# --- S3Storage (for cloud scaling) ---
# Uncomment and install boto3 when ready to scale:
# pip install boto3
#
# class S3Storage:
#     def __init__(self):
#         import boto3
#         self.s3 = boto3.client(
#             "s3",
#             aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
#             aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
#             region_name=settings.AWS_REGION,
#         )
#         self.bucket = settings.S3_BUCKET_NAME
#
#     async def save(self, file: UploadFile, subfolder: str = "") -> dict:
#         import asyncio
#         ext = Path(file.filename).suffix.lower()
#         unique_name = f"{uuid.uuid4()}{ext}"
#         key = f"{subfolder}/{unique_name}" if subfolder else unique_name
#         content = await file.read()
#         await asyncio.get_event_loop().run_in_executor(
#             None,
#             lambda: self.s3.put_object(Bucket=self.bucket, Key=key, Body=content,
#                                         ContentType=file.content_type)
#         )
#         return {"filename": unique_name, "path": key, "size": len(content), "storage": "s3"}
#
#     def get_presigned_url(self, filename: str, subfolder: str = "", expiry: int = 3600) -> str:
#         key = f"{subfolder}/{filename}" if subfolder else filename
#         return self.s3.generate_presigned_url(
#             "get_object", Params={"Bucket": self.bucket, "Key": key}, ExpiresIn=expiry
#         )


def get_storage():
    """Factory — swap to S3Storage() when scaling to cloud."""
    if settings.STORAGE_BACKEND == "local":
        return LocalStorage(settings.LOCAL_STORAGE_PATH)
    # elif settings.STORAGE_BACKEND == "s3":
    #     return S3Storage()
    raise ValueError(f"Unknown storage backend: {settings.STORAGE_BACKEND}")


storage = get_storage()