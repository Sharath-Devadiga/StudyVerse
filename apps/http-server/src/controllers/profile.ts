import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db/prisma";
import { isValidUuid } from "../utils/validation";
import { safeUserWithRelationsSelect } from "../utils/safeUser";

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: safeUserWithRelationsSelect,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { username, avatar, universityId, departmentId } = req.body;

    if (
      username === undefined &&
      avatar === undefined &&
      universityId === undefined &&
      departmentId === undefined
    ) {
      return res.status(400).json({ error: "At least one field is required" });
    }

    const data: {
      username?: string;
      avatar?: string | null;
      universityId?: string | null;
      departmentId?: string | null;
    } = {};

    if (username !== undefined) {
      if (typeof username !== "string" || username.trim() === "") {
        return res.status(400).json({ error: "Invalid username" });
      }
      data.username = username.trim();
    }

    if (avatar !== undefined) {
      data.avatar = typeof avatar === "string" ? avatar : null;
    }

    if (universityId !== undefined) {
      if (universityId !== null && !isValidUuid(universityId)) {
        return res.status(400).json({ error: "Invalid university ID" });
      }
      if (universityId) {
        const university = await prisma.university.findUnique({
          where: { id: universityId },
        });
        if (!university) {
          return res.status(400).json({ error: "University not found" });
        }
      }
      data.universityId = universityId;
    }

    if (departmentId !== undefined) {
      if (departmentId !== null && !isValidUuid(departmentId)) {
        return res.status(400).json({ error: "Invalid department ID" });
      }
      if (departmentId) {
        const department = await prisma.department.findUnique({
          where: { id: departmentId },
        });
        if (!department) {
          return res.status(400).json({ error: "Department not found" });
        }

        const resolvedUniversityId =
          data.universityId !== undefined
            ? data.universityId
            : (
                await prisma.user.findUnique({
                  where: { id: req.user.id },
                  select: { universityId: true },
                })
              )?.universityId;

        if (
          resolvedUniversityId &&
          department.universityId !== resolvedUniversityId
        ) {
          return res.status(400).json({
            error: "Department does not belong to the selected university",
          });
        }

        if (data.universityId === undefined && !resolvedUniversityId) {
          data.universityId = department.universityId;
        }
      }
      data.departmentId = departmentId;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: safeUserWithRelationsSelect,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
