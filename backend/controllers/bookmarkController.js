import User from "../models/User.js";

// @desc    Bookmark a poll
// @route   POST /api/polls/:id/bookmark
export const bookmarkPoll = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const pollId = req.params.id;

        if (user.bookmarks.includes(pollId)) {
            user.bookmarks = user.bookmarks.filter((id) => id.toString() !== pollId);
            await user.save();
            return res.json({ message: "Bookmark removed" });
        }

        user.bookmarks.push(pollId);
        await user.save();
        res.json({ message: "Poll bookmarked" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user bookmarks
// @route   GET /api/auth/bookmarks
export const getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({
            path: "bookmarks",
            populate: { path: "creator", select: "name username avatar" },
        });

        res.json({ bookmarks: user.bookmarks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
