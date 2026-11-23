"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Crown, Loader2, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useMembers } from "@/hooks/useMembers";
import { projectKey, useProject } from "@/hooks/useProject";
import { getApiErrorMessage } from "@/lib/api";
import { getInitials } from "@/lib/format";
import { projectService } from "@/services/project.service";

const selectClass =
  "h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

export default function ProjectMembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useProject(projectId);
  const { data: orgMembers } = useMembers();
  const [selected, setSelected] = useState("");

  const onSaved = (updated: Awaited<ReturnType<typeof projectService.addMembers>>) =>
    queryClient.setQueryData(projectKey(projectId), updated);

  const add = useMutation({
    mutationFn: (userId: string) => projectService.addMembers(projectId, [userId]),
    onSuccess: (updated) => {
      onSaved(updated);
      setSelected("");
      toast.success("Member added");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => projectService.removeMember(projectId, userId),
    onSuccess: (updated) => {
      onSaved(updated);
      toast.success("Member removed");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!project) return <div className="text-red-500">Failed to load project.</div>;

  // The API lets the owner, admins and PMs manage members
  const canManage =
    user?._id === project.owner._id || user?.role === "admin" || user?.role === "pm";

  const memberIds = new Set(project.members.map((m) => m._id));
  const available = (orgMembers ?? []).filter((m) => m.isActive && !memberIds.has(m._id));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/projects/${projectId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to board
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{project.name} members</h1>
        <p className="text-muted-foreground">
          Only project members can be assigned tasks in this project.
        </p>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a member</CardTitle>
          </CardHeader>
          <CardContent>
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Everyone in your organization is already in this project. Invite more people from
                the{" "}
                <Link href="/team" className="text-primary hover:underline">
                  Team page
                </Link>
                .
              </p>
            ) : (
              <div className="flex gap-2">
                <select
                  className={selectClass}
                  aria-label="Person to add"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">Select a person…</option>
                  {available.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
                <Button disabled={!selected || add.isPending} onClick={() => add.mutate(selected)}>
                  {add.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Add
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members ({project.members.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {project.members.map((member) => {
            const isOwner = member._id === project.owner._id;
            return (
              <div key={member._id} className="flex items-center gap-4 px-6 py-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {getInitials(member.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                {isOwner ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Crown className="h-3.5 w-3.5" /> Owner
                  </span>
                ) : (
                  canManage && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title={`Remove ${member.name}`}
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(member._id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
