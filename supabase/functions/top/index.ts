import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type WindowType = "1m" | "5m" | "1h";

const windowDurations: Record<WindowType, number> = {
  "1m": 60000,
  "5m": 300000,
  "1h": 3600000,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const window = (url.searchParams.get("window") || "1h") as WindowType;

    if (!windowDurations[window]) {
      return new Response(
        JSON.stringify({ error: "Invalid window. Use 1m, 5m, or 1h" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowDurations[window]);

    // Query events within the time window and aggregate
    const { data: events, error } = await supabase
      .from("events")
      .select("verb, object_id")
      .gte("created_at", windowStart.toISOString())
      .lte("created_at", now.toISOString());

    if (error) {
      console.error("Top query error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate verb counts
    const verbCounts: Record<string, number> = {};
    const objectCounts: Record<string, number> = {};

    for (const event of events || []) {
      verbCounts[event.verb] = (verbCounts[event.verb] || 0) + 1;
      objectCounts[event.object_id] = (objectCounts[event.object_id] || 0) + 1;
    }

    // Sort and get top 100
    const topVerbs = Object.entries(verbCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([key, count]) => ({ key, count }));

    const topObjects = Object.entries(objectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([key, count]) => ({ key, count }));

    return new Response(
      JSON.stringify({
        window,
        window_start: windowStart.toISOString(),
        window_end: now.toISOString(),
        total_events: events?.length || 0,
        top_verbs: topVerbs,
        top_objects: topObjects,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
