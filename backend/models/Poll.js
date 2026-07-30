// ===== POLL MODEL =====
// Defines the Poll and Vote schemas. Supports five poll types: single, yesno, rating, image, open.

import mongoose from "mongoose";

// Sub-schema for individual votes — tracks which user voted and what value they cast
const voteSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true }, // varies by poll type
    },
    { timestamps: true, _id: false }
);

const pollSchema = mongoose.Schema(
    {
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        question: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["single", "yesno", "rating", "image", "open"],
            required: true,
        },
        options: [
            {
                text: String,  // Display label (blank for image polls)
                image: String, // Cloudinary URL (only used for image polls)
            },
        ],
        category: { type: String, default: "General" },
        closed: { type: Boolean, default: false }, // When true, no new votes accepted
        views: { type: Number, default: 0 },
        votes: [voteSchema], // Array of vote sub-documents
    },
    { timestamps: true }
);

export default mongoose.model("Poll", pollSchema);
