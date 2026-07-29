import Poll from "../models/Poll.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import { computeResults, enrichPoll, bookmarkSet } from "../utils/computeResults.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// @desc    Get polls the current user voted on
// @route   GET /api/polls/voted
export const getVotedPolls = async (req, res) => {
    try {
        const polls = await Poll.find({ "votes.user": req.userId })
            .populate("creator", "name username avatar")
            .sort({ createdAt: -1 });

        const pollIds = polls.map((p) => p._id);
        const commentCounts = await Comment.aggregate([
            { $match: { poll: { $in: pollIds } } },
            { $group: { _id: "$poll", count: { $sum: 1 } } },
        ]);
        const ccMap = {};
        for (const c of commentCounts) ccMap[String(c._id)] = c.count;

        const enriched = polls.map((poll) => {
            const p = enrichPoll(poll, req.userId);
            p.comments = ccMap[String(poll._id)] || 0;
            return p;
        });

        res.json({ polls: enriched });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trending poll types
// @route   GET /api/polls/trending
export const getTrending = async (_req, res) => {
    try {
        const polls = await Poll.find();
        const counts = {};
        for (const p of polls) {
            counts[p.type] = (counts[p.type] || 0) + 1;
        }
        const data = Object.entries(counts).map(([type, count]) => ({ type, count }));
        res.json({ polls: data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new poll
// @route   POST /api/polls
export const createPoll = async (req, res) => {
    try {
        const { question, type, options, category } = req.body;

        let normalized = [];
        if (type === "yesno") {
            normalized = [{ text: "Yes" }, { text: "No" }];
        } else if (type === "single") {
            const parsed = typeof options === "string" ? JSON.parse(options) : (options || []);
            normalized = parsed
                .filter((t) => t && (typeof t === "string" ? t.trim() : true))
                .map((t) => ({ text: typeof t === "string" ? t.trim() : t.text || String(t) }));
            if (normalized.length < 2)
                return res.status(400).json({ message: "Add at least 2 options" });
        } else if (type === "image") {
            if (!req.files || req.files.length < 2)
                return res.status(400).json({ message: "Add at least 2 images" });
            const urls = await Promise.all(
                req.files.map((f) => uploadToCloudinary(f.buffer)),
            );
            normalized = urls.map((image) => ({ image, text: "" }));
        } else {
            normalized = Array.isArray(options)
                ? options.map((opt) => (typeof opt === "string" ? { text: opt } : opt))
                : [];
        }

        let poll = await Poll.create({
            creator: req.userId,
            question,
            type,
            options: normalized,
            category,
        });

        poll = await Poll.findById(poll._id).populate("creator", "name username avatar");

        res.status(201).json({ poll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all polls
// @route   GET /api/polls
export const getPolls = async (req, res) => {
    try {
        const filter = {};
        if (req.query.type && req.query.type !== "all") filter.type = req.query.type;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.feed === "following" && req.userId) {
            const me = await User.findById(req.userId).select("following");
            filter.creator = { $in: me?.following || [] };
        }

        const polls = await Poll.find(filter)
            .populate("creator", "name username avatar")
            .sort({ createdAt: -1 });

        const pollIds = polls.map((p) => p._id);
        const [commentCounts, bmSet] = await Promise.all([
            Comment.aggregate([
                { $match: { poll: { $in: pollIds } } },
                { $group: { _id: "$poll", count: { $sum: 1 } } },
            ]),
            bookmarkSet(req.userId),
        ]);
        const ccMap = {};
        for (const c of commentCounts) ccMap[String(c._id)] = c.count;

        const enriched = polls.map((poll) => {
            const p = enrichPoll(poll, req.userId);
            p.comments = ccMap[String(poll._id)] || 0;
            p.isBookmarked = bmSet.has(String(poll._id));
            return p;
        });

        res.json({ polls: enriched });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single poll
// @route   GET /api/polls/:id
export const getPoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id)
            .populate("creator", "name username avatar")
            .populate("votes.user", "name username avatar");

        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        // Prevent view increment if user is creator or ?noview=true
        const creatorId = poll.creator?._id || poll.creator;
        const isCreator = String(creatorId) === String(req.userId);
        const skipView = req.query.noview === "true";
        if (!isCreator && !skipView) {
            poll.views = (poll.views || 0) + 1;
            await poll.save();
        }

        const [bmSet, comments] = await Promise.all([
            bookmarkSet(req.userId),
            Comment.countDocuments({ poll: poll._id }),
        ]);

        const p = enrichPoll(poll, req.userId);
        p.comments = comments;
        p.isBookmarked = bmSet.has(String(poll._id));

        res.json({ poll: p });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function enrichPollForResponse(poll, reqUserId) {
    const bmSet = await bookmarkSet(reqUserId);
    const comments = await Comment.countDocuments({ poll: poll._id });
    const p = enrichPoll(poll, reqUserId);
    p.comments = comments;
    p.isBookmarked = bmSet.has(String(poll._id));
    return p;
}

// @desc    Vote on poll
// @route   POST /api/polls/:id/vote
export const votePoll = async (req, res) => {
    try {
        const { value } = req.body;
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        if (poll.closed) {
            return res.status(400).json({ message: "Poll is closed" });
        }

        if (poll.type === "yesno") {
            const n = Number(value);
            if (![0, 1].includes(n) && !["Yes", "No"].includes(value)) {
                return res.status(400).json({ message: "Value must be 0/1 or Yes/No" });
            }
        }
        if (poll.type === "single") {
            const idx = Number(value);
            if (!Number.isInteger(idx) || idx < 0 || idx >= poll.options.length) {
                return res.status(400).json({ message: "Invalid option index" });
            }
        }
        if (poll.type === "rating") {
            const n = Number(value);
            if (!Number.isInteger(n) || n < 1 || n > 5) {
                return res.status(400).json({ message: "Rating must be 1-5" });
            }
        }
        if (poll.type === "image") {
            const idx = Number(value);
            if (!Number.isInteger(idx) || idx < 0 || idx >= poll.options.length) {
                return res.status(400).json({ message: "Invalid image option" });
            }
        }

        const existingVote = poll.votes.find(
            (v) => v.user.toString() === req.userId
        );

        const isNewVote = !existingVote;

        if (existingVote) {
            existingVote.value = value;
        } else {
            poll.votes.push({ user: req.userId, value });
        }

        await poll.save();

        // Notify poll creator on new vote (skip if voter is creator)
        if (isNewVote) {
            const creatorId = poll.creator?._id || poll.creator;
            if (String(creatorId) !== String(req.userId)) {
                await Notification.create({
                    recipient: creatorId,
                    actor: req.userId,
                    type: "vote",
                    poll: poll._id,
                }).catch(() => {});
            }
        }

        res.json({ poll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get poll stats
// @route   GET /api/polls/stats
export const getStats = async (req, res) => {
    try {
        const polls = await Poll.find();
        const totalPolls = polls.length;
        const totalVotes = polls.reduce((s, p) => s + p.votes.length, 0);
        const activeUsers = [...new Set(polls.flatMap((p) => p.votes.map((v) => v.user.toString())))].length;
        const avgVotes = totalPolls ? (totalVotes / totalPolls).toFixed(1) : 0;
        res.json({ totalPolls, totalVotes, activeUsers, avgVotes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove user's vote
// @route   POST /api/polls/:id/unvote
export const unvotePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }
        poll.votes = poll.votes.filter((v) => v.user.toString() !== req.userId);
        await poll.save();
        const populated = await Poll.findById(poll._id)
            .populate("creator", "name username avatar")
            .populate("votes.user", "name username avatar");
        const p = await enrichPollForResponse(populated, req.userId);
        p.myVote = null;
        res.json({ poll: p });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Edit poll question/category
// @route   PUT /api/polls/:id
export const editPoll = async (req, res) => {
    try {
        const { question, category } = req.body;
        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }
        if (poll.creator.toString() !== req.userId) {
            return res.status(401).json({ message: "Not authorized" });
        }
        if (question) poll.question = question;
        if (category) poll.category = category;
        await poll.save();
        res.json({ poll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Close or reopen a poll
// @route   PATCH /api/polls/:id/close
export const closePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }
        if (poll.creator.toString() !== req.userId) {
            return res.status(401).json({ message: "Not authorized" });
        }
        poll.closed = !poll.closed;
        await poll.save();
        res.json({ poll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete poll
// @route   DELETE /api/polls/:id
export const deletePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        if (poll.creator.toString() !== req.userId) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await poll.deleteOne();
        res.json({ message: "Poll deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
