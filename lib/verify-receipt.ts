import "server-only";

/**
 * Client for the receipt verifier (merio/verifier).
 *
 * Server-side only: the service requires a shared secret and the Gemini API key
 * never leaves the verifier, so this must stay out of any client bundle.
 *
 * Every failure path resolves to `needs_review` rather than throwing. A member
 * uploading a screenshot should never see an error because a model was rate
 * limited; the owner reviews the payment instead. See verifier/app/main.py,
 * which fails the same way.
 */

/** Mirrors ReceiptExtraction in verifier/app/schemas.py. */
export type ReceiptExtraction = {
  is_payment_confirmation: boolean;
  amount: number | null;
  currency: string | null;
  payment_date: string | null;
  recipient_name: string | null;
};

/** Mirrors VerificationResult in verifier/app/schemas.py. */
export type VerificationResult = {
  status: "verified" | "needs_review";
  reasons: string[];
  extracted: ReceiptExtraction | null;
};

// The Gemini call is the slow part, and the service has no timeout of its own,
// so its caped here.
const TIMEOUT_MS = 20_000;

function needsReview(reason: string): VerificationResult {
  return { status: "needs_review", reasons: [reason], extracted: null };
}

export async function verifyReceipt(
  image: File,
  payment: { amount: string; periodStart: string; recipient?: string },
): Promise<VerificationResult> {
  const baseUrl = process.env.VERIFIER_URL;
  const token = process.env.VERIFIER_TOKEN;

  if (!baseUrl || !token) {
    console.warn("[verify] VERIFIER_URL or VERIFIER_TOKEN is not set");

    return needsReview("verifier_not_configured");
  }

  const form = new FormData();
  form.append("image", image);
  form.append("expected_amount", payment.amount);
  form.append("period_start", payment.periodStart);
  if (payment.recipient) {
    form.append("expected_recipient", payment.recipient);
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/verify`, {
      method: "POST",
      headers: { "X-Service-Token": token },
      body: form,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.warn(`[verify] verifier returned ${res.status}`);

      return needsReview("verifier_error");
    }

    return (await res.json()) as VerificationResult;
  } catch (error) {
    console.warn("[verify] call failed:", error);

    return needsReview("verifier_unavailable");
  }
}
