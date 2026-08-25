export const SESSION_COOKIE = "merio_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

async function hmacHex(value: string): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "";

  if (secret.length === 0) {
    throw new Error("AUTH_SECRET must be set in your environment");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;

  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;

  return `${expiresAt}.${await hmacHex(String(expiresAt))}`;
}

export async function isValidSessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const [expiresAt, signature] = token.split(".");
  const expires = Number(expiresAt);

  if (!expires || !signature || expires < Date.now()) {
    return false;
  }

  return safeEqual(signature, await hmacHex(expiresAt));
}

export async function verifyPassword(password: string): Promise<boolean> {
  const expected = process.env.OWNER_PASSWORD ?? "";

  if (expected.length === 0 || password.length === 0) {
    return false;
  }

  return safeEqual(await hmacHex(password), await hmacHex(expected));
}
