from enum import Enum

from pydantic import BaseModel, Field


class ReceiptExtraction(BaseModel):
    """What the model reads from a payment screenshot.

    Every field is nullable so the model can say "I can't see this" instead of
    guessing. Fields have no defaults because the Gemini response schema
    doesn't support them.
    """

    is_payment_confirmation: bool = Field(
        description="True only if the image shows a completed money transfer or payment confirmation."
    )
    amount: float | None = Field(
        description="The amount transferred, as a plain number with no currency symbol. Not an account balance."
    )
    currency: str | None = Field(description="ISO 4217 currency code, for example EUR.")
    payment_date: str | None = Field(description="Date of the transfer in YYYY-MM-DD format.")
    recipient_name: str | None = Field(
        description="Name of the person or account that received the money, not the sender."
    )


class Status(str, Enum):
    VERIFIED = "verified"
    NEEDS_REVIEW = "needs_review"


class VerificationResult(BaseModel):
    status: Status
    reasons: list[str] = Field(
        description="Machine-readable reason codes. Empty when the payment is verified."
    )
    extracted: ReceiptExtraction | None
