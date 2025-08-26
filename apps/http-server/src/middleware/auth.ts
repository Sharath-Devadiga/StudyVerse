import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@repo/db/prisma';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, avatar: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};