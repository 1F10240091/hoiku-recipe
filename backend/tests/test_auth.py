"""認証 API のテスト。"""


def test_register_and_login(client):
    res = client.post("/api/v1/auth/register", json={"username": "u1", "password": "password123"})
    assert res.status_code == 201
    assert "access_token" in res.json()

    res = client.post("/api/v1/auth/login", json={"username": "u1", "password": "password123"})
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_register_duplicate(client):
    client.post("/api/v1/auth/register", json={"username": "u2", "password": "password123"})
    res = client.post("/api/v1/auth/register", json={"username": "u2", "password": "password123"})
    assert res.status_code == 409


def test_register_blank_username_rejected(client):
    res = client.post("/api/v1/auth/register", json={"username": "   ", "password": "password123"})
    assert res.status_code == 422


def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={"username": "u3", "password": "password123"})
    res = client.post("/api/v1/auth/login", json={"username": "u3", "password": "wrongpass"})
    assert res.status_code == 401


def test_me_requires_auth(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401


def test_update_username(client):
    res = client.post("/api/v1/auth/register", json={"username": "u4", "password": "password123"})
    token = res.json()["access_token"]
    res = client.put(
        "/api/v1/auth/me",
        json={"username": "u4-new"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["username"] == "u4-new"

    res = client.post("/api/v1/auth/login", json={"username": "u4-new", "password": "password123"})
    assert res.status_code == 200
