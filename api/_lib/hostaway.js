/* Shared server-side Hostaway client. Lives in api/_lib: Vercel turns no
   underscore-prefixed path under /api into an endpoint, and nothing under
   /api is served as a static file, so this source never reaches the web
   (it used to be readable at /lib/hostaway.js). Credentials come from Vercel project env vars and are never
   exposed to the browser:
     HOSTAWAY_CLIENT_ID      Hostaway account ID (Settings → Hostaway API).
                             HOSTAWAY_ACCOUNT_ID is still read as a fallback
                             so the existing Vercel setup keeps working.
     HOSTAWAY_CLIENT_SECRET  API key / client secret for that account.
   Docs: https://api.hostaway.com/documentation (Authentication). */

const HOSTAWAY_BASE_URL = "https://api.hostaway.com/v1";
const REQUEST_TIMEOUT_MS = 8000;

let cachedToken = null;
let cachedTokenExpiresAt = 0;

class HostawayError extends Error {
  constructor(message, { status = 0, body = "", path = "" } = {}) {
    super(message);
    this.name = "HostawayError";
    this.status = status;
    this.body = body;
    this.path = path;
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") throw new HostawayError(`Hostaway timed out after ${REQUEST_TIMEOUT_MS}ms`, { status: 504, path: String(url) });
    throw new HostawayError(`Hostaway network error: ${err.message}`, { status: 503, path: String(url) });
  } finally {
    clearTimeout(timer);
  }
}

async function getAccessToken({ forceRefresh = false } = {}) {
  if (!forceRefresh && cachedToken && Date.now() < cachedTokenExpiresAt) return cachedToken;

  const clientId = process.env.HOSTAWAY_CLIENT_ID || process.env.HOSTAWAY_ACCOUNT_ID;
  const clientSecret = process.env.HOSTAWAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new HostawayError("Hostaway credentials are not configured (HOSTAWAY_CLIENT_ID / HOSTAWAY_CLIENT_SECRET)", { status: 500 });
  }

  const res = await fetchWithTimeout(`${HOSTAWAY_BASE_URL}/accessTokens`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "general",
    }),
  });
  if (!res.ok) {
    throw new HostawayError(`Hostaway token request failed (${res.status})`, { status: res.status, body: await res.text().catch(() => ""), path: "/accessTokens" });
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Refresh a little early so a warm invocation never hands out a token
  // that expires mid-request.
  cachedTokenExpiresAt = Date.now() + (Number(data.expires_in) || 0) * 1000 - 60_000;
  return cachedToken;
}

async function hostawayRequest(method, path, { searchParams, body } = {}) {
  const url = new URL(`${HOSTAWAY_BASE_URL}${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
  }
  const send = async (token) => fetchWithTimeout(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-control": "no-cache",
      ...(body ? { "Content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let res = await send(await getAccessToken());
  // A revoked/expired token comes back as 403; get a fresh one and retry once.
  if (res.status === 403 || res.status === 401) res = await send(await getAccessToken({ forceRefresh: true }));

  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) { /* non-JSON error page */ }
  if (!res.ok || (json && json.status === "fail")) {
    throw new HostawayError(`Hostaway ${method} ${path} failed (${res.status})`, { status: res.status, body: text.slice(0, 1000), path });
  }
  return json;
}

const hostawayGet = (path, searchParams) => hostawayRequest("GET", path, { searchParams });
const hostawayPost = (path, body, searchParams) => hostawayRequest("POST", path, { body, searchParams });

module.exports = { hostawayGet, hostawayPost, HostawayError };
