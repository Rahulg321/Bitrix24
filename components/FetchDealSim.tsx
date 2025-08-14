"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";
import { DealType } from "@prisma/client";

const SimItem = dynamic(() => import("@/components/SimItem"), { ssr: false });

interface Props {
  dealId: string;
  dealType: DealType;
}

interface Sim {
  id: string;
  title: string;
  caption: string;
  status: string;
  fileUrl: string;
}

export default function FetchDealSim({ dealId, dealType }: Props) {
  const [sims, setSims] = useState<Sim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/deals/${dealId}/sims`);
        if (res.ok) {
          const data = (await res.json()) as Sim[];
          setSims(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [dealId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {sims.length > 0 ? (
        sims.map((sim) => (
          <SimItem
            key={sim.id}
            title={sim.title}
            description={sim.caption}
            status={sim.status}
            cimId={sim.id}
            dealId={dealId}
            dealType={dealType}
            fileUrl={sim.fileUrl}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold">No SIMs Available</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No Strategic Investment Memos have been created for this deal yet.
          </p>
          <p className="text-sm text-muted-foreground">Create First SIM</p>
        </div>
      )}
    </div>
  );
}