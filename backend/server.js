import cors from "cors";

import path from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";

import passport from "./config/passport.js";
import userRoutes from "./routes/users.js";
import itemRoutes from "./routes/items.js";
import notificationRoutes from "./routes/notifications.js";
import uploadsRoute from "./routes/uploads.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = process.env.PORT || 4000;

import cors from "cors";
console.log("🔥 BACKEND DEPLOYED WITH CORS FIX 🔥");

import cors from "cors";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://campuslostnfound.netlify.app"
    ],
    credentials: true,
  })
);


console.log("🔥 SERVER STARTED - CORS DEBUG 🔥");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://campuslostnfound.netlify.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());


app.use(passport.initialize());

// Mount dynamic uploads route (serves images from DB) before static fallback
app.use("/uploads", uploadsRoute);
// Fallback: also serve any files from the uploads dir if present on disk
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/notifications", notificationRoutes);

const frontendBuildPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

}

app.use((err, req, res, next) => {
  console.error("🔥 REAL ERROR 🔥");
  console.error(err);

  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});

console.log("MONGO URI:", process.env.MONGODB_URI);
