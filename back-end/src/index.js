import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import adminRoutes from "./routes/admin.routes.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import filmRoutes from "./routes/film.routes.js";
import { testConnection } from "./config/database.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json());

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "MarsAI API online 🚀" });
});

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/films", filmRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/admin", adminRoutes);

const port = Number(process.env.PORT) || 5000;

testConnection().then((success) => {
  if (!success) {
    console.log("⚠️  Server starting without database connection");
  }

  app.listen(port, () => {
    console.log(`✅ API running on http://localhost:${port}`);
    console.log(`✅ CORS allowed origins: ${allowedOrigins.join(", ")}`);
  });
});
