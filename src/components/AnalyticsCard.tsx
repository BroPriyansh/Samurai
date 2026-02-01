import { BarChart3, TrendingUp, Clock, Hash } from "lucide-react";
import type { TopAnalytics } from "@/types/activity";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  analytics: TopAnalytics | null;
  loading?: boolean;
  onWindowChange?: (window: "1m" | "5m" | "1h") => void;
  currentWindow?: string;
}

const windowLabels = {
  "1m": "1 min",
  "5m": "5 min",
  "1h": "1 hour",
};

export function AnalyticsCard({ analytics, loading, onWindowChange, currentWindow = "1h" }: AnalyticsCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Top Analytics</h3>
        </div>
        <div className="flex gap-1">
          {(["1m", "5m", "1h"] as const).map((w) => (
            <button
              key={w}
              onClick={() => onWindowChange?.(w)}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                currentWindow === w
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {windowLabels[w]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card text-center">
                <div className="text-2xl font-bold text-foreground">{analytics.total_events}</div>
                <div className="mt-1 text-xs text-muted-foreground">Total Events</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-2xl font-bold text-foreground">{analytics.top_verbs.length}</div>
                <div className="mt-1 text-xs text-muted-foreground">Unique Verbs</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-2xl font-bold text-foreground">{analytics.top_objects.length}</div>
                <div className="mt-1 text-xs text-muted-foreground">Unique Objects</div>
              </div>
            </div>

            {/* Top verbs */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                Top Verbs
              </div>
              <div className="space-y-2">
                {analytics.top_verbs.slice(0, 5).map((item, i) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className="mono w-6 text-xs text-muted-foreground">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{item.key}</span>
                        <span className="mono text-xs text-primary">{item.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${(item.count / (analytics.top_verbs[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {analytics.top_verbs.length === 0 && (
                  <p className="text-sm text-muted-foreground">No data in this window</p>
                )}
              </div>
            </div>

            {/* Top objects */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Hash className="h-4 w-4 text-accent" />
                Top Objects
              </div>
              <div className="space-y-2">
                {analytics.top_objects.slice(0, 5).map((item, i) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className="mono w-6 text-xs text-muted-foreground">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <code className="mono text-sm text-foreground">{item.key}</code>
                        <span className="mono text-xs text-accent">{item.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{
                            width: `${(item.count / (analytics.top_objects[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {analytics.top_objects.length === 0 && (
                  <p className="text-sm text-muted-foreground">No data in this window</p>
                )}
              </div>
            </div>

            {/* Window info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {new Date(analytics.window_start).toLocaleTimeString()} –{" "}
                {new Date(analytics.window_end).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No analytics data
          </div>
        )}
      </div>
    </div>
  );
}
