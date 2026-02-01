import { formatDistanceToNow } from "date-fns";
import { Star, GitFork, MessageSquare, GitMerge, CircleDot, UserPlus, Heart, Share2, Activity } from "lucide-react";
import type { Event, VerbType, VERB_CONFIG } from "@/types/activity";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  event: Event;
  isNew?: boolean;
}

const verbIcons: Record<string, typeof Star> = {
  starred: Star,
  forked: GitFork,
  commented: MessageSquare,
  merged: GitMerge,
  opened: CircleDot,
  followed: UserPlus,
  liked: Heart,
  shared: Share2,
};

const verbColors: Record<string, string> = {
  starred: "event-badge-star",
  forked: "event-badge-fork",
  commented: "event-badge-comment",
  merged: "event-badge-merge",
  opened: "event-badge-issue",
  followed: "event-badge-follow",
  liked: "event-badge-star",
  shared: "event-badge-comment",
};

export function ActivityCard({ event, isNew }: ActivityCardProps) {
  const Icon = verbIcons[event.verb] || Activity;
  const badgeClass = verbColors[event.verb] || "event-badge-follow";

  return (
    <div className={cn("activity-card group", isNew && "animate-slide-in border-glow")}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium uppercase text-secondary-foreground">
          {event.actor_id.slice(0, 2)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{event.actor_id}</span>
            <span className={cn("event-badge", badgeClass)}>
              <Icon className="h-3 w-3" />
              {event.verb}
            </span>
            <span className="text-muted-foreground">{event.object_type}</span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <code className="mono rounded bg-secondary px-1.5 py-0.5 text-xs text-primary">
              {event.object_id}
            </code>
            {event.target_user_ids.length > 0 && (
              <span className="text-xs text-muted-foreground">
                → {event.target_user_ids.join(", ")}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</span>
            <span className="mono opacity-50">{event.id.slice(0, 8)}</span>
          </div>
        </div>

        {/* New indicator */}
        {isNew && (
          <div className="flex items-center gap-2">
            <span className="pulse-dot" />
            <span className="text-xs font-medium text-primary">NEW</span>
          </div>
        )}
      </div>
    </div>
  );
}
