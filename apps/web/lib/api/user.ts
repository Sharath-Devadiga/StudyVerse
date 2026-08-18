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
