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

export const joinRoom = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { semesterId } = req.body;
    const user = req.user;

    if (!semesterId) {
      return res.status(400).json({ message: "Semester ID is required." });
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    let room = await prisma.room.findUnique({
      where: {
        semesterId: semesterId,
      },
    });

    if (!room) {
      const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
        include: {
          department: true, 
        },
      });

      if (!semester) {
        return res.status(404).json({ message: "Semester not found." });
      }

      const roomName = `${semester.department.name} - Semester ${semester.number}`;

      room = await prisma.room.create({
        data: {
          name: roomName,
          semesterId: semesterId,
        },
      });
    }

   
    const updatedRoom = await prisma.room.update({
      where: {
        id: room.id,
      },
      data: {
        members: {
          connect: {
            id: user.id,
          },
        },
      },
    });


    res.status(200).json(updatedRoom);

  } catch (error) {
    console.error("Failed to join room:", error);
    next(error);
  }
};
