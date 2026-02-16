import { Button } from "@/components/ui/button";
import { Plus, Trash2, Mic, User, Play } from "lucide-react";

const mockVoices = [
  { id: "1", name: "Rachel — Warm, Professional", linkedAvatars: 1 },
  { id: "2", name: "Marcus — Deep, Authoritative", linkedAvatars: 1 },
  { id: "3", name: "Aisha — Energetic, Friendly", linkedAvatars: 1 },
];

export default function VoicesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Voices</h1>
          <p className="text-muted-foreground text-sm">Manage your ElevenLabs voice library</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Voice
        </Button>
      </div>

      <div className="space-y-3">
        {mockVoices.map((voice) => (
          <div
            key={voice.id}
            className="glass-card p-4 flex items-center gap-4 hover:border-primary/20 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm">{voice.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {voice.linkedAvatars} linked avatar{voice.linkedAvatars !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
