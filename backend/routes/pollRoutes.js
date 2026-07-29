import express from "express";
import {
    createPoll,
    getPolls,
    getPoll,
    votePoll,
    unvotePoll,
    editPoll,
    closePoll,
    deletePoll,
    getStats,
    getTrending,
    getVotedPolls,
} from "../controllers/pollController.js";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import { bookmarkPoll } from "../controllers/bookmarkController.js";
import auth, { optionalAuth } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.get("/voted", auth, getVotedPolls);
router.get("/trending", getTrending);
router.get("/", optionalAuth, getPolls);
router.get("/stats", getStats);
router.get("/:id", optionalAuth, getPoll);
router.post("/", auth, upload.array("images"), createPoll);
router.post("/:id/vote", auth, votePoll);
router.post("/:id/unvote", auth, unvotePoll);
router.put("/:id", auth, editPoll);
router.patch("/:id/close", auth, closePoll);
router.delete("/:id", auth, deletePoll);
router.post("/:id/comments", auth, addComment);
router.get("/:id/comments", getComments);
router.delete("/:id/comments/:commentId", auth, deleteComment);
router.post("/:id/bookmark", auth, bookmarkPoll);

export default router;
