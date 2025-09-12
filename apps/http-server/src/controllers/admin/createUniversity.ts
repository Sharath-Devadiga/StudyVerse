import { NextFunction, Request, Response } from "express";
import { prisma } from "@repo/db/prisma"; 

export const createUniversity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "University name is required" });
    }

    const existingUniversity = await prisma.university.findUnique({
      where: { name },
    });

    if (existingUniversity) {
      return res.status(400).json({ message: "University already exists" });
    }

    const university = await prisma.university.create({
      data: { name },
    });

    return res.status(201).json({
      message: "University created successfully",
      university,
    });
  } catch (error) {
    console.error("Error creating university:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
