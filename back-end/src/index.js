import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
<<<<<<< HEAD
import { fileURLToPath } from "url";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
=======
import adminRoutes from "./routes/admin.routes.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
import filmRoutes from "./routes/film.routes.js";
import { testConnection } from "./config/database.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS must be first!
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json());

<<<<<<< HEAD
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Root endpoint
=======
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

>>>>>>> thomas/claude/youtube-jury-backup-flqXs
app.get("/", (req, res) => {
  res.json({
    message: "MarsAI API online",
    version: "2.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      films: "/api/films",
    },
  });
});

// Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
<<<<<<< HEAD
app.use("/api/films", filmRoutes);
=======
app.use("/api/test", testRoutes);
app.use("/api/films", filmRoutes);
app.use("/api/admin", adminRoutes);
>>>>>>> thomas/claude/youtube-jury-backup-flqXs

const port = Number(process.env.PORT) || 5000;

// Test database connection and start server
testConnection().then((success) => {
  if (!success) {
    console.log("Warning: Server starting without database connection");
  }

  app.listen(port, () => {
    console.log(`MarsAI API running on http://localhost:${port}`);
  });
});
