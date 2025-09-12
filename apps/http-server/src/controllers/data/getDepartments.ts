import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db/prisma";

export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { universityId } = req.params;
    if (!universityId) {
      return res.status(400).json({ message: "University ID is required." });
    }

    const departments = await prisma.department.findMany({
      where: {
        universityId: universityId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json(departments);
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    next(error);
  }
};
