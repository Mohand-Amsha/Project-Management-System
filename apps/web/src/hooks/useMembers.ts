import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { memberService } from "@/services/member.service";
import type { InviteRole, UserRole } from "@/types/user";

export const membersKey = ["members"] as const;
export const invitesKey = ["invites"] as const;

export function useMembers() {
  return useQuery({ queryKey: membersKey, queryFn: memberService.list });
}

/** Pending invitations. Only admins and project managers may see these. */
export function useInvites(enabled: boolean) {
  return useQuery({ queryKey: invitesKey, queryFn: memberService.listInvites, enabled });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; role?: InviteRole }) =>
      memberService.createInvite(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: invitesKey }),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => memberService.revokeInvite(inviteId),
    onSuccess: () => {
      toast.success("Invitation revoked");
      queryClient.invalidateQueries({ queryKey: invitesKey });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      ...payload
    }: {
      userId: string;
      role?: UserRole;
      isActive?: boolean;
    }) => memberService.update(userId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
}
