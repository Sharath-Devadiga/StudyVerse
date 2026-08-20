import axios from "axios";

const adminClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "", withCredentials: true, headers: { "Content-Type": "application/json" } });

export const adminApi = {
  login: async (username: string, password: string) => (await adminClient.post("/admin/adminSignin", { username, password })).data as { message: string },
  logout: async () => { await adminClient.post("/admin/logout"); },
  me: async () => (await adminClient.get("/admin/me")).data,
  stats: async () => (await adminClient.get("/admin/stats")).data as Record<string, number>,
  list: async <T>(path: string) => (await adminClient.get<T[]>(`/admin/${path}`)).data,
  create: async <T>(path: string, data: unknown) => (await adminClient.post<T>(`/admin/${path}`, data)).data,
  update: async <T>(path: string, id: string, data: unknown) => (await adminClient.patch<T>(`/admin/${path}/${id}`, data)).data,
  remove: async (path: string, id: string) => adminClient.delete(`/admin/${path}/${id}`),
};
