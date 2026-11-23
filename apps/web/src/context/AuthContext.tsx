"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authService, LoginPayload, RegisterPayload } from "@/services/auth.service";
import { tokenStorage } from "@/lib/auth";
import { User } from "@/types/api";
import { getApiErrorMessage } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount: if token exists, fetch current user
  useEffect(() => {
    const bootstrap = async () => {
      const token = tokenStorage.getAccess();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const result = await authService.login(payload);
      tokenStorage.set(result.accessToken, result.refreshToken);
      setUser(result.user);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const result = await authService.register(payload);
      tokenStorage.set(result.accessToken, result.refreshToken);
      setUser(result.user);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.me();
      setUser(me);
    } catch (err) {
      console.error(getApiErrorMessage(err));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}