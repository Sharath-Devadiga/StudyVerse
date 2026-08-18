export interface User {
  id: string;
  email: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  departmentId?: string | null;
  universityId?: string | null;
  createdAt: string;
  department?: {
    id: string;
    name: string;
    universityId: string;
    university?: { id: string; name: string };
  } | null;
  university?: { id: string; name: string } | null;
}

export interface University {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  universityId: string;
}

export interface Semester {
  id: string;
  number: number;
  departmentId: string;
}

export interface Room {
  id: string;
  name: string;
  semester: { id: string; number: number };
  department: { id: string; name: string };
  university: { id: string; name: string };
  memberCount: number;
}

export interface RoomMember {
  id: string;
  name: string;
  username: string | null;
  avatar: string | null;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  roomId: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    avatar: string | null;
  };
}

export interface ApiError {
  error?: string;
  message?: string;
}

export interface SigninResponse {
  message: string;
  token: string;
  user: User;
}

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";
