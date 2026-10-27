"""Photo persistence, permissions, normalization and atomic failure."""
import base64
import io
import uuid
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import RecipePhoto


def image_data():
    output = io.BytesIO()
    metadata = Image.Exif()
    metadata[270] = "private metadata"
    Image.new("RGB", (1800, 900), "red").save(output, format="JPEG", exif=metadata)
    return "data:image/jpeg;base64," + base64.b64encode(output.getvalue()).decode()


def create(client, **overrides):
    payload = {"name": "photo-" + uuid.uuid4().hex, "image_data": image_data(), "ingredients": [{"name":"鶏肉"}]}
    payload.update(overrides)
    return client.post("/api/v1/recipe-master", json=payload)


def stranger():
    client = TestClient(app)
    response = client.post('/api/v1/auth/register', json={'username':uuid.uuid4().hex[:20],'password':'test1234'})
    client.headers['Authorization'] = 'Bearer ' + response.json()['access_token']
    return client


def test_photo_roundtrip_and_metadata(auth_client):
    response = create(auth_client)
    assert response.status_code == 201, response.text
    recipe = response.json()
    assert recipe['has_image'] is True
    assert 'image_data' not in recipe
    assert auth_client.get('/api/v1/recipe-master/mine').json()[0]['has_image']
    photo = auth_client.get(f"/api/v1/recipe-master/{recipe['id']}/image")
    assert photo.status_code == 200
    assert photo.headers['content-type'] == 'image/webp'
    assert 'no-store' in photo.headers['cache-control']
    with Image.open(io.BytesIO(photo.content)) as image:
        assert image.width == 1200
        assert not image.getexif()


def test_private_photo_follows_visibility_changes(auth_client):
    recipe = create(auth_client).json()
    other = stranger()
    url = f"/api/v1/recipe-master/{recipe['id']}/image"
    assert TestClient(app).get(url).status_code == 401
    assert other.get(url).status_code == 404
    auth_client.put(f"/api/v1/recipe-master/{recipe['id']}", json={'is_public':True})
    assert other.get(url).status_code == 200
    auth_client.put(f"/api/v1/recipe-master/{recipe['id']}", json={'is_public':False})
    assert other.get(url).status_code == 404


def test_recipe_deletion_removes_photo(auth_client):
    recipe = create(auth_client).json()
    assert auth_client.delete(f"/api/v1/recipe-master/{recipe['id']}").status_code == 204
    with SessionLocal() as db:
        assert db.get(RecipePhoto, recipe['id']) is None


@pytest.mark.parametrize('data', ['data:image/svg+xml;base64,PHN2Zz4=', 'data:image/jpeg;base64,!!!!', 'data:image/png;base64,aGVsbG8=', 'https://example.com/image.jpg'])
def test_invalid_photo_does_not_create_recipe(auth_client, data):
    name = 'invalid-photo-' + uuid.uuid4().hex
    response = create(auth_client, name=name, image_data=data)
    assert response.status_code == 422
    assert auth_client.get('/api/v1/recipe-master/search', params={'keyword': name}).json()['total'] == 0


def test_photo_is_optional(auth_client):
    recipe = create(auth_client, image_data=None).json()
    assert recipe['has_image'] is False
    assert auth_client.get(f"/api/v1/recipe-master/{recipe['id']}/image").status_code == 404
