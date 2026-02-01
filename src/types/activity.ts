export interface Event {
  id: string;
  actor_id: string;
  verb: string;
  object_type: string;
  object_id: string;
  target_user_ids: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  event_id: string;
  is_read: boolean;
  created_at: string;
  events: Event | null;
}

export interface FeedResponse {
  events: Event[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export interface TopAnalytics {
  window: string;
  window_start: string;
  window_end: string;
  total_events: number;
  top_verbs: { key: string; count: number }[];
  top_objects: { key: string; count: number }[];
}

export type VerbType = "starred" | "forked" | "commented" | "merged" | "opened" | "followed" | "liked" | "shared";

export const VERB_CONFIG: Record<VerbType, { label: string; icon: string; color: string }> = {
  starred: { label: "starred", icon: "Star", color: "star" },
  forked: { label: "forked", icon: "GitFork", color: "fork" },
  commented: { label: "commented on", icon: "MessageSquare", color: "comment" },
  merged: { label: "merged", icon: "GitMerge", color: "merge" },
  opened: { label: "opened", icon: "CircleDot", color: "issue" },
  followed: { label: "followed", icon: "UserPlus", color: "follow" },
  liked: { label: "liked", icon: "Heart", color: "star" },
  shared: { label: "shared", icon: "Share2", color: "comment" },
};
