// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const authMiddleware = (req, res, next) => {
  try {
    // Look for token in Authorization header: "Bearer <token>"
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // attach admin payload to request
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authMiddleware;
