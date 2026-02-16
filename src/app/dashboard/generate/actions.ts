"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { YoutubeTranscript } from "youtube-transcript";
import { rewriteScript } from "@/lib/openai";
import { textToSpeech } from "@/lib/elevenlabs";
import { createVideo } from "@/lib/heygen";

export async function listAvatarsForGenerate(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("avatars")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function listVoicesForGenerate(): Promise<{ id: string; name: string }[]> {
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

function extractVideoId(urlOrId: string): string | null {
  const trimmed = urlOrId.trim();
  const m = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/) || trimmed.match(/^([a-zA-Z0-9_-]{11})$/);
  return m ? m[1] : null;
}

export async function submitGenerate(params: {
  sourceType: "url" | "transcript";
  youtubeUrlOrTranscript: string;
  outputFormat: "9:16" | "16:9";
  language: string;
  lengthSeconds: number;
  avatarId: string;
  voiceId: string;
}): Promise<{ error?: string; jobId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (!params.avatarId || !params.voiceId) return { error: "Please select an avatar and a voice." };

  let rawTranscript: string;
  if (params.sourceType === "url") {
    const videoId = extractVideoId(params.youtubeUrlOrTranscript);
    if (!videoId) return { error: "Invalid YouTube URL. Paste a link like https://youtube.com/watch?v=..." };
    try {
      const segments = await YoutubeTranscript.fetchTranscript(params.youtubeUrlOrTranscript);
      rawTranscript = segments.map((s) => s.text).join(" ");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not fetch transcript.";
      return { error: `Transcript unavailable: ${msg}. Try pasting the transcript manually.` };
    }
  } else {
    rawTranscript = params.youtubeUrlOrTranscript.trim();
    if (!rawTranscript) return { error: "Please paste a transcript or enter a YouTube URL." };
  }

  const [profile, avatar, voice] = await Promise.all([
    supabase.from("profiles").select("openai_api_key, elevenlabs_api_key, heygen_api_key").eq("id", user.id).single(),
    supabase.from("avatars").select("provider_avatar_id").eq("id", params.avatarId).eq("user_id", user.id).single(),
    supabase.from("voices").select("provider_voice_id").eq("id", params.voiceId).eq("user_id", user.id).single(),
  ]);

  const openaiKey = profile.data?.openai_api_key || process.env.OPENAI_API_KEY;
  const elevenLabsKey = profile.data?.elevenlabs_api_key;
  const heygenKey = profile.data?.heygen_api_key;

  if (!openaiKey) return { error: "OpenAI API key not set. Add it in Settings or set OPENAI_API_KEY." };
  if (!elevenLabsKey) return { error: "ElevenLabs API key not set in Settings." };
  if (!heygenKey) return { error: "HeyGen API key not set in Settings." };
  if (!avatar.data?.provider_avatar_id) return { error: "Avatar not found." };
  if (!voice.data?.provider_voice_id) return { error: "Voice not found." };

  let script: string;
  let title: string;
  try {
    const result = await rewriteScript({
      transcript: rawTranscript,
      outputFormat: params.outputFormat,
      language: params.language,
      lengthSeconds: params.lengthSeconds,
      apiKey: openaiKey,
    });
    script = result.script;
    title = result.title;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Script generation failed.";
    return { error: msg };
  }

  const { data: job, error: insertError } = await supabase
    .from("generated_videos")
    .insert({
      user_id: user.id,
      title,
      script,
      output_format: params.outputFormat,
      language: params.language,
      length_seconds: params.lengthSeconds,
      avatar_id: params.avatarId,
      voice_id: params.voiceId,
      status: "script_done",
    })
    .select("id")
    .single();

  if (insertError || !job) return { error: insertError?.message ?? "Failed to create job." };

  const jobId = job.id;

  let audioUrl: string;
  try {
    const audioBuffer = await textToSpeech({
      text: script,
      voiceId: voice.data.provider_voice_id,
      apiKey: elevenLabsKey,
    });
    const admin = createAdminClient();
    const path = `${user.id}/${jobId}/audio.mp3`;
    const { error: uploadError } = await admin.storage
      .from("generated-videos")
      .upload(path, new Blob([audioBuffer]), { contentType: "audio/mpeg", upsert: true });
    if (uploadError) throw new Error(uploadError.message);
    const { data: urlData } = admin.storage.from("generated-videos").getPublicUrl(path);
    audioUrl = urlData.publicUrl;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Voice generation failed.";
    await supabase.from("generated_videos").update({ status: "failed", error_message: msg }).eq("id", jobId);
    return { error: msg };
  }

  await supabase
    .from("generated_videos")
    .update({ status: "voice_done", audio_url: audioUrl, updated_at: new Date().toISOString() })
    .eq("id", jobId);

  const dimension = params.outputFormat === "9:16" ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };

  try {
    const { videoId } = await createVideo({
      talkingPhotoId: avatar.data.provider_avatar_id,
      audioUrl,
      dimension,
      callbackId: jobId,
      apiKey: heygenKey,
      title,
    });
    await supabase
      .from("generated_videos")
      .update({
        status: "video_pending",
        heygen_video_id: videoId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Video creation failed.";
    await supabase.from("generated_videos").update({ status: "failed", error_message: msg }).eq("id", jobId);
    return { error: msg };
  }

  revalidatePath("/dashboard/videos");
  return { jobId };
}
