"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium hidden md:inline-block">
            {user?.name}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}