import { Request, Response, NextFunction } from "express";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function allowedOrigins(): Set<string> {
  const configured = process.env.FRONTEND_URL?.trim();
  const origins = new Set<string>();
  if (configured) origins.add(configured);
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return origins;
}

export function originProtection(req: Request, res: Response, next: NextFunction) {
  if (!unsafeMethods.has(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  if (!origin || !allowedOrigins().has(origin)) {
    res.status(403).json({ error: "Untrusted request origin" });
    return;
  }

  next();
}