"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Link2, FileText, Sparkles, CheckCircle } from "lucide-react";

const mockAvatars = [
  { id: "1", name: "Sarah — News Anchor" },
  { id: "2", name: "Alex — Educator" },
  { id: "3", name: "Priya — Lifestyle" },
];

const mockVoices = [
  { id: "1", name: "Rachel — Warm, Professional" },
  { id: "2", name: "Marcus — Deep, Authoritative" },
  { id: "3", name: "Aisha — Energetic, Friendly" },
];

export default function GeneratePage() {
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

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
        {/* Source Input */}
        <Tabs defaultValue="url" className="w-full">
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
            />
          </TabsContent>
          <TabsContent value="transcript" className="mt-4">
            <Textarea
              placeholder="Paste your transcript here..."
              className="bg-secondary/50 border-border min-h-[120px]"
            />
          </TabsContent>
        </Tabs>

        {/* Config */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Format</Label>
            <Select>
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
            <Select>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Length</Label>
            <Select>
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

        {/* Avatar & Voice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Avatar</Label>
            <Select>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select avatar" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {mockAvatars.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Voice</Label>
            <Select>
              <SelectTrigger className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {mockVoices.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full h-12 text-base font-semibold" onClick={() => setSubmitted(true)}>
          <Sparkles className="mr-2 h-4 w-4" /> Generate Video
        </Button>
      </div>
    </div>
  );
}
