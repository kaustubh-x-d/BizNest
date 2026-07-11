import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  budget_tier: string;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, budgetTier?: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hydrate user session on load
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem("access_token");
      
      if (token) {
        try {
          const response = await api.get("/users/me");
          setUser(response.data);
        } catch (err) {
          console.error("Token invalid or expired on load", err);
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, refresh_token } = response.data;
      
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      
      const userResponse = await api.get("/users/me");
      setUser(userResponse.data);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, budgetTier?: string) => {
    setLoading(true);
    try {
      await api.post("/auth/signup", {
        email,
        password,
        full_name: fullName,
        budget_tier: budgetTier || "medium",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
