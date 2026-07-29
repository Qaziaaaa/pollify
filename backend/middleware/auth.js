import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Optional auth: sets req.userId if token present, never blocks
export const optionalAuth = (req, _res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
        } catch {
            // ignore invalid token
        }
    }
    next();
};

export default auth;
