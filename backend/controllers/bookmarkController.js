// ===== BOOKMARK CONTROLLER =====
// Toggles bookmark status on polls and retrieves all bookmarked polls for the current user.

import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { enrichPoll } from "../utils/computeResults.js";

// @desc    Toggle bookmark on a poll
// @route   POST /api/polls/:id/bookmark
// If already bookmarked → remove; otherwise → add. Returns new bookmark state.
export const bookmarkPoll = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const pollId = req.params.id;

        if (user.bookmarks.some((id) => String(id) === String(pollId))) {
            user.bookmarks = user.bookmarks.filter((id) => String(id) !== String(pollId));
            await user.save();
            return res.json({ bookmarked: false });
        }

        user.bookmarks.push(pollId);
        await user.save();
        res.json({ bookmarked: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookmarked polls for the current user
// @route   GET /api/auth/bookmarks
// Populates each bookmark with creator info, enriches with results & comment count
export const getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({
            path: "bookmarks",
            populate: { path: "creator", select: "name username avatar" },
        });

        const enriched = await Promise.all(
            (user.bookmarks || []).map(async (poll) => {
                const p = enrichPoll(poll, req.userId);
                p.comments = await Comment.countDocuments({ poll: poll._id });
                p.isBookmarked = true;
                return p;
            })
        );

        res.json({ bookmarks: enriched });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
