"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type VideoStatus = "script_done" | "voice_done" | "video_pending" | "video_done" | "failed";

export type GeneratedVideoRow = {
  id: string;
  title: string;
  output_format: string;
  status: VideoStatus;
  video_url: string | null;
  error_message: string | null;
  created_at: string;
  avatar: { name: string } | null;
  voice: { name: string } | null;
};

export async function listGeneratedVideos(filters?: {
  status?: VideoStatus;
  format?: string;
  avatar_id?: string;
}): Promise<GeneratedVideoRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("generated_videos")
    .select(
      "id, title, output_format, status, video_url, error_message, created_at, avatars(name), voices(name)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.format) query = query.eq("output_format", filters.format);
  if (filters?.avatar_id) query = query.eq("avatar_id", filters.avatar_id);

  const { data } = await query;
  const rows = (data ?? []) as unknown as {
    id: string;
    title: string;
    output_format: string;
    status: VideoStatus;
    video_url: string | null;
    error_message: string | null;
    created_at: string;
    avatars: { name: string } | { name: string }[] | null;
    voices: { name: string } | { name: string }[] | null;
  }[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    output_format: r.output_format,
    status: r.status,
    video_url: r.video_url,
    error_message: r.error_message,
    created_at: r.created_at,
    avatar: Array.isArray(r.avatars) ? r.avatars[0] ?? null : r.avatars,
    voice: Array.isArray(r.voices) ? r.voices[0] ?? null : r.voices,
  }));
}

export async function deleteGeneratedVideo(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("generated_videos").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/videos");
  return {};
}
