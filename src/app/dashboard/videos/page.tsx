"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Trash2, Film, RefreshCw } from "lucide-react";
import { listGeneratedVideos, deleteGeneratedVideo, type GeneratedVideoRow, type VideoStatus } from "./actions";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function GeneratedVideosPage() {
  const [videos, setVideos] = useState<GeneratedVideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [viewVideo, setViewVideo] = useState<GeneratedVideoRow | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const filters: { status?: VideoStatus; format?: string } = {};
    if (statusFilter !== "all") filters.status = statusFilter as VideoStatus;
    if (formatFilter !== "all") filters.format = formatFilter;
    const list = await listGeneratedVideos(filters);
    setVideos(list);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [statusFilter, formatFilter]);

  const handleDelete = async (id: string) => {
    const { error } = await deleteGeneratedVideo(id);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Video removed.");
    load();
  };

  const handleDownload = (video: GeneratedVideoRow) => {
    if (video.video_url) window.open(video.video_url, "_blank");
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Generated Videos</h1>
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4 animate-pulse">
              <div className="w-28 h-20 rounded-lg bg-secondary" />
              <div className="flex-1 h-4 bg-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Generated Videos</h1>
          <p className="text-muted-foreground text-sm">{videos.length} videos in your library</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh status
          </Button>
          <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="video_done">Completed</SelectItem>
              <SelectItem value="video_pending">Pending</SelectItem>
              <SelectItem value="voice_done">Voice Ready</SelectItem>
              <SelectItem value="script_done">Script Ready</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={formatFilter} onValueChange={setFormatFilter}>
            <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="16:9">YouTube (16:9)</SelectItem>
              <SelectItem value="9:16">Shorts (9:16)</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {videos.length === 0 ? (
          <div className="glass-card p-8 text-center text-muted-foreground">
            <Film className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No videos yet. Generate your first video from the Generate page.</p>
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/20 transition-colors"
            >
              <div className="w-full sm:w-28 h-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Film className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate">{video.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <span>{video.avatar?.name ?? "—"}</span>
                  <span>·</span>
                  <span>{video.voice?.name ?? "—"}</span>
                  <span>·</span>
                  <span>{video.output_format}</span>
                  <span>·</span>
                  <span>{format(new Date(video.created_at), "yyyy-MM-dd HH:mm")}</span>
                </div>
                {video.status === "failed" && video.error_message && (
                  <p className="text-xs text-destructive mt-1">{video.error_message}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={video.status} />
                <div className="flex items-center gap-1">
                  {video.video_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setViewVideo(video)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {video.status === "video_done" && video.video_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleDownload(video)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove this video?</AlertDialogTitle>
                        <AlertDialogDescription>
                          &quot;{video.title}&quot; will be removed from your list. The file is not deleted from HeyGen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(video.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!viewVideo} onOpenChange={(open) => !open && setViewVideo(null)}>
        <DialogContent className="sm:max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">{viewVideo?.title}</DialogTitle>
          </DialogHeader>
          {viewVideo?.video_url && (
            <video
              src={viewVideo.video_url}
              controls
              className="w-full rounded-lg bg-black"
              playsInline
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
