"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Video, Zap, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoginModal } from "@/components/LoginModal";

const features = [
  { icon: Zap, title: "Instant Script Rewrite", description: "AI rewrites any YouTube video into a fresh, engaging script — optimized for your format and length." },
  { icon: Video, title: "Realistic AI Avatars", description: "Upload your likeness once. Generate unlimited videos with your custom digital presenter." },
  { icon: Globe, title: "30+ Languages", description: "Repurpose content for global audiences. One video, every language — powered by ElevenLabs voices." },
  { icon: Clock, title: "Minutes, Not Hours", description: "Go from YouTube link to finished avatar video in under 5 minutes. No editing required." },
];

const stats = [
  { value: "10K+", label: "Videos Generated" },
  { value: "30+", label: "Languages" },
  { value: "< 5 min", label: "Avg. Generation Time" },
  { value: "98%", label: "Satisfaction Rate" },
];

const DRAFT_KEY = "clonestar:generate-draft";

export default function Landing() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [format, setFormat] = useState("16:9");
  const [language, setLanguage] = useState("en");
  const [length, setLength] = useState("60");
  const router = useRouter();

  const handleLogin = () => {
    setLoginOpen(false);
    router.push("/dashboard/generate");
  };

  const handleGenerateClick = () => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ youtubeUrl, format, language, length })
      );
    } catch {
      // ignore
    }
    setLoginOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Video className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">clonestar</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setLoginOpen(true)}>Sign In</Button>
            <Button onClick={() => setLoginOpen(true)}>Get Started</Button>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-3.5 w-3.5" /> AI-Powered Video Creation
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Turn Any YouTube Video Into<br />
            <span className="text-gradient">Your AI Avatar Content</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Paste a link. Pick your avatar. Get a studio-quality video — in any language, any format, in minutes.
          </p>
          <div className="glass-card p-6 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="space-y-4">
              <Input
                placeholder="Paste YouTube link or transcript..."
                className="h-12 bg-secondary/50 border-border text-base"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Format" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="9:16">Shorts (9:16)</SelectItem>
                    <SelectItem value="16:9">YouTube (16:9)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Language" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Length" /></SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="180">3 minutes</SelectItem>
                    <SelectItem value="480">5–8 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full h-12 text-base font-semibold animate-pulse-glow" onClick={handleGenerateClick}>
                Generate Video <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 border-y border-border/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">Everything You Need to Scale Content</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From script to screen — one platform handles it all.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="glass-card p-6 hover:border-primary/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Three Steps. One Video.</h2>
          <p className="text-muted-foreground mb-14">No learning curve. No complex timeline editors.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Paste & Configure", desc: "Drop a YouTube link or paste a transcript. Choose format, language, and length." },
              { step: "02", title: "Pick Avatar & Voice", desc: "Select your custom AI avatar and an ElevenLabs voice that matches your brand." },
              { step: "03", title: "Generate & Download", desc: "Hit generate. Your studio-quality avatar video is ready to download in minutes." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="font-display text-5xl font-bold text-primary/20 mb-3">{item.step}</div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center glass-card p-10 glow-border">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ready to Create Your First AI Video?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of creators who ship content 10x faster with AI avatars.</p>
          <Button size="lg" className="text-base px-8" onClick={() => setLoginOpen(true)}>Start Free <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <Video className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">clonestar</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 clonestar. All rights reserved.</p>
        </div>
      </footer>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} onLogin={handleLogin} />
    </div>
  );
}
