// ===== FOLLOW CONTROLLER =====
// Manages follow/unfollow relationships and retrieves follower/following lists.

import User from "../models/User.js";
import Notification from "../models/Notification.js";

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// Self-follow is blocked. Sends a follow notification to the target user.
export const followUser = async (req, res) => {
    try {
        const target = await User.findById(req.params.id);
        if (!target) return res.status(404).json({ message: "User not found" });
        if (String(req.params.id) === String(req.userId))
            return res.status(400).json({ message: "Cannot follow yourself" });

        const me = await User.findById(req.userId);
        const alreadyFollowing = me.following.some((id) => String(id) === String(req.params.id));

        if (!alreadyFollowing) {
            me.following.push(req.params.id);
            await me.save();

            await Notification.create({
                recipient: req.params.id,
                actor: req.userId,
                type: "follow",
            }).catch(() => {});
        }

        res.json({ message: "User followed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// Removes the target user ID from the current user's following array
export const unfollowUser = async (req, res) => {
    try {
        const me = await User.findById(req.userId);
        me.following = me.following.filter((id) => String(id) !== String(req.params.id));
        await me.save();
        res.json({ message: "User unfollowed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get followers/following for a user by username
// @route   GET /api/users/:username/connections
// Returns two arrays: followers (users who follow this user) and following (users this user follows)
export const getConnections = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: "User not found" });

        const [followerDocs, followingDocs] = await Promise.all([
            User.find({ following: user._id }).select("name username avatar"),
            User.find({ _id: { $in: user.following } }).select("name username avatar"),
        ]);

        res.json({ data: { followers: followerDocs, following: followingDocs } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
