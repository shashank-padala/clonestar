import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Eye, Trash2, Film } from "lucide-react";

const mockVideos = [
  { id: "1", title: "5 AI Trends You Can't Ignore in 2026", avatar: "Sarah — News Anchor", voice: "Rachel", format: "16:9", status: "video_done" as const, createdAt: "2026-02-16 09:30" },
  { id: "2", title: "Learn React in 60 Seconds", avatar: "Alex — Educator", voice: "Marcus", format: "9:16", status: "video_pending" as const, createdAt: "2026-02-16 09:15" },
  { id: "3", title: "Morning Skincare Routine for Beginners", avatar: "Priya — Lifestyle", voice: "Aisha", format: "9:16", status: "voice_done" as const, createdAt: "2026-02-16 08:50" },
  { id: "4", title: "Understanding Quantum Computing Basics", avatar: "Alex — Educator", voice: "Marcus", format: "16:9", status: "failed" as const, createdAt: "2026-02-15 22:10" },
  { id: "5", title: "Top 10 Travel Destinations for 2026", avatar: "Sarah — News Anchor", voice: "Rachel", format: "16:9", status: "script_done" as const, createdAt: "2026-02-15 18:45" },
];

export default function GeneratedVideosPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Generated Videos</h1>
          <p className="text-muted-foreground text-sm">{mockVideos.length} videos in your library</p>
        </div>
        <div className="flex gap-3">
          <Select>
            <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="video_done">Completed</SelectItem>
              <SelectItem value="video_pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select>
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

      <div className="space-y-3">
        {mockVideos.map((video) => (
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
                <span>{video.avatar}</span>
                <span>·</span>
                <span>{video.voice}</span>
                <span>·</span>
                <span>{video.format}</span>
                <span>·</span>
                <span>{video.createdAt}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <StatusBadge status={video.status} />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Eye className="h-4 w-4" />
                </Button>
                {video.status === "video_done" && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
