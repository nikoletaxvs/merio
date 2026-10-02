"""Deterministic checks that decide whether an extracted receipt matches a payment.

The model only *reads* the screenshot. Every decision about whether a payment
counts as paid happens here, in plain code that can be unit tested. This also
limits prompt injection: text in an image can at worst make the model misreport
a value, and a wrong value fails these checks and goes to the owner.
"""

import difflib
import unicodedata
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation

from app.schemas import ReceiptExtraction

AMOUNT_TOLERANCE = Decimal("0.01")
NAME_SIMILARITY_THRESHOLD = 0.8
# Receipts are dated in the payer's local time, the server runs in UTC.
FUTURE_DATE_SLACK = timedelta(days=1)


def normalize_name(name: str) -> str:
    """Casefold, strip accents and collapse whitespace. Handles Greek too (ά -> α, ς -> σ)."""
    decomposed = unicodedata.normalize("NFKD", name.casefold())
    without_accents = "".join(c for c in decomposed if not unicodedata.combining(c))
    return " ".join(without_accents.split())


def names_match(extracted: str, expected: str) -> bool:
    a, b = normalize_name(extracted), normalize_name(expected)
    if not a or not b:
        return False
    # Banks often show "SURNAME NAME", so compare word sets as well as the raw string.
    tokens_a, tokens_b = sorted(a.split()), sorted(b.split())
    if tokens_a == tokens_b:
        return True
    ratio = difflib.SequenceMatcher(None, " ".join(tokens_a), " ".join(tokens_b)).ratio()
    return ratio >= NAME_SIMILARITY_THRESHOLD


def check_receipt(
    extraction: ReceiptExtraction,
    *,
    expected_amount: Decimal,
    currency: str,
    period_start: date,
    today: date,
    expected_recipient: str | None = None,
) -> list[str]:
    """Return reason codes for everything that doesn't check out. Empty list = verified."""
    if not extraction.is_payment_confirmation:
        return ["not_a_payment_confirmation"]

    reasons: list[str] = []

    if extraction.amount is None:
        reasons.append("amount_unreadable")
    else:
        try:
            paid = Decimal(str(extraction.amount))
        except InvalidOperation:
            reasons.append("amount_unreadable")
        else:
            if abs(paid - expected_amount) > AMOUNT_TOLERANCE:
                reasons.append("amount_mismatch")

    # A missing currency is allowed: many banking apps only show "€" and the
    # amount check already passed or failed on its own.
    if extraction.currency and extraction.currency.strip().upper() != currency.upper():
        reasons.append("currency_mismatch")

    paid_on = _parse_date(extraction.payment_date)
    if paid_on is None:
        reasons.append("date_unreadable")
    elif paid_on < period_start:
        # Catches last month's screenshot being reused.
        reasons.append("date_before_period")
    elif paid_on > today + FUTURE_DATE_SLACK:
        reasons.append("date_in_future")

    if expected_recipient:
        if not extraction.recipient_name:
            reasons.append("recipient_unreadable")
        elif not names_match(extraction.recipient_name, expected_recipient):
            reasons.append("recipient_mismatch")

    return reasons


def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value.strip())
    except ValueError:
        return None
