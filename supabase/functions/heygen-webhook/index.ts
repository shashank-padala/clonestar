import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface HeyGenSuccessData {
  video_id?: string;
  url?: string;
  callback_id?: string;
}

interface HeyGenFailData {
  video_id?: string;
  msg?: string;
  callback_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { event_type?: string; event_data?: HeyGenSuccessData & HeyGenFailData };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { event_type, event_data } = body;
  if (!event_type || !event_data) {
    return new Response(JSON.stringify({ error: "Missing event_type or event_data" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY")!;
  const supabase = createClient(supabaseUrl, secretKey);

  const callbackId = event_data.callback_id;
  if (!callbackId) {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const updateIfPending = async (
    id: string,
    update: { status: string; video_url?: string | null; error_message?: string | null }
  ) => {
    const { data: row } = await supabase
      .from("generated_videos")
      .select("id, status")
      .eq("id", id)
      .single();
    if (row && row.status !== "video_done" && row.status !== "failed") {
      await supabase.from("generated_videos").update({ ...update, updated_at: new Date().toISOString() }).eq("id", id);
    }
  };

  if (event_type === "avatar_video.success") {
    const url = event_data.url;
    const videoId = event_data.video_id;
    await updateIfPending(callbackId, { status: "video_done", video_url: url ?? null });
    if (videoId && callbackId !== videoId) {
      const { data: byHeygen } = await supabase
        .from("generated_videos")
        .select("id, status")
        .eq("heygen_video_id", videoId)
        .single();
      if (byHeygen && byHeygen.status !== "video_done" && byHeygen.status !== "failed") {
        await supabase
          .from("generated_videos")
          .update({ status: "video_done", video_url: url ?? null, updated_at: new Date().toISOString() })
          .eq("id", byHeygen.id);
      }
    }
  } else if (event_type === "avatar_video.fail") {
    const msg = event_data.msg ?? "Unknown error";
    const videoId = event_data.video_id;
    await updateIfPending(callbackId, { status: "failed", error_message: msg });
    if (videoId && callbackId !== videoId) {
      const { data: byHeygen } = await supabase
        .from("generated_videos")
        .select("id, status")
        .eq("heygen_video_id", videoId)
        .single();
      if (byHeygen && byHeygen.status !== "video_done" && byHeygen.status !== "failed") {
        await supabase
          .from("generated_videos")
          .update({ status: "failed", error_message: msg, updated_at: new Date().toISOString() })
          .eq("id", byHeygen.id);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
