import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes.js";
import juryRoutes from "./routes/jury.routes.js";
import directorRoutes from "./routes/director.routes.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { testConnection } from "./config/database.js";

dotenv.config();

const app = express();

// Parsers
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", //DEV ONLY — replace "*" with allowed frontend domain in prod
    credentials: true,
  })
);

// Base route
app.get("/", (req, res) => {
  res.json({ message: "MarsAI API online 🚀" });
});

// Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/director", directorRoutes);
app.use("/api/jury", juryRoutes);
app.use("/api/admin", adminRoutes);

const port = Number(process.env.PORT) || 5000;

// Test database connection and start server
testConnection().then((success) => {
  if (!success) {
    console.log("⚠️  Server starting without database connection");
  }

  app.listen(port, () => {
    console.log(`✅ API running on http://localhost:${port}`);
  });
});
