import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.routes.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import { testConnection } from "./config/database.js";

dotenv.config();

const app = express();

// Middleware - CORS MUST be before routes
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "MarsAI API online 🚀" });
});

// Routes
app.use("/api", adminRoutes);
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);

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
