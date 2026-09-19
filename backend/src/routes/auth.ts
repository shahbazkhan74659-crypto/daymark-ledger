import { Router } from "express";
import { prisma } from "../db.js";
import { requireSession } from "../middleware/requireSession.js";
import {
  SESSION_COOKIE_NAME,
  generateSessionToken,
  hashSessionToken,
  sessionCookieOptions,
  sessionExpiryDate,
  verifyPassword,
} from "../lib/auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ status: "error", message: "Username and password are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    const passwordMatches = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      res.status(401).json({ status: "error", message: "Invalid credentials" });
      return;
    }

    const token = generateSessionToken();
    await prisma.session.create({
      data: {
        hashedToken: hashSessionToken(token),
        userId: user.id,
        expiresAt: sessionExpiryDate(),
      },
    });

    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ status: "error", message: "Login failed" });
  }
});

authRouter.post("/logout", async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  try {
    if (token) {
      await prisma.session.deleteMany({ where: { hashedToken: hashSessionToken(token) } });
    }
    res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions);
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Logout failed:", error);
    res.status(500).json({ status: "error", message: "Logout failed" });
  }
});

authRouter.get("/me", requireSession, (req, res) => {
  res.json({ status: "ok", user: req.user });
});
