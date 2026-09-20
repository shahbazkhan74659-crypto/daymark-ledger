import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../db.js";
import { requireSession } from "../middleware/requireSession.js";
import { ensureWorkerUploadDir, generateStoredFileName, workerUploadDir } from "../lib/storage.js";

export const documentsRouter = Router();

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    try {
      const dir = ensureWorkerUploadDir(String(req.params.id));
      cb(null, dir);
    } catch (error) {
      cb(error as Error, "");
    }
  },
  filename: (_req, file, cb) => {
    cb(null, generateStoredFileName(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error("UNSUPPORTED_FILE_TYPE"));
      return;
    }
    cb(null, true);
  },
}).single("file");

documentsRouter.post("/:id/documents", requireSession, async (req, res) => {
  const id = String(req.params.id);

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }
  } catch (error) {
    console.error("Fetching worker failed:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch worker" });
    return;
  }

  upload(req, res, async (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ status: "error", message: "File exceeds the 10MB size limit" });
        return;
      }
      if (err instanceof Error && err.message === "UNSUPPORTED_FILE_TYPE") {
        res.status(400).json({ status: "error", message: "File type must be pdf, jpg, jpeg, or png" });
        return;
      }
      console.error("Uploading document failed:", err);
      res.status(500).json({ status: "error", message: "Failed to upload document" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ status: "error", message: "file is required" });
      return;
    }

    try {
      const document = await prisma.workerDocument.create({
        data: {
          workerId: id,
          originalName: req.file.originalname,
          storedName: req.file.filename,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
        },
      });

      res.json({
        status: "ok",
        document: {
          id: document.id,
          originalName: document.originalName,
          mimeType: document.mimeType,
          sizeBytes: document.sizeBytes,
          createdAt: document.createdAt.toISOString(),
        },
      });
    } catch (error) {
      console.error("Saving document record failed:", error);
      fs.unlink(req.file.path, () => {});
      res.status(500).json({ status: "error", message: "Failed to save document record" });
    }
  });
});

documentsRouter.get("/:id/documents", requireSession, async (req, res) => {
  const id = String(req.params.id);

  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) {
      res.status(404).json({ status: "error", message: "Worker not found" });
      return;
    }

    const documents = await prisma.workerDocument.findMany({
      where: { workerId: id },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      status: "ok",
      documents: documents.map((doc) => ({
        id: doc.id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        createdAt: doc.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Listing documents failed:", error);
    res.status(500).json({ status: "error", message: "Failed to list documents" });
  }
});

documentsRouter.get("/:id/documents/:documentId/download", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const documentId = String(req.params.documentId);

  try {
    const document = await prisma.workerDocument.findUnique({ where: { id: documentId } });
    if (!document || document.workerId !== id) {
      res.status(404).json({ status: "error", message: "Document not found" });
      return;
    }

    const filePath = path.join(workerUploadDir(id), document.storedName);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ status: "error", message: "Document file not found on disk" });
      return;
    }

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.originalName.replace(/"/g, "")}"`,
    );
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("Downloading document failed:", error);
    res.status(500).json({ status: "error", message: "Failed to download document" });
  }
});

documentsRouter.post("/:id/documents/:documentId/remove", requireSession, async (req, res) => {
  const id = String(req.params.id);
  const documentId = String(req.params.documentId);

  try {
    const document = await prisma.workerDocument.findUnique({ where: { id: documentId } });
    if (!document || document.workerId !== id) {
      res.status(404).json({ status: "error", message: "Document not found" });
      return;
    }

    const filePath = path.join(workerUploadDir(id), document.storedName);
    await prisma.workerDocument.delete({ where: { id: documentId } });

    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkError) {
      const err = unlinkError as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") {
        console.error("Removing document file from disk failed:", err);
      }
    }

    res.json({ status: "ok", document: { id: documentId } });
  } catch (error) {
    console.error("Removing document failed:", error);
    res.status(500).json({ status: "error", message: "Failed to remove document" });
  }
});
