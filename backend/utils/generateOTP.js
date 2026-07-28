export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const expireOTP = () => {
    return new Date(Date.now() + 10 * 60 * 1000);
};

export const otpValid = (user, otp) => {
    return user.otp.code === otp && user.otp.expiresAt && user.otp.expiresAt > new Date();
};
