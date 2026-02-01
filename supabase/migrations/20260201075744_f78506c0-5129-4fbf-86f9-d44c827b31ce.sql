-- Events table - core activity events
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id TEXT NOT NULL,
  verb TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  target_user_ids TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table - user-specific notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event counters for analytics (sliding window aggregations)
CREATE TABLE public.event_counters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counter_key TEXT NOT NULL,
  counter_type TEXT NOT NULL, -- 'verb' or 'object_id'
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance (read-heavy workload)
CREATE INDEX idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX idx_events_actor_id ON public.events(actor_id);
CREATE INDEX idx_events_target_users ON public.events USING GIN(target_user_ids);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_event_id ON public.notifications(event_id);
CREATE INDEX idx_event_counters_key ON public.event_counters(counter_key, counter_type);
CREATE INDEX idx_event_counters_window ON public.event_counters(window_start, window_end);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_counters ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow all operations for demo (mock auth)
CREATE POLICY "Allow all events operations" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all notifications operations" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all counters operations" ON public.event_counters FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;