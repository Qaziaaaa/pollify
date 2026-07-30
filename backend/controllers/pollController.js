// ===== POLL CONTROLLER =====
// Handles all poll CRUD, voting, unvoting, stats, and trending aggregation.
// Enriches poll responses with computed results, bookmark status, and comment counts.

import Poll from "../models/Poll.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import { computeResults, enrichPoll, bookmarkSet } from "../utils/computeResults.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// @desc    Get polls created by the current user
// @route   GET /api/polls/mine
// Returns enriched polls with comment counts and bookmark status
export const getMyPolls = async (req, res) => {
    try {
        const polls = await Poll.find({ creator: req.userId })
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

// @desc    Get polls the current user voted on
// @route   GET /api/polls/voted
export const getVotedPolls = async (req, res) => {
    try {
        const polls = await Poll.find({ "votes.user": req.userId })
            .populate("creator", "name username avatar")
            .sort({ createdAt: -1 });

        const pollIds = polls.map((p) => p._id);
        const [commentCounts, bmSet] = await Promise.all([
            Comment.aggregate([{ $match: { poll: { $in: pollIds } } }, { $group: { _id: "$poll", count: { $sum: 1 } } }]),
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

// @desc    Get trending poll types
// @route   GET /api/polls/trending
// Aggregates all polls by type and returns counts for the trending chart
export const getTrending = async (_req, res) => {
    try {
        const data = await Poll.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const polls = data.map((d) => ({ type: d._id, count: d.count }));
        res.json({ polls });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new poll
// @route   POST /api/polls
// Handles all five types: yesno, single, image, rating, open.
// For image polls, uploads each file to Cloudinary.
export const createPoll = async (req, res) => {
    try {
        const { question, type, options, category } = req.body;

        if (!question || question.trim().length < 3) return res.status(400).json({ message: "Question must be at least 3 characters" });
        if (question.length > 500) return res.status(400).json({ message: "Question must be under 500 characters" });
        let normalized = [];
        if (type === "yesno") {
            normalized = [{ text: "Yes" }, { text: "No" }];
        } else if (type === "single") {
            const parsed = typeof options === "string" ? JSON.parse(options) : (options || []);
            normalized = parsed
                .filter((t) => t && (typeof t === "string" ? t.trim() : true))
                .map((t) => ({ text: typeof t === "string" ? t.trim() : t.text || String(t) }));
            if (normalized.length < 2) return res.status(400).json({ message: "Add at least 2 options" });
            for (const opt of normalized) {
                if (opt.text.length > 200) return res.status(400).json({ message: "Option text must be under 200 characters" });
            }
        } else if (type === "image") {
            if (!req.files || req.files.length < 2) return res.status(400).json({ message: "Add at least 2 images" });
            const urls = await Promise.all(req.files.map((f) => uploadToCloudinary(f.buffer)));
            normalized = urls.map((image) => ({ image, text: "" }));
        } else {
            // rating and open types — options array is passed as-is
            normalized = Array.isArray(options)
                ? options.map((opt) => (typeof opt === "string" ? { text: opt } : opt))
                : [];
        }

        let poll = await Poll.create({
            creator: req.userId, question, type,
            options: normalized, category,
        });

        // Re-fetch with populated creator for the response
        poll = await Poll.findById(poll._id).populate("creator", "name username avatar");

        res.status(201).json({ poll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all polls (with optional filtering)
// @route   GET /api/polls
// Supports filtering by type, category, and "following" feed.
// Enriches each poll with results, bookmark state, and comment count.
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
            Comment.aggregate([{ $match: { poll: { $in: pollIds } } }, { $group: { _id: "$poll", count: { $sum: 1 } } }]),
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
// Increments view count unless the viewer is the creator or ?noview=true
export const getPoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id)
            .populate("creator", "name username avatar")
            .populate("votes.user", "name username avatar");

        if (!poll) return res.status(404).json({ message: "Poll not found" });

        // Don't count the creator's own view as a real view
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

// Helper: enrich a poll with comment count and bookmark state (used by unvote endpoint)
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
// Validates the vote value based on poll type, handles new vote vs. existing vote change.
// Sends a notification to the poll creator for new votes (unless voter is the creator).
export const votePoll = async (req, res) => {
    try {
        const { value } = req.body;
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.closed) return res.status(400).json({ message: "Poll is closed" });

        // Type-specific validation
        if (poll.type === "yesno") {
            const n = Number(value);
            if (![0, 1].includes(n) && !["Yes", "No"].includes(value))
                return res.status(400).json({ message: "Value must be 0/1 or Yes/No" });
        }
        if (poll.type === "single" || poll.type === "image") {
            const idx = Number(value);
            if (!Number.isInteger(idx) || idx < 0 || idx >= poll.options.length)
                return res.status(400).json({ message: "Invalid option index" });
        }
        if (poll.type === "rating") {
            const n = Number(value);
            if (!Number.isInteger(n) || n < 1 || n > 5)
                return res.status(400).json({ message: "Rating must be 1-5" });
        }

        // Check if user already voted (to distinguish new vote from vote change)
        const existingVote = poll.votes.find((v) => v.user.toString() === req.userId);
        const isNewVote = !existingVote;

        if (existingVote) {
            existingVote.value = value; // Update existing vote
        } else {
            poll.votes.push({ user: req.userId, value }); // Add new vote
        }

        await poll.save();

        // Re-populate before responding
        const populated = await Poll.findById(poll._id)
            .populate("creator", "name username avatar")
            .populate("votes.user", "name username avatar");

        // Notify poll creator on new vote (skip if voter is creator)
        if (isNewVote) {
            const creatorId = poll.creator?._id || poll.creator;
            if (String(creatorId) !== String(req.userId)) {
                await Notification.create({
                    recipient: creatorId, actor: req.userId,
                    type: "vote", poll: poll._id,
                }).catch(() => {});
            }
        }

        // Enrich with computed fields (myVote, totalVotes, percentages) before responding
        const enriched = await enrichPollForResponse(populated, req.userId);
        res.json({ poll: enriched });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global poll stats
// @route   GET /api/polls/stats
// Returns total polls, total votes, active voters, and average votes per poll
export const getStats = async (req, res) => {
    try {
        const [totalPolls, voteStats, activeUsers] = await Promise.all([
            Poll.countDocuments(),
            Poll.aggregate([
                { $project: { voteCount: { $size: "$votes" } } },
                { $group: { _id: null, totalVotes: { $sum: "$voteCount" } } },
            ]),
            Poll.aggregate([
                { $unwind: "$votes" },
                { $group: { _id: "$votes.user" } },
                { $count: "count" },
            ]),
        ]);
        const totalVotes = voteStats[0]?.totalVotes || 0;
        const activeUserCount = activeUsers[0]?.count || 0;
        const avgVotes = totalPolls ? (totalVotes / totalPolls).toFixed(1) : 0;
        res.json({ totalPolls, totalVotes, activeUsers: activeUserCount, avgVotes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove user's vote
// @route   POST /api/polls/:id/unvote
// Filters out the user's vote from the array and cleans up associated notifications
export const unvotePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        poll.votes = poll.votes.filter((v) => v.user.toString() !== req.userId);
        await poll.save();

        // Remove vote notifications for this user+poll
        await Notification.deleteMany({
            poll: req.params.id, actor: req.userId, type: "vote",
        }).catch(() => {});

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
// Owner-only: allows changing the question text and category
export const editPoll = async (req, res) => {
    try {
        const { question, category } = req.body;
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.creator.toString() !== req.userId)
            return res.status(401).json({ message: "Not authorized" });

        if (question) {
            if (question.trim().length < 3) return res.status(400).json({ message: "Question must be at least 3 characters" });
            if (question.length > 500) return res.status(400).json({ message: "Question must be under 500 characters" });
            poll.question = question;
        }
        if (category) poll.category = category;
        await poll.save();

        const updated = await Poll.findById(poll._id).populate("creator", "name username avatar");
        res.json({ poll: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Close or reopen a poll
// @route   PATCH /api/polls/:id/close
// Toggles the closed flag — owner only
export const closePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.creator.toString() !== req.userId)
            return res.status(401).json({ message: "Not authorized" });

        poll.closed = !poll.closed;
        await poll.save();
        res.json({ poll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete poll
// @route   DELETE /api/polls/:id
// Owner-only: permanently removes the poll from the database
export const deletePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.creator.toString() !== req.userId)
            return res.status(401).json({ message: "Not authorized" });

        await poll.deleteOne();
        res.json({ message: "Poll deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
