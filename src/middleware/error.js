import { ZodError } from "zod";
import { HttpError } from "../lib/http-error.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
};

// Every error ends up here (Express 5 forwards rejected promises from async handlers automatically).
// Response shape is always { error: string, details?: object } so the frontend can rely on it.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    const details = {};
    for (const issue of err.issues) details[issue.path.join(".") || "_"] ??= issue.message;
    return res.status(400).json({ error: "Please check the highlighted fields", details });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err.code === "P2002") return res.status(409).json({ error: "That record already exists" });
  if (err.code === "P2025") return res.status(404).json({ error: "Not found" });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });

  console.error(err);
  res.status(500).json({ error: "Something went wrong on our side. Please try again." });
};
