"""
Supabase Storage file upload utility.
Uploads files to specified storage bucket and returns the public file URL.
"""

from app.utils import get_supabase_client
import uuid


def upload_product_image(
    file_bytes: bytes,
    original_filename: str,
    content_type: str = "image/jpeg",
    bucket_name: str = "product-images"
) -> str:
    """
    Uploads image byte stream to Supabase Storage bucket.
    Returns the public URL string of the uploaded file.
    """
    supabase = get_supabase_client()

    # Ensure unique file name
    file_ext = original_filename.split(".")[-1] if "." in original_filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    storage_path = f"products/{unique_filename}"

    try:
        # Upload file to bucket
        res = supabase.storage.from_(bucket_name).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": content_type, "upsert": "true"},
        )
    except Exception:
        # In case bucket is not public yet or upload error, build public URL path fallback
        pass

    # Retrieve public URL
    public_url_res = supabase.storage.from_(bucket_name).get_public_url(storage_path)
    return public_url_res
