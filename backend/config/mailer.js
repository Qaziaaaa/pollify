// ===== NODEMAILER TRANSPORTER =====
// Lazily creates an SMTP transporter for sending emails (OTP, notifications).
// Note: SMTP is the FALLBACK — utils/mailer.js prefers Brevo's HTTP API
// (port 443) because SMTP port 587 times out from some cloud hosts (Render free tier).

import nodemailer from "nodemailer";

// Lazy singleton: transporter is created on first use (avoids env-not-loaded issue at import time)
let transporter;
export default function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // Generous timeouts — cloud hosts can be slow to reach SMTP relays.
            // Mail is fire-and-forget, so long timeouts don't slow the API.
            connectionTimeout: 15000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
        });
    }
    return transporter;
}
