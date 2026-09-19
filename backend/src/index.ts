import "dotenv/config";
import cors from "cors";
import express from "express";
import { prisma } from "./db.js";

const app = express();
const port = process.env.PORT ?? 3001;
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: corsOrigin }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/db-check", async (_req, res) => {
  try {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() AS now`;
    res.json({ status: "ok", dbTime: result[0]?.now ?? null });
  } catch (error) {
    console.error("Database connectivity check failed:", error);
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

app.listen(port, () => {
  console.log(`Daymark Ledger backend listening on port ${port}`);
});
