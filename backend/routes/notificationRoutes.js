// ===== NOTIFICATION ROUTES =====
// Fetch, mark-as-read (single and bulk) for in-app notifications.

import express from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getNotifications);              // Get notifications (optional ?unreadOnly=true)
router.put("/read-all", auth, markAllAsRead);          // Mark all as read
router.put("/:id/read", auth, markAsRead);             // Mark single notification as read

export default router;
