"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Link2, FileText, Sparkles, CheckCircle } from "lucide-react";
import { listAvatarsForGenerate, listVoicesForGenerate, submitGenerate } from "./actions";
import { toast } from "sonner";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "hi", label: "Hindi" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
];

export default function GeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [avatars, setAvatars] = useState<{ id: string; name: string }[]>([]);
  const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [sourceType, setSourceType] = useState<"url" | "transcript">("url");
  const [youtubeUrlOrTranscript, setYoutubeUrlOrTranscript] = useState("");
  const [outputFormat, setOutputFormat] = useState<"9:16" | "16:9">("16:9");
  const [language, setLanguage] = useState("en");
  const [lengthSeconds, setLengthSeconds] = useState(60);
  const [avatarId, setAvatarId] = useState("");
  const [voiceId, setVoiceId] = useState("");

  useEffect(() => {
    const load = async () => {
      const [a, v] = await Promise.all([listAvatarsForGenerate(), listVoicesForGenerate()]);
      setAvatars(a);
      setVoices(v);
      if (a.length && !avatarId) setAvatarId(a[0].id);
      if (v.length && !voiceId) setVoiceId(v[0].id);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const url = searchParams.get("youtube");
    const format = searchParams.get("format");
    const lang = searchParams.get("lang");
    const length = searchParams.get("length");
    if (url) setYoutubeUrlOrTranscript(url);
    if (format === "9:16" || format === "16:9") setOutputFormat(format);
    if (lang && LANGUAGES.some((l) => l.value === lang)) setLanguage(lang);
    if (length) {
      const n = parseInt(length, 10);
      if (n === 60 || n === 180 || n === 480) setLengthSeconds(n);
    }
    if (!url && typeof window !== "undefined") {
      try {
        const draft = sessionStorage.getItem("clonestar:generate-draft");
        if (draft) {
          sessionStorage.removeItem("clonestar:generate-draft");
          const parsed = JSON.parse(draft) as { youtubeUrl?: string; format?: string; language?: string; length?: string };
          if (parsed.youtubeUrl) setYoutubeUrlOrTranscript(parsed.youtubeUrl);
          if (parsed.format === "9:16" || parsed.format === "16:9") setOutputFormat(parsed.format);
          if (parsed.language && LANGUAGES.some((l) => l.value === parsed.language)) setLanguage(parsed.language);
          if (parsed.length) {
            const n = parseInt(parsed.length, 10);
            if (n === 60 || n === 180 || n === 480) setLengthSeconds(n);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!avatarId || !voiceId) {
      toast.error("Please select an avatar and a voice.");
      return;
    }
    setSubmitting(true);
    const { error, jobId } = await submitGenerate({
      sourceType,
      youtubeUrlOrTranscript,
      outputFormat,
      language,
      lengthSeconds,
      avatarId,
      voiceId,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-3">
          Your Video Is Generating
        </h1>
        <p className="text-muted-foreground mb-8">
          This usually takes 3–5 minutes. Check the Generated Videos page for status updates.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => setSubmitted(false)}>
            Generate Another
          </Button>
          <Button onClick={() => router.push("/dashboard/videos")}>
            View Generated Videos <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Generate Video</h1>
        <p className="text-muted-foreground">Paste a source, configure settings, and let AI do the rest.</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as "url" | "transcript")} className="w-full">
          <TabsList className="bg-secondary">
            <TabsTrigger value="url" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Link2 className="h-3.5 w-3.5" /> YouTube URL
            </TabsTrigger>
            <TabsTrigger value="transcript" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <FileText className="h-3.5 w-3.5" /> Transcript
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="mt-4">
            <Input
              placeholder="https://youtube.com/watch?v=..."
              className="bg-secondary/50 border-border h-11"
              value={youtubeUrlOrTranscript}
              onChange={(e) => setYoutubeUrlOrTranscript(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="transcript" className="mt-4">
            <Textarea
              placeholder="Paste your transcript here..."
              className="bg-secondary/50 border-border min-h-[120px]"
              value={youtubeUrlOrTranscript}
              onChange={(e) => setYoutubeUrlOrTranscript(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Format</Label>
            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as "9:16" | "16:9")}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="9:16">Shorts (9:16)</SelectItem>
                <SelectItem value="16:9">YouTube (16:9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Length</Label>
            <Select
              value={String(lengthSeconds)}
              onValueChange={(v) => setLengthSeconds(Number(v))}
            >
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="60">60 seconds</SelectItem>
                <SelectItem value="180">3 minutes</SelectItem>
                <SelectItem value="480">5–8 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Avatar</Label>
            <Select value={avatarId} onValueChange={setAvatarId} disabled={loading}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select avatar" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {avatars.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Voice</Label>
            <Select value={voiceId} onValueChange={setVoiceId} disabled={loading}>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {voices.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {avatars.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add an <a href="/dashboard/avatars" className="text-primary hover:underline">avatar</a> and a{" "}
            <a href="/dashboard/voices" className="text-primary hover:underline">voice</a> to generate videos.
          </p>
        )}

        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handleSubmit}
          disabled={submitting || loading || avatars.length === 0 || voices.length === 0}
        >
          <Sparkles className="mr-2 h-4 w-4" /> {submitting ? "Generating…" : "Generate Video"}
        </Button>
      </div>
    </div>
  );
}
