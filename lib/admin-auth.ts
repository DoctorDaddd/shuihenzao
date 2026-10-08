const encoder = new TextEncoder();
const SESSION_SECONDS = 8 * 60 * 60;

function cookieName(url: string) {
  return new URL(url).protocol === "https:" ? "__Host-brush_admin" : "brush_admin";
}
function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
}
async function key(password: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
export function adminConfigured(password?: string): password is string {
  return (
    typeof password === "string" &&
    password.length >= 16 &&
    password.length <= 256
  );
}
export async function passwordMatches(candidate: string, password: string) {
  const signingKey = await key(password);
  const expected = await crypto.subtle.sign(
    "HMAC", signingKey, encoder.encode(password),
  );
  return crypto.subtle.verify(
    "HMAC", signingKey, expected, encoder.encode(candidate),
  );
}
function cookie(url: string, token: string, maxAge: number) {
  const secure = new URL(url).protocol === "https:" ? "; Secure" : "";
  return `${cookieName(url)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
export async function adminSessionCookie(
  url: string, password: string, now = Date.now(),
) {
  const payload = `${Math.floor(now / 1000) + SESSION_SECONDS}.${crypto.randomUUID()}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await key(password),
    encoder.encode(`${new URL(url).origin}|${payload}`),
  );
  return cookie(url, `${payload}.${hex(signature)}`, SESSION_SECONDS);
}
export function clearAdminCookie(url: string) {
  return cookie(url, "", 0);
}
export async function isAdmin(
  request: Request, password?: string, now = Date.now(),
) {
  if (!adminConfigured(password)) return false;
  const name = cookieName(request.url) + "=";
  const token = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(name))
    ?.slice(name.length);
  if (!token || !/^\d{10}\.[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(token)) return false;
  const [expires, nonce, signature] = token.split(".");
  const seconds = Math.floor(now / 1000);
  if (Number(expires) <= seconds || Number(expires) > seconds + SESSION_SECONDS)
    return false;
  const bytes = Uint8Array.from(signature.match(/../g)!, (pair) => parseInt(pair, 16));
  return crypto.subtle.verify(
    "HMAC",
    await key(password),
    bytes,
    encoder.encode(`${new URL(request.url).origin}|${expires}.${nonce}`),
  );
}
