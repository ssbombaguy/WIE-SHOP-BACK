import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db.js";
import { conflict, notFound, unauthorized } from "../lib/http-error.js";
import * as serialize from "../lib/serializers.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

// Slow down password guessing: 20 attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes and try again." },
});

const email = z.email("Enter a valid email").trim().toLowerCase();

const registerBody = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email,
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

const loginBody = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

router.post("/register", authLimiter, validate({ body: registerBody }), async (req, res) => {
  const { name, email, password } = req.valid.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw conflict("An account with this email already exists");

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  res.status(201).json({ token: signToken(user), user: serialize.user(user) });
});

router.post("/login", authLimiter, validate({ body: loginBody }), async (req, res) => {
  const { email, password } = req.valid.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // Same message for "no such user" and "wrong password" so emails can't be probed.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw unauthorized("Email or password is incorrect");
  }
  res.json({ token: signToken(user), user: serialize.user(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw notFound("Account not found");
  res.json({ user: serialize.user(user) });
});

export default router;
