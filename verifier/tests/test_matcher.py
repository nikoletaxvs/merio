from datetime import date
from decimal import Decimal

import pytest

from app.matcher import check_receipt, names_match
from app.schemas import ReceiptExtraction

TODAY = date(2026, 10, 3)


def receipt(**overrides) -> ReceiptExtraction:
    fields = {
        "is_payment_confirmation": True,
        "amount": 3.40,
        "currency": "EUR",
        "payment_date": "2026-10-02",
        "recipient_name": "Maria Papadopoulou",
    }
    return ReceiptExtraction(**(fields | overrides))


def check(extraction: ReceiptExtraction, **overrides) -> list[str]:
    args = {
        "expected_amount": Decimal("3.40"),
        "currency": "EUR",
        "period_start": date(2026, 10, 1),
        "today": TODAY,
        "expected_recipient": "Maria Papadopoulou",
    }
    return check_receipt(extraction, **(args | overrides))


def test_matching_receipt_is_verified():
    assert check(receipt()) == []


def test_float_rounding_does_not_cause_a_mismatch():
    assert check(receipt(amount=3.3999999)) == []


def test_non_receipt_stops_early():
    assert check(receipt(is_payment_confirmation=False)) == ["not_a_payment_confirmation"]


@pytest.mark.parametrize(
    ("overrides", "reason"),
    [
        ({"amount": 3.00}, "amount_mismatch"),
        ({"amount": None}, "amount_unreadable"),
        ({"currency": "USD"}, "currency_mismatch"),
        ({"payment_date": None}, "date_unreadable"),
        ({"payment_date": "02/10/2026"}, "date_unreadable"),
        ({"payment_date": "2026-09-02"}, "date_before_period"),
        ({"payment_date": "2026-10-10"}, "date_in_future"),
        ({"recipient_name": None}, "recipient_unreadable"),
        ({"recipient_name": "Giorgos Nikolaou"}, "recipient_mismatch"),
    ],
)
def test_each_problem_is_reported(overrides, reason):
    assert check(receipt(**overrides)) == [reason]


def test_missing_currency_is_allowed():
    assert check(receipt(currency=None)) == []


def test_recipient_check_is_skipped_when_not_expected():
    assert check(receipt(recipient_name=None), expected_recipient=None) == []


def test_multiple_problems_are_all_reported():
    reasons = check(receipt(amount=10, payment_date="2026-08-01"))
    assert reasons == ["amount_mismatch", "date_before_period"]


@pytest.mark.parametrize(
    ("extracted", "expected"),
    [
        ("MARIA PAPADOPOULOU", "Maria Papadopoulou"),
        ("Papadopoulou Maria", "Maria Papadopoulou"),
        ("ΜΑΡΙΑ ΠΑΠΑΔΟΠΟΥΛΟΥ", "Μαρία Παπαδοπούλου"),
        ("Νικολέτας", "ΝΙΚΟΛΕΤΑΣ"),
        ("Maria Papadopoulu", "Maria Papadopoulou"),
    ],
)
def test_names_that_should_match(extracted, expected):
    assert names_match(extracted, expected)


@pytest.mark.parametrize(
    ("extracted", "expected"),
    [
        ("Giorgos Nikolaou", "Maria Papadopoulou"),
        ("", "Maria Papadopoulou"),
    ],
)
def test_names_that_should_not_match(extracted, expected):
    assert not names_match(extracted, expected)
