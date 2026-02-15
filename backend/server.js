import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
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

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://campuslostnfound.netlify.app"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

/* uploads */
app.use("/uploads", uploadsRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* health */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* routes */
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/notifications", notificationRoutes);

/* frontend (optional) */
const frontendBuildPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

/* error handler */
app.use((err, req, res, next) => {
  console.error("🔥 REAL ERROR 🔥", err);
  res.status(500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`✅ API server running on port ${port}`);
});