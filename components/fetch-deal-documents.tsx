"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";
import { DealType } from "@prisma/client";

const DealDocumentItem = dynamic(() => import("./DealDocumentItem"), { ssr: false });

interface Props {
  dealId: string;
  dealType: DealType;
  refreshKey?: number;
}

interface DealDocument {
  id: string;
  title: string;
  description: string | null;
  category: string;
  documentUrl: string;
}

export default function FetchDealDocuments({ dealId, dealType, refreshKey }: Props) {
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/deals/${dealId}/deal-documents`);
        if (res.ok) {
          const data = (await res.json()) as DealDocument[];
          setDocuments(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [dealId, refreshKey]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {documents.length > 0 ? (
        documents.map((doc) => (
          <DealDocumentItem
            key={doc.id}
            title={doc.title}
            description={doc.description || ""}
            category={doc.category}
            documentId={doc.id}
            dealId={dealId}
            dealType={dealType}
            fileUrl={doc.documentUrl}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
          <h3 className="text-lg font-semibold">No Documents Available</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            No documents have been created for this deal yet.
          </p>
          <p className="text-sm text-muted-foreground">Create First Document</p>
        </div>
      )}
    </div>
  );
}