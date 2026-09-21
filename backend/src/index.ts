import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { prisma } from "./db.js";
import { advancesRouter } from "./routes/advances.js";
import { authRouter } from "./routes/auth.js";
import { documentsRouter } from "./routes/documents.js";
import { reportsRouter } from "./routes/reports.js";
import { workersRouter } from "./routes/workers.js";

const app = express();
const port = process.env.PORT ?? 3001;
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/workers", reportsRouter);
app.use("/api/workers", workersRouter);
app.use("/api/workers", advancesRouter);
app.use("/api/workers", documentsRouter);

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
