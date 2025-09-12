import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db/prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await prisma.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: { username, password: hashedPassword },
    });

    const token = jwt.sign({ id: newAdmin.id ,role: "admin"}, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, { httpOnly: true, secure: false });

    res.json({ message: "Admin registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error });
  }
};

export const adminSignin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.id ,role: "admin"}, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, { httpOnly: true, secure: false });

    res.json({ message: "Signin successful",token});
  } catch (error) {
    res.status(500).json({ message: "Signin failed", error });
  }
};


