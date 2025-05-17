// components/UserTable.tsx
"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import UserActionMenu from "@/components/UserActionMenu";

interface UserTableProps {
  initialUsers: Pick<User, "id" | "name" | "email" | "role" | "isBlocked">[];
}

export default function UserTable({ initialUsers }: UserTableProps) {
  const [filter, setFilter] = useState("");
  const [visibleCols, setVisibleCols] = useState({
    select:  true,
    name:    true,
    email:   true,
    role:    true,
    blocked: true,
    actions: true,
  });

  const filtered = initialUsers.filter((u) =>
    u.email.toLowerCase().includes(filter.toLowerCase()),
  );

  function toggleCol(key: keyof typeof visibleCols) {
    setVisibleCols((v) => ({ ...v, [key]: !v[key] }));
  }

  return (
    <div>
      {/* Filter & Columns controls */}
      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Filter emails..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Columns</Button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <div className="space-y-2 py-2">
              {(
                [
                  ["select",  "Select"],
                  ["name",    "Name"],
                  ["email",   "Email"],
                  ["role",    "Role"],
                  ["blocked", "Blocked"],
                  ["actions","Actions"],
                ] as [keyof typeof visibleCols, string][]
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center px-4 py-1 cursor-pointer"
                >
                  <Checkbox
                    checked={visibleCols[key]}
                    onCheckedChange={() => toggleCol(key)}
                  />
                  <span className="ml-2">{label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Users table */}
      <Table>
        <TableHeader>
          <TableRow>
            {visibleCols.select  && <TableHead className="w-8"><input type="checkbox" /></TableHead>}
            {visibleCols.name    && <TableHead>Name</TableHead>}
            {visibleCols.email   && <TableHead>Email</TableHead>}
            {visibleCols.role    && <TableHead>Role</TableHead>}
            {visibleCols.blocked && <TableHead>Blocked</TableHead>}
            {visibleCols.actions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((user) => (
            <TableRow key={user.id}>
              {visibleCols.select  && <TableCell><input type="checkbox" /></TableCell>}
              {visibleCols.name    && <TableCell>{user.name ?? "—"}</TableCell>}
              {visibleCols.email   && <TableCell>{user.email}</TableCell>}
              {visibleCols.role    && <TableCell>{user.role}</TableCell>}
              {visibleCols.blocked && (
                <TableCell>
                  <span
                    className={`inline-block rounded-full px-2 text-xs font-medium ${
                      user.isBlocked
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.isBlocked ? "Yes" : "No"}
                  </span>
                </TableCell>
              )}
              {visibleCols.actions && (
                <TableCell className="text-right">
                  <UserActionMenu user={user} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
