import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db/prisma";

export const getSemesters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departmentId } = req.params;
    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required." });
    }

    const semesters = await prisma.semester.findMany({
      where: {
        departmentId: departmentId,
      },
      orderBy: {
        number: 'asc',
      },
    });

    res.status(200).json(semesters);
  } catch (error) {
    console.error("Failed to fetch semesters:", error);
    next(error);
  }
};
