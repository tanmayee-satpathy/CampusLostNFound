const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");

// JWT secret from environment variables (should be set in .env)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate JWT token for a user
 * @param {Object} user - User object (should not include password)
 * @returns {string} JWT token
 */
function generateToken(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token and extract user information
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware - verifies JWT token from Authorization header
 * Adds req.user with user information if token is valid
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "No authorization token provided." });
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .json({
          message: "Invalid authorization header format. Use 'Bearer <token>'.",
        });
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    // Get user from database to ensure user still exists
    const db = await getDb();
    const usersCollection = db.collection("Users");

    if (!ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({ message: "Invalid user ID in token." });
    }

    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded.userId),
    });
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Attach user info to request object (without password)
    const { passwordHash: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication failed." });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token is provided
 * Useful for routes that work with or without authentication
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No token provided, continue without authentication
      req.user = null;
      req.userId = null;
      return next();
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      // Invalid format, continue without authentication
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      // Invalid token, continue without authentication
      req.user = null;
      req.userId = null;
      return next();
    }

    // Get user from database
    const db = await getDb();
    const usersCollection = db.collection("Users");

    if (ObjectId.isValid(decoded.userId)) {
      const user = await usersCollection.findOne({
        _id: new ObjectId(decoded.userId),
      });
      if (user) {
        const { passwordHash: _, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        req.userId = decoded.userId;
      } else {
        req.user = null;
        req.userId = null;
      }
    } else {
      req.user = null;
      req.userId = null;
    }

    next();
  } catch (error) {
    console.error("Optional authentication error:", error);
    // On error, continue without authentication
    req.user = null;
    req.userId = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  generateToken,
  verifyToken,
};
