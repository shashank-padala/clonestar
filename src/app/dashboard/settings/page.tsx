"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getProfile, updateProfile, deleteAccount, KEY_MASK, type ProfileForm } from "./actions";
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


export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    elevenlabs_api_key: "",
    heygen_api_key: "",
    openai_api_key: "",
  });
  const [email, setEmail] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const profile = await getProfile();
      if (!mounted) return;
      if (profile) {
        setForm({
          full_name: profile.full_name,
          elevenlabs_api_key: profile.elevenlabs_api_key,
          heygen_api_key: profile.heygen_api_key,
          openai_api_key: profile.openai_api_key,
        });
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const loadEmail = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const { data: { user } } = await createClient().auth.getUser();
      setEmail(user?.email ?? "");
    };
    loadEmail();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(form);
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Settings saved.");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const { error } = await deleteAccount();
    setDeleting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Account deleted.");
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences</p>
        </div>
        <div className="glass-card p-6 animate-pulse space-y-4">
          <div className="h-10 bg-secondary rounded" />
          <div className="h-10 bg-secondary rounded" />
        </div>
      </div>
    );
  }

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
              <Input
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="bg-secondary/50 border-border"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
              <Input value={email} className="bg-secondary/50 border-border" disabled />
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">API Keys</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Store your API keys here to use script, voice, and video generation. Keys are stored per account and only used server-side.
          </p>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">OpenAI API Key (optional if set in env)</Label>
              <Input
                type="password"
                value={form.openai_api_key}
                onChange={(e) => setForm((f) => ({ ...f, openai_api_key: e.target.value }))}
                className="bg-secondary/50 border-border"
                placeholder={form.openai_api_key ? KEY_MASK : "sk-..."}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">ElevenLabs API Key</Label>
              <Input
                type="password"
                value={form.elevenlabs_api_key}
                onChange={(e) => setForm((f) => ({ ...f, elevenlabs_api_key: e.target.value }))}
                className="bg-secondary/50 border-border"
                placeholder={form.elevenlabs_api_key ? KEY_MASK : "..."}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">HeyGen API Key</Label>
              <Input
                type="password"
                value={form.heygen_api_key}
                onChange={(e) => setForm((f) => ({ ...f, heygen_api_key: e.target.value }))}
                className="bg-secondary/50 border-border"
                placeholder={form.heygen_api_key ? KEY_MASK : "..."}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Danger Zone</h2>
            <p className="text-xs text-muted-foreground mt-1">Permanently delete your account and all data</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all your avatars, voices, and generated videos. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteAccount();
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
