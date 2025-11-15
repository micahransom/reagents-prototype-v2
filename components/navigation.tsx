'use client'

import Link from "next/link";
import { CircleUser, LogOut } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

type NavigationProps = {
  activePage?: "dashboard" | "experiments" | "items" | "admin";
};

export default function Navigation({ activePage }: NavigationProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-6">
          <Link href="/reagents">
            <div className="w-6 h-3 bg-foreground rounded-sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Tooltip content="Not Yet Built" side="bottom">
              <span
                className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50"
              >
                Dashboard
              </span>
            </Tooltip>
            <Tooltip content="Not Yet Built" side="bottom">
              <span
                className="text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50"
              >
                Experiments
              </span>
            </Tooltip>
            <Link href="/reagents">
              <span
                className={`text-sm font-medium ${
                  activePage === "items"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                } transition-colors`}
              >
                Reagents
              </span>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Logout" side="bottom">
            <button 
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shadow-sm hover:bg-secondary/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </nav>
  );
}

