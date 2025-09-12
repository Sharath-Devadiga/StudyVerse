import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";

export const addDepartments = async (req: Request, res: Response) => {
  try {
    const { universityId, departments } = req.body;

    if (!universityId || typeof universityId !== "string") {
      return res.status(400).json({ error: "Valid universityId is required" });
    }

    const university = await prisma.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    let departmentList: string[] = [];
    if (typeof departments === "string" && departments.trim() !== "") {
      departmentList = [departments.trim()];
    } else if (Array.isArray(departments)) {
      departmentList = departments
        .filter((d) => typeof d === "string" && d.trim() !== "")
        .map((d) => d.trim());
    }

    if (departmentList.length === 0) {
      return res.status(400).json({
        error: "At least one valid department name is required",
      });
    }

    const data = departmentList.map((name: string) => ({
      name,
      universityId,
    }));

    const result = await prisma.department.createMany({
      data,
      skipDuplicates: true,
    });

    res.status(201).json({
      message: "Departments added successfully",
      totalRequested: departmentList.length,
      addedCount: result.count,
      skippedCount: departmentList.length - result.count,
    });
  } catch (error) {
    console.error("Error adding departments:", error);
    res.status(500).json({ error: "Failed to add departments" });
  }
};
