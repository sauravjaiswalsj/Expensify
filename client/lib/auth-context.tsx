"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getToken,
  setToken,
  removeToken,
  getStoredUsername,
  setStoredUsername,
  removeStoredUsername,
} from "@/lib/api";

interface AuthContextValue {
  username: string | null;
  token: string | null;
  isAuthenticated: boolean;
  /** true once the auth state has been read from storage */
  hydrated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedToken = getToken();
    const storedUsername = getStoredUsername();
    if (storedToken && storedUsername) {
      setTokenState(storedToken);
      setUsername(storedUsername);
    }
    setHydrated(true);
  }, []);

  const login = useCallback((newToken: string, newUsername: string) => {
    setToken(newToken);
    setStoredUsername(newUsername);
    setTokenState(newToken);
    setUsername(newUsername);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    removeStoredUsername();
    setTokenState(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        username,
        token,
        isAuthenticated: !!token,
        hydrated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
