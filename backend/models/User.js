// ===== USER MODEL =====
// Defines the User schema with password hashing, follow/bookmark relationships, and OTP fields.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        username: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true, minlength: 8 },
        avatar: { type: String, default: "" },
        bio: { type: String, default: "", maxlength: 160 },
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users this user follows
        bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Poll" }], // Saved polls
        isVerified: { type: Boolean, default: false }, // Email verified flag
        otp: {
            code: String,      // 6-digit OTP for email verification or password reset
            expiresAt: Date,   // OTP expiry timestamp (10 min from generation)
        },
    },
    { timestamps: true }
);

// Pre-save hook: hash password whenever it is modified
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Instance method: compare a candidate password against the stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false; // Guard against missing/corrupt hash
    return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
