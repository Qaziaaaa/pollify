// ===== POLL COMPUTATION HELPERS =====
// Utility functions for computing poll results, enriching poll objects, and fetching bookmarks.

import User from "../models/User.js";

/**
 * computeResults — takes a raw poll document and returns structured results.
 * Each poll type has its own aggregation logic:
 *   - yesno: two buckets (Yes / No)
 *   - single, image: one bucket per option, indexed by the vote value
 *   - rating: five buckets (1-star through 5-star)
 *   - open: each response is its own entry (raw text, no percentage)
 */
export function computeResults(poll) {
    const votes = poll.votes.map((v) => v.value); // Extract the raw vote values
    const total = votes.length;

    if (poll.type === "yesno") {
        // Yes = vote value 0 (or "0" or "yes"); everything else = No
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
        // Open-ended: each response shown individually, no percentage
        return votes.map((v) => ({ text: String(v), count: 1, percent: 0 }));
    }
    return [];
}

/**
 * enrichPoll — converts a Mongoose poll doc into a plain object with:
 *   - results (computed vote breakdown)
 *   - myVote (the current user's vote value, if any)
 *   - totalVotes (raw count)
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
 * bookmarkSet — fetches a user's bookmarked poll IDs and returns them as a Set for O(1) lookups.
 */
export async function bookmarkSet(userId) {
    if (!userId) return new Set();
    const user = await User.findById(userId).select("bookmarks");
    return new Set((user?.bookmarks || []).map(String));
}
