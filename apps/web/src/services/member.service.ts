import { api, ApiResponse } from "@/lib/api";
import type { CreatedInvite, Invite, InviteRole, Member, UserRole } from "@/types/user";

export const memberService = {
  list: async (): Promise<Member[]> => {
    const { data } = await api.get<ApiResponse<Member[]>>("/api/members");
    return data.data;
  },

  update: async (
    userId: string,
    payload: { role?: UserRole; isActive?: boolean }
  ): Promise<Member> => {
    const { data } = await api.patch<ApiResponse<Member>>(`/api/members/${userId}`, payload);
    return data.data;
  },

  listInvites: async (): Promise<Invite[]> => {
    const { data } = await api.get<ApiResponse<Invite[]>>("/api/members/invites");
    return data.data;
  },

  createInvite: async (payload: { email: string; role?: InviteRole }): Promise<CreatedInvite> => {
    const { data } = await api.post<ApiResponse<CreatedInvite>>("/api/members/invites", payload);
    return data.data;
  },

  revokeInvite: async (inviteId: string): Promise<void> => {
    await api.delete(`/api/members/invites/${inviteId}`);
  },
};
