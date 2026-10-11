/* POST /api/contact-message
   "Contact us" page (contact-us.html) → email to info@mexicoluxestays.com
   via Resend (api/_lib/email-fallback.js). Reply-To is the guest, so the
   team answers straight from the inbox. Nothing goes to Hostaway: this is
   for general questions, not booking requests (those use
   /api/booking-request from contact.html).

   Body (JSON), sent by assets/js/main.js ([data-message-form]):
     name, email, phone (optional), subject (optional), message, lang
     company     honeypot — real visitors never see or fill it */

const { sendEmail, emailConfigured } = require("./_lib/email-fallback");

const CONTACT = { whatsapp: "+52 984 807 9475", email: "info@mexicoluxestays.com" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Same per-instance limits as api/booking-request.js. */
const RATE_LIMIT = { windowMs: 10 * 60 * 1000, max: 5 };
const recentByIp = new Map();
const recentSubmissions = new Map(); // dedupe key → timestamp
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

function rateLimited(ip) {
  const now = Date.now();
  const hits = (recentByIp.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  hits.push(now);
  recentByIp.set(ip, hits);
  return hits.length > RATE_LIMIT.max;
}

const clean = (v, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function fail(res, status, code, extra = {}) {
  res.status(status).json({ ok: false, code, contact: CONTACT, ...extra });
}

function validate(body) {
  const data = {
    name: clean(body.name, 120),
    email: clean(body.email, 120).toLowerCase(),
    phone: clean(body.phone, 40),
    subject: clean(body.subject, 150),
    message: String(body.message ?? "").trim().slice(0, 4000),
    lang: body.lang === "es" ? "es" : "en",
  };
  if (!data.name) return { error: "name" };
  if (!EMAIL_RE.test(data.email)) return { error: "email" };
  if (data.phone && !/^\+?[\d\s().-]{7,25}$/.test(data.phone)) return { error: "phone" };
  if (data.message.length < 2) return { error: "message" };
  return { data };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, code: "method" });
    return;
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};

  // Honeypot filled → pretend success, send nothing.
  if (clean(body.company)) {
    res.status(200).json({ ok: true });
    return;
  }
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  if (rateLimited(ip)) return fail(res, 429, "rate_limited");

  const { data, error } = validate(body);
  if (error) return fail(res, 400, "invalid", { field: error });

  const dedupeKey = `${data.email}|${data.message}`;
  const seenAt = recentSubmissions.get(dedupeKey);
  if (seenAt && Date.now() - seenAt < DEDUPE_WINDOW_MS) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  if (!emailConfigured()) {
    console.error("[contact-message] RESEND_API_KEY / RESEND_FROM_EMAIL not set — message not sent");
    return fail(res, 503, "upstream");
  }

  const sent = await sendEmail({
    subject: `Website message — ${data.name}${data.subject ? ` — ${data.subject}` : ""}`,
    intro: "New message from the Contact us form on mexicoluxestays.com. Reply to this email to answer the guest.",
    replyTo: data.email,
    logTag: "contact-message",
    rows: [
      ["Name", data.name],
      ["Email", data.email],
      ["Phone / WhatsApp", data.phone || "—"],
      ["Subject", data.subject || "—"],
      ["Language", data.lang === "es" ? "Spanish" : "English"],
      ["Message", data.message],
    ],
  });
  if (!sent) return fail(res, 502, "upstream");

  recentSubmissions.set(dedupeKey, Date.now());
  res.status(200).json({ ok: true });
};
