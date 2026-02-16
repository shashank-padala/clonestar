"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type VoiceRow = {
  id: string;
  name: string;
  provider_voice_id: string;
  created_at: string;
};

export async function listVoices(): Promise<VoiceRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("voices")
    .select("id, name, provider_voice_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function addVoice(name: string, provider_voice_id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (!name.trim() || !provider_voice_id.trim()) return { error: "Name and voice ID are required" };

  const { error } = await supabase
    .from("voices")
    .insert({ user_id: user.id, name: name.trim(), provider_voice_id: provider_voice_id.trim() });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/voices");
  revalidatePath("/dashboard/generate");
  return {};
}

export async function deleteVoice(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("voices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/voices");
  revalidatePath("/dashboard/generate");
  return {};
}

/** Returns count of avatars that use this voice as default (for display only). */
export async function getAvatarCountByVoice(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data: avatars } = await supabase
    .from("avatars")
    .select("default_voice_id")
    .eq("user_id", user.id);

  const counts: Record<string, number> = {};
  for (const a of avatars ?? []) {
    if (a.default_voice_id) {
      counts[a.default_voice_id] = (counts[a.default_voice_id] ?? 0) + 1;
    }
  }
  return counts;
}
