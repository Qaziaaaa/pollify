// ===== OPTIMISTIC VOTE HELPER =====
// Computes what the poll state would look like after a vote,
// so the UI can show approximately correct results immediately
// instead of flashing stale data then re-animating.

/**
 * optimisticVoteUpdate — given the current poll and the new vote value,
 * returns { myVote, totalVotes, results } with the new vote folded in.
 *
 * This prevents the "flash" where PollResults renders with old
 * percentages, animates to them, then re-animates when the server
 * responds with the real (slightly different) data.
 */
export function optimisticVoteUpdate(poll, value) {
  const totalVotes = (poll.totalVotes || 0) + 1;

  if (poll.type === "open" || !poll.results) {
    // Open-ended polls show individual responses, not percentages,
    // so there's nothing to compute. Just update the count.
    return { myVote: value, totalVotes, results: poll.results };
  }

  const isSelected = (result, index) => {
    if (poll.type === "yesno") {
      return (
        (Number(value) === 0 && result.label === "Yes") ||
        (Number(value) === 1 && result.label === "No")
      );
    }
    if (poll.type === "single" || poll.type === "image") {
      return index === Number(value);
    }
    if (poll.type === "rating") {
      return result.star === Number(value);
    }
    return false;
  };

  const results = poll.results.map((r, i) => {
    const selected = isSelected(r, i);
    const count = r.count + (selected ? 1 : 0);
    return { ...r, count, percent: Math.round((count / totalVotes) * 100) };
  });

  return { myVote: value, totalVotes, results };
}
