import { useCallback, useEffect, useMemo, useState } from "react";
import { AUTH_UNAUTHORIZED_EVENT } from "../api/client";
import { getCurrentUser, type User } from "../api/authApi";
import { AuthContext } from "./authContext";

type StoredAuth = {
  user: User | null;
  token: string | null;
};

const isValidUser = (value: unknown): value is User => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<User>;

  return (
    typeof user.id === "number" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    (user.role === "customer" || user.role === "admin")
  );
};

const readStoredAuth = (): StoredAuth => {
  const savedUser = localStorage.getItem("user");
  const savedToken = localStorage.getItem("token");

  if (!savedUser || !savedToken) {
    return { user: null, token: null };
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    if (!isValidUser(parsedUser)) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return { user: null, token: null };
    }

    return {
      user: parsedUser,
      token: savedToken,
    };
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return { user: null, token: null };
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth>(() => readStoredAuth());

  const login = useCallback((userData: User, userToken: string) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);

    setAuth({
      user: userData,
      token: userToken,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setAuth({
      user: null,
      token: null,
    });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [logout]);

  useEffect(() => {
    if (!auth.token) {
      return;
    }

    let cancelled = false;

    getCurrentUser()
      .then(({ user }) => {
        if (cancelled) {
          return;
        }

        localStorage.setItem("user", JSON.stringify(user));
        setAuth((currentAuth) =>
          currentAuth.token
            ? {
                ...currentAuth,
                user,
              }
            : currentAuth
        );
      })
      .catch(() => {
        if (!cancelled) {
          logout();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.token, logout]);

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      login,
      logout,
      isLoggedIn: Boolean(auth.user && auth.token),
    }),
    [auth.user, auth.token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
