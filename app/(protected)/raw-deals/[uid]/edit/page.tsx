import EditDealForm from "@/components/forms/edit-deal-form";
import PreviousPageButton from "@/components/PreviousPageButton";
import { Card, CardContent } from "@/components/ui/card";
import prismaDB from "@/lib/prisma";
import { Metadata } from "next";
import React from "react";

type Params = Promise<{ uid: string }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { uid } = await props.params;

  try {
    const fetchedDeal = await prismaDB.deal.findUnique({
      where: {
        id: uid,
      },
    });

    return {
      title: `Edit ${fetchedDeal?.dealCaption}` || "Dark Alpha Capital",
      description: `Make changes to the details of the ${fetchedDeal?.dealCaption} deal`,
    };
  } catch {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist",
    };
  }
}

const EditManualDealPage = async (props: { params: Params }) => {
  const { uid } = await props.params;

  const fetchedDeal = await prismaDB.deal.findUnique({
    where: {
      id: uid,
    },
  });

  if (!fetchedDeal) {
    return (
      <section className="mt-10 text-center text-xl">Deal not found</section>
    );
  }

  const { title } = fetchedDeal;

  return (
    <section className="block-space relative">
      <div className="absolute left-8 top-6">
        <PreviousPageButton />
      </div>
      <div className="narrow-container mb-8 md:mb-10 lg:mb-12">
        <h1 className="mb-4 text-center text-4xl font-bold">
          Edit Deal: {title}
        </h1>

        <p className="text-center text-lg leading-relaxed">
          Please ensure that all fields, such as revenue, asking price,
          location, and contract status, are updated accurately. Once
          you&apos;re done, click on{" "}
          <span className="font-semibold">Save Changes</span> to apply your
          updates. Be mindful that your changes will impact the overall
          visibility and status of this deal in the system.
        </p>
      </div>
      <div className="big-container">
        <Card className="transition-all duration-75 ease-in-out hover:shadow-lg">
          <CardContent className="p-6">
            <EditDealForm deal={fetchedDeal} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EditManualDealPage;
