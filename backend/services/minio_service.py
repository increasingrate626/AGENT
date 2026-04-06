from __future__ import annotations

import io
from pathlib import Path
from config import settings

_minio = None


def get_minio_client():
    """Lazy init MinIO client."""
    global _minio
    if _minio is None:
        from minio import Minio
        from minio.error import S3Error

        endpoint = settings.minio_endpoint
        access_key = settings.minio_access_key
        secret_key = settings.minio_secret_key
        bucket_name = settings.minio_bucket_name
        public_url = settings.minio_public_url

        try:
            client = Minio(
                endpoint.replace("http://", "").replace("https://", ""),
                access_key=access_key,
                secret_key=secret_key,
                secure=endpoint.startswith("https"),
            )
            # Ensure bucket exists
            if not client.bucket_exists(bucket_name):
                client.make_bucket(bucket_name)
            _minio = {
                "client": client,
                "bucket_name": bucket_name,
                "public_url": public_url,
            }
        except Exception as e:
            print(f"Warning: MinIO connection failed: {e}")
            _minio = {"client": None}
    return _minio.get("client")


def upload_file(file_path: str, data: bytes, content_type: str = "audio/mpeg") -> str:
    """Upload file to MinIO and return proxy URL."""
    client = get_minio_client()
    if client is None:
        return f"/api/v1/audio/{file_path.split('/')[-1]}"

    from minio.error import S3Error
    bucket_name = _minio["bucket_name"]

    try:
        client.put_object(
            bucket_name,
            file_path,
            io.BytesIO(data),
            len(data),
            content_type=content_type,
        )
        # Return proxy URL to avoid CORS issues
        return f"/api/v1/audio/{file_path.split('/')[-1]}"
    except S3Error as e:
        print(f"MinIO upload failed: {e}")
        return f"/api/v1/audio/{file_path.split('/')[-1]}"


def upload_file_from_path(file_path: str, local_path: str, content_type: str = "audio/mpeg") -> str:
    """Upload file from local path to MinIO and return proxy URL."""
    client = get_minio_client()
    if client is None:
        return f"/api/v1/audio/{file_path.split('/')[-1]}"

    from minio.error import S3Error
    bucket_name = _minio["bucket_name"]

    try:
        client.fput_object(
            bucket_name,
            file_path,
            local_path,
            content_type=content_type,
        )
        # Return proxy URL to avoid CORS issues
        return f"/api/v1/audio/{file_path.split('/')[-1]}"
    except S3Error as e:
        print(f"MinIO upload failed: {e}")
        return f"/api/v1/audio/{file_path.split('/')[-1]}"


def get_file_url(file_path: str) -> str:
    """Get public URL for a file."""
    if _minio and _minio.get("client"):
        return f"{_minio['public_url']}/{_minio['bucket_name']}/{file_path}"
    return f"/api/v1/audio/{file_path.split('/')[-1]}"


def delete_file(file_path: str) -> bool:
    """Delete file from MinIO."""
    client = get_minio_client()
    if client is None:
        return False

    from minio.error import S3Error
    bucket_name = _minio["bucket_name"]

    try:
        client.remove_object(bucket_name, file_path)
        return True
    except S3Error as e:
        print(f"MinIO delete failed: {e}")
        return False
