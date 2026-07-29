export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const expireOTP = () => {
    return new Date(Date.now() + 10 * 60 * 1000);
};

export const otpValid = (user, otp) => {
    return String(user.otp.code) === String(otp) && user.otp.expiresAt && new Date(user.otp.expiresAt) > new Date();
};
