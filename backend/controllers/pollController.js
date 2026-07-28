import Poll from "../models/Poll.js";

// @desc    Create new poll
// @route   POST /api/polls
export const createPoll = async (req, res) => {
    try {
        const { question, type, options, category } = req.body;

        const poll = await Poll.create({
            creator: req.userId,
            question,
            type,
            options,
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
