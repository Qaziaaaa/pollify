import express from "express";
import {
    createPoll,
    getPolls,
    getPoll,
    votePoll,
    deletePoll,
} from "../controllers/pollController.js";
import { addComment, getComments } from "../controllers/commentController.js";
import { bookmarkPoll } from "../controllers/bookmarkController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getPolls);
router.get("/:id", getPoll);
router.post("/", auth, createPoll);
router.post("/:id/vote", auth, votePoll);
router.delete("/:id", auth, deletePoll);
router.post("/:id/comments", auth, addComment);
router.get("/:id/comments", getComments);
router.post("/:id/bookmark", auth, bookmarkPoll);

export default router;
