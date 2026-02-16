"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Mic, User, Play } from "lucide-react";
import { listVoices, addVoice, deleteVoice, getAvatarCountByVoice, type VoiceRow } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function VoicesPage() {
  const [voices, setVoices] = useState<VoiceRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addVoiceId, setAddVoiceId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [v, c] = await Promise.all([listVoices(), getAvatarCountByVoice()]);
    setVoices(v);
    setCounts(c);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addVoiceId.trim()) {
      toast.error("Name and ElevenLabs Voice ID are required.");
      return;
    }
    setSubmitting(true);
    const { error } = await addVoice(addName.trim(), addVoiceId.trim());
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Voice added.");
    setAddOpen(false);
    setAddName("");
    setAddVoiceId("");
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteVoice(id);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Voice removed.");
    load();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Voices</h1>
          <p className="text-muted-foreground text-sm">Manage your ElevenLabs voice library</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4 animate-pulse">
              <div className="h-10 w-10 rounded-lg bg-secondary" />
              <div className="flex-1 h-5 bg-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Voices</h1>
          <p className="text-muted-foreground text-sm">Manage your ElevenLabs voice library</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Voice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Add ElevenLabs Voice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Voice name</Label>
                <Input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Rachel — Warm, Professional"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>ElevenLabs Voice ID</Label>
                <Input
                  value={addVoiceId}
                  onChange={(e) => setAddVoiceId(e.target.value)}
                  placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                  className="bg-secondary/50 border-border font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Find voice IDs in your ElevenLabs dashboard or API docs.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding…" : "Add Voice"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {voices.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            <Mic className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No voices yet. Add an ElevenLabs voice to use in video generation.</p>
          </div>
        ) : (
          voices.map((voice) => (
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
                  {counts[voice.id] ?? 0} linked avatar{(counts[voice.id] ?? 0) !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove this voice?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove &quot;{voice.name}&quot; from your library. Avatars using it will keep working until you change their default voice.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(voice.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
