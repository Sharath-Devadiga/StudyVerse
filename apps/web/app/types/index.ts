export interface University {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  university: University; // The university is nested inside the department
}

// This is the main fix for your page and dashboard errors
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: Department | null; // Add the optional department property
}

export interface Semester {
  id: string;
  number: number;
  departmentId: string;
}

export interface Room {
  id: string;
  name: string;
  semesterId: string;
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
    avatar?: string;
  };
}

