// ===== POLL ROUTES =====
// CRUD for polls, voting, commenting, bookmarking, and stats/trending endpoints.

import express from "express";
import {
    createPoll, getPolls, getPoll, votePoll, unvotePoll, editPoll,
    closePoll, deletePoll, getStats, getTrending, getVotedPolls, getMyPolls,
} from "../controllers/pollController.js";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import { bookmarkPoll } from "../controllers/bookmarkController.js";
import auth, { optionalAuth } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// Personal poll views (require auth)
router.get("/mine", auth, getMyPolls);                          // Polls created by current user
router.get("/voted", auth, getVotedPolls);                      // Polls current user voted on
router.get("/trending", getTrending);                            // Poll type distribution (public)

// Public poll listing & stats
router.get("/", optionalAuth, getPolls);                        // All polls (with optional auth for bookmarks)
router.get("/stats", getStats);                                  // Global poll/vote/user stats
router.get("/:id", optionalAuth, getPoll);                       // Single poll detail

// Poll CRUD
router.post("/", auth, upload.array("images"), createPoll);     // Create poll (supports image uploads)
router.put("/:id", auth, editPoll);                              // Edit question/category
router.patch("/:id/close", auth, closePoll);                     // Toggle open/closed
router.delete("/:id", auth, deletePoll);                         // Delete poll (owner only)

// Voting
router.post("/:id/vote", auth, votePoll);                        // Cast or change vote
router.post("/:id/unvote", auth, unvotePoll);                    // Remove vote

// Comments
router.post("/:id/comments", auth, addComment);                  // Add comment
router.get("/:id/comments", getComments);                        // Fetch comments (public)
router.delete("/:id/comments/:commentId", auth, deleteComment);  // Delete own comment

// Bookmarks
router.post("/:id/bookmark", auth, bookmarkPoll);                // Toggle bookmark

export default router;
