// ===== PASSWORD RESET CONTROLLER =====
// Handles forgot-password flow: send OTP → verify OTP → reset password.
// Reuses the OTP utilities from the auth module.

import User from "../models/User.js";
import { generateOTP, expireOTP, otpValid } from "../utils/generateOTP.js";
import sendMail from "../utils/mailer.js";

// @desc    Forgot password — send OTP to user's email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate & store OTP on user document
        const otp = generateOTP();
        user.otp = { code: otp, expiresAt: expireOTP() };
        await user.save();

        // Fire-and-forget the email so the endpoint responds instantly —
        // waiting on SMTP here is what caused "Request timed out" on slow mail servers.
        // If the email fails, the user can simply request a new OTP.
        sendMail({
            to: user.email,
            subject: `Password Reset OTP: ${otp}`,
            text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        });

        res.json({ message: "OTP sent to your email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify reset OTP
// @route   POST /api/auth/verify-reset-otp
// Confirms the OTP is valid before allowing the password reset step
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!otpValid(user, otp)) return res.status(400).json({ message: "Invalid or expired OTP" });
        res.json({ message: "OTP verified" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password with verified OTP
// @route   POST /api/auth/reset-password
// Sets a new password only if the OTP is valid (and clears the OTP afterward)
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!otpValid(user, otp)) return res.status(400).json({ message: "Invalid or expired OTP" });

        user.password = newPassword; // Pre-save hook hashes it
        user.otp = { code: undefined, expiresAt: undefined }; // Invalidate OTP
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
