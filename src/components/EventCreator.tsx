import { useState } from "react";
import { Send, Shuffle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEventIngestion } from "@/hooks/useActivity";
import { toast } from "sonner";

const SAMPLE_VERBS = ["starred", "forked", "commented", "merged", "opened", "followed", "liked", "shared"];
const SAMPLE_OBJECT_TYPES = ["repository", "issue", "pull_request", "comment", "user", "post"];
const SAMPLE_USERS = ["alice", "bob", "charlie", "diana", "eve", "frank"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface EventCreatorProps {
  currentUserId: string;
  onEventCreated?: () => void;
}

export function EventCreator({ currentUserId, onEventCreated }: EventCreatorProps) {
  const { ingestEvent, loading } = useEventIngestion();
  const [actorId, setActorId] = useState(currentUserId);
  const [verb, setVerb] = useState("starred");
  const [objectType, setObjectType] = useState("repository");
  const [objectId, setObjectId] = useState("acme/project-x");
  const [targetUsers, setTargetUsers] = useState(currentUserId);

  const handleRandomize = () => {
    const actor = randomItem(SAMPLE_USERS);
    setActorId(actor);
    setVerb(randomItem(SAMPLE_VERBS));
    setObjectType(randomItem(SAMPLE_OBJECT_TYPES));
    setObjectId(`${randomItem(SAMPLE_USERS)}/${randomItem(["app", "api", "lib", "cli", "web"])}-${Math.floor(Math.random() * 100)}`);
    setTargetUsers(randomItem(SAMPLE_USERS.filter((u) => u !== actor)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await ingestEvent({
        actor_id: actorId,
        verb,
        object_type: objectType,
        object_id: objectId,
        target_user_ids: targetUsers.split(",").map((s) => s.trim()).filter(Boolean),
      });
      toast.success("Event created successfully!");
      onEventCreated?.();
    } catch (error) {
      toast.error("Failed to create event");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Create Event</h3>
        <Button variant="outline" size="sm" onClick={handleRandomize}>
          <Shuffle className="mr-2 h-4 w-4" />
          Randomize
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="actor">Actor ID</Label>
            <Input
              id="actor"
              value={actorId}
              onChange={(e) => setActorId(e.target.value)}
              placeholder="user123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="verb">Verb</Label>
            <select
              id="verb"
              value={verb}
              onChange={(e) => setVerb(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {SAMPLE_VERBS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="objectType">Object Type</Label>
            <select
              id="objectType"
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {SAMPLE_OBJECT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="objectId">Object ID</Label>
            <Input
              id="objectId"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
              placeholder="acme/project-x"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targets">Target Users (comma-separated)</Label>
          <Input
            id="targets"
            value={targetUsers}
            onChange={(e) => setTargetUsers(e.target.value)}
            placeholder="user1, user2"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send Event
        </Button>
      </form>
    </div>
  );
}
