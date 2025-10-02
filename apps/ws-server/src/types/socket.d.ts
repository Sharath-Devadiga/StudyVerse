import { prisma } from '@repo/db';
import type { User } from '@prisma/client';

declare module "socket.io" {
  interface Socket {
    data: {
      user: Pick<User, "id" | "username">;
    };
  }
}
