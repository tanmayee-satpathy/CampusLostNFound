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

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://teal-clafoutis-90d159.netlify.app",
    ],
    credentials: true,
  })
);



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
