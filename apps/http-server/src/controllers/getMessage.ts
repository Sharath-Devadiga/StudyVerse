import { Request, Response, NextFunction } from 'express';
import { prisma } from "@repo/db/prisma";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
  };
}


export const getMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params; // Get roomId from the URL, e.g., /api/rooms/some-id/messages
    const user = req.user;


    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required in the URL." });
    }

    if (!user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const roomMembership = await prisma.room.findFirst({
      where: {
        id: roomId,
        members: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!roomMembership) {
      return res.status(403).json({ message: "Forbidden: You are not a member of this room." });
    }

    
    const messages = await prisma.message.findMany({
      where: {
        roomId: roomId,
      },
      
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', 
      },
    });

    res.status(200).json(messages);

  } catch (error) {
    console.error("Failed to get messages:", error);
    next(error);
  }
};

