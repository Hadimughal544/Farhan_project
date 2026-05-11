import io
import hashlib
import time
import secrets
import requests
import cloudinary
import cloudinary.uploader

from app.config import settings


class AvatarService:
    @staticmethod
    def _dicebear_seed(name: str, gender: str | None) -> str:
        s = f"{name}-{gender or 'unspecified'}"
        # normalize and create short seed
        return hashlib.sha1(s.encode('utf-8')).hexdigest()[:24]

    @staticmethod
    def generate_dicebear_svg(seed: str) -> bytes:
        url = f"https://api.dicebear.com/9.x/adventurer/svg?seed={seed}"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.content

    @staticmethod
    def upload_svg_to_cloudinary(svg_bytes: bytes, folder: str | None = "avatars") -> str:
        cloud_name = settings.cloudinary_cloud_name
        api_key = settings.cloudinary_api_key
        api_secret = settings.cloudinary_api_secret
        if not (cloud_name and api_key and api_secret):
            raise RuntimeError("Cloudinary credentials are not configured in environment")

        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )

        public_id = f"{folder}/{int(time.time())}-{secrets.token_hex(6)}"
        # Cloudinary can accept file-like objects
        file_obj = io.BytesIO(svg_bytes)
        file_obj.name = "avatar.svg"

        result = cloudinary.uploader.upload(
            file_obj,
            public_id=public_id,
            resource_type="image",
            format="svg",
            overwrite=True,
        )
        return result.get("secure_url")

    @staticmethod
    def generate_and_upload_from_name(full_name: str, gender: str | None) -> str:
        seed = AvatarService._dicebear_seed(full_name, gender)
        svg = AvatarService.generate_dicebear_svg(seed)
        return AvatarService.upload_svg_to_cloudinary(svg)

    @staticmethod
    def upload_fileobj_to_cloudinary(file_bytes: bytes, filename: str | None = None, folder: str | None = "avatars") -> str:
        cloud_name = settings.cloudinary_cloud_name
        api_key = settings.cloudinary_api_key
        api_secret = settings.cloudinary_api_secret
        if not (cloud_name and api_key and api_secret):
            raise RuntimeError("Cloudinary credentials are not configured in environment")

        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )

        public_id = f"{folder}/{int(time.time())}-{secrets.token_hex(6)}"
        file_obj = io.BytesIO(file_bytes)
        if filename:
            file_obj.name = filename
        else:
            file_obj.name = "upload"

        result = cloudinary.uploader.upload(
            file_obj,
            public_id=public_id,
            resource_type="image",
            overwrite=True,
        )
        return result.get("secure_url")
