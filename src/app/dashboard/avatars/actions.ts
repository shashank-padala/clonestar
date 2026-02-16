"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AvatarRow = {
  id: string;
  name: string;
  provider_avatar_id: string;
  image_url: string | null;
  default_voice_id: string | null;
  created_at: string;
};

export async function listAvatars(): Promise<AvatarRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("avatars")
    .select("id, name, provider_avatar_id, image_url, default_voice_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function addAvatar(payload: {
  name: string;
  provider_avatar_id: string;
  image_url?: string | null;
  default_voice_id?: string | null;
}): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  if (!payload.name.trim() || !payload.provider_avatar_id.trim())
    return { error: "Name and avatar ID are required" };

  const { data, error } = await supabase
    .from("avatars")
    .insert({
      user_id: user.id,
      name: payload.name.trim(),
      provider_avatar_id: payload.provider_avatar_id.trim(),
      image_url: payload.image_url ?? null,
      default_voice_id: payload.default_voice_id ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/avatars");
  revalidatePath("/dashboard/generate");
  return { id: data.id };
}

export async function updateAvatar(
  id: string,
  updates: { name?: string; default_voice_id?: string | null }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.default_voice_id !== undefined) payload.default_voice_id = updates.default_voice_id;

  const { error } = await supabase
    .from("avatars")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/avatars");
  revalidatePath("/dashboard/generate");
  return {};
}

export async function listVoices(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("voices")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name");
  return data ?? [];
}

export async function deleteAvatar(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("avatars")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/avatars");
  revalidatePath("/dashboard/generate");
  return {};
}
