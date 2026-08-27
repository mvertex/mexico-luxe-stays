/* POST /api/send-inquiry
   Sends a "Book Now" trip request straight to the team's inbox via the
   Resend API (https://resend.com) instead of relying on WhatsApp.
   Reads RESEND_API_KEY (required) and RESEND_FROM_EMAIL (optional, must be
   on a domain verified in Resend) from Vercel project env vars — never
   exposed to the browser. Until RESEND_API_KEY is set in Vercel, this
   endpoint responds 500 and the form falls back to its WhatsApp status
   message (see assets/js/main.js). */

const TO_EMAIL = "info@mexicoluxestays.com";
const DEFAULT_FROM_EMAIL = "Mexico Luxe Stays <onboarding@resend.dev>";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Email is not configured yet (missing RESEND_API_KEY)" });
    return;
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { villaName, checkin, checkout, bedrooms, adults, children, infants, notes } = body;

  if (!villaName || !checkin || !checkout) {
    res.status(400).json({ error: "Missing required booking fields" });
    return;
  }

  const rows = [
    ["Villa", villaName],
    ["Dates", `${checkin} to ${checkout}`],
    ["Bedrooms", bedrooms],
    ["Adults", adults],
    ["Children (2-12)", children],
    ["Infants (0-2)", infants],
    ["Notes", notes],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  const textBody = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const htmlBody = `
    <h2>New booking request</h2>
    <table cellpadding="6" cellspacing="0">
      ${rows.map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`).join("")}
    </table>
  `;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
        to: TO_EMAIL,
        subject: `Booking request — ${villaName} (${checkin} to ${checkout})`,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      throw new Error(`Resend request failed (${resendRes.status}): ${errText}`);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: err.message || "Email send failed" });
  }
};
