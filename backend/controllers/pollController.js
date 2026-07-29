import Poll from "../models/Poll.js";

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

        const enriched = polls.map((poll) => {
            const p = poll.toObject();
            const myVoteEntry = req.userId ? poll.votes.find((v) => v.user.toString() === req.userId) : null;
            p.myVote = myVoteEntry ? myVoteEntry.value : null;
            p.totalVotes = poll.votes.length;
            p.commentCount = 0;

            const votes = poll.votes.map((v) => v.value);
            const total = votes.length;
            if (poll.type === "yesno") {
                const yes = votes.filter((v) => v === 0 || String(v) === "0" || String(v).toLowerCase() === "yes").length;
                const no = total - yes;
                p.results = [
                    { label: "Yes", count: yes, percent: total ? Math.round((yes / total) * 100) : 0 },
                    { label: "No", count: no, percent: total ? Math.round((no / total) * 100) : 0 },
                ];
            } else if (poll.type === "single") {
                p.results = poll.options.map((opt, i) => {
                    const count = votes.filter((v) => v === i || String(v) === String(i)).length;
                    return { label: opt.text, count, percent: total ? Math.round((count / total) * 100) : 0 };
                });
            } else if (poll.type === "rating") {
                p.results = [1, 2, 3, 4, 5].map((star) => {
                    const count = votes.filter((v) => Number(v) === star).length;
                    return { star, label: `${star} star${star > 1 ? "s" : ""}`, count, percent: total ? Math.round((count / total) * 100) : 0 };
                });
            } else if (poll.type === "image") {
                p.results = poll.options.map((opt, i) => {
                    const count = votes.filter((v) => v === i || String(v) === String(i)).length;
                    return { label: `Option ${i + 1}`, text: opt.text, image: opt.image, count, percent: total ? Math.round((count / total) * 100) : 0 };
                });
            } else if (poll.type === "open") {
                p.results = votes.map((v) => ({ text: String(v), count: 1, percent: 0 }));
            } else {
                p.results = [];
            }
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

        poll.views += 1;
        await poll.save();

        const p = poll.toObject();
        const myVoteEntry = req.userId ? poll.votes.find((v) => v.user.toString() === req.userId) : null;
        p.myVote = myVoteEntry ? myVoteEntry.value : null;
        p.totalVotes = poll.votes.length;
        p.commentCount = 0;
        p.results = computeResults(poll);

        res.json({ poll: p });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

function computeResults(poll) {
    const votes = poll.votes.map((v) => v.value);
    const total = votes.length;
    if (poll.type === "yesno") {
        const yes = votes.filter((v) => v === 0 || String(v) === "0" || String(v).toLowerCase() === "yes").length;
        const no = total - yes;
        return [
            { label: "Yes", count: yes, percent: total ? Math.round((yes / total) * 100) : 0 },
            { label: "No", count: no, percent: total ? Math.round((no / total) * 100) : 0 },
        ];
    }
    if (poll.type === "single") {
        return poll.options.map((opt, i) => {
            const count = votes.filter((v) => v === i || String(v) === String(i)).length;
            return { label: opt.text, count, percent: total ? Math.round((count / total) * 100) : 0 };
        });
    }
    if (poll.type === "rating") {
        return [1, 2, 3, 4, 5].map((star) => {
            const count = votes.filter((v) => Number(v) === star).length;
            return { star, label: `${star} star${star > 1 ? "s" : ""}`, count, percent: total ? Math.round((count / total) * 100) : 0 };
        });
    }
    if (poll.type === "image") {
        return poll.options.map((opt, i) => {
            const count = votes.filter((v) => v === i || String(v) === String(i)).length;
            return { label: `Option ${i + 1}`, text: opt.text, image: opt.image, count, percent: total ? Math.round((count / total) * 100) : 0 };
        });
    }
    if (poll.type === "open") {
        return votes.map((v) => ({ text: String(v), count: 1, percent: 0 }));
    }
    return [];
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
