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

// Startup email diagnostics — print key prefixes (never the full secret) so a
// deploy log immediately reveals whether Brevo env vars are set correctly.
{
    const api = (process.env.BREVO_API_KEY || "").trim();
    const smtp = (process.env.SMTP_PASS || "").trim();
    console.log(`[mail] BREVO_API_KEY: ${api ? `${api.length} chars, starts "${api.slice(0, 8)}"` : "NOT SET"}`);
    console.log(`[mail] SMTP_PASS: ${smtp ? `${smtp.length} chars, starts "${smtp.slice(0, 8)}"` : "NOT SET"}`);
    console.log(`[mail] EMAIL_FROM: ${process.env.EMAIL_FROM || "NOT SET"}`);
}

const app = express();

// Render (and other proxies) set X-Forwarded-For — required for
// express-rate-limit to identify real client IPs behind the proxy.
app.set("trust proxy", 1);

// Security & parsing middleware
app.use(helmet()); // Sets secure HTTP headers

// CORS — accepts comma-separated origins (e.g. "https://a.vercel.app,http://localhost:5173"),
// allows `*` for testing, and never blocks non-browser requests (curl, Postman, uptime pings).
const CORS_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",").map((o) => o.trim()).filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Allow non-browser requests (no Origin header) and any listed origin
        if (!origin || CORS_ORIGINS.includes("*") || CORS_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`[cors] Blocked origin: ${origin}`);
        return callback(null, false);
    },
    credentials: true,
}));

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
