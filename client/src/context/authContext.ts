import { createContext } from "react";
import type { User } from "../api/authApi";

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
