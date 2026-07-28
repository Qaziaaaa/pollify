import express from "express";
import {
    register,
    verifyOtp,
    login,
    getProfile,
} from "../controllers/authController.js";
import {
    forgotPassword,
    resetPassword,
} from "../controllers/passwordController.js";
import { getBookmarks } from "../controllers/bookmarkController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyOtp);
router.post("/login", login);
router.get("/profile", auth, getProfile);
router.get("/bookmarks", auth, getBookmarks);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
