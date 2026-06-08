from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():

    response = client.get("/")

    assert response.status_code == 200

    assert response.json() == {
        "message": "TechKraft API Running"
    }


def test_register():

    response = client.post(
        "/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "password123"
        }
    )

    assert response.status_code in [200, 400]


def test_login():

    response = client.post(
        "/auth/login",
        json={
            "email": "reviewer@techkraft.com",
            "password": "reviewer123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data