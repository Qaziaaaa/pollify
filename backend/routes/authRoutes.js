// ===== AUTH ROUTES =====
// Registration, login, profile management, password reset, and bookmark retrieval.

import express from "express";
import {
    register, verifyOtp, login, getProfile, updateProfile, updatePassword,
} from "../controllers/authController.js";
import { forgotPassword, verifyResetOtp, resetPassword } from "../controllers/passwordController.js";
import { getBookmarks } from "../controllers/bookmarkController.js";
import auth from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);          // Create account (optional avatar)
router.post("/verify", verifyOtp);                                     // Verify email via OTP
router.post("/login", login);                                          // Sign in → returns JWT
router.get("/profile", auth, getProfile);                              // Get own profile with stats
router.put("/profile", auth, upload.single("avatar"), updateProfile);  // Update name/username/bio/avatar
router.put("/password", auth, updatePassword);                         // Change password
router.get("/bookmarks", auth, getBookmarks);                          // Fetch bookmarked polls
router.post("/forgot-password", forgotPassword);                       // Request password reset OTP
router.post("/verify-reset-otp", verifyResetOtp);                      // Verify reset OTP
router.post("/reset-password", resetPassword);                         // Set new password

export default router;
