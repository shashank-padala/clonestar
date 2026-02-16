import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Mic } from "lucide-react";

const mockAvatars = [
  { id: "1", name: "Sarah — News Anchor", voice: "Rachel — Warm, Professional", initials: "SA" },
  { id: "2", name: "Alex — Educator", voice: "Marcus — Deep, Authoritative", initials: "AE" },
  { id: "3", name: "Priya — Lifestyle", voice: "Aisha — Energetic, Friendly", initials: "PL" },
];

export default function AvatarsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Avatars</h1>
          <p className="text-muted-foreground text-sm">Your custom AI presenters</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Upload Avatar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAvatars.map((avatar) => (
          <div key={avatar.id} className="glass-card p-5 hover:border-primary/20 transition-colors">
            <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <span className="font-display text-2xl font-bold text-muted-foreground">{avatar.initials}</span>
            </div>
            <h3 className="font-medium text-foreground text-center text-sm">{avatar.name}</h3>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Mic className="h-3 w-3" />
              {avatar.voice}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}

        <button className="glass-card p-5 border-dashed hover:border-primary/30 transition-colors flex flex-col items-center justify-center min-h-[200px]">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">Add New Avatar</span>
        </button>
      </div>
    </div>
  );
}
