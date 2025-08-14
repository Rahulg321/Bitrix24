// components/DealHistoryView.tsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import revertDealVersion from "@/app/actions/revert-deal-version";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Version {
  id: string;
  snapshot: Record<string, any>;
  createdAt: string;
}

function diffSnapshots(a: Record<string, any>, b: Record<string, any> | null) {
  if (!b) return [] as Array<{ field: string; oldVal: any; newVal: any }>;
  const fields = new Set([...Object.keys(a), ...Object.keys(b)]);
  const changes: Array<{ field: string; oldVal: any; newVal: any }> = [];
  fields.forEach((f) => {
    const prevVal = b[f];
    const nextVal = a[f];
    if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
      changes.push({ field: f, oldVal: prevVal, newVal: nextVal });
    }
  });
  return changes;
}

export default function DealHistoryView({ dealId }: { dealId: string }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/deals/${dealId}/versions`)
      .then((res) => res.json())
      .then(setVersions);
  }, [dealId]);

  const getOlderSnapshot = (idx: number) =>
    idx + 1 < versions.length ? versions[idx + 1].snapshot : null;

  return (
    <div className="divide-y">
      {versions.map((v, idx) => {
        const changes = diffSnapshots(v.snapshot, getOlderSnapshot(idx));
        return (
          <div key={v.id} className="py-2">
            <button
              onClick={() => setOpenId(openId === v.id ? null : v.id)}
              className="w-full flex justify-between items-center text-left"
            >
              <div>
                <strong>{new Date(v.createdAt).toLocaleString()}</strong>
                {changes.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {changes.length} field{changes.length > 1 ? "s" : ""} changed
                  </span>
                )}
              </div>
              <span className="ml-2">{openId === v.id ? "▲" : "▼"}</span>
            </button>
            {openId === v.id && (
              <div className="mt-2 space-y-3 bg-muted/50 p-3 rounded">
                {changes.length > 0 ? (
                  <ul className="list-disc pl-5 text-xs">
                    {changes.map((c) => (
                      <li key={c.field}>
                        <strong>{c.field}</strong>: {JSON.stringify(c.oldVal)} &rarr; {JSON.stringify(c.newVal)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No visible difference</p>
                )}

                <button
                  className="mt-4 rounded bg-primary px-2 py-1 text-xs text-white disabled:opacity-50"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await revertDealVersion(v.id, dealId);
                      if (res.type === "success") {
                        toast({
                          title: "Version reverted",
                          description: "Deal has been reverted to selected version.",
                        });
                        router.refresh();
                      } else {
                        toast({
                          title: "Revert failed",
                          description: res.message ?? "Failed to revert deal.",
                          variant: "destructive",
                        });
                      }
                    })
                  }
                >
                  {isPending ? "Reverting…" : "Revert to this version"}
                </button>
              </div>
            )}
          </div>
        );
      })}
      {versions.length === 0 && (
        <p className="p-4 text-sm text-gray-500">No version history.</p>
      )}
    </div>
  );
}
