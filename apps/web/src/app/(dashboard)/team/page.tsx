"use client";

import { Mail, X } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { InviteMemberDialog } from "@/components/team/InviteMemberDialog";
import { useInvites, useMembers, useRevokeInvite, useUpdateMember } from "@/hooks/useMembers";
import { formatDate, getInitials } from "@/lib/format";
import type { UserRole } from "@/types/user";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  pm: "Project manager",
  member: "Member",
};

const selectClass =
  "h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

export default function TeamPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const canInvite = isAdmin || user?.role === "pm";

  const { data: members, isLoading, isError } = useMembers();
  const { data: invites } = useInvites(canInvite);
  const updateMember = useUpdateMember();
  const revoke = useRevokeInvite();

  if (isLoading) return <LoadingSpinner />;
  if (isError || !members) return <div className="text-red-500">Failed to load the team.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            {members.length} {members.length === 1 ? "person" : "people"} in your organization.
          </p>
        </div>
        {canInvite && <InviteMemberDialog canInvitePm={isAdmin} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {members.map((member) => {
            const isSelf = member._id === user?._id;
            return (
              <div key={member._id} className="flex items-center gap-4 px-6 py-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {member.name}
                    {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>

                {!member.isActive && <Badge variant="secondary">Deactivated</Badge>}

                {isAdmin && !isSelf ? (
                  <>
                    <select
                      className={selectClass}
                      aria-label={`Role for ${member.name}`}
                      value={member.role}
                      disabled={updateMember.isPending}
                      onChange={(e) =>
                        updateMember.mutate({ userId: member._id, role: e.target.value as UserRole })
                      }
                    >
                      {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updateMember.isPending}
                      onClick={() =>
                        updateMember.mutate({ userId: member._id, isActive: !member.isActive })
                      }
                    >
                      {member.isActive ? "Deactivate" : "Reactivate"}
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {canInvite && invites && invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending invitations</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {invites.map((invite) => (
              <div key={invite._id} className="flex items-center gap-4 px-6 py-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[invite.role]} · expires {formatDate(invite.expiresAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Revoke invitation"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(invite._id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
