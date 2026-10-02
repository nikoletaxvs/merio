import pytest
from fastapi.testclient import TestClient

from app.extractor import ExtractionError
from app.main import app, get_extractor
from app.schemas import ReceiptExtraction

HEADERS = {"X-Service-Token": "test-token"}
PNG = ("receipt.png", b"\x89PNG fake image bytes", "image/png")
FORM = {"expected_amount": "3.40", "period_start": "2026-01-01"}


class FakeExtractor:
    def __init__(self, result: ReceiptExtraction | Exception) -> None:
        self.result = result

    async def extract(self, image: bytes, mime_type: str) -> ReceiptExtraction:
        if isinstance(self.result, Exception):
            raise self.result
        return self.result


@pytest.fixture
def client():
    yield TestClient(app)
    app.dependency_overrides.clear()


def use_extractor(result):
    app.dependency_overrides[get_extractor] = lambda: FakeExtractor(result)


def good_receipt() -> ReceiptExtraction:
    return ReceiptExtraction(
        is_payment_confirmation=True,
        amount=3.40,
        currency="EUR",
        payment_date="2026-01-02",
        recipient_name="Maria Papadopoulou",
    )


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_rejects_missing_token(client):
    use_extractor(good_receipt())
    response = client.post("/verify", files={"image": PNG}, data=FORM)
    assert response.status_code == 401


def test_rejects_wrong_token(client):
    use_extractor(good_receipt())
    response = client.post(
        "/verify", files={"image": PNG}, data=FORM, headers={"X-Service-Token": "nope"}
    )
    assert response.status_code == 401


def test_verifies_matching_receipt(client):
    use_extractor(good_receipt())
    response = client.post("/verify", files={"image": PNG}, data=FORM, headers=HEADERS)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "verified"
    assert body["reasons"] == []
    assert body["extracted"]["amount"] == 3.40


def test_mismatch_goes_to_review(client):
    use_extractor(good_receipt().model_copy(update={"amount": 1.0}))
    response = client.post("/verify", files={"image": PNG}, data=FORM, headers=HEADERS)
    assert response.json()["status"] == "needs_review"
    assert response.json()["reasons"] == ["amount_mismatch"]


def test_model_failure_goes_to_review_instead_of_erroring(client):
    use_extractor(ExtractionError("rate limited"))
    response = client.post("/verify", files={"image": PNG}, data=FORM, headers=HEADERS)
    assert response.status_code == 200
    assert response.json() == {
        "status": "needs_review",
        "reasons": ["extraction_failed"],
        "extracted": None,
    }


def test_rejects_non_image_upload(client):
    use_extractor(good_receipt())
    response = client.post(
        "/verify",
        files={"image": ("notes.txt", b"hello", "text/plain")},
        data=FORM,
        headers=HEADERS,
    )
    assert response.status_code == 415


def test_rejects_invalid_amount(client):
    use_extractor(good_receipt())
    response = client.post(
        "/verify",
        files={"image": PNG},
        data=FORM | {"expected_amount": "-5"},
        headers=HEADERS,
    )
    assert response.status_code == 422
