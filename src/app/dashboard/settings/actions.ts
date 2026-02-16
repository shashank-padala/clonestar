"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type ProfileForm = {
  full_name: string;
  elevenlabs_api_key: string;
  heygen_api_key: string;
  openai_api_key: string;
};

const KEY_MASK = "••••••••••••";

export async function getProfile(): Promise<ProfileForm | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("full_name, elevenlabs_api_key, heygen_api_key, openai_api_key")
    .eq("id", user.id)
    .single();

  if (!data) return null;
  return {
    full_name: data.full_name ?? "",
    elevenlabs_api_key: data.elevenlabs_api_key ? KEY_MASK : "",
    heygen_api_key: data.heygen_api_key ? KEY_MASK : "",
    openai_api_key: data.openai_api_key ? KEY_MASK : "",
  };
}

export { KEY_MASK };

export async function updateProfile(form: ProfileForm): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload: Record<string, unknown> = {
    full_name: form.full_name || null,
    updated_at: new Date().toISOString(),
  };
  if (form.elevenlabs_api_key && form.elevenlabs_api_key !== KEY_MASK)
    payload.elevenlabs_api_key = form.elevenlabs_api_key;
  if (form.heygen_api_key && form.heygen_api_key !== KEY_MASK)
    payload.heygen_api_key = form.heygen_api_key;
  if (form.openai_api_key && form.openai_api_key !== KEY_MASK)
    payload.openai_api_key = form.openai_api_key;

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return {};
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return {};
}
