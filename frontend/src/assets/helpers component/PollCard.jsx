// ===== POLL CARD =====
// Main poll display component. Shows poll question, voting UI, results, comments, and owner controls.
// Props: poll, vote, unvote, bookmark, edit, close, remove, owner (boolean).

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowBigUp, Bookmark, MessageCircle, Lock,
  Pencil, RotateCcw, Trash2, Share2, Check, Copy,
  ChevronDown,
} from "lucide-react";
import PollVote from "./PollVote.jsx";
import Comments from "./Comments.jsx";
import { Avatar, Button, inputCls, ConfirmModal } from "./UIElements.jsx";
import { pollCardStyles as s } from "../dummyStyles";

// Available categories for the edit dropdown
const CATEGORIES = ["General", "Tech", "Food", "Sports", "Entertainment", "Gaming", "Music", "Travel", "Education", "Lifestyle", "Other"];

// Formats a date as a relative time string (e.g., "3h ago", "2d ago")
const ago = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  for (const [n, sec] of [["d", 86400], ["h", 3600], ["m", 60]]) {
    const v = Math.floor(s / sec);
    if (v >= 1) return `${v}${n} ago`;
  }
  return "just now";
};

// Category accent colors pulled from a hash of the category name
const ACCENTS = [
  { bar: "bg-emerald-500", tag: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { bar: "bg-sky-500", tag: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  { bar: "bg-violet-500", tag: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  { bar: "bg-amber-500", tag: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { bar: "bg-rose-500", tag: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  { bar: "bg-teal-500", tag: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
];
const accentOf = (s = "") => ACCENTS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % ACCENTS.length];

export default function PollCard({
  poll, vote, unvote, bookmark, edit, close, remove, owner,
}) {
  const voted = poll.myVote !== null && poll.myVote !== undefined;
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const shareRef = useRef(null);
  const catRef = useRef(null);

  // Close share popover when clicking outside or pressing Escape
  useEffect(() => {
    if (!showShare) return;
    const close = () => setShowShare(false);
    const onDown = (e) => { if (shareRef.current && !shareRef.current.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showShare]);

  // Close category dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!showCatDropdown) return;
    const close = () => setShowCatDropdown(false);
    const onDown = (e) => { if (catRef.current && !catRef.current.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showCatDropdown]);

  // Edit form state
  const [eq, setEq] = useState("");
  const [ecat, setEcat] = useState("");
  const u = poll.creator || {};
  const a = accentOf(poll.category);

  const startEdit = () => {
    setEq(poll.question);
    setEcat(poll.category);
    setEditing(true);
  };

  // Save poll edit — always exits edit mode even if API call fails
  const saveEdit = async () => {
    try {
      await edit(poll._id, { question: eq, category: ecat });
    } catch {}
    setEditing(false);
  };

  // Copy poll link to clipboard
  const handleShare = async () => {
    const url = `${window.location.origin}/poll/${poll._id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowShare(false); }, 1500);
    } catch {
      prompt("Copy this link:", url);
    }
  };

  return (
    <div className={s.card}>
      <div className={`h-px ${a.bar}`} />

      <div className="p-4">
        {/* Header: avatar, name, username, timestamp, closed badge, category tag */}
        <div className={s.header}>
          <Link to={`/profile/${u._id}`}>
            <Avatar user={u} className={s.avatar} />
          </Link>
          <div className={s.userInfo}>
            <div className={s.userInfoInner}>
              <Link to={`/profile/${u._id}`} className={s.userNameLink}>{u.name}</Link>
              <span className={s.dot}>·</span>
              <span className={s.username}>@{u.username}</span>
              <span className={s.dot}>·</span>
              <span className={s.timestamp}>{ago(poll.createdAt)}</span>
            </div>
          </div>
          {poll.closed && (
            <span className={s.closedBadge}><Lock size={9} /> Closed</span>
          )}
          <span className={`${s.categoryTagBase} ${a.tag}`}>{poll.category}</span>
        </div>

        {/* Owner controls: edit, share, close/reopen, delete — only shown to poll owner */}
        {owner && !editing && (
          <div className={s.ownerControls}>
            {edit && (
              <button onClick={startEdit} title="Edit" className={s.ownerButton}>
                <Pencil size={13} />
              </button>
            )}
            <div className="relative" ref={shareRef}>
              <button onClick={() => setShowShare(!showShare)} title="Share" className={s.ownerButton}>
                <Share2 size={13} />
              </button>
              {showShare && (
                <div className={s.sharePopover}>
                  <button onClick={handleShare} className={s.shareOption}>
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
              )}
            </div>
            {close && (
              <button onClick={() => close(poll._id)} title={poll.closed ? "Reopen" : "Close"} className={s.ownerButton}>
                {poll.closed ? <RotateCcw size={13} /> : <Lock size={13} />}
              </button>
            )}
            {remove && (
              <button onClick={() => setShowDeleteConfirm(true)} title="Delete" className={s.ownerDelete}>
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}

        {/* Edit mode: textarea for question + category select + save/cancel */}
        {editing ? (
          <div className="mb-3 space-y-2">
            <textarea value={eq} onChange={(e) => setEq(e.target.value)} className={`${inputCls} ${s.editTextarea}`} />
            {/* Custom category dropdown — avoids native browser white popup */}
            <div ref={catRef} className="relative">
              <button type="button" onClick={() => setShowCatDropdown(!showCatDropdown)} className={`${inputCls} flex items-center justify-between gap-2`}>
                <span>{ecat}</span>
                <ChevronDown size={14} className={`transition-transform duration-150 ${showCatDropdown ? "rotate-180" : ""}`} />
              </button>
              {showCatDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-zinc-800 border border-zinc-700 rounded-xl p-1 shadow-2xl shadow-black/40">
                  {CATEGORIES.map((x) => (
                    <button key={x} type="button" onClick={() => { setEcat(x); setShowCatDropdown(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${ecat === x ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-300 hover:bg-zinc-700"}`}>
                      {x}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={saveEdit} className={s.editButton}>Save</button>
              <button onClick={() => setEditing(false)} className={s.editButton}>Cancel</button>
            </div>
          </div>
        ) : (
          <h2 className={s.question}>{poll.question}</h2>
        )}

        {/* Vote UI — type-appropriate input */}
        <PollVote poll={poll} onVote={(v) => vote(poll._id, v)} onUnvote={!poll.closed && unvote ? () => unvote(poll._id) : undefined} />

        {/* Footer: vote count, comments toggle, bookmark */}
        <div className={s.footer}>
          <span className={s.totalVotes}><ArrowBigUp size={14} /> {poll.totalVotes}</span>
          <button title="Comments" onClick={() => setShowComments(!showComments)} className={`${s.action} ${showComments ? s.actionActive : ""}`}>
            <MessageCircle size={14} /> {poll.comments ?? 0}
          </button>
          <button title={poll.isBookmarked ? "Saved" : "Save"} onClick={() => bookmark(poll._id)} className={`${s.action} ${poll.isBookmarked ? s.actionActive : ""}`}>
            <Bookmark size={14} className={poll.isBookmarked ? s.saveIconFill : ""} /> {poll.saves ?? 0}
          </button>
        </div>

        {/* Expandable comments section */}
        {showComments && <Comments pollId={poll._id} />}
      </div>

      {/* Custom confirm dialog — replaces native window.confirm() for consistent dark theme */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete poll?"
        message="This will permanently remove this poll and all its votes and comments. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => { setShowDeleteConfirm(false); remove(poll._id); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
