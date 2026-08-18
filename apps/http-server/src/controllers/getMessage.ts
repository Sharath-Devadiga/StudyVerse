import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db/prisma";
import { isValidUuid } from "../utils/validation";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id;

    if (!roomId || !isValidUuid(roomId)) {
      return res.status(400).json({ error: "Valid room ID is required" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const roomMembership = await prisma.room.findFirst({
      where: {
        id: roomId,
        members: { some: { id: userId } },
      },
    });

    if (!roomMembership) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not a member of this room" });
    }

    const messages = await prisma.message.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
