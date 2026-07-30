// ===== POLL VOTE =====
// Type-appropriate voting UI for each poll type: yesno, single, rating, image, open.
// Shows results view instead when the user has already voted or the poll is closed.

import { useState } from "react";
import { Star, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import PollResults from "./PollResults.jsx";
import { inputCls } from "./UIElements.jsx";
import { pollVoteStyles as s } from "../dummyStyles";

export default function PollVote({ poll, onVote, onUnvote }) {
  const [sel, setSel] = useState(null);    // Currently selected option (pre-submit)
  const [hover, setHover] = useState(0);   // Hovered star for rating preview
  const [text, setText] = useState("");    // Open-ended text input
  const voted = poll.myVote !== null && poll.myVote !== undefined;

  // Check if a given value matches the user's current vote
  const isMyVote = (value) => voted && String(poll.myVote) === String(value);

  // Toggle: if clicking same option and unvote is allowed → unvote; otherwise vote
  const handleVote = (value) => {
    if (isMyVote(value) && onUnvote) onUnvote();
    else onVote(value);
  };

  // Already voted or closed → show results instead
  if (voted || poll.closed) return <PollResults poll={poll} onUnvote={onUnvote} />;

  // ===== YES/NO =====
  if (poll.type === "yesno")
    return (
      <div className={s.yesNoGrid}>
        <button onClick={() => handleVote(0)} className={`${s.yesNoButtonBase} ${isMyVote(0) ? s.yesNoButtonYesActive : s.yesNoButtonYesInactive}`} title={isMyVote(0) ? "Click to remove your vote" : "Vote Yes"}>
          <ThumbsUp size={16} /> Yes
        </button>
        <button onClick={() => handleVote(1)} className={`${s.yesNoButtonBase} ${isMyVote(1) ? s.yesNoButtonNoActive : s.yesNoButtonNoInactive}`} title={isMyVote(1) ? "Click to remove your vote" : "Vote No"}>
          <ThumbsDown size={16} /> No
        </button>
      </div>
    );

  // ===== SINGLE CHOICE =====
  if (poll.type === "single")
    return (
      <div className={s.singleContainer}>
        {poll.options.map((o, i) => (
          <button key={i} onClick={() => handleVote(i)} className={`${s.singleOptionBase} ${isMyVote(i) ? s.singleOptionActive : s.singleOptionInactive}`} title={isMyVote(i) ? "Click to remove your vote" : ""}>
            <span className={`${s.singleOptionCircleBase} ${isMyVote(i) ? s.singleOptionCircleActive : s.singleOptionCircleInactive}`}>
              {isMyVote(i) ? <Check size={12} /> : String.fromCharCode(65 + i)}
            </span>
            {o.text}
            {isMyVote(i) && <span className={s.singleUndoHint}>tap to undo</span>}
          </button>
        ))}
      </div>
    );

  // ===== STAR RATING =====
  if (poll.type === "rating") {
    const currentRating = voted ? Number(poll.myVote) : sel;
    return (
      <div className={s.ratingContainer}>
        <div className={s.ratingStars} onMouseLeave={() => !voted && setHover(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => {
                if (voted) {
                  if (Number(poll.myVote) === star) { if (onUnvote) onUnvote(); }
                  else onVote(star);
                } else setSel(star);
              }}
              onMouseEnter={() => !voted && setHover(star)}
              className={s.ratingStarButton}
              title={voted ? (Number(poll.myVote) === star ? "Click to remove your vote" : "Change vote") : ""}
            >
              <Star size={26} className={star <= (hover || currentRating || 0) ? s.ratingStarFilled : s.ratingStarEmpty} />
            </button>
          ))}
        </div>
        {!voted && sel ? (
          <button onClick={() => onVote(sel)} className={s.ratingSubmit}>Submit</button>
        ) : !voted ? (
          <span className={s.ratingHint}>Tap to rate</span>
        ) : (
          <span className={s.ratingUndoHint}>click your star to undo</span>
        )}
      </div>
    );
  }

  // ===== IMAGE =====
  if (poll.type === "image")
    return (
      <div>
        <div className={s.imageGrid}>
          {poll.options.map((o, i) => (
            <button
              key={i}
              onClick={() => {
                if (voted) {
                  if (isMyVote(i) && onUnvote) onUnvote();
                  else onVote(i);
                } else setSel(sel === i ? null : i);
              }}
              className={`${s.imageItemBase} ${isMyVote(i) ? s.imageItemActive : sel === i ? s.imageItemSelected : s.imageItemInactive}`}
              title={isMyVote(i) ? "Click to remove your vote" : "Change vote"}
            >
              <img src={o.image} alt="" className={s.imageThumb} />
              {(sel === i || isMyVote(i)) && <span className={s.imageCheck}><Check size={13} /></span>}
              {isMyVote(i) && <span className={s.imageUndoText}>tap to undo</span>}
            </button>
          ))}
        </div>
        {!voted && sel !== null && (
          <button onClick={() => onVote(sel)} className={s.imageSubmit}>Submit vote</button>
        )}
      </div>
    );

  // ===== OPEN-ENDED (fallback) =====
  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={280} className={`${inputCls} ${s.openTextarea}`} placeholder="Share your thoughts…" />
      <div className={s.openFooter}>
        <span className={s.openCharCount}>{text.length}/280</span>
        <button disabled={!text.trim()} onClick={() => onVote(text.trim())} className={s.openSubmit}>Submit</button>
      </div>
    </div>
  );
}
