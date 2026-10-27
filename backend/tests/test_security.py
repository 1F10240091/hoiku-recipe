"""セキュリティ対策のテスト（パスワード強度・レート制限）。"""

import os

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import app
from app.middleware import RateLimitMiddleware


def _limited_app(max_requests: int = 2, window_seconds: int = 60, fail: bool = False, trusted_proxy_ips=None) -> TestClient:
    """レート制限付きの独立したアプリを作る。"""
    from fastapi import HTTPException

    test_app = FastAPI()

    @test_app.post("/api/v1/auth/login")
    async def login():
        if fail:
            raise HTTPException(status_code=401, detail="認証失敗")
        return {"ok": True}

    test_app.add_middleware(RateLimitMiddleware, max_requests=max_requests, window_seconds=window_seconds, trusted_proxy_ips=trusted_proxy_ips)
    return TestClient(test_app)


def test_password_too_weak_rejected(client):
    res = client.post("/api/v1/auth/register", json={"username": "weak1", "password": "short"})
    assert res.status_code == 422

    res = client.post("/api/v1/auth/register", json={"username": "weak2", "password": "onlyletters"})
    assert res.status_code == 422

    res = client.post("/api/v1/auth/register", json={"username": "weak3", "password": "12345678"})
    assert res.status_code == 422


def test_password_with_letters_and_digits_accepted(client):
    res = client.post("/api/v1/auth/register", json={"username": "okuser", "password": "abc12345"})
    assert res.status_code == 201


def test_rate_limit_does_not_count_successful_logins():
    tc = _limited_app(max_requests=2)
    for _ in range(6):
        assert tc.post("/api/v1/auth/login").status_code == 200


def test_rate_limit_blocks_excess_failures():
    tc = _limited_app(max_requests=2, fail=True)
    for _ in range(2):
        assert tc.post("/api/v1/auth/login").status_code == 401
    assert tc.post("/api/v1/auth/login").status_code == 429


def test_rate_limit_per_ip_is_independent():
    tc = _limited_app(max_requests=2, fail=True, trusted_proxy_ips=["testclient"])
    for _ in range(2):
        assert tc.post("/api/v1/auth/login", headers={"x-forwarded-for": "1.1.1.1"}).status_code == 401
    assert tc.post("/api/v1/auth/login", headers={"x-forwarded-for": "1.1.1.1"}).status_code == 429
    # 別 IP からは制限されない
    assert tc.post("/api/v1/auth/login", headers={"x-forwarded-for": "2.2.2.2"}).status_code == 401


def test_default_app_has_rate_limit_disabled_in_tests(client):
    # テスト環境ではレート制限が無効化されている（専用テストで検証済み）
    assert os.environ.get("RATE_LIMIT_ENABLED") == "false"
