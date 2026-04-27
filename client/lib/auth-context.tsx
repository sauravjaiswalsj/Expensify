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

export interface UserProfile {
  displayName: string;
  email: string;
  role: string;
  bio: string;
}

interface AuthContextValue {
  username: string | null;
  token: string | null;
  profile: UserProfile;
  isAuthenticated: boolean;
  /** true once the auth state has been read from storage */
  hydrated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PROFILE_STORAGE_KEY = "expensify-profile";

function buildDefaultProfile(username: string | null): UserProfile {
  return {
    displayName: username ?? "Guest User",
    email: username ? `${username}@example.com` : "",
    role: "Member",
    bio: "Tracking expenses, trends, and spending decisions from one place.",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(buildDefaultProfile(null));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedToken = getToken();
    const storedUsername = getStoredUsername();
    if (storedToken && storedUsername) {
      setTokenState(storedToken);
      setUsername(storedUsername);
      try {
        const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (storedProfile) {
          setProfile({
            ...buildDefaultProfile(storedUsername),
            ...JSON.parse(storedProfile),
          });
        } else {
          setProfile(buildDefaultProfile(storedUsername));
        }
      } catch {
        setProfile(buildDefaultProfile(storedUsername));
      }
    }
    setHydrated(true);
  }, []);

  const login = useCallback((newToken: string, newUsername: string) => {
    setToken(newToken);
    setStoredUsername(newUsername);
    setTokenState(newToken);
    setUsername(newUsername);
    const nextProfile = buildDefaultProfile(newUsername);
    setProfile(nextProfile);
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(() => {
    removeToken();
    removeStoredUsername();
    setTokenState(null);
    setUsername(null);
    setProfile(buildDefaultProfile(null));
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((current) => {
      const nextProfile = { ...current, ...updates };
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
      } catch {
        // ignore
      }
      return nextProfile;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        username,
        token,
        profile,
        isAuthenticated: !!token,
        hydrated,
        login,
        logout,
        updateProfile,
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
