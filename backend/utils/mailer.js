// ===== MAIL HELPER =====
// Sends emails via the configured SMTP transporter. Returns boolean success.

import getTransporter from "../config/mailer.js";

const sendMail = async ({ to, subject, text }) => {
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
