import Comment from "../models/Comment.js";
import Poll from "../models/Poll.js";
import Notification from "../models/Notification.js";

// @desc    Add comment to poll
// @route   POST /api/polls/:id/comments
export const addComment = async (req, res) => {
    try {
        const { text, parentComment } = req.body;

        const comment = await Comment.create({
            user: req.userId,
            poll: req.params.id,
            text,
            parentComment: parentComment || null,
        });

        // Notify poll creator on comment (skip if commenter is creator)
        const poll = await Poll.findById(req.params.id).select("creator").lean();
        if (poll && String(poll.creator) !== String(req.userId)) {
            await Notification.create({
                recipient: poll.creator,
                actor: req.userId,
                type: "comment",
                poll: req.params.id,
            }).catch(() => {});
        }

        res.status(201).json({ comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for a poll
// @route   GET /api/polls/:id/comments
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

// @desc    Delete comment
// @route   DELETE /api/polls/:id/comments/:commentId
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.user.toString() !== req.userId) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await comment.deleteOne();
        res.json({ message: "Comment deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
