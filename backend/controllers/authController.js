import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import jwt from "jsonwebtoken";
import { generateOTP, expireOTP, otpValid } from "../utils/generateOTP.js";
import sendMail from "../utils/mailer.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { computeResults, enrichPoll } from "../utils/computeResults.js";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const clean = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
});

// @desc    Register new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            // FIX: if account exists but not verified, delete it so user can re-register
            if (!existingUser.isVerified) {
                await User.deleteOne({ _id: existingUser._id });
            } else {
                return res.status(400).json({ message: "User already exists" });
            }
        }

        let avatar = "";
        if (req.file) {
            try {
                avatar = await uploadToCloudinary(req.file.buffer);
            } catch (e) {
                console.warn("Avatar upload skipped:", e.message);
            }
        }

        const otp = generateOTP();
        const user = await User.create({
            name,
            email,
            username,
            password,
            avatar,
            isVerified: false,
            otp: { code: otp, expiresAt: expireOTP() },
        });

        const emailSent = await sendMail({
            to: user.email,
            subject: `Your Pollify OTP: ${otp}`,
            text: `Welcome to Pollify! Your verification OTP is ${otp}. It expires in 10 minutes.`,
        });

        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send verification email. Please check your email address and try again." });
        }

        res.status(201).json({ message: "OTP sent to your email", email: user.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!otpValid(user, otp)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = { code: undefined, expiresAt: undefined };
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email first" });
        }

        res.json({
            token: generateToken(user._id),
            user: clean(user),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const polls = await Poll.find({ creator: req.userId })
            .populate("creator", "name username avatar")
            .sort({ createdAt: -1 });

        const commentCounts = await Promise.all(
            polls.map((p) => Comment.countDocuments({ poll: p._id }))
        );

        const enriched = polls.map((poll, idx) => {
            const p = enrichPoll(poll, null);
            p.comments = commentCounts[idx] || 0;
            return p;
        });

        // Count followers (users who have this user in their following array)
        const followers = await User.countDocuments({ following: req.userId });

        res.json({
            user: {
                ...clean(user),
                pollCount: polls.length,
                polls: enriched,
            },
            stats: {
                created: polls.length,
                voted: await Poll.countDocuments({ "votes.user": req.userId }),
                followers,
                following: user.following?.length || 0,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
    try {
        const { name, username, bio } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username && username !== user.username) {
            const taken = await User.findOne({ username });
            if (taken) {
                return res.status(400).json({ message: "Username already taken" });
            }
            user.username = username;
        }
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (req.file) {
            try {
                user.avatar = await uploadToCloudinary(req.file.buffer);
            } catch (e) {
                console.warn("Avatar upload skipped:", e.message);
            }
        }
        await user.save();
        res.json({ user: clean(user) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update password
// @route   PUT /api/auth/password
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
