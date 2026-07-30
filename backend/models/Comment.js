// ===== COMMENT MODEL =====
// Stores user comments on polls. Supports nested replies via parentComment.

import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
        text: { type: String, required: true, trim: true },
        parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }, // For reply threading
    },
    { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
