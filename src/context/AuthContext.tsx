import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { storeApi, type CustomerUser } from "@/lib/storeApi";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: CustomerUser | null;
  login: (token: string, user: CustomerUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_TOKEN = "vel-customer-token";
const LOCAL_STORAGE_USER = "vel-customer-profile";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CustomerUser | null>(null);

  const login = useCallback((authToken: string, profile: CustomerUser) => {
    setToken(authToken);
    setUser(profile);
    try {
      localStorage.setItem(LOCAL_STORAGE_TOKEN, authToken);
      localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(profile));
    } catch {
      // ignore storage errors
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_USER);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN);
      const storedUser = localStorage.getItem(LOCAL_STORAGE_USER);
      setToken(storedToken);
      setUser(storedUser ? (JSON.parse(storedUser) as CustomerUser) : null);
    } catch {
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const refreshProfile = async () => {
      if (!token) return;
      try {
        const { user: profile } = await storeApi.getProfile(token);
        setUser(profile);
        localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(profile));
      } catch {
        logout();
      }
    };

    refreshProfile();
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: Boolean(token), token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
