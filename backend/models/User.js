import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        avatar: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
            maxlength: 160,
        },
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Poll",
            },
        ],
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            code: String,
            expiresAt: Date,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
