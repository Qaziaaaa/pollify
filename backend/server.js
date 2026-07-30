// ===== POLLIFY BACKEND SERVER =====
// Entry point for the Express API. Sets up middleware, connects DB, registers routes.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config(); // Load .env variables into process.env

connectDB(); // Connect to MongoDB via Mongoose

const app = express();

// Security & parsing middleware
app.use(helmet()); // Sets secure HTTP headers
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" })); // Restrict frontend origin
app.use(express.json({ limit: "10kb" })); // Parse JSON bodies, max 10KB

// Rate limiting — prevents brute-force attacks on auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    max: 20, // max 20 requests per window per IP
    message: { message: "Too many attempts, try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
app.use("/api/auth/verify-reset-otp", authLimiter);

// Register route handlers
app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// Health-check endpoint
app.get("/", (req, res) => {
    res.send("OpinionHub API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
