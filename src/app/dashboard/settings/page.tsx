import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Profile</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</Label>
              <Input defaultValue="John Doe" className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
              <Input defaultValue="john@example.com" className="bg-secondary/50 border-border" disabled />
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">API Keys</h2>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">ElevenLabs API Key</Label>
              <Input type="password" defaultValue="sk-xxxxxxxx" className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">HeyGen API Key</Label>
              <Input type="password" defaultValue="hg-xxxxxxxx" className="bg-secondary/50 border-border" />
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Danger Zone</h2>
            <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all data</p>
          </div>
          <Button variant="destructive" size="sm">Delete Account</Button>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
