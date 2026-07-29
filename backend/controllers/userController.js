import User from "../models/User.js";
import Poll from "../models/Poll.js";

const clean = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
});

// @desc    Get user profile by ID
// @route   GET /api/users/:id
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -otp");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const polls = await Poll.find({ creator: req.params.id })
            .populate("creator", "name username avatar")
            .sort({ createdAt: -1 });

        res.json({
            user: {
                ...clean(user),
                pollCount: polls.length,
                polls,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
