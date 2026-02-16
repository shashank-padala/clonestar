import { Badge } from "@/components/ui/badge";

type StatusType = "script_done" | "voice_done" | "video_pending" | "video_done" | "failed";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  script_done: { label: "Script Ready", className: "bg-primary/15 text-primary border-primary/30" },
  voice_done: { label: "Voice Ready", className: "bg-primary/15 text-primary border-primary/30" },
  video_pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30" },
  video_done: { label: "Completed", className: "bg-success/15 text-success border-success/30" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
