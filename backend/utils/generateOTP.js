// ===== OTP HELPERS =====
// Generates, expires, and validates one-time passwords for email verification and password reset.

// Generates a random 6-digit OTP as a string
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Returns a Date 10 minutes from now — used as the OTP expiry timestamp
export const expireOTP = () => {
    return new Date(Date.now() + 10 * 60 * 1000);
};

// Checks whether a given OTP code matches the user's stored OTP and has not expired
export const otpValid = (user, otp) => {
    return String(user.otp?.code) === String(otp) && user.otp?.expiresAt && new Date(user.otp.expiresAt) > new Date();
};
