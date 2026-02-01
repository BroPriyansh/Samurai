import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EventPayload {
  actor_id: string;
  verb: string;
  object_type: string;
  object_id: string;
  target_user_ids?: string[];
  metadata?: Record<string, unknown>;
  created_at?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Mock auth: get user_id from header
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return new Response(JSON.stringify({ error: "x-user-id header required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: EventPayload = await req.json();

    // Validate required fields
    if (!body.actor_id || !body.verb || !body.object_type || !body.object_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: actor_id, verb, object_type, object_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const eventData = {
      actor_id: body.actor_id,
      verb: body.verb,
      object_type: body.object_type,
      object_id: body.object_id,
      target_user_ids: body.target_user_ids || [],
      metadata: body.metadata || {},
      created_at: body.created_at || new Date().toISOString(),
    };

    // Insert event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert(eventData)
      .select("id")
      .single();

    if (eventError) {
      console.error("Event insert error:", eventError);
      return new Response(JSON.stringify({ error: eventError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create notifications for target users
    if (body.target_user_ids && body.target_user_ids.length > 0) {
      const notifications = body.target_user_ids.map((targetUserId) => ({
        user_id: targetUserId,
        event_id: event.id,
        is_read: false,
      }));

      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("Notification insert error:", notifError);
      }
    }

    // Update counters for analytics (sliding window)
    const now = new Date();
    const windows = [
      { name: "1m", start: new Date(now.getTime() - 60000), end: now },
      { name: "5m", start: new Date(now.getTime() - 300000), end: now },
      { name: "1h", start: new Date(now.getTime() - 3600000), end: now },
    ];

    // Update verb and object_id counters
    for (const window of windows) {
      const verbKey = `${body.verb}:${window.name}`;
      const objectKey = `${body.object_id}:${window.name}`;

      // Upsert verb counter
      await supabase.from("event_counters").upsert(
        {
          counter_key: verbKey,
          counter_type: "verb",
          count: 1,
          window_start: window.start.toISOString(),
          window_end: window.end.toISOString(),
          updated_at: now.toISOString(),
        },
        { onConflict: "counter_key,counter_type" }
      );

      // Upsert object counter
      await supabase.from("event_counters").upsert(
        {
          counter_key: objectKey,
          counter_type: "object_id",
          count: 1,
          window_start: window.start.toISOString(),
          window_end: window.end.toISOString(),
          updated_at: now.toISOString(),
        },
        { onConflict: "counter_key,counter_type" }
      );
    }

    return new Response(JSON.stringify({ event_id: event.id }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
