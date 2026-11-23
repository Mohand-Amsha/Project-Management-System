"use client";

import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog"; 
import { useProjects } from "@/hooks/useProjects";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Failed to load projects.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your team`s projects.</p>
        </div>
        {/* We will wire this up next step */}
        <CreateProjectDialog /> 
        
      </div>

      {projects?.length === 0 ? (
        <div className="border rounded-lg p-12 text-center bg-card">
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <Link key={project._id} href={`/projects/${project._id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {project.key}
                    </span>
                  </div>
                  <CardTitle className="text-xl mt-2">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description || "No description provided."}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{project.status.replace("_", " ")}</span>
                    <span>{project.members.length} members</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}