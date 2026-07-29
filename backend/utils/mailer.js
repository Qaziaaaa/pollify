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
        return false;
    }
};

export default sendMail;
