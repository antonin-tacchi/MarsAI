import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { testConnection } from "./config/database.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "MarsAI API online 🚀" });
});

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);

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
