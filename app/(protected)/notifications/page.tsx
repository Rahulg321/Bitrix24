"use client";

import {
  getNotifications,
  markNotificationAsSeen,
} from "@/app/actions/notifications";
import useNotifications from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { Notification } from "@prisma/client";
import { Circle, Dot, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";

type PendingDeal = {
  id: string;
  title: string;
  ebitda: number;
  status: string;
};

type WebSocketMessage = {
  type: string;
  productId?: string;
  status?: string;
  userId?: string;
};

export default function Notifications() {
  const { notifications, wsConnected } = useNotifications();
  const pendingDeals = notifications.filter(
    (notif) => notif.status === "PENDING",
  );
  const completedDeals = notifications.filter(
    (notif) => notif.status === "COMPLETED",
  );


  if (!wsConnected)
    return <div className="block-space big-container flex-1">Loading...</div>;

  return (
    <div className="block-space big-container flex flex-row">
      <div className="flex-1">
        <h3>Pending - {pendingDeals.length}</h3>
        {/* <div className="flex flex-col gap-y-4">
          {pendingDeals.map((deal) => (
            <div key={deal.id}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h5 className="truncate text-sm font-medium text-foreground">
                    {deal.dealTitle || `Deal #${deal.dealId}`}
                  </h5>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ID: {deal.id}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div> */}
        <div className="flex flex-col items-start gap-y-4 text-left">
          {pendingDeals.map((deal) => (
            <div
              key={deal.id}
              className="flex w-fit flex-row items-center gap-4 rounded-md border-2 p-2"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h5 className="truncate text-sm font-medium text-foreground">
                    {deal.dealTitle || `Deal #${deal.id}`}
                  </h5>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ID: {deal.dealId}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 text-right">
        <h3 className="mb-2">Completed - {completedDeals.length}</h3>
        <DataTable columns={columns} data={completedDeals} />
        {/* <div className="flex flex-col items-end gap-y-4 text-left">
          {completedDeals.map((deal) => (
            <a
              onMouseEnter={async () => {
                console.log(deal.seen);
                await markNotificationAsSeen(deal.id);
              }}
              key={deal.id}
              href={`/raw-deals/${deal.dealId}`}
              className={cn(
                "flex w-fit flex-row items-center gap-4 rounded-md border-2 p-2",
                {
                  "bg-red-100 font-semibold": !deal.seen,
                },
              )}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h5 className="truncate text-sm font-medium text-foreground">
                    {deal.dealTitle || `Deal #${deal.id}`}
                  </h5>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ID: {deal.dealId}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div> */}
      </div>
    </div>
  );
}
