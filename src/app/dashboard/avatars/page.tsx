"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Mic } from "lucide-react";
import { listAvatars, addAvatar, updateAvatar, deleteAvatar, listVoices, type AvatarRow } from "./actions";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type VoiceOption = { id: string; name: string };

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<AvatarRow[]>([]);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addProviderId, setAddProviderId] = useState("");
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editVoiceId, setEditVoiceId] = useState<string | null>(null);

  const load = async () => {
    const [a, v] = await Promise.all([listAvatars(), listVoices()]);
    setAvatars(a);
    setVoices(v.map((x) => ({ id: x.id, name: x.name })));
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addProviderId.trim()) {
      toast.error("Name and HeyGen Avatar ID are required.");
      return;
    }
    setSubmitting(true);
    let imageUrl: string | null = null;
    if (addImageFile) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubmitting(false);
        toast.error("Not authenticated.");
        return;
      }
      const ext = addImageFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, addImageFile, { upsert: false });
      if (uploadError) {
        setSubmitting(false);
        toast.error(uploadError.message);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }
    const { error } = await addAvatar({
      name: addName.trim(),
      provider_avatar_id: addProviderId.trim(),
      image_url: imageUrl,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Avatar added.");
    setAddOpen(false);
    setAddName("");
    setAddProviderId("");
    setAddImageFile(null);
    load();
  };

  const handleEdit = (avatar: AvatarRow) => {
    setEditingId(avatar.id);
    setEditName(avatar.name);
    setEditVoiceId(avatar.default_voice_id);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await updateAvatar(editingId, { name: editName, default_voice_id: editVoiceId });
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Avatar updated.");
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteAvatar(id);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Avatar removed.");
    load();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Avatars</h1>
          <p className="text-muted-foreground text-sm">Your custom AI presenters</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-24 w-24 rounded-full bg-secondary mx-auto mb-4" />
              <div className="h-4 bg-secondary rounded mb-2" />
              <div className="h-3 bg-secondary rounded w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Avatars</h1>
          <p className="text-muted-foreground text-sm">Your custom AI presenters</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Upload Avatar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display">Add Avatar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Avatar name</Label>
                <Input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Sarah — News Anchor"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>HeyGen Avatar ID (talking photo ID)</Label>
                <Input
                  value={addProviderId}
                  onChange={(e) => setAddProviderId(e.target.value)}
                  placeholder="From HeyGen dashboard or API"
                  className="bg-secondary/50 border-border font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Create a photo avatar in HeyGen, then paste its ID here.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Preview image (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAddImageFile(e.target.files?.[0] ?? null)}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding…" : "Add Avatar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {avatars.map((avatar) => (
          <div key={avatar.id} className="glass-card p-5 hover:border-primary/20 transition-colors">
            {editingId === avatar.id ? (
              <div className="space-y-3">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-secondary/50 border-border h-9"
                />
                <div>
                  <Label className="text-xs text-muted-foreground">Default voice</Label>
                  <Select
                    value={editVoiceId ?? "none"}
                    onValueChange={(v) => setEditVoiceId(v === "none" ? null : v)}
                  >
                    <SelectTrigger className="mt-1 bg-secondary/50 border-border h-9">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {voices.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {avatar.image_url ? (
                    <img src={avatar.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-2xl font-bold text-muted-foreground">
                      {avatar.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-foreground text-center text-sm">{avatar.name}</h3>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Mic className="h-3 w-3" />
                  {voices.find((v) => v.id === avatar.default_voice_id)?.name ?? "No default voice"}
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleEdit(avatar)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove this avatar?</AlertDialogTitle>
                        <AlertDialogDescription>
                          &quot;{avatar.name}&quot; will be removed from your library. Generated videos using it are unchanged.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(avatar.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        ))}

        <button
          type="button"
          className="glass-card p-5 border-dashed hover:border-primary/30 transition-colors flex flex-col items-center justify-center min-h-[200px]"
          onClick={() => setAddOpen(true)}
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">Add New Avatar</span>
        </button>
      </div>
    </div>
  );
}
