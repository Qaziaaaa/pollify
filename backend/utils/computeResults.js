import User from "../models/User.js";

/**
 * Compute poll results from votes array.
 * Returns an array of result objects: { label, count, percent } or { text } for open type.
 */
export function computeResults(poll) {
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

/**
 * Enrich a poll document with computed results, myVote, totalVotes.
 */
export function enrichPoll(poll, userId) {
    const p = poll.toObject ? poll.toObject() : { ...poll };
    const myVoteEntry = userId ? poll.votes.find((v) => String(v.user) === String(userId)) : null;
    p.myVote = myVoteEntry ? myVoteEntry.value : null;
    p.totalVotes = poll.votes.length;
    p.results = computeResults(poll);
    return p;
}

/**
 * Build a Set of bookmark IDs for a user.
 */
export async function bookmarkSet(userId) {
    if (!userId) return new Set();
    const user = await User.findById(userId).select("bookmarks");
    return new Set((user?.bookmarks || []).map(String));
}
