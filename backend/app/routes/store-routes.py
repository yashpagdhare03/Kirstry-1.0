"""
Store Profile & Staff Management API routes blueprint.
Handles store metadata updates, staff invitations, member listing, and access revocation.
"""

from flask import Blueprint, request
from pydantic import ValidationError
from app.utils import success_response, error_response, get_request_store_id, require_auth, require_owner
from app.schemas import UpdateStoreSchema, InviteStoreMemberSchema
from app.services import (
    get_store_details,
    update_store_details,
    get_store_members,
    invite_store_member,
    remove_store_member,
)

store_bp = Blueprint("store", __name__)


@store_bp.route("/api/store", methods=["GET"])
@require_auth
def get_store_route():
    """Get store profile details."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    store = get_store_details(store_id)
    return success_response(data=store, message="Store details retrieved successfully")


@store_bp.route("/api/store", methods=["PUT"])
@require_owner
def update_store_route():
    """Update store profile details (owner only)."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = UpdateStoreSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    updated = update_store_details(store_id, schema.model_dump(exclude_unset=True))
    return success_response(data=updated, message="Store details updated successfully")


@store_bp.route("/api/store/members", methods=["GET"])
@require_auth
def get_members_route():
    """List staff and owner members of store."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    members = get_store_members(store_id)
    return success_response(data={"members": members}, message="Store members retrieved successfully")


@store_bp.route("/api/store/members/invite", methods=["POST"])
@require_owner
def invite_member_route():
    """Invite a new staff member by email (owner only)."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    json_data = request.get_json() or {}
    try:
        schema = InviteStoreMemberSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    member = invite_store_member(store_id, schema.model_dump(exclude_unset=True))
    return success_response(data=member, message="Staff invitation sent successfully", status_code=201)


@store_bp.route("/api/store/members/<member_id>", methods=["DELETE"])
@require_owner
def delete_member_route(member_id: str):
    """Revoke staff member access (owner only). Prevents owner self-deletion."""
    store_id = get_request_store_id()
    if not store_id:
        return error_response("Store ID required in header (X-Store-ID)", status_code=400)

    try:
        removed = remove_store_member(store_id, member_id)
        if not removed:
            return error_response("Member not found", status_code=404)
        return success_response(data={"id": member_id}, message="Staff member access revoked successfully")
    except ValueError as e:
        return error_response(message=str(e), status_code=400)
    except Exception as e:
        return error_response(message=str(e), status_code=500)
