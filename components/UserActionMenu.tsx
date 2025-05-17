// components/UserActionMenu.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";

interface UserActionMenuProps {
  user: Pick<User, "id" | "name" | "email" | "role" | "isBlocked">;
}

export default function UserActionMenu({ user }: UserActionMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isAdmin = user.role === "ADMIN";

  async function promote() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/promote`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("User promoted to ADMIN");
        router.refresh();
      } else {
        toast.error("Failed to promote user");
      }
    } catch {
      toast.error("Failed to promote user");
    } finally {
      setLoading(false);
    }
  }

  async function toggleBlock() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block: !user.isBlocked }),
      });
      if (res.ok) {
        toast.success(user.isBlocked ? "User unblocked" : "User blocked");
        router.refresh();
      } else {
        toast.error("Operation failed");
      }
    } catch {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={loading}
          className="rounded p-1 hover:bg-muted"
          aria-label="Actions"
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="end">
        {!isAdmin && (
          <DropdownMenuItem onSelect={promote} disabled={loading}>
            <UserCheck size={16} className="mr-2" />
            Promote to Admin
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={toggleBlock} disabled={loading}>
          <UserX size={16} className="mr-2" />
          {user.isBlocked ? "Unblock User" : "Block User"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
