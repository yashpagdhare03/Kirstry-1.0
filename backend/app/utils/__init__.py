"""
Utils package initialization.
Exports utilities for clean imports across the application.
"""

import importlib

response_helper = importlib.import_module("app.utils.response-helper")
success_response = response_helper.success_response
error_response = response_helper.error_response

supabase_client_module = importlib.import_module("app.utils.supabase-client")
get_supabase_client = supabase_client_module.get_supabase_client

error_handler_module = importlib.import_module("app.utils.error-handler")
register_error_handlers = error_handler_module.register_error_handlers

store_helper_module = importlib.import_module("app.utils.store-helper")
get_request_store_id = store_helper_module.get_request_store_id

auth_middleware_module = importlib.import_module("app.utils.auth-middleware")
require_auth = auth_middleware_module.require_auth
require_owner = auth_middleware_module.require_owner

__all__ = [
    "success_response",
    "error_response",
    "get_supabase_client",
    "register_error_handlers",
    "get_request_store_id",
    "require_auth",
    "require_owner",
]
