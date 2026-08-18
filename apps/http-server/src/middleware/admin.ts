import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as CustomJwtPayload;

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    (req as Request & { admin: CustomJwtPayload }).admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
