"""Validate and normalize recipe photos before persistent storage."""
import base64
import binascii
import io
import warnings
from fastapi import HTTPException
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_IMAGE_BYTES = 2 * 1024 * 1024
MAX_PIXELS = 20_000_000


def normalize_photo(value: str) -> bytes:
    try:
        header, encoded = value.split(",", 1)
        if header not in {"data:image/jpeg;base64", "data:image/png;base64", "data:image/webp;base64"}:
            raise ValueError
        data = base64.b64decode(encoded, validate=True)
        if not data or len(data) > MAX_IMAGE_BYTES:
            raise ValueError
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as source:
                if source.format not in {"JPEG", "PNG", "WEBP"} or source.width * source.height > MAX_PIXELS:
                    raise ValueError
                if getattr(source, "n_frames", 1) > 1:
                    raise ValueError
                image = ImageOps.exif_transpose(source).convert("RGB")
                image.thumbnail((1200, 1200))
                output = io.BytesIO()
                # Re-encoding omits EXIF/GPS and untrusted embedded metadata.
                image.save(output, format="WEBP", quality=80, method=4)
                result = output.getvalue()
                if len(result) > 512 * 1024:
                    raise ValueError
                return result
    except (ValueError, binascii.Error, OSError, UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(status_code=422, detail="画像を読み込めません。JPEG・PNG・WebPの静止画を選び直してください。")
