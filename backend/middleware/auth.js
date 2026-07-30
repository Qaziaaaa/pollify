// ===== AUTH MIDDLEWARE =====
// Verifies JWT from Authorization header and injects req.userId.
// optionalAuth variant sets userId if token present but never blocks the request.

import jwt from "jsonwebtoken";

// Strict auth — blocks request if no valid token is provided
const auth = (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Attach user ID to request for downstream handlers
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Optional auth — sets req.userId if token present, never blocks
// Used for public endpoints that optionally show personalized data
export const optionalAuth = (req, _res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
        } catch {
            // Silently ignore invalid/expired tokens on optional routes
        }
    }
    next();
};

export default auth;
