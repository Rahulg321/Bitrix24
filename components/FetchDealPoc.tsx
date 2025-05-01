import prismaDB from "@/lib/prisma";
import React from "react";
import PocItem from "@/components/PocItem";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { DealType } from "@prisma/client";

// this component will be used to fetch and display all pocs for a particular deal

const FetchDealPoc = async ({
  dealId,
  dealType,
}: {
  dealId: string;
  dealType: DealType;
}) => {
  const pocs = await prismaDB.pOC.findMany({
    where: {
      dealId: dealId,
    },
  });

  return (
    <div>
    {pocs.length > 0 ? (
      pocs.map((poc) => (
        <PocItem
        key={poc.id}
        name={poc.name}
        workPhone={poc.workPhone}
        email={poc.email}
        websites={poc.websites}
        dealId={dealId}
        dealType={dealType}
        />
      ))
    ) : (
      <div className="flex flex-col items-center justify-center text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
      <h3 className="text-lg font-semibold">No PoCs Available</h3>
      <p className="mt-2 text-sm text-muted-foreground">
      No Points of Contact have been created for this deal yet.
      </p>
      <p className="text-sm text-muted-foreground">Create First PoC</p>
      </div>
    )}
    </div>
  );
};

export default FetchDealPoc;
