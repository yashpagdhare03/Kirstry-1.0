"""
Authentication & Store Setup API routes blueprint.
Handles signup, login, Google OAuth, store creation wizard, token refresh, and profile retrieval.
"""

from flask import Blueprint, request, g
from pydantic import ValidationError
from app.utils import success_response, error_response, require_auth
from app.schemas import (
    SignUpSchema,
    LoginSchema,
    GoogleAuthSchema,
    StoreSetupSchema,
    RefreshTokenSchema,
)
from app.services import (
    sign_up_user,
    sign_in_user,
    authenticate_google_user,
    setup_user_store,
    refresh_user_token,
    get_user_profile,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/auth/signup", methods=["POST"])
def signup_route():
    """Sign up a new user with email and password."""
    json_data = request.get_json() or {}
    try:
        schema = SignUpSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    result = sign_up_user(schema.model_dump(exclude_unset=True))
    return success_response(data=result, message="User account created successfully", status_code=201)


@auth_bp.route("/api/auth/login", methods=["POST"])
def login_route():
    """Sign in an existing user with email and password."""
    json_data = request.get_json() or {}
    try:
        schema = LoginSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    result = sign_in_user(schema.model_dump(exclude_unset=True))
    return success_response(data=result, message="Sign in successful")


@auth_bp.route("/api/auth/google", methods=["POST"])
def google_auth_route():
    """Authenticate user via Google OAuth ID token."""
    json_data = request.get_json() or {}
    try:
        schema = GoogleAuthSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    result = authenticate_google_user(schema.model_dump(exclude_unset=True))
    return success_response(data=result, message="Google authentication successful")


@auth_bp.route("/api/auth/store-setup", methods=["POST"])
@require_auth
def store_setup_route():
    """Store creation wizard for new owners."""
    json_data = request.get_json() or {}
    try:
        schema = StoreSetupSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    user_id = getattr(g, "user_id", "user-owner-1")
    store = setup_user_store(user_id, schema.model_dump(exclude_unset=True))
    return success_response(data=store, message="Store created successfully", status_code=201)


@auth_bp.route("/api/auth/refresh", methods=["POST"])
def refresh_token_route():
    """Refresh JWT access token."""
    json_data = request.get_json() or {}
    try:
        schema = RefreshTokenSchema(**json_data)
    except ValidationError as err:
        return error_response(message="Validation error", status_code=400, data=err.errors())

    tokens = refresh_user_token(schema.refresh_token)
    return success_response(data=tokens, message="Token refreshed successfully")


@auth_bp.route("/api/auth/me", methods=["GET"])
@require_auth
def get_me_route():
    """Get authenticated user profile and active store tenancy."""
    user_id = getattr(g, "user_id", None)
    store_id = getattr(g, "store_id", None)
    role = getattr(g, "user_role", "owner")
    email = getattr(g, "user_email", None)

    profile = get_user_profile(user_id, store_id, role, email)
    return success_response(data=profile, message="User profile retrieved successfully")


@auth_bp.route("/api/auth/sync-profile", methods=["POST"])
@require_auth
def sync_profile_route():
    """Sync Supabase user profile & store membership upon OAuth sign-in."""
    user_id = getattr(g, "user_id", None)
    store_id = getattr(g, "store_id", None)
    role = getattr(g, "user_role", "owner")
    email = getattr(g, "user_email", None)

    profile = get_user_profile(user_id, store_id, role, email)
    status = "exists" if profile.get("has_store") else "created"
    return success_response(
        data={"status": status, **profile},
        message="Profile synchronized successfully",
    )

