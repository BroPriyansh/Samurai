import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Event, FeedResponse, NotificationsResponse, TopAnalytics } from "@/types/activity";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function useActivityFeed(userId: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({ user_id: userId, limit: "20" });
      if (!reset && cursor) params.append("cursor", cursor);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/feed?${params}`, {
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      const data: FeedResponse = await response.json();
      
      if (reset) {
        setEvents(data.events);
      } else {
        setEvents((prev) => [...prev, ...data.events]);
      }
      setCursor(data.next_cursor);
      setHasMore(data.has_more);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, cursor, hasMore, loading]);

  const refresh = useCallback(() => {
    setCursor(null);
    setHasMore(true);
    return fetchFeed(true);
  }, [fetchFeed]);

  return { events, loading, hasMore, fetchFeed, refresh };
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<NotificationsResponse["notifications"]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async (since?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (since) params.append("since", since);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/notifications?${params}`, {
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      const data: NotificationsResponse = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  return { notifications, unreadCount, loading, fetchNotifications, markAsRead };
}

export function useTopAnalytics() {
  const [analytics, setAnalytics] = useState<TopAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTop = useCallback(async (window: "1m" | "5m" | "1h" = "1h") => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/top?window=${window}`, {
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      const data: TopAnalytics = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching top analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { analytics, loading, fetchTop };
}

export function useEventIngestion() {
  const [loading, setLoading] = useState(false);

  const ingestEvent = useCallback(async (event: {
    actor_id: string;
    verb: string;
    object_type: string;
    object_id: string;
    target_user_ids?: string[];
    metadata?: Record<string, unknown>;
  }) => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "x-user-id": event.actor_id,
        },
        body: JSON.stringify(event),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error ingesting event:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { ingestEvent, loading };
}
