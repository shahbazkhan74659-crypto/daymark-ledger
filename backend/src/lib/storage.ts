import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export function workerUploadDir(workerId: string): string {
  return path.join(UPLOADS_ROOT, workerId);
}

export function ensureWorkerUploadDir(workerId: string): string {
  const dir = workerUploadDir(workerId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function generateStoredFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return `${randomUUID()}${ext}`;
}
