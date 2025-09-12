import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";

export const createSemesters = async (req: Request, res: Response) => {
  try {
    const { departmentId, semesters } = req.body;

    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    if (!semesters || !Array.isArray(semesters) || semesters.length === 0) {
      return res.status(400).json({ message: "Semesters array is required" });
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const createdSemesters = [];
    for (const num of semesters) {
      const semester = await prisma.semester.upsert({
        where: {
          number_departmentId: {
            number: num,
            departmentId: departmentId,
          },
        },
        update: {},
        create: {
          number: num,
          departmentId: departmentId,
        },
      });
      createdSemesters.push(semester);
    }

    res.status(201).json({
      message: "Semesters added successfully",
      semesters: createdSemesters,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
