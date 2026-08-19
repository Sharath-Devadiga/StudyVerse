import { apiClient } from "./client";
import type { User } from "../types";

export async function getUserProfile(): Promise<User> {
  const { data } = await apiClient.get<User>("/user/me");
  return data;
}

export async function updateUserProfile(updates: {
  username?: string;
  avatar?: string | null;
  universityId?: string | null;
  departmentId?: string | null;
}): Promise<User> {
  const { data } = await apiClient.patch<User>("/user/me", updates);
  return data;
}

export async function resetWorkspace(): Promise<void> { await apiClient.post("/user/workspace/reset"); }
export async function uploadAvatar(data: string, mimeType: string): Promise<User> { const response = await apiClient.post<User>("/user/me/avatar", { data, mimeType }); return response.data; }
