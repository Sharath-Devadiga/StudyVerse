import { Request, Response, NextFunction } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Unhandled error:", err instanceof Error ? err.message : err);
  res.status(500).json({ error: "Internal Server Error" });
}
