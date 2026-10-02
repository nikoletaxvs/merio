# Merio receipt verifier

A small FastAPI service that checks payment screenshots for
[Merio](https://github.com/nikoletaxvs/merio). A member uploads a screenshot of
their bank transfer, a vision model reads the amount, date and recipient, and
the service decides whether the payment can be marked as paid or should go to
the owner for review.

## How it works

1. Merio sends the image plus what the member owes (`expected_amount`,
   `period_start`, optionally `expected_recipient`).
2. A Gemini Flash model reads the screenshot and returns structured JSON,
   validated with Pydantic.
3. Plain Python checks compare what was read against what was owed.
4. The service answers `verified` or `needs_review`, with reason codes.

## Design decisions

- **The model reads, code decides.** The LLM only extracts values. Whether a
  payment counts is decided in `app/matcher.py`, which is deterministic and
  unit tested. Text hidden in an image can at worst make the model misreport a
  value, and a wrong value fails the checks and goes to the owner.
- **Failure means review, never an error.** If the model is rate limited, down,
  or returns junk, the payment goes to the owner instead of the request failing.
- **Nullable fields.** Every extracted field can be `null`, and the prompt tells
  the model not to guess. An unreadable amount is safer than an invented one.
- **Reused screenshots are caught** by rejecting transfers dated before the
  billing period started.
- **Greek and Latin names** are compared after casefolding and stripping
  accents, and word order is ignored, since banks often show `SURNAME NAME`.

## Running locally

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env        # add GEMINI_API_KEY and SERVICE_TOKEN
uvicorn app.main:app --reload
```

Interactive API docs: http://localhost:8000/docs

```bash
pytest                      # unit and API tests, no API key needed
python -m evals.run_eval    # accuracy against labelled screenshots
```

With Docker:

```bash
docker build -t merio-verifier .
docker run --env-file .env -p 8000:8000 merio-verifier
```

## API

`POST /verify` (multipart form, header `X-Service-Token`)

| Field | Required | Example |
| --- | --- | --- |
| `image` | yes | JPEG, PNG or WebP, max 5 MB |
| `expected_amount` | yes | `3.40` |
| `period_start` | yes | `2026-10-01` |
| `currency` | no, default `EUR` | `EUR` |
| `expected_recipient` | no | `Maria Papadopoulou` |

Response:

```json
{
  "status": "needs_review",
  "reasons": ["amount_mismatch"],
  "extracted": {
    "is_payment_confirmation": true,
    "amount": 3.0,
    "currency": "EUR",
    "payment_date": "2026-10-02",
    "recipient_name": "Maria Papadopoulou"
  }
}
```

Reason codes: `not_a_payment_confirmation`, `amount_unreadable`,
`amount_mismatch`, `currency_mismatch`, `date_unreadable`,
`date_before_period`, `date_in_future`, `recipient_unreadable`,
`recipient_mismatch`, `extraction_failed`.

## Calling it from Merio

```ts
// lib/verify-receipt.ts (server-side only)
export type VerificationResult = {
  status: "verified" | "needs_review";
  reasons: string[];
};

export async function verifyReceipt(
  image: File,
  payment: { amount: string; periodStart: string; recipient?: string },
): Promise<VerificationResult> {
  const form = new FormData();
  form.append("image", image);
  form.append("expected_amount", payment.amount);
  form.append("period_start", payment.periodStart);
  if (payment.recipient) form.append("expected_recipient", payment.recipient);

  try {
    const res = await fetch(`${process.env.VERIFIER_URL}/verify`, {
      method: "POST",
      headers: { "X-Service-Token": process.env.VERIFIER_TOKEN! },
      body: form,
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`Verifier returned ${res.status}`);
    return await res.json();
  } catch {
    return { status: "needs_review", reasons: ["verifier_unavailable"] };
  }
}
```

## Privacy

On the free Gemini tier, requests may be used to improve Google's models.
Use made-up or redacted receipts for the demo and evaluation set.

## Limitations

- A name written in Greek on the receipt won't match the same name stored in
  Latin letters, so those payments go to review.
- Screenshots can be edited. This catches honest mistakes and lazy reuse, not a
  determined forger; the owner review step stays in place for that reason.
