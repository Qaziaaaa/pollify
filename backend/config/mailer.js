// ===== NODEMAILER TRANSPORTER =====
// Lazily creates an SMTP transporter for sending emails (OTP, notifications).

import nodemailer from "nodemailer";

// Lazy singleton: transporter is created on first use (avoids env-not-loaded issue at import time)
let transporter;
export default function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            family: 4, // Use IPv4 only
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            // Fail fast instead of hanging for minutes on a slow/unreachable SMTP server
            connectionTimeout: 5000,
            greetingTimeout: 5000,
            socketTimeout: 8000,
        });
    }
    return transporter;
}
