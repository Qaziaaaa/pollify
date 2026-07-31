// ===== MAIL HELPER =====
// Sends emails via Brevo's HTTP API (port 443) when BREVO_API_KEY is set,
// falling back to SMTP. Returns boolean success.
//
// WHY HTTP API FIRST: Render free tier (and other cloud hosts) often can't
// reach SMTP relay port 587 — we saw "Email failed: Connection timeout".
// HTTPS on port 443 is never blocked, so Brevo's REST API is the reliable path.

import getTransporter from "../config/mailer.js";

// Send via Brevo REST API (https://developers.brevo.com/reference/sendtransacemail)
async function sendViaApi({ to, subject, text }) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
            sender: { email: process.env.EMAIL_FROM },
            to: [{ email: to }],
            subject,
            textContent: text,
        }),
    });
    if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Brevo API ${res.status}: ${detail.slice(0, 200)}`);
    }
    return true;
}

const sendMail = async ({ to, subject, text }) => {
    // Preferred path: Brevo HTTP API on port 443
    if (process.env.BREVO_API_KEY) {
        try {
            return await sendViaApi({ to, subject, text });
        } catch (error) {
            console.error("Brevo API failed:", error.message, "— falling back to SMTP");
        }
    }

    // Fallback: SMTP relay (works locally / on hosts that allow port 587)
    try {
        await getTransporter().sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
        });
        return true;
    } catch (error) {
        console.error("Email failed:", error.message);
        return false; // Return false so callers can handle gracefully instead of crashing
    }
};

export default sendMail;
