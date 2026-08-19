import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import {parse} from "cookie";
import { prisma } from "@repo/db/prisma";

function extractToken(socket: Socket): string | undefined {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.length > 0) {
    return authToken;
  }

  const cookieHeader = socket.handshake.headers.cookie;
  if (cookieHeader) {
    const parsed = parse(cookieHeader);
    if (parsed.token) {
      return parsed.token;
    }
  }

  return undefined;
}

export const authMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = extractToken(socket);
  if (!token) {
    return next(new Error("Authentication error: Token not provided."));
  }

  try {
    const decodedPayload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string; role?: string };

    if (decodedPayload.role === "admin") {
      return next(new Error("Authentication error: Invalid token."));
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedPayload.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return next(new Error("Authentication error: User not found."));
    }

    socket.data.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username ?? undefined,
      avatar: user.avatar ?? undefined,
    };
    next();
  } catch {
    return next(new Error("Authentication error: Invalid token."));
  }
};
