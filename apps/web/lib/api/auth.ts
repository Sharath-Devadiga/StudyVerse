import { apiClient } from "./client";
import type { SigninResponse, User } from "../types";
import { setStoredToken, clearStoredToken } from "../utils";

export async function signin(email: string, password: string): Promise<SigninResponse> {
  const { data } = await apiClient.post<SigninResponse>("/auth/signin", {
    email,
    password,
  });
  if (data.token) {
    setStoredToken(data.token);
  }
  return data;
}

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<{ message: string; user: User }> {
  const { data } = await apiClient.post("/auth/signup", { name, email, password });
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearStoredToken();
  }
}

export async function getAuthMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export function getGoogleAuthUrl(action: "signin" | "signup" = "signin"): string {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
  return action === "signup"
    ? `${base}/auth/google?action=signup`
    : `${base}/auth/google`;
}
