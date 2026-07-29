import express from "express";
import { getUser, checkUsername } from "../controllers/userController.js";
import { followUser, unfollowUser, getConnections } from "../controllers/followController.js";
import auth, { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/check-username", checkUsername);
router.get("/:id", optionalAuth, getUser);
router.post("/:id/follow", auth, followUser);
router.post("/:id/unfollow", auth, unfollowUser);
router.get("/:username/connections", getConnections);

export default router;
