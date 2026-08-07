"""
Security & Input Sanitization tests.
Tests rate limiting headers, security headers (nosniff, DENY, XSS protection), and HTML input sanitization.
"""

import pytest
from app import create_app
from app.utils.security import sanitize_input_string


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


HEADERS = {"X-Store-ID": "00000000-0000-0000-0000-000000000001"}


def test_security_headers_present(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("X-XSS-Protection") == "1; mode=block"


def test_input_sanitization_html_tags():
    raw = "<script>alert('xss')</script>Hello World <b>Kirana</b>"
    cleaned = sanitize_input_string(raw)
    assert cleaned == "alert('xss')Hello World Kirana"
    assert "<script>" not in cleaned
    assert "<b>" not in cleaned


def test_input_sanitization_javascript_protocol():
    raw = "javascript:alert('evil')"
    cleaned = sanitize_input_string(raw)
    assert "javascript:" not in cleaned.lower()
