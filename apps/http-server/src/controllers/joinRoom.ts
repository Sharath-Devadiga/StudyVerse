import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db/prisma";
import { isValidUuid } from "../utils/validation";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const roomDetailInclude = {
  semester: {
    include: {
      department: {
        include: {
          university: true,
        },
      },
    },
  },
  _count: {
    select: { members: true },
  },
} as const;

function formatRoomResponse(room: {
  id: string;
  name: string;
  semester: {
    id: string;
    number: number;
    department: {
      id: string;
      name: string;
      university: { id: string; name: string };
    };
  };
  _count: { members: number };
}) {
  return {
    id: room.id,
    name: room.name,
    semester: {
      id: room.semester.id,
      number: room.semester.number,
    },
    department: {
      id: room.semester.department.id,
      name: room.semester.department.name,
    },
    university: {
      id: room.semester.department.university.id,
      name: room.semester.department.university.name,
    },
    memberCount: room._count.members,
  };
}

export const joinRoom = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { semesterId } = req.body;
    const userId = req.user?.id;

    if (!semesterId || !isValidUuid(semesterId)) {
      return res.status(400).json({ error: "Valid semester ID is required" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
      include: { department: true },
    });

    if (!semester) {
      return res.status(404).json({ error: "Semester not found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true, universityId: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.departmentId && user.departmentId !== semester.departmentId) {
      return res.status(400).json({
        error: "Semester does not belong to your selected department",
      });
    }

    if (
      user.universityId &&
      user.universityId !== semester.department.universityId
    ) {
      return res.status(400).json({
        error: "Semester does not belong to your selected university",
      });
    }

    let room = await prisma.room.findUnique({
      where: { semesterId },
      include: roomDetailInclude,
    });

    if (!room) {
      const roomName = `${semester.department.name} - Semester ${semester.number}`;
      room = await prisma.room.create({
        data: {
          name: roomName,
          semesterId,
        },
        include: roomDetailInclude,
      });
    }

    const existingMembership = await prisma.room.findFirst({
      where: {
        id: room.id,
        members: { some: { id: userId } },
      },
    });

    if (!existingMembership) {
      await prisma.room.update({
        where: { id: room.id },
        data: {
          members: { connect: { id: userId } },
        },
      });

      room = await prisma.room.findUniqueOrThrow({
        where: { id: room.id },
        include: roomDetailInclude,
      });
    }

    res.status(200).json(formatRoomResponse(room));
  } catch (error) {
    next(error);
  }
};
