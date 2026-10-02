import logging
import secrets
from datetime import date, datetime, timezone
from decimal import Decimal
from functools import lru_cache
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile

from app.config import get_settings
from app.extractor import ExtractionError, GeminiExtractor, ReceiptExtractor
from app.matcher import check_receipt
from app.schemas import Status, VerificationResult

logger = logging.getLogger("merio.verifier")

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

app = FastAPI(title="Merio receipt verifier", version="0.1.0")


def require_service_token(x_service_token: Annotated[str, Header()] = "") -> None:
    """Only the Merio app may call this service. Fails closed if no token is configured."""
    expected = get_settings().service_token
    if not expected or not secrets.compare_digest(x_service_token, expected):
        raise HTTPException(status_code=401, detail="Invalid service token")


@lru_cache
def get_extractor() -> ReceiptExtractor:
    settings = get_settings()
    return GeminiExtractor(api_key=settings.gemini_api_key, model=settings.gemini_model)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/verify",
    response_model=VerificationResult,
    dependencies=[Depends(require_service_token)],
)
async def verify(
    image: Annotated[UploadFile, File(description="Screenshot of the transfer")],
    expected_amount: Annotated[Decimal, Form(gt=0, max_digits=10, decimal_places=2)],
    period_start: Annotated[date, Form(description="First day of the billing period")],
    extractor: Annotated[ReceiptExtractor, Depends(get_extractor)],
    currency: Annotated[str, Form(min_length=3, max_length=3)] = "EUR",
    expected_recipient: Annotated[str | None, Form()] = None,
) -> VerificationResult:
    if image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG or WebP image")

    max_bytes = get_settings().max_upload_bytes
    data = await image.read(max_bytes + 1)
    if not data:
        raise HTTPException(status_code=400, detail="Image is empty")
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail="Image is too large")

    try:
        extraction = await extractor.extract(data, image.content_type)
    except ExtractionError:
        logger.warning("Extraction failed, sending payment to owner review", exc_info=True)
        return VerificationResult(
            status=Status.NEEDS_REVIEW, reasons=["extraction_failed"], extracted=None
        )

    reasons = check_receipt(
        extraction,
        expected_amount=expected_amount,
        currency=currency,
        period_start=period_start,
        today=datetime.now(timezone.utc).date(),
        expected_recipient=expected_recipient,
    )
    return VerificationResult(
        status=Status.VERIFIED if not reasons else Status.NEEDS_REVIEW,
        reasons=reasons,
        extracted=extraction,
    )
