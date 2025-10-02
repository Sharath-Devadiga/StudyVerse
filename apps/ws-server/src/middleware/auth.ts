import { Socket } from "socket.io";
import jwt from 'jsonwebtoken';
import { prisma } from '@repo/db/prisma';

export const authMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided.'));
  }

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const userId = decodedPayload.id;

    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });

    if (!user) {
      return next(new Error('Authentication error: User not found.'));
    }

    socket.data.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || undefined
    };
    next();

  } catch (err) {
    return next(new Error('Authentication error: Invalid token.'));
  }
};
