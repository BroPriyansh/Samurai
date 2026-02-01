import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  connected: boolean;
  onReconnect?: () => void;
}

export function ConnectionStatus({ connected, onReconnect }: ConnectionStatusProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
        connected
          ? "bg-success/10 text-success"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {connected ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span>Live</span>
          <span className="pulse-dot ml-1" />
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>Disconnected</span>
          {onReconnect && (
            <button
              onClick={onReconnect}
              className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
