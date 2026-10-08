import { afterEach, describe, expect, it, vi } from "vitest";

import { verifyReceipt } from "./verify-receipt";

const image = new File(["fake"], "proof.png", { type: "image/png" });

const payment = { amount: "3.40", periodStart: "2026-10-01" };

function stubVerifier(url: string) {
  vi.stubEnv("VERIFIER_URL", url);
  vi.stubEnv("VERIFIER_TOKEN", "s3cret");
}

function okJson(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("verifyReceipt", () => {
  it("returns the verifier verdict", async () => {
    stubVerifier("https://verifier.example");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        okJson({
          status: "needs_review",
          reasons: ["amount_mismatch"],
          extracted: { is_payment_confirmation: true, amount: 3 },
        }),
      ),
    );

    expect(await verifyReceipt(image, payment)).toEqual({
      status: "needs_review",
      reasons: ["amount_mismatch"],
      extracted: { is_payment_confirmation: true, amount: 3 },
    });
  });

  it("posts the form and the service token", async () => {
    stubVerifier("https://verifier.example");
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({ status: "verified", reasons: [], extracted: null }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await verifyReceipt(image, {
      ...payment,
      recipient: "Maria Papadopoulou",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("https://verifier.example/verify");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "X-Service-Token": "s3cret" });

    const body = init.body as FormData;

    expect(body.get("expected_amount")).toBe("3.40");
    expect(body.get("period_start")).toBe("2026-10-01");
    expect(body.get("expected_recipient")).toBe("Maria Papadopoulou");
    expect(body.get("image")).toBe(image);
  });

  it("omits the recipient when there isn't one", async () => {
    stubVerifier("https://verifier.example");
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({ status: "verified", reasons: [], extracted: null }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await verifyReceipt(image, payment);

    const body = (fetchMock.mock.calls[0][1] as RequestInit).body as FormData;

    expect(body.has("expected_recipient")).toBe(false);
  });

  it("keeps a PythonAnywhere URL working", async () => {
    stubVerifier("http://username.pythonanywhere.com/");
    const fetchMock = vi.fn().mockResolvedValue(
      okJson({ status: "verified", reasons: [], extracted: null }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await verifyReceipt(image, payment);

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://username.pythonanywhere.com/verify",
    );
  });

  it("fails closed when the env vars are missing", async () => {
    vi.stubEnv("VERIFIER_URL", "");
    vi.stubEnv("VERIFIER_TOKEN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(await verifyReceipt(image, payment)).toEqual({
      status: "needs_review",
      reasons: ["verifier_not_configured"],
      extracted: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("turns an error response into a review, not an exception", async () => {
    stubVerifier("https://verifier.example");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("nope", { status: 502 })),
    );

    expect(await verifyReceipt(image, payment)).toEqual({
      status: "needs_review",
      reasons: ["verifier_error"],
      extracted: null,
    });
  });

  it("survives the verifier being unreachable or slow", async () => {
    stubVerifier("https://verifier.example");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    expect(await verifyReceipt(image, payment)).toEqual({
      status: "needs_review",
      reasons: ["verifier_unavailable"],
      extracted: null,
    });
  });
});
