import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db.js";
import { SESSION_COOKIE_NAME, hashSessionToken } from "../lib/auth.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; username: string };
    }
  }
}

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token) {
    res.status(401).json({ status: "error", message: "Not authenticated" });
    return;
  }

  try {
    const hashedToken = hashSessionToken(token);
    const session = await prisma.session.findUnique({
      where: { hashedToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ status: "error", message: "Not authenticated" });
      return;
    }

    req.user = { id: session.user.id, username: session.user.username };
    next();
  } catch (error) {
    console.error("Session verification failed:", error);
    res.status(500).json({ status: "error", message: "Session verification failed" });
  }
}
