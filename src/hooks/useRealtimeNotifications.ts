import { useEffect, useRef, useState, useCallback } from "react";
import type { Notification } from "@/types/activity";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function useRealtimeNotifications(userId: string) {
  const [liveNotifications, setLiveNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = `${SUPABASE_URL}/functions/v1/notifications-stream?user_id=${userId}`;
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          setLiveNotifications((prev) => [data.data, ...prev].slice(0, 50));
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    eventSourceRef.current = eventSource;
  }, [userId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
  }, []);

  const clearLiveNotifications = useCallback(() => {
    setLiveNotifications([]);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { liveNotifications, connected, clearLiveNotifications, reconnect: connect };
}
