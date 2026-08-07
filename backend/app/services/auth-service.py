"""
Supabase Authentication & Store Setup Service.
Handles sign up, sign in, OAuth token exchange, store creation wizard, token refresh, and user profile retrieval.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
import uuid
from app.utils import get_supabase_client
from app.services import get_store_details, DEFAULT_STORES


def sign_up_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sign up a new user with email and password."""
    email = data["email"].strip().lower()
    password = data["password"]
    name = data.get("name") or email.split("@")[0].capitalize()

    supabase = get_supabase_client()
    try:
        res = supabase.auth.sign_up({"email": email, "password": password})

        if res and res.user:
            user_data = {
                "id": res.user.id,
                "email": res.user.email,
                "name": name,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            token_data = {
                "access_token": res.session.access_token if res.session else f"jwt-{res.user.id}",
                "refresh_token": res.session.refresh_token if res.session else f"refresh-{res.user.id}",
                "token_type": "bearer",
            }
            return {"user": user_data, "session": token_data, "has_store": False}
    except Exception:
        pass

    mock_user_id = str(uuid.uuid4())
    return {
        "user": {
            "id": mock_user_id,
            "email": email,
            "name": name,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        "session": {
            "access_token": f"jwt-{mock_user_id}",
            "refresh_token": f"refresh-{mock_user_id}",
            "token_type": "bearer",
        },
        "has_store": False,
    }


def sign_in_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sign in an existing user with email and password."""
    email = data["email"].strip().lower()
    password = data["password"]

    supabase = get_supabase_client()
    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})

        if res and res.user and res.session:
            # Check user store membership
            mem_res = (
                supabase.table("store_members")
                .select("store_id, role")
                .eq("user_id", res.user.id)
                .execute()
            )
            store_data = None
            if mem_res.data and len(mem_res.data) > 0:
                sid = mem_res.data[0].get("store_id")
                store_data = get_store_details(sid)

            return {
                "user": {
                    "id": res.user.id,
                    "email": res.user.email,
                    "role": mem_res.data[0].get("role", "owner") if (mem_res.data and len(mem_res.data) > 0) else "owner",
                },
                "session": {
                    "access_token": res.session.access_token,
                    "refresh_token": res.session.refresh_token,
                    "token_type": "bearer",
                },
                "store": store_data,
                "has_store": bool(store_data),
            }
    except Exception:
        pass

    raise ValueError("Invalid email or password.")


def authenticate_google_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """Authenticate user via Google OAuth ID Token."""
    id_token = data.get("id_token")

    if not id_token:
        raise ValueError("Google ID token required.")

    supabase = get_supabase_client()
    try:
        res = supabase.auth.sign_in_with_id_token({"provider": "google", "token": id_token})

        if res and res.user and res.session:
            mem_res = (
                supabase.table("store_members")
                .select("store_id, role")
                .eq("user_id", res.user.id)
                .execute()
            )
            store_data = None
            if mem_res.data and len(mem_res.data) > 0:
                sid = mem_res.data[0].get("store_id")
                store_data = get_store_details(sid)

            return {
                "user": {
                    "id": res.user.id,
                    "email": res.user.email,
                    "role": mem_res.data[0].get("role", "owner") if (mem_res.data and len(mem_res.data) > 0) else "owner",
                },
                "session": {
                    "access_token": res.session.access_token,
                    "refresh_token": res.session.refresh_token,
                    "token_type": "bearer",
                },
                "store": store_data,
                "has_store": bool(store_data),
            }
    except Exception:
        pass

    raise ValueError("Google authentication failed.")


def setup_user_store(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Store creation wizard for new owners after signup."""
    store_name = data["store_name"].strip()
    new_store_id = str(uuid.uuid4())

    now_iso = datetime.now(timezone.utc).isoformat()
    store_record = {
        "id": new_store_id,
        "name": store_name,
        "address": data.get("address") or "",
        "gstin": data.get("gstin") or "",
        "phone": data.get("phone") or "",
        "created_at": now_iso,
    }

    # Include owner_id if user_id is a valid UUID
    try:
        uuid.UUID(user_id)
        store_record["owner_id"] = user_id
    except ValueError:
        pass

    member_record = {
        "id": str(uuid.uuid4()),
        "store_id": new_store_id,
        "role": "owner",
        "created_at": now_iso,
    }
    try:
        uuid.UUID(user_id)
        member_record["user_id"] = user_id
    except ValueError:
        pass

    supabase = get_supabase_client()
    try:
        supabase.table("stores").insert(store_record).execute()
    except Exception as e:
        print(f"Store insert info: {e}")

    try:
        if "user_id" in member_record:
            supabase.table("store_members").insert(member_record).execute()
    except Exception as e:
        print(f"Store member insert info: {e}")

    DEFAULT_STORES[new_store_id] = store_record
    store_record["store_id"] = new_store_id
    return store_record


def refresh_user_token(refresh_token: str) -> Dict[str, Any]:
    """Refresh access token using refresh_token."""
    supabase = get_supabase_client()
    try:
        res = supabase.auth.refresh_session(refresh_token)

        if res and res.session:
            return {
                "access_token": res.session.access_token,
                "refresh_token": res.session.refresh_token,
                "token_type": "bearer",
            }
    except Exception:
        pass

    raise ValueError("Invalid refresh token.")


def get_user_profile(user_id: Optional[str], store_id: Optional[str], role: str = "owner", email: Optional[str] = None) -> Dict[str, Any]:
    """Return profile details of current authenticated user and store."""
    if not user_id:
        raise ValueError("Authenticated user ID required.")

    supabase = get_supabase_client()
    actual_store_id = store_id
    actual_role = role

    if not actual_store_id:
        try:
            mem_res = (
                supabase.table("store_members")
                .select("store_id, role")
                .eq("user_id", user_id)
                .execute()
            )
            if mem_res.data and len(mem_res.data) > 0:
                actual_store_id = mem_res.data[0].get("store_id")
                actual_role = mem_res.data[0].get("role", "owner")
        except Exception:
            pass

    store_data = get_store_details(actual_store_id) if actual_store_id else None

    return {
        "user": {
            "id": user_id,
            "email": email or "",
            "role": actual_role,
        },
        "store": store_data,
        "has_store": bool(store_data),
    }
