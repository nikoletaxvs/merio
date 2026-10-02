"""Measure how accurately the model reads real screenshots.

Put labelled screenshots in evals/receipts/ and describe them in evals/cases.json
(see cases.example.json). Use made-up or redacted receipts: on the free Gemini
tier, what you send may be used to improve Google's models.

Run from the project root:  python -m evals.run_eval
"""

import asyncio
import json
import mimetypes
import sys
from pathlib import Path

from app.config import get_settings
from app.extractor import ExtractionError, GeminiExtractor
from app.matcher import names_match
from app.schemas import ReceiptExtraction

EVAL_DIR = Path(__file__).parent
FIELDS = ["is_payment_confirmation", "amount", "currency", "payment_date", "recipient_name"]
# Stay under the free tier's requests-per-minute limit.
SECONDS_BETWEEN_CALLS = 7


def field_correct(field: str, got, expected) -> bool:
    if expected is None or got is None:
        return got is None and expected is None
    if field == "amount":
        return abs(float(got) - float(expected)) < 0.005
    if field == "recipient_name":
        return names_match(got, expected)
    if field == "currency":
        return got.upper() == expected.upper()
    return got == expected


async def main() -> int:
    cases_file = EVAL_DIR / "cases.json"
    if not cases_file.exists():
        print("No evals/cases.json yet. Copy cases.example.json and add your screenshots.")
        return 1

    cases = json.loads(cases_file.read_text())
    settings = get_settings()
    extractor = GeminiExtractor(settings.gemini_api_key, settings.gemini_model)

    correct = {field: 0 for field in FIELDS}
    fully_correct = 0
    failures: list[str] = []

    for i, case in enumerate(cases):
        path = EVAL_DIR / case["image"]
        mime_type = mimetypes.guess_type(path)[0] or "image/png"
        expected = case["expected"]
        try:
            result: ReceiptExtraction = await extractor.extract(path.read_bytes(), mime_type)
        except ExtractionError as exc:
            failures.append(f"{case['image']}: extraction failed ({exc})")
        else:
            wrong = []
            for field in FIELDS:
                got = getattr(result, field)
                if field_correct(field, got, expected.get(field)):
                    correct[field] += 1
                else:
                    wrong.append(f"{field}: got {got!r}, expected {expected.get(field)!r}")
            if wrong:
                failures.append(f"{case['image']}: " + "; ".join(wrong))
            else:
                fully_correct += 1
        if i < len(cases) - 1:
            await asyncio.sleep(SECONDS_BETWEEN_CALLS)

    total = len(cases)
    print(f"Model: {settings.gemini_model}   Cases: {total}\n")
    for field in FIELDS:
        print(f"  {field:<25} {correct[field]}/{total}  ({correct[field] / total:.0%})")
    print(f"\n  {'all fields correct':<25} {fully_correct}/{total}  ({fully_correct / total:.0%})")
    if failures:
        print("\nFailures:")
        for line in failures:
            print(f"  - {line}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
