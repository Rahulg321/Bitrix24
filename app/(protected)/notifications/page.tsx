"use client";

import {
  getNotifications,
  markNotificationAsSeen,
} from "@/app/actions/notifications";
import { Notification } from "@prisma/client";
import { Circle, Dot, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useTransition, useRef, useCallback, useEffect } from "react";

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
  const userSession = useSession();

  const userId = userSession.data ? userSession.data.user.id : undefined;

  // extract this logic to some sort of hook eventually
  const [completedDeals, setCompletedDeals] = useState<Notification[]>([]);
  const [pendingDeals, setPendingDeals] = useState<Notification[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef(1000);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const notifications = await getNotifications(userId);
    setPendingDeals(
      notifications.filter((notif) => notif.status === "PENDING"),
    );
    setCompletedDeals(
      notifications.filter((notif) => notif.status === "COMPLETED"),
    );
    // TODO: implement graceful error displaying
  }, [userId]);

  const fetchAndTransition = useCallback(() => {
    startTransition(() => {
      fetchNotifications();
    });
  }, [userId]);

  useEffect(() => {
    fetchAndTransition();
  }, [fetchAndTransition]);

  const formatEbitda = (ebitda: number) => {
    if (ebitda >= 1000000) {
      return `$${(ebitda / 1000000).toFixed(1)}M`;
    } else if (ebitda >= 1000) {
      return `$${(ebitda / 1000).toFixed(1)}K`;
    }
    return `$${ebitda.toLocaleString()}`;
  };

  const connectWebSocket = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080";

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      ws.send(JSON.stringify({ type: "register", userId }));
      retryDelayRef.current = 1000;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
    ws.onmessage = (e) => {
      try {
        const msg: WebSocketMessage = JSON.parse(e.data);
        if (msg.type === "new_screen_call") fetchAndTransition();
        if (msg.type === "problem_done" && msg.productId) fetchAndTransition();
      } catch {}
    };
    const scheduleReconnect = () => {
      if (reconnectTimeoutRef.current) return;
      const delay = Math.min(retryDelayRef.current, 10000);
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connectWebSocket();
      }, delay);
      retryDelayRef.current = Math.min(delay * 2, 10000);
    };
    ws.onclose = () => {
      setWsConnected(false);
      scheduleReconnect();
    };
    ws.onerror = () => {
      setWsConnected(false);
      scheduleReconnect();
    };
  }, [userId, fetchAndTransition]);

  useEffect(() => {
    if (!userId) return;
    connectWebSocket();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      retryDelayRef.current = 1000;
    };
  }, [userId, connectWebSocket]);

  if (!userSession.data)
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
        <div className="flex flex-col items-end gap-y-4 text-left">
          {completedDeals.map((deal) => (
            <a
              onMouseEnter={() => {
                setCompletedDeals(
                  [
                    ...completedDeals.filter((_deal) => _deal.id !== deal.id),
                    {
                      ...deal,
                      seen: true,
                    },
                  ].sort(
                    (a, b) => b.createdAt.valueOf() - a.createdAt.valueOf(),
                  ),
                );
                markNotificationAsSeen(deal.id);
              }}
              key={deal.id}
              href={`/raw-deals/${deal.dealId}`}
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
              {!deal.seen && <Circle size={12} fill="red" color="red" />}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
