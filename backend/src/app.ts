import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { prisma } from "./db.js";
import { advancesRouter } from "./routes/advances.js";
import { authRouter } from "./routes/auth.js";
import { documentsRouter } from "./routes/documents.js";
import { publicRouter } from "./routes/public.js";
import { repaymentsRouter } from "./routes/repayments.js";
import { reportsRouter } from "./routes/reports.js";
import { workersRouter } from "./routes/workers.js";

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

export const app = express();

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/workers", reportsRouter);
app.use("/api/workers", workersRouter);
app.use("/api/workers", advancesRouter);
app.use("/api/workers", repaymentsRouter);
app.use("/api/workers", documentsRouter);
app.use("/api/public/workers", publicRouter);

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
