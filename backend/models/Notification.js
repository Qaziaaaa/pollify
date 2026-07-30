// ===== NOTIFICATION MODEL =====
// Stores in-app notifications for votes, comments, and follows.
// Indexed for efficient "unread-first" queries.

import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who triggered the notification
        type: {
            type: String,
            enum: ["vote", "comment", "follow"],
            required: true,
        },
        poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", default: null }, // Related poll (null for follow)
        read: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

// Compound index: fetch unread notifications for a recipient, sorted by newest first
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
