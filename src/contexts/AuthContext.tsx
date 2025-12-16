import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/api";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;

    // exp is in seconds, Date.now() is in ms
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (e) {
    // If decoding fails, assume expired/invalid
    return true;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user/token on load
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        if (isTokenExpired(token)) {
          console.warn("Token expired, clearing session");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to parse user from storage or check token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await auth.login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await auth.register(email, password);
      // Auto login after signup or just redirect?
      // For now let's just allow them to login or auto-login if API returns token.
      // My API currently returns message only for signup, so they need to login.
      // Or I can update API to return token on signup too.
      // For now, let's keep it simple: signup success -> user must login (or I can auto login here if I change API).
      // Let's assume user must login after signup for now or handle it in component.
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
