import transporter from "../config/mailer.js";

const sendMail = async ({ to, subject, text }) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            text,
        });
        return true;
    } catch (error) {
        console.error("Email failed:", error.message);
        return false;
    }
};

export default sendMail;
