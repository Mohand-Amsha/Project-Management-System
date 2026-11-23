import { api, ApiResponse } from "@/lib/api";
import { AuthResponse, User } from "@/types/api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/api/auth/register",
      payload
    );
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/api/auth/login",
      payload
    );
    return data.data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>("/api/auth/me");
    return data.data;
  },
};