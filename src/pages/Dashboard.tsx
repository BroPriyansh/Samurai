import { useEffect, useState, useCallback } from "react";
import { Activity, Bell, RefreshCw, ChevronDown, User, Zap } from "lucide-react";
import { useActivityFeed, useNotifications, useTopAnalytics } from "@/hooks/useActivity";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { ActivityCard } from "@/components/ActivityCard";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { AnalyticsCard } from "@/components/AnalyticsCard";
import { EventCreator } from "@/components/EventCreator";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DEMO_USER_ID = "demo-user";

const Dashboard = () => {
  const [currentUserId] = useState(DEMO_USER_ID);
  const [analyticsWindow, setAnalyticsWindow] = useState<"1m" | "5m" | "1h">("1h");
  const [showNotifications, setShowNotifications] = useState(false);

  // Hooks
  const { events, loading: feedLoading, hasMore, fetchFeed, refresh } = useActivityFeed(currentUserId);
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications(currentUserId);
  const { analytics, loading: analyticsLoading, fetchTop } = useTopAnalytics();
  const { liveNotifications, connected, reconnect } = useRealtimeNotifications(currentUserId);

  // Initial data fetch
  useEffect(() => {
    fetchFeed(true);
    fetchNotifications();
    fetchTop(analyticsWindow);
  }, []);

  // Refresh analytics when window changes
  useEffect(() => {
    fetchTop(analyticsWindow);
  }, [analyticsWindow]);

  // Show toast for live notifications
  useEffect(() => {
    if (liveNotifications.length > 0) {
      const latest = liveNotifications[0];
      if (latest.events) {
        toast.info(`${latest.events.actor_id} ${latest.events.verb} ${latest.events.object_type}`, {
          description: latest.events.object_id,
        });
      }
    }
  }, [liveNotifications]);

  const handleEventCreated = useCallback(() => {
    refresh();
    fetchTop(analyticsWindow);
    fetchNotifications();
  }, [refresh, fetchTop, analyticsWindow, fetchNotifications]);

  const totalUnread = unreadCount + liveNotifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Activity Feed</h1>
              <p className="text-xs text-muted-foreground">Real-time notifications system</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ConnectionStatus connected={connected} onReconnect={reconnect} />
            
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {totalUnread > 0 && (
                <span className="notification-badge absolute -right-1 -top-1 h-5 min-w-[20px]">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </Button>

            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{currentUserId}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Feed column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Activity Feed</h2>
              </div>
              <Button variant="outline" size="sm" onClick={refresh} disabled={feedLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${feedLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Live notifications preview */}
            {liveNotifications.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <span className="pulse-dot" />
                  Live Updates
                </div>
                {liveNotifications.slice(0, 3).map((notif) =>
                  notif.events ? (
                    <ActivityCard key={notif.id} event={notif.events} isNew />
                  ) : null
                )}
              </div>
            )}

            {/* Feed events */}
            <div className="space-y-3">
              {events.map((event) => (
                <ActivityCard key={event.id} event={event} />
              ))}

              {events.length === 0 && !feedLoading && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
                  <Activity className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">No activity yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Create an event to get started</p>
                </div>
              )}

              {feedLoading && (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}

              {hasMore && !feedLoading && events.length > 0 && (
                <Button variant="ghost" className="w-full" onClick={() => fetchFeed()}>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Load More
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event creator */}
            <EventCreator currentUserId={currentUserId} onEventCreated={handleEventCreated} />

            {/* Analytics */}
            <AnalyticsCard
              analytics={analytics}
              loading={analyticsLoading}
              currentWindow={analyticsWindow}
              onWindowChange={setAnalyticsWindow}
            />

            {/* Notifications panel (mobile/toggle) */}
            {showNotifications && (
              <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:relative lg:inset-auto lg:bg-transparent lg:backdrop-blur-none">
                <div className="fixed right-0 top-0 h-full w-full max-w-md lg:relative lg:max-w-none">
                  <NotificationsPanel
                    notifications={[...liveNotifications, ...notifications]}
                    unreadCount={totalUnread}
                    onMarkRead={markAsRead}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-muted-foreground">
              Activity Feed System Demo • Built with Lovable Cloud
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Target: 200M events</span>
              <span>•</span>
              <span>2k concurrent connections</span>
              <span>•</span>
              <span>SSE streaming</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
