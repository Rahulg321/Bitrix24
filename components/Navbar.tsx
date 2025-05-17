"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NavBar() {
  const { data: session } = useSession();   // runs on client only
  const role = session?.user.role;

  return (
    <nav className="flex gap-4">
      <Link href="/raw-deals">Raw</Link>
      <Link href="/published-deals">Published</Link>

      {/* show link only for admins */}
      {role === "ADMIN" && <Link href="/admin">Admin</Link>}
    </nav>
  );
}
