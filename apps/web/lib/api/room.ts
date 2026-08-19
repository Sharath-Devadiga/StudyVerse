import { apiClient } from "./client";
import type { Room, RoomMember, Message, Channel, Resource } from "../types";

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

export async function getRoomChannels(roomId: string): Promise<Channel[]> {
  const { data } = await apiClient.get<Channel[]>(`/user/room/${roomId}/channels`);
  return data;
}

export async function getChannelMessages(roomId: string, channelId: string): Promise<Message[]> {
  const { data } = await apiClient.get<Message[]>(`/user/room/${roomId}/channels/${channelId}/messages`);
  return data;
}

export async function getRoomResources(roomId: string): Promise<Resource[]> {
  const { data } = await apiClient.get<Resource[]>(`/user/room/${roomId}/resources`);
  return data;
}
