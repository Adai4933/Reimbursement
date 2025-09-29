import os
from typing import List

from fastapi import UploadFile

from src.utils.file import is_allowed_file, generate_unique_filename


async def save_upload_file(files: List[UploadFile], access_url_prefix, upload_dir, max_file_size=5 * 1024 * 1024) -> {str, int}:
    uploaded_urls = []

    for file in files:
        try:
            # 检查文件类型
            if not is_allowed_file(file.filename):
                raise Exception(f"文件类型不支持: {file.filename}")

            # 生成唯一文件名
            unique_filename = generate_unique_filename(file.filename)
            file_path = os.path.join(upload_dir, unique_filename)

            # 读取并保存文件
            content = await file.read()

            # 检查文件大小
            if len(content) > max_file_size:
                raise Exception(f"文件过大: {file.filename} (最大 {max_file_size // 1024 // 1024}MB)")

            # 保存文件
            with open(file_path, "wb") as f:
                f.write(content)

            # 生成访问URL（根据您的实际域名调整）
            file_url = f"{access_url_prefix}/{unique_filename}"
            uploaded_urls.append(file_url)

        except Exception as e:
            # 如果某个文件上传失败，继续处理其他文件
            print(f"文件上传失败 {file.filename}: {str(e)}")
            continue

    if not uploaded_urls:
        raise Exception("文件上传失败")

    # 用逗号拼接所有URL
    urls_string = ",".join(uploaded_urls)

    return urls_string, uploaded_urls
