"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import AddPocDialog from "./Dialogs/add-poc-dialog";
import DeletePocButton from "./Buttons/delete-poc-button";

interface POC {
  id: string;
  name: string;
  email: string;
  workPhone?: string | null;
}

const FetchDealPOC = ({ dealId }: { dealId: string }) => {
  const [pocs, setPocs] = useState<POC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/deals/${dealId}/pocs`);
        if (res.ok) {
          const data = (await res.json()) as POC[];
          setPocs(data);
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
    <div className="space-y-4">
      <AddPocDialog dealId={dealId} />

      {pocs.length > 0 ? (
        <ul className="space-y-3 p-4">
          {pocs.map((poc) => (
            <li
              key={poc.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex-grow space-y-1.5 pr-4">
                <p className="text-sm font-semibold leading-tight">{poc.name}</p>
                <p className="text-xs text-muted-foreground">{poc.email}</p>
                {poc.workPhone && (
                  <p className="text-xs text-muted-foreground">{poc.workPhone}</p>
                )}
              </div>
              <DeletePocButton pocId={poc.id} dealId={dealId} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No points of contact found</h3>
        </div>
      )}
    </div>
  );
};

export default FetchDealPOC;