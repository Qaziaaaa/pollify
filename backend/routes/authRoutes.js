import express from "express";
import {
    register,
    verifyOtp,
    login,
    getProfile,
    updateProfile,
    updatePassword,
} from "../controllers/authController.js";
import {
    forgotPassword,
    verifyResetOtp,
    resetPassword,
} from "../controllers/passwordController.js";
import { getBookmarks } from "../controllers/bookmarkController.js";
import auth from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);
router.post("/verify", verifyOtp);
router.post("/login", login);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, upload.single("avatar"), updateProfile);
router.put("/password", auth, updatePassword);
router.get("/bookmarks", auth, getBookmarks);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

export default router;
