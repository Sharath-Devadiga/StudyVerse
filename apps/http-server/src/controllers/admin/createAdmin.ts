import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db/prisma";
import { adminCookieOptions, clearAdminCookieOptions } from "../../utils/authCookies";

const JWT_SECRET = process.env.JWT_SECRET as string;

function createAdminToken(adminId: string) {
  return jwt.sign({ id: adminId, role: "admin" }, JWT_SECRET, {
    expiresIn: "1d",
  });
}

function setAdminCookie(res: Response, token: string) {
  res.cookie("adminToken", token, {
    ...adminCookieOptions,
  });
}

export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { username, password, setupKey } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const requiredSetupKey = process.env.ADMIN_SETUP_KEY;
    if (!requiredSetupKey || setupKey !== requiredSetupKey) {
      return res.status(403).json({ error: "Invalid setup key" });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: { username, password: hashedPassword },
    });

    const token = createAdminToken(newAdmin.id);
    setAdminCookie(res, token);

    res.json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Admin signup failed:", error);
    res.status(500).json({ error: "Signup failed" });
  }
};

export const adminSignin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = createAdminToken(admin.id);
    setAdminCookie(res, token);

    res.json({ message: "Signin successful" });
  } catch (error) {
    console.error("Admin signin failed:", error);
    res.status(500).json({ error: "Signin failed" });
  }
};

export const adminLogout = (_req: Request, res: Response) => {
  res.clearCookie("adminToken", clearAdminCookieOptions);
  res.json({ message: "Logged out successfully" });
};
