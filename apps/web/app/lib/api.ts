import { University, Department, Semester, Room, Message, User } from "../types";

// Ensure this port matches your http-server's .env file
const API_BASE_URL = "http://localhost:5000";

// --- Data Fetching for Selection ---

export const getUniversities = async (): Promise<University[]> => {
  const response = await fetch(`${API_BASE_URL}/api/universities`);
  if (!response.ok) throw new Error("Failed to fetch universities");
  return response.json();
};

export const getDepartments = async (universityId: string): Promise<Department[]> => {
  const response = await fetch(`${API_BASE_URL}/api/universities/${universityId}/departments`);
  if (!response.ok) throw new Error("Failed to fetch departments");
  return response.json();
};

export const getSemesters = async (departmentId: string): Promise<Semester[]> => {
  const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}/semesters`);
  if (!response.ok) throw new Error('Failed to fetch semesters');
  return response.json();
};

// --- User Profile ---

export const getUserProfile = async (): Promise<User> => {
    // 'credentials: include' is crucial for sending the auth cookie
    const response = await fetch(`${API_BASE_URL}/user/me`, { credentials: 'include' });
    if (!response.ok) throw new Error("Failed to fetch user profile");
    return response.json();
};

export const updateUserProfile = async (departmentId: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ departmentId }),
    });
    if (!response.ok) throw new Error("Failed to update user profile");
    return response.json();
};

// --- Room and Chat ---

export const joinSemesterRoom = async (semesterId: string): Promise<Room> => {
  const response = await fetch(`${API_BASE_URL}/user/joinRoom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ semesterId }),
  });
  if (!response.ok) throw new Error("Failed to join room");
  return response.json();
};

export const getMessages = async (roomId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/user/room/${roomId}/messages`, {
        credentials: 'include',
    });
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json();
};

