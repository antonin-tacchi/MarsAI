import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes.js";

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

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`✅ API running on http://localhost:${port}`);
});
