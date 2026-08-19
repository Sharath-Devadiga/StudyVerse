import { NextFunction, Request, Response } from "express";
import { prisma } from "@repo/db/prisma";
import { isValidUuid } from "../utils/validation";

interface AuthenticatedRequest extends Request { user?: { id: string } }

export const DEFAULT_CHANNELS = ["general", "exam-prep"];

export async function ensureRoomChannels(roomId: string) {
  await prisma.$transaction(
    DEFAULT_CHANNELS.map((name, position) =>
      prisma.channel.upsert({
        where: { roomId_name: { roomId, name } },
        update: {},
        create: { roomId, name, position },
      })
    )
  );
}

async function accessibleRoom(userId: string, roomId: string) {
  return prisma.room.findFirst({ where: { id: roomId, members: { some: { id: userId } } } });
}

export const getChannels = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    if (!req.user?.id) return res.status(401).json({ error: "Authentication required" });
    if (!roomId || !isValidUuid(roomId)) return res.status(400).json({ error: "Valid room ID is required" });
    if (!await accessibleRoom(req.user.id, roomId)) return res.status(403).json({ error: "Forbidden: You are not a member of this room" });
    await ensureRoomChannels(roomId);
    res.json(await prisma.channel.findMany({ where: { roomId, isActive: true }, orderBy: [{ position: "asc" }, { name: "asc" }] }));
  } catch (error) { next(error); }
};

export const getChannelMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId, channelId } = req.params;
    if (!req.user?.id) return res.status(401).json({ error: "Authentication required" });
    if (!roomId || !channelId || !isValidUuid(roomId) || !isValidUuid(channelId)) return res.status(400).json({ error: "Valid room and channel IDs are required" });
    if (!await accessibleRoom(req.user.id, roomId)) return res.status(403).json({ error: "Forbidden: You are not a member of this room" });
    const channel = await prisma.channel.findFirst({ where: { id: channelId, roomId } });
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    const messages = await prisma.message.findMany({ where: { roomId, channelId }, include: { user: { select: { id: true, name: true, username: true, avatar: true } }, resource: { include: { uploader: { select: { id: true, name: true } }, channel: { select: { id: true, name: true } } } } }, orderBy: { createdAt: "asc" } });
    res.json(messages);
  } catch (error) { next(error); }
};

export const getResources = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    if (!req.user?.id) return res.status(401).json({ error: "Authentication required" });
    if (!roomId || !isValidUuid(roomId)) return res.status(400).json({ error: "Valid room ID is required" });
    if (!await accessibleRoom(req.user.id, roomId)) return res.status(403).json({ error: "Forbidden: You are not a member of this room" });
    res.json(await prisma.resource.findMany({ where: { roomId }, include: { uploader: { select: { id: true, name: true } }, channel: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } }));
  } catch (error) { next(error); }
};
