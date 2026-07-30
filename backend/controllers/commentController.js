// ===== COMMENT CONTROLLER =====
// Handles adding, fetching, and deleting comments on polls.
// Sends notifications to the poll creator on new comments.

import Comment from "../models/Comment.js";
import Poll from "../models/Poll.js";
import Notification from "../models/Notification.js";

// @desc    Add a comment to a poll
// @route   POST /api/polls/:id/comments
// Supports optional parentComment for threaded replies. Notifies the poll creator.
export const addComment = async (req, res) => {
    try {
        const { text, parentComment } = req.body;

        if (!text || !text.trim()) return res.status(400).json({ message: "Comment cannot be empty" });
        if (text.length > 1000) return res.status(400).json({ message: "Comment must be under 1000 characters" });

        const comment = await Comment.create({
            user: req.userId,
            poll: req.params.id,
            text,
            parentComment: parentComment || null,
        });

        // Re-fetch with user populated so the frontend has avatar/name/username for display and delete checks
        const populated = await Comment.findById(comment._id)
            .populate("user", "name username avatar");

        // Notify poll creator (unless the commenter is the creator themselves)
        const poll = await Poll.findById(req.params.id).select("creator").lean();
        if (poll && String(poll.creator) !== String(req.userId)) {
            await Notification.create({
                recipient: poll.creator,
                actor: req.userId,
                type: "comment",
                poll: req.params.id,
            }).catch(() => {});
        }

        res.status(201).json({ comment: populated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all comments for a poll
// @route   GET /api/polls/:id/comments
// Returns comments sorted newest-first, with user details populated
export const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ poll: req.params.id })
            .populate("user", "name username avatar")
            .sort({ createdAt: -1 });

        res.json({ comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/polls/:id/comments/:commentId
// Owner-only: the comment author can delete their own comment
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });
        if (comment.user.toString() !== req.userId)
            return res.status(401).json({ message: "Not authorized" });

        await comment.deleteOne();
        res.json({ message: "Comment deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
