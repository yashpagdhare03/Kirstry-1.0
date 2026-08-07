"""
Store Profile & Staff Management Service.
Handles store metadata updates, staff invitations, member listing, and access revocation.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from app.utils import get_supabase_client


# Mock store store fallback for dev/testing when Supabase table isn't populated
DEFAULT_STORES: Dict[str, Dict[str, Any]] = {
    "00000000-0000-0000-0000-000000000001": {
        "id": "00000000-0000-0000-0000-000000000001",
        "store_id": "00000000-0000-0000-0000-000000000001",
        "name": "Yash Kirana & General Store",
        "address": "Shop 12, Main Market Road, Andheri West, Mumbai",
        "gstin": "27AAACK1234F1Z5",
        "phone": "+91 98223 34455",
        "created_at": datetime.utcnow().isoformat(),
    }
}

DEFAULT_MEMBERS: List[Dict[str, Any]] = [
    {
        "id": "mem-owner-1",
        "store_id": "00000000-0000-0000-0000-000000000001",
        "email": "owner@yashstore.com",
        "name": "Yash Pagdhare (Owner)",
        "role": "owner",
        "status": "active",
        "joined_at": datetime.utcnow().isoformat(),
    },
    {
        "id": "mem-staff-2",
        "store_id": "00000000-0000-0000-0000-000000000001",
        "email": "cashier@yashstore.com",
        "name": "Ramesh Kumar (Counter Cashier)",
        "role": "staff",
        "status": "active",
        "joined_at": datetime.utcnow().isoformat(),
    },
]


def get_store_details(store_id: str) -> Dict[str, Any]:
    """Get store profile information."""
    supabase = get_supabase_client()
    try:
        res = supabase.table("stores").select("*").eq("id", store_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception:
        pass

    # Fallback to store dictionary
    if store_id in DEFAULT_STORES:
        return DEFAULT_STORES[store_id]

    return {
        "id": store_id,
        "store_id": store_id,
        "name": "Kirstry Kirana Store",
        "address": "Main Street Market",
        "gstin": "27AAACK0000F1Z1",
        "phone": "+91 98765 43210",
        "created_at": datetime.utcnow().isoformat(),
    }


def update_store_details(store_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Update store profile (owner only)."""
    supabase = get_supabase_client()
    update_fields = {k: v for k, v in data.items() if v is not None}

    try:
        res = supabase.table("stores").update(update_fields).eq("id", store_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception:
        pass

    current = get_store_details(store_id)
    current.update(update_fields)
    DEFAULT_STORES[store_id] = current
    return current


def get_store_members(store_id: str) -> List[Dict[str, Any]]:
    """List staff and owner members of a store."""
    supabase = get_supabase_client()
    try:
        res = supabase.table("store_members").select("*").eq("store_id", store_id).execute()
        if res.data and len(res.data) > 0:
            return res.data
    except Exception:
        pass

    return [m for m in DEFAULT_MEMBERS if m["store_id"] == store_id]


def invite_store_member(store_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Invite a new staff member by email."""
    email = data["email"].strip().lower()
    role = data.get("role", "staff")
    name = data.get("name") or email.split("@")[0].capitalize()

    supabase = get_supabase_client()
    new_member = {
        "id": f"mem-{uuid.uuid4().hex[:8]}",
        "store_id": store_id,
        "email": email,
        "name": name,
        "role": role,
        "status": "invited",
        "joined_at": datetime.utcnow().isoformat(),
    }

    try:
        res = supabase.table("store_members").insert(new_member).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception:
        pass

    DEFAULT_MEMBERS.append(new_member)
    return new_member


def remove_store_member(store_id: str, member_id: str) -> bool:
    """Revoke a staff member's access. Prevents owner self-deletion."""
    members = get_store_members(store_id)
    target = next((m for m in members if m["id"] == member_id), None)

    if not target:
        return False

    if target.get("role") == "owner":
        raise ValueError("Cannot remove store owner membership account")

    supabase = get_supabase_client()
    try:
        supabase.table("store_members").delete().eq("id", member_id).eq("store_id", store_id).execute()
    except Exception:
        pass

    global DEFAULT_MEMBERS
    DEFAULT_MEMBERS = [m for m in DEFAULT_MEMBERS if m["id"] != member_id]
    return True
