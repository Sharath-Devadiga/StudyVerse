import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db/prisma";

// Custom Request interface to include the authenticated user
interface AuthenticatedRequest extends Request {
  user?: { id: string; };
}

export const getUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // --- FIX: Add a guard clause to ensure the user is authenticated ---
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }, // Now TypeScript knows req.user.id is a string
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        department: { // Include the chosen department and its university
          include: {
            university: true,
          },
        },
      },
    });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/me - Updates the user's profile (e.g., to set their department)
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { departmentId } = req.body;

    // --- FIX: Add a guard clause to ensure the user is authenticated ---
    if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required." });
    }

    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id }, // Now TypeScript knows req.user.id is a string
      data: {
        departmentId: departmentId,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

