"use client";

import { getNotifications } from "@/app/actions/notifications";
import { Notification } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useTransition, useRef, useCallback, useEffect } from "react";

type WebSocketMessage = {
  type: string;
  productId?: string;
  status?: string;
  userId?: string;
};

export default function useNotifications() {
  const userSession = useSession();

  const userId = userSession.data ? userSession.data.user.id : undefined;

  // extract this logic to some sort of hook eventually
	const [notifications, setNotifications] = useState<Notification[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef(1000);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const notifications = await getNotifications(userId);
		setNotifications(notifications);
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


	// maybe use better "loading" variable?
	// using wsConnected mainly as a sign of if userSession is fetched
	return {notifications, wsConnected}
}
