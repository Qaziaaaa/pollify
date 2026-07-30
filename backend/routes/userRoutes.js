// ===== USER ROUTES =====
// Public profile lookup, username availability check, follow/unfollow, and connections.

import express from "express";
import { getUser, checkUsername } from "../controllers/userController.js";
import { followUser, unfollowUser, getConnections } from "../controllers/followController.js";
import auth, { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/check-username", checkUsername);        // Check if username is available
router.get("/:id", optionalAuth, getUser);            // Get user profile + polls + stats
router.post("/:id/follow", auth, followUser);         // Follow a user
router.post("/:id/unfollow", auth, unfollowUser);     // Unfollow a user
router.get("/:username/connections", getConnections); // Get follower/following lists

export default router;
