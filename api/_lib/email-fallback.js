/* Optional email backup for booking requests (Resend, https://resend.com).
   OFF by default: requests go to Hostaway (see api/booking-request.js).
   This only runs when Hostaway fails AND all of these are set in Vercel:
     BOOKING_EMAIL_FALLBACK=1
     RESEND_API_KEY
     RESEND_FROM_EMAIL   sender on a domain verified in Resend
   Never throws — the caller already has its own error response. */

const TO_EMAIL = "info@mexicoluxestays.com";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function emailFallbackEnabled() {
  return process.env.BOOKING_EMAIL_FALLBACK === "1" && !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;
}

async function sendFallbackEmail({ subject, rows, replyTo }) {
  if (!emailFallbackEnabled()) return false;
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `<h2>${escapeHtml(subject)}</h2><p>Hostaway could not be reached, so this request was emailed instead. Please add it to Hostaway manually.</p><table cellpadding="6" cellspacing="0">${rows
    .map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`)
    .join("")}</table>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: TO_EMAIL, reply_to: replyTo, subject, text, html }),
    });
    if (!res.ok) {
      console.error("[booking-request] email fallback failed", res.status, (await res.text()).slice(0, 500));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[booking-request] email fallback error", err.message);
    return false;
  }
}

module.exports = { sendFallbackEmail, emailFallbackEnabled };
