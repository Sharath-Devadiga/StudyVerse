import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db/prisma";
import { safeUserSelect } from "../utils/safeUser";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.cookies.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ["HS256"],
    }) as {
      id: string;
      email?: string;
      role?: string;
    };

    if (decoded.role === "admin") {
      return res.status(403).json({ error: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { ...safeUserSelect, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "User not found" });
    }

    (req as Request & { user: typeof user }).user = user;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
};
