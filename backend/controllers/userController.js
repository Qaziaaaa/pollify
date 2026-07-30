// ===== USER CONTROLLER =====
// Handles public user profile lookup and username availability checks.

import User from "../models/User.js";
import Poll from "../models/Poll.js";
import { enrichPoll, bookmarkSet } from "../utils/computeResults.js";

// Helper: strip sensitive fields from user object
const clean = (user) => ({
    _id: user._id, name: user.name, email: user.email,
    username: user.username, avatar: user.avatar, bio: user.bio,
});

// @desc    Get user profile by ID (public)
// @route   GET /api/users/:id
// Returns user info, their polls (enriched), follow state, and interaction stats
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -otp");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Fetch user's polls, voted count, follower count, and (if logged in) current user's data
        const [polls, voted, followers, me] = await Promise.all([
            Poll.find({ creator: user._id }).populate("creator", "name username avatar").sort("-createdAt"),
            Poll.countDocuments({ "votes.user": user._id }),
            User.countDocuments({ following: user._id }),
            req.userId ? User.findById(req.userId).select("bookmarks following") : Promise.resolve(null),
        ]);

        const bmSet = await bookmarkSet(req.userId);
        const isFollowing = me ? (me.following || []).some((id) => String(id) === String(user._id)) : false;

        const shaped = polls.map((poll) => {
            const p = enrichPoll(poll, req.userId);
            p.isBookmarked = bmSet.has(String(poll._id));
            return p;
        });

        res.json({
            user: { _id: user._id, name: user.name, username: user.username, avatar: user.avatar, bio: user.bio },
            isFollowing,
            isMe: req.userId ? String(user._id) === String(req.userId) : false,
            stats: { created: polls.length, voted, followers, following: user.following?.length || 0 },
            polls: shaped,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if a username is available
// @route   GET /api/users/check-username
// Returns { available: boolean } — used during registration/profile editing
export const checkUsername = async (req, res) => {
    try {
        const { username } = req.query;
        if (!username || username.length < 3) return res.json({ available: false });
        const existing = await User.findOne({ username });
        res.json({ available: !existing });
    } catch {
        res.json({ available: false });
    }
};
