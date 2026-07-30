// ===== DATABASE CONNECTION =====
// Connects to MongoDB using the URI from environment variables.

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error.message);
        process.exit(1); // Exit process if DB connection fails
    }
};

export default connectDB;
