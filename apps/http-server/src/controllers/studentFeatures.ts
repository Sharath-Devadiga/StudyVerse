import { NextFunction, Request, Response } from "express";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@repo/db/prisma";
import { isValidUuid } from "../utils/validation";

interface AuthenticatedRequest extends Request { user?: { id: string } }
async function member(userId: string, roomId: string) { return prisma.room.findFirst({ where: { id: roomId, members: { some: { id: userId } } } }); }

export const resetWorkspace = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { try {
  if (!req.user?.id) return res.status(401).json({ error: "Authentication required" });
  await prisma.user.update({ where: { id: req.user.id }, data: { universityId: null, departmentId: null, rooms: { set: [] } } });
  res.status(204).end();
} catch (error) { next(error); } };

export const uploadResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { try {
  const userId = req.user?.id; const { roomId, channelId, name, mimeType, data } = req.body;
  if (!userId) return res.status(401).json({ error: "Authentication required" });
  if (!isValidUuid(roomId) || !isValidUuid(channelId) || typeof name !== "string" || typeof data !== "string") return res.status(400).json({ error: "A valid room, channel, filename, and file are required" });
  if (data.length > 14_000_000) return res.status(413).json({ error: "Files must be 10 MB or smaller" });
  if (!await member(userId, roomId)) return res.status(403).json({ error: "You are not a member of this study room" });
  const channel = await prisma.channel.findFirst({ where: { id: channelId, roomId, isActive: true } });
  if (!channel) return res.status(404).json({ error: "Channel not found" });
  const allowed = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
  if (typeof mimeType !== "string" || !allowed.has(mimeType)) return res.status(400).json({ error: "Unsupported file type" });
  const match = data.match(/^data:([^;]+);base64,(.+)$/); if (!match || match[1] !== mimeType) return res.status(400).json({ error: "Invalid file payload" });
  const extension = path.extname(name).replace(/[^.a-z0-9]/gi, "").slice(0, 12); const storedName = `${randomUUID()}${extension}`;
  const uploadDir = path.resolve(process.cwd(), "uploads"); await mkdir(uploadDir, { recursive: true }); await writeFile(path.join(uploadDir, storedName), Buffer.from(match[2]!, "base64"));
  const resource = await prisma.resource.create({ data: { name: path.basename(name).slice(0, 180), url: `/uploads/${storedName}`, mimeType, uploaderId: userId, roomId, channelId }, include: { uploader: { select: { id: true, name: true } }, channel: { select: { id: true, name: true } } } });
  res.status(201).json(resource);
} catch (error) { next(error); } };

export const roomSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { try {
  const roomId = req.params.roomId; if (!req.user?.id) return res.status(401).json({ error: "Authentication required" }); if (!roomId || !isValidUuid(roomId)) return res.status(400).json({ error: "Valid room ID is required" }); if (!await member(req.user.id, roomId)) return res.status(403).json({ error: "You are not a member of this study room" });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "AI summaries are not configured yet. Add GEMINI_API_KEY to enable them." });
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [messages, resources] = await Promise.all([prisma.message.findMany({ where: { roomId, createdAt: { gte: since } }, include: { channel: { select: { name: true } }, user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 80 }), prisma.resource.findMany({ where: { roomId, createdAt: { gte: since } }, select: { name: true, channel: { select: { name: true } } }, take: 20 })]);
  if (!messages.length && !resources.length) return res.json({ summary: "No discussions or study materials were shared in this room during the last 24 hours." });
  const context = JSON.stringify({ messages: messages.reverse().map(m => ({ channel: m.channel?.name, author: m.user.name, content: m.content })), resources: resources.map(r => ({ name: r.name, channel: r.channel?.name })) });
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `Summarize this academic study room activity accurately using short headings and bullets. Cover important discussions, doubts/questions, useful answers or decisions, materials/files shared, and important study or exam points. Only use the supplied data; do not invent facts. Data: ${context}` }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 700 } }),
  });
  if (!response.ok) {
    const providerBody = await response.text();
    // This intentionally logs the provider's response, never the request URL or API key.
    console.error("Gemini generateContent failed", { status: response.status, statusText: response.statusText, body: providerBody.slice(0, 2_000) });
    const providerMessage = (() => { try { return (JSON.parse(providerBody) as { error?: { message?: string } }).error?.message; } catch { return undefined; } })();
    const error = response.status === 400 ? "Gemini rejected the summary request. Check the configured model and request format." : response.status === 401 || response.status === 403 ? "Gemini rejected the API key or this key is not authorized for the selected model." : response.status === 404 ? "The configured Gemini model was not found or is unavailable for this API key." : response.status === 429 ? "Gemini quota or rate limit has been reached. Please try again later." : "Gemini could not generate a summary right now.";
    return res.status(response.status === 429 ? 429 : 502).json({ error: process.env.NODE_ENV === "production" ? error : providerMessage ? `${error} (${providerMessage})` : error });
  }
  const payload = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[]; promptFeedback?: { blockReason?: string } };
  const summary = payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("").trim();
  if (!summary) return res.status(502).json({ error: payload.promptFeedback?.blockReason ? `Gemini blocked this summary request: ${payload.promptFeedback.blockReason}.` : "Gemini returned no summary content." });
  res.json({ summary });
} catch (error) { next(error); } };

export const uploadAvatar = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => { try {
  const userId = req.user?.id; const { data, mimeType } = req.body;
  if (!userId) return res.status(401).json({ error: "Authentication required" });
  if (typeof data !== "string" || data.length > 2_800_000 || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return res.status(400).json({ error: "Use a PNG, JPEG, or WebP image under 2 MB" });
  const match = data.match(/^data:([^;]+);base64,(.+)$/); if (!match || match[1] !== mimeType) return res.status(400).json({ error: "Invalid image payload" });
  const extension = mimeType === "image/png" ? ".png" : mimeType === "image/webp" ? ".webp" : ".jpg"; const fileName = `avatar-${userId}-${randomUUID()}${extension}`; const uploadDir = path.resolve(process.cwd(), "uploads"); await mkdir(uploadDir, { recursive: true }); await writeFile(path.join(uploadDir, fileName), Buffer.from(match[2]!, "base64"));
  const user = await prisma.user.update({ where: { id: userId }, data: { avatar: `/uploads/${fileName}` }, select: { id: true, email: true, name: true, username: true, avatar: true, createdAt: true, departmentId: true, universityId: true, department: { include: { university: true } }, university: true } }); res.json(user);
} catch (error) { next(error); } };
