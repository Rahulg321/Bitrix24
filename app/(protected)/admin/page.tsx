// app/(protected)/admin/page.tsx
import { Metadata } from "next";
import { auth } from "@/auth";
import prismaDB from "@/lib/prisma";
import UserTable from "@/components/UserTable";

export const metadata: Metadata = {
  title: "Admin • Dashboard",
  description: "Promote users to admins or block/unblock them",
};

export default async function AdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    return <p className="p-8 text-red-600">Not authorized.</p>;
  }

  // fetch all users
  const users = await prismaDB.user.findMany({
    select: { id: true, name: true, email: true, role: true, isBlocked: true },
    orderBy: { email: "asc" },
  });

  return (
    <main className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      {/* Render the client-side table */}
      <UserTable initialUsers={users} />
    </main>
  );
}
