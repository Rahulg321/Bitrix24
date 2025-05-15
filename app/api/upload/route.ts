import { NextResponse } from "next/server";
import { withAuth }     from "@/lib/withAuth";
import { limiters, enforce } from "@/lib/rate-limit";
import { uploadFile }   from "@/lib/upload";

export const POST = withAuth(async (req, user) => {
  const form = await req.formData();
  const file = form.get("file") as File;

  const { ok, headers } = await enforce(limiters.fileUpload, user.id);
  if (!ok) return new Response("Too many uploads", { status: 429, headers });

  const url = await uploadFile(file, user.id);
  return NextResponse.json({ url }, { status: 201, headers });
}).__ratelimit("fileUpload");
