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

function formatRoom(room: {
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

async function verifyRoomMembership(userId: string, roomId: string) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
      members: { some: { id: userId } },
    },
    include: roomDetailInclude,
  });
}

export const getUserRooms = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const rooms = await prisma.room.findMany({
      where: {
        members: { some: { id: req.user.id } },
      },
      include: roomDetailInclude,
      orderBy: { name: "asc" },
    });

    res.status(200).json(rooms.map(formatRoom));
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;

    if (!roomId || !isValidUuid(roomId)) {
      return res.status(400).json({ error: "Valid room ID is required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const room = await verifyRoomMembership(req.user.id, roomId);

    if (!room) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not a member of this room" });
    }

    res.status(200).json(formatRoom(room));
  } catch (error) {
    next(error);
  }
};

export const getRoomMembers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;

    if (!roomId || !isValidUuid(roomId)) {
      return res.status(400).json({ error: "Valid room ID is required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        members: { some: { id: req.user.id } },
      },
      select: {
        members: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!room) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not a member of this room" });
    }

    res.status(200).json(room.members);
  } catch (error) {
    next(error);
  }
};
