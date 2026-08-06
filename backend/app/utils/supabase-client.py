"""
Supabase client singleton utility.
"""

from typing import Optional
from supabase import create_client, Client
from app.config import Config

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Returns a singleton instance of the Supabase client.
    Initializes using SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY).
    """
    global _supabase_client

    if _supabase_client is None:
        url = Config.SUPABASE_URL
        key = Config.SUPABASE_SERVICE_ROLE_KEY or Config.SUPABASE_ANON_KEY

        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment."
            )

        _supabase_client = create_client(url, key)

    return _supabase_client
