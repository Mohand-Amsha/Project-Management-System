"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Not logged in. <a href="/login" className="text-blue-500 underline">Go to login</a></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Welcome, {user.name} 👋</h1>
        <p className="text-muted-foreground mt-2">
          Email: {user.email}
        </p>
        <p className="text-muted-foreground">
          Role: {user.role}
        </p>
        <Button onClick={logout} className="mt-6">
          Logout
        </Button>
      </div>
    </div>
  );
}