import User from "../models/User.js";
import { generateOTP, expireOTP, otpValid } from "../utils/generateOTP.js";
import sendMail from "../utils/mailer.js";

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        user.otp = { code: otp, expiresAt: expireOTP() };
        await user.save();

        await sendMail({
            to: user.email,
            subject: `Password Reset OTP: ${otp}`,
            text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        });

        res.json({ message: "OTP sent to your email" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!otpValid(user, otp)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.password = newPassword;
        user.otp = { code: undefined, expiresAt: undefined };
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
