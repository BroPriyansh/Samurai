import { formatDistanceToNow } from "date-fns";
import { Bell, Check, X } from "lucide-react";
import type { Notification } from "@/types/activity";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const event = notification.events;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg p-3 transition-colors",
        notification.is_read
          ? "bg-transparent hover:bg-secondary/50"
          : "bg-primary/5 hover:bg-primary/10"
      )}
    >
      {/* Unread indicator */}
      <div className="mt-1.5">
        {notification.is_read ? (
          <div className="h-2 w-2 rounded-full bg-muted" />
        ) : (
          <div className="pulse-dot" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {event ? (
          <>
            <p className="text-sm">
              <span className="font-medium text-foreground">{event.actor_id}</span>
              <span className="text-muted-foreground"> {event.verb} </span>
              <span className="font-medium text-foreground">{event.object_type}</span>
            </p>
            <code className="mono mt-1 block truncate text-xs text-primary">
              {event.object_id}
            </code>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Event details unavailable</p>
        )}
        <span className="mt-1 block text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </span>
      </div>

      {/* Actions */}
      {!notification.is_read && onMarkRead && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100"
          onClick={() => onMarkRead(notification.id)}
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface NotificationsPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead?: (id: string) => void;
  onClose?: () => void;
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  onMarkRead,
  onClose,
}: NotificationsPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={onMarkRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
