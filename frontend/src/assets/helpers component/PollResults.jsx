// ===== POLL RESULTS =====
// Animated result bars and type-specific result displays after voting or when poll is closed.
// Supports: yesno (versus bar), single, rating, image, and open-ended results.

import { useEffect, useState } from "react";
import { Star, Check, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { pollResultsStyles as s } from "../dummyStyles";

// Animate a number from 0 to target over `duration` ms using requestAnimationFrame
function useCountUp(target, duration = 850) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (start === undefined) start = t;
      const p = Math.min((t - start) / duration, 1);
      setN(Math.round(p * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

// A single result bar with animated width and percentage counter
function ResultBar({ label, percent, highlight, winner, onClick }) {
  const [w, setW] = useState(0);
  const shown = useCountUp(percent);
  useEffect(() => { const t = setTimeout(() => setW(percent), 60); return () => clearTimeout(t); }, [percent]);

  return (
    <div onClick={onClick} className={`${s.resultBarBase} ${highlight ? s.resultBarHighlight : s.resultBarDefault}`} title={highlight ? "Click to remove your vote" : ""}>
      <div className={`${s.resultBarFill} ${highlight ? s.resultBarFillHighlight : winner ? s.resultBarFillWinner : s.resultBarFillDefault}`} style={{ width: `${w}%` }} />
      <div className={s.resultBarContent}>
        <span className={`${s.resultBarLabelBase} ${highlight ? s.resultBarLabelHighlight : s.resultBarLabelDefault}`}>
          {highlight && <Check size={12} className={s.resultBarCheck} />}
          {highlight && <RotateCcw size={12} className={s.resultBarUndoIcon} />}
          {label}
        </span>
        <span className={`${s.resultBarPercentBase} ${highlight ? s.resultBarPercentHighlight : s.resultBarPercentDefault}`}>
          {highlight && <span className={s.resultBarUndoHint}>click to undo</span>}
          {shown}%
        </span>
      </div>
    </div>
  );
}

// Yes/No special display — balanced split bar with independent animations on both sides
function VersusBar({ results, myVote, total, onUnvote }) {
  const yes = results[0] || { percent: 0 };
  const no = results[1] || { percent: 0 };
  const [yesW, setYesW] = useState(0);
  const [noW, setNoW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setYesW(yes.percent), 60); return () => clearTimeout(t); }, [yes.percent]);
  useEffect(() => { const t = setTimeout(() => setNoW(no.percent), 60); return () => clearTimeout(t); }, [no.percent]);

  if (!total) return <div className={s.versusEmpty}>No votes yet</div>;

  const hasVote = myVote !== null && myVote !== undefined;

  return (
    <div>
      <div className={s.versusBarContainer} style={{ position: 'relative' }}>
        {/* Yes bar — anchored left, grows right (toward center) */}
        <div className={`${s.versusYesBase} ${hasVote && myVote === 0 ? s.versusYesHover : ""}`} style={{ width: `${yesW}%` }} onClick={() => hasVote && myVote === 0 && onUnvote && onUnvote()} title={myVote === 0 ? "Click to remove your vote" : ""}>
          {yes.percent >= 15 && `${yes.percent}%`}
        </div>
        {/* No bar — anchored right, grows left (toward center) */}
        <div className={`${s.versusNoBase} ${hasVote && myVote === 1 ? s.versusNoHover : ""}`} style={{ width: `${noW}%`, position: 'absolute', right: 0, top: 0, height: '100%' }} onClick={() => hasVote && myVote === 1 && onUnvote && onUnvote()} title={myVote === 1 ? "Click to remove your vote" : ""}>
          {no.percent >= 15 && `${no.percent}%`}
        </div>
      </div>
      <div className={s.versusLabels}>
        <span onClick={() => hasVote && myVote === 0 && onUnvote && onUnvote()} className={`${s.versusLabelYesBase} ${myVote === 0 ? s.versusLabelYesActive : s.versusLabelYesInactive}`} title={myVote === 0 ? "Click to remove your vote" : ""}>
          <ThumbsUp size={11} /> Yes {myVote === 0 && <span className={s.versusUndoHint}>(you · <span className="text-rose-400/80">click to undo</span>)</span>}
        </span>
        <span className={s.versusVoteCount}>{total} votes</span>
        <span onClick={() => hasVote && myVote === 1 && onUnvote && onUnvote()} className={`${s.versusLabelNoBase} ${myVote === 1 ? s.versusLabelNoActive : s.versusLabelNoInactive}`} title={myVote === 1 ? "Click to remove your vote" : ""}>
          {myVote === 1 && <span className={s.versusUndoHint}>(<span className="text-rose-400/80">click to undo</span> · you)</span>} No <ThumbsDown size={11} />
        </span>
      </div>
    </div>
  );
}

// Main results component — delegates to type-specific display
export default function PollResults({ poll, onUnvote }) {
  // Open-ended: show first 6 responses as quoted text
  if (poll.type === "open")
    return (
      <div className={s.openContainer}>
        <p className={s.openHeader}>{poll.totalVotes} responses</p>
        {poll.results.slice(0, 6).map((r, i) => (<div key={i} className={s.openResponse}>"{r.text}"</div>))}
        {poll.results.length === 0 && <p className={s.openEmpty}>No responses yet.</p>}
      </div>
    );

  // Yes/No: versus bar
  if (poll.type === "yesno")
    return <VersusBar results={poll.results} myVote={poll.myVote} total={poll.totalVotes} onUnvote={onUnvote} />;

  const max = Math.max(0, ...poll.results.map((r) => r.percent));

  // Image: grid of images with result bars underneath
  if (poll.type === "image")
    return (
      <div className={s.imageGrid}>
        {poll.results.map((r, i) => (
          <div key={i} className="space-y-1.5">
            <div onClick={() => poll.myVote === i && onUnvote && onUnvote()} className={`${s.imageItemBase} ${poll.myVote === i ? s.imageItemActive : s.imageItemInactive}`} title={poll.myVote === i ? "Click to remove your vote" : ""}>
              <img src={r.image} alt="" className={s.imageThumb} />
              {poll.myVote === i && (
                <>
                  <span className={s.imageBadge}>
                    <Check size={13} className="group-hover/img:hidden" />
                    <RotateCcw size={13} className="hidden group-hover/img:inline animate-[spin_2.5s_linear_infinite]" />
                  </span>
                  <span className={s.imageUndoText}>click to undo</span>
                </>
              )}
            </div>
            <ResultBar label="" percent={r.percent} highlight={poll.myVote === i} winner={r.percent === max && max > 0} onClick={() => poll.myVote === i && onUnvote && onUnvote()} />
          </div>
        ))}
      </div>
    );

  // Single choice & rating: list of ResultBars with average rating summary
  const total = poll.results.reduce((a, r) => a + r.count, 0);
  const avg = total ? poll.results.reduce((a, r) => a + r.star * r.count, 0) / total : 0;

  return (
    <div className="space-y-1.5">
      {poll.type === "rating" && (
        <div className={s.ratingSummary}>
          <span className={s.ratingAverage}>{avg.toFixed(1)}</span>
          <div className={s.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={13} className={star <= Math.round(avg) ? s.starFilled : s.starEmpty} />))}
          </div>
          <span className={s.ratingCount}>· {total} ratings</span>
        </div>
      )}
      {poll.results.map((r, i) => {
        const isSelected = poll.type === "rating" ? poll.myVote === r.star : poll.myVote === i;
        return <ResultBar key={i} label={r.label || r.text} percent={r.percent} highlight={isSelected} winner={r.percent === max && max > 0} onClick={() => isSelected && onUnvote && onUnvote()} />;
      })}
      {poll.type !== "rating" && <p className={s.totalVotesText}>{poll.totalVotes} total votes</p>}
    </div>
  );
}
