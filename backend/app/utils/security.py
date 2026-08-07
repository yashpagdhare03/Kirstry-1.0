"""
Security Utility functions for input sanitization and XSS protection.
"""

import re
from typing import Optional


def sanitize_input_string(val: Optional[str]) -> Optional[str]:
    """
    Strips HTML tags and suspicious scripts from input strings.
    """
    if val is None:
        return None

    # Strip HTML tags
    cleaned = re.sub(r"<[^>]*>", "", val)

    # Strip script protocols
    cleaned = re.sub(r"javascript:", "", cleaned, flags=re.IGNORECASE)

    return cleaned.strip()
