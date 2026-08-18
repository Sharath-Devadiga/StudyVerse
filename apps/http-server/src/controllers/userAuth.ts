import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";
import bcrypt from "bcrypt";
import { generateJwt } from "../utils/generateJwt";
import { safeUserSelect } from "../utils/safeUser";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: safeUserSelect,
    });

    return res
      .status(201)
      .json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateJwt({ id: user.id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    const { password: _, googleId: __, createdAt: ___, departmentId: ____, universityId: _____, ...safeUser } = user;

return res.json({
  message: "Login successful",
  token,
  user: safeUser,
});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
};
