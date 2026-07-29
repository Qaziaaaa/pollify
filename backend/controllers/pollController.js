import Poll from "../models/Poll.js";

// @desc    Create new poll
// @route   POST /api/polls
export const createPoll = async (req, res) => {
    try {
        const { question, type, options, category } = req.body;

        const normalized = Array.isArray(options)
            ? options.map((opt) => (typeof opt === "string" ? { text: opt } : opt))
            : [];

        const poll = await Poll.create({
            creator: req.userId,
            question,
            type,
            options: normalized,
            category,
        });

        res.status(201).json({ poll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all polls
// @route   GET /api/polls
export const getPolls = async (req, res) => {
    try {
        const polls = await Poll.find()
            .populate("creator", "name username avatar")
            .sort({ createdAt: -1 });

        res.json({ polls });
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

        poll.views += 1;
        await poll.save();

        res.json({ poll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

        if (poll.type === "yesno" && !["Yes", "No"].includes(value)) {
            return res.status(400).json({ message: "Value must be Yes or No" });
        }
        if (poll.type === "single") {
            const valid = poll.options.some((o) => o.text === value);
            if (!valid) return res.status(400).json({ message: "Invalid option" });
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

        if (existingVote) {
            existingVote.value = value;
        } else {
            poll.votes.push({ user: req.userId, value });
        }

        await poll.save();
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
