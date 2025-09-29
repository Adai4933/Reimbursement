import os
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from src.service import file_service

file_router = APIRouter(prefix="/api/files")

TICKETS_UPLOAD_DIR = "attachments"
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

os.makedirs(TICKETS_UPLOAD_DIR, exist_ok=True)


@file_router.post("/tickets/attachment")
async def upload_files(files: List[UploadFile] = File(...)):
    """
    上传多个文件并返回URL列表（逗号分隔）
    """
    if not files:
        raise HTTPException(status_code=400, detail="没有上传文件")

    urls_string, uploaded_urls = file_service.save_upload_file(files, "static",
                                                               TICKETS_UPLOAD_DIR, MAX_FILE_SIZE)

    return JSONResponse({
        "success": True,
        "data": {
            "message": f"成功上传 {len(uploaded_urls)} 个文件",
            "urls": urls_string,
            "file_count": len(uploaded_urls)
        },
    })
