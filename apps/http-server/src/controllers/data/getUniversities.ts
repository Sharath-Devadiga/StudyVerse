import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db/prisma";

export const getUniversities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const universities = await prisma.university.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.status(200).json(universities);
  } catch (error) {
    console.error("Failed to fetch universities:", error);
    next(error);
  }
};
