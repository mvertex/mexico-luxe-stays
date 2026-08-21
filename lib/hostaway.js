/* Shared server-side Hostaway client. Lives outside /api so Vercel does not
   treat it as its own route — only files directly under /api become
   endpoints. Reads HOSTAWAY_ACCOUNT_ID / HOSTAWAY_CLIENT_SECRET from Vercel
   project env vars; never exposed to the browser. */

const HOSTAWAY_BASE_URL = "https://api.hostaway.com/v1";

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) return cachedToken;

  const accountId = process.env.HOSTAWAY_ACCOUNT_ID;
  const clientSecret = process.env.HOSTAWAY_CLIENT_SECRET;
  if (!accountId || !clientSecret) {
    throw new Error("Hostaway credentials are not configured (HOSTAWAY_ACCOUNT_ID / HOSTAWAY_CLIENT_SECRET)");
  }

  const res = await fetch(`${HOSTAWAY_BASE_URL}/accessTokens`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: accountId,
      client_secret: clientSecret,
      scope: "general",
    }),
  });
  if (!res.ok) throw new Error(`Hostaway token request failed (${res.status})`);

  const data = await res.json();
  cachedToken = data.access_token;
  // Refresh a little early so a warm invocation never hands out a token
  // that expires mid-request.
  cachedTokenExpiresAt = Date.now() + (Number(data.expires_in) || 0) * 1000 - 60_000;
  return cachedToken;
}

async function hostawayGet(path, searchParams) {
  const token = await getAccessToken();
  const url = new URL(`${HOSTAWAY_BASE_URL}${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
  }
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Hostaway request to ${path} failed (${res.status})`);
  return res.json();
}

module.exports = { hostawayGet };
