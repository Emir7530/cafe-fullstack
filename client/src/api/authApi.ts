import { apiRequest } from "./client";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt?: string;
};

type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

export const registerUser = async (data: RegisterData) => {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    json: data,
  });
};

export const loginUser = async (data: LoginData) => {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    json: data,
  });
};

export const getCurrentUser = async () => {
  return apiRequest<{ user: User }>("/auth/me", {
    auth: true,
  });
};
