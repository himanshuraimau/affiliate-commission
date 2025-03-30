"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setCookie, removeCookie } from './cookies';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage
        let storedUser = null;
        try {
          const storedUserString = typeof window !== 'undefined' ? 
            localStorage.getItem("user") : null;
          if (storedUserString) {
            storedUser = JSON.parse(storedUserString);
          }
        } catch (e) {
          console.error("localStorage error:", e);
        }

        // Validate stored user with server
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          // Clear invalid session
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem("user");
            removeCookie('user');
          }
          // Remove automatic redirect for public pages
          return;
        }

        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem("user", JSON.stringify(data.user));
            setCookie('user', data.user);
          }
        } else {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem("user");
            removeCookie('user');
          }
          // Remove automatic redirect for public pages
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem("user");
          removeCookie('user');
        }
        // Remove automatic redirect for public pages
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      // Use the user data directly from the response
      if (data.user) {
        setUser(data.user);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem("user", JSON.stringify(data.user));
            // Add cookie for middleware
            setCookie('user', data.user);
          }
        } catch (e) {
          console.error("localStorage error:", e);
        }
        console.log("Login successful, redirecting to dashboard");
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }
      
      // Use the user data directly from the response
      if (data.user) {
        setUser(data.user);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem("user", JSON.stringify(data.user));
            // Add cookie for middleware
            setCookie('user', data.user);
          }
        } catch (e) {
          console.error("localStorage error:", e);
        }
        console.log("Signup successful, redirecting to dashboard");
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem("user");
          // Remove cookie for middleware
          removeCookie('user');
        }
      } catch (e) {
        console.error("localStorage error:", e);
      }
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
