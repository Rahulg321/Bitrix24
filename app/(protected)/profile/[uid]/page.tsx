import ProfileForm from "@/components/forms/profile-form";
import prismaDB from "@/lib/prisma.server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

type Params = Promise<{ uid: string }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { uid } = await props.params;

  try {
    const fetchedUserProfile = await prismaDB.user.findUnique({
      where: {
        id: uid,
      },
    });

    const userName = fetchedUserProfile?.name;

    return {
      title: `${userName} Profile`,
      description: `Profile Page of ${userName}`,
    };
  } catch (error) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist",
    };
  }
}

const UserProfilePage = async ({ params }: { params: Params }) => {
  const profileUid = (await params).uid;

  const user = await prismaDB.user.findUnique({
    where: { id: profileUid },
    include: { accounts: true },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">User Profile</h1>
      <div className="rounded-lg p-6 shadow">
        <ProfileForm user={user} />
        <div className="mt-8"></div>
      </div>
    </div>
  );
};

export default UserProfilePage;
