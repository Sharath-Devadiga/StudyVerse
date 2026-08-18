import { apiClient } from "./client";
import type { Room, RoomMember, Message } from "../types";

export async function joinRoom(semesterId: string): Promise<Room> {
  const { data } = await apiClient.post<Room>("/user/joinRoom", { semesterId });
  return data;
}

export async function getUserRooms(): Promise<Room[]> {
  const { data } = await apiClient.get<Room[]>("/user/rooms");
  return data;
}

export async function getRoom(roomId: string): Promise<Room> {
  const { data } = await apiClient.get<Room>(`/user/room/${roomId}`);
  return data;
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const { data } = await apiClient.get<RoomMember[]>(
    `/user/room/${roomId}/members`
  );
  return data;
}

export async function getRoomMessages(roomId: string): Promise<Message[]> {
  const { data } = await apiClient.get<Message[]>(
    `/user/room/${roomId}/messages`
  );
  return data;
}
