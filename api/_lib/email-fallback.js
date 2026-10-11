/* Email via Resend (https://resend.com), to the team inbox.
   Needs, in Vercel:
     RESEND_API_KEY
     RESEND_FROM_EMAIL   sender on a domain verified in Resend

   Two uses:
   - sendEmail: the "Contact us" message form (api/contact-message.js).
   - sendFallbackEmail: optional backup for booking requests, OFF by default
     (requests go to Hostaway, see api/booking-request.js). It only runs when
     Hostaway fails AND BOOKING_EMAIL_FALLBACK=1 is also set.
   Never throws — callers already have their own error response. */

const TO_EMAIL = "info@mexicoluxestays.com";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function emailConfigured() {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;
}

function emailFallbackEnabled() {
  return process.env.BOOKING_EMAIL_FALLBACK === "1" && emailConfigured();
}

async function sendEmail({ subject, intro, rows, replyTo, logTag = "email" }) {
  if (!emailConfigured()) return false;
  const text = [intro, "", ...rows.map(([label, value]) => `${label}: ${value}`)].filter((l) => l !== undefined).join("\n");
  const html = `<h2>${escapeHtml(subject)}</h2>${intro ? `<p>${escapeHtml(intro)}</p>` : ""}<table cellpadding="6" cellspacing="0">${rows
    .map(([label, value]) => `<tr><td valign="top"><strong>${escapeHtml(label)}</strong></td><td style="white-space:pre-wrap">${escapeHtml(value)}</td></tr>`)
    .join("")}</table>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: TO_EMAIL, reply_to: replyTo, subject, text, html }),
    });
    if (!res.ok) {
      console.error(`[${logTag}] email failed`, res.status, (await res.text()).slice(0, 500));
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[${logTag}] email error`, err.message);
    return false;
  }
}

async function sendFallbackEmail({ subject, rows, replyTo }) {
  if (!emailFallbackEnabled()) return false;
  return sendEmail({
    subject,
    rows,
    replyTo,
    intro: "Hostaway could not be reached, so this request was emailed instead. Please add it to Hostaway manually.",
    logTag: "booking-request",
  });
}

module.exports = { sendEmail, sendFallbackEmail, emailConfigured, emailFallbackEnabled };
