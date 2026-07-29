import express from "express";
import {
    createPoll,
    getPolls,
    getPoll,
    votePoll,
    deletePoll,
    getStats,
    getTrending,
} from "../controllers/pollController.js";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import { bookmarkPoll } from "../controllers/bookmarkController.js";
import auth, { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/trending", getTrending);
router.get("/", optionalAuth, getPolls);
router.get("/stats", getStats);
router.get("/:id", getPoll);
router.post("/", auth, createPoll);
router.post("/:id/vote", auth, votePoll);
router.delete("/:id", auth, deletePoll);
router.post("/:id/comments", auth, addComment);
router.get("/:id/comments", getComments);
router.delete("/:id/comments/:commentId", auth, deleteComment);
router.post("/:id/bookmark", auth, bookmarkPoll);

export default router;
