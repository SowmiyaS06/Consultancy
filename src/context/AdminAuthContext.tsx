import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AdminProfile } from "@/types/admin";
import { adminApi } from "@/lib/adminApi";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  admin: AdminProfile | null;
  login: (token: string, admin: AdminProfile) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const LOCAL_STORAGE_TOKEN = "vel-admin-token";
const LOCAL_STORAGE_ADMIN = "vel-admin-profile";

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);

  const login = useCallback((authToken: string, profile: AdminProfile) => {
    setToken(authToken);
    setAdmin(profile);
    try {
      localStorage.setItem(LOCAL_STORAGE_TOKEN, authToken);
      localStorage.setItem(LOCAL_STORAGE_ADMIN, JSON.stringify(profile));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_ADMIN);
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN);
      const storedAdmin = localStorage.getItem(LOCAL_STORAGE_ADMIN);
      setToken(storedToken);
      setAdmin(storedAdmin ? (JSON.parse(storedAdmin) as AdminProfile) : null);
    } catch {
      setToken(null);
      setAdmin(null);
    }
  }, []);

  useEffect(() => {
    const refreshProfile = async () => {
      if (!token) return;
      try {
        const { admin: profile } = await adminApi.getProfile(token);
        setAdmin(profile);
        localStorage.setItem(LOCAL_STORAGE_ADMIN, JSON.stringify(profile));
      } catch {
        logout();
      }
    };

    refreshProfile();
  }, [token, logout]);

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated: Boolean(token), token, admin, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
};
