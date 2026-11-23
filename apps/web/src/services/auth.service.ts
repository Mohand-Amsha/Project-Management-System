import { api, ApiResponse } from "@/lib/api";
import { AuthResponse, User } from "@/types/api";
import type { InviteInfo } from "@/types/user";

export interface AcceptInvitePayload {
  token: string;
  name: string;
  password: string;
}

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

  inviteInfo: async (token: string): Promise<InviteInfo> => {
    const { data } = await api.get<ApiResponse<InviteInfo>>(`/api/auth/invite/${token}`);
    return data.data;
  },

  acceptInvite: async (payload: AcceptInvitePayload): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/api/auth/accept-invite",
      payload
    );
    return data.data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>("/api/auth/me");
    return data.data;
  },
};