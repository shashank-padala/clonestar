-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles: extends auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  elevenlabs_api_key TEXT,
  heygen_api_key TEXT,
  openai_api_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voices: user's ElevenLabs voice mappings
CREATE TABLE public.voices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider_voice_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Avatars: user's HeyGen avatar mappings (photo avatar = talking_photo_id)
CREATE TABLE public.avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider_avatar_id TEXT NOT NULL,
  image_url TEXT,
  default_voice_id UUID REFERENCES public.voices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generated videos: pipeline jobs
CREATE TYPE video_status AS ENUM (
  'script_done',
  'voice_done',
  'video_pending',
  'video_done',
  'failed'
);

CREATE TABLE public.generated_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  script TEXT,
  output_format TEXT NOT NULL CHECK (output_format IN ('9:16', '16:9')),
  language TEXT NOT NULL,
  length_seconds INTEGER NOT NULL,
  avatar_id UUID NOT NULL REFERENCES public.avatars(id) ON DELETE CASCADE,
  voice_id UUID NOT NULL REFERENCES public.voices(id) ON DELETE CASCADE,
  status video_status NOT NULL DEFAULT 'script_done',
  heygen_video_id TEXT,
  video_url TEXT,
  audio_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_videos ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own row; insert via trigger
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Voices
CREATE POLICY "Users can manage own voices" ON public.voices
  FOR ALL USING (auth.uid() = user_id);

-- Avatars
CREATE POLICY "Users can manage own avatars" ON public.avatars
  FOR ALL USING (auth.uid() = user_id);

-- Generated videos
CREATE POLICY "Users can manage own generated_videos" ON public.generated_videos
  FOR ALL USING (auth.uid() = user_id);

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket 'avatars': create in Dashboard (Storage > New bucket) or run:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- Then add policy: storage.policies for bucket 'avatars' allow select, insert, update, delete
-- where (storage.foldername(name))[1] = auth.uid()::text;

-- Storage bucket: generated-videos (for audio files)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('generated-videos', 'generated-videos', false);
