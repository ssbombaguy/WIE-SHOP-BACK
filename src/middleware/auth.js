import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { forbidden, unauthorized } from "../lib/http-error.js";

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

function readToken(req) {
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    return { id: payload.sub, role: payload.role };
  } catch {
    throw unauthorized("Your session has expired, please sign in again");
  }
}

// Sets req.user when a valid token is sent, but lets guests through (used by checkout).
export const optionalAuth = (req, res, next) => {
  req.user = readToken(req);
  next();
};

export const requireAuth = (req, res, next) => {
  req.user = readToken(req);
  if (!req.user) throw unauthorized();
  next();
};

export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== "ADMIN") throw forbidden();
    next();
  });
};
