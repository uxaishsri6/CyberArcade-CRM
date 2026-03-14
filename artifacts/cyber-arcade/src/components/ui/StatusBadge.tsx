import { cn } from "@/lib/utils";

type StatusType = 
  | "cold_lead" 
  | "warm_lead" 
  | "trial_attended" 
  | "interested" 
  | "enrolled" 
  | "churned"
  | "draft"
  | "scheduled"
  | "active"
  | "paused"
  | "completed"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "replied"
  | "converted"
  | "failed";

const STATUS_CONFIG: Record<StatusType, { color: string, label: string }> = {
  // Contact Statuses
  cold_lead: { color: "text-blue-400 bg-blue-400/20 border-blue-400/30", label: "Cold Lead" },
  warm_lead: { color: "text-yellow bg-yellow/20 border-yellow/30", label: "Warm Lead" },
  trial_attended: { color: "text-purple bg-purple/20 border-purple/30", label: "Trial Attended" },
  interested: { color: "text-cyan bg-cyan/20 border-cyan/30", label: "Interested" },
  enrolled: { color: "text-green bg-green/20 border-green/30", label: "Enrolled" },
  churned: { color: "text-pink bg-pink/20 border-pink/30", label: "Churned" },
  
  // Campaign Statuses
  draft: { color: "text-gray-400 bg-gray-400/20 border-gray-400/30", label: "Draft" },
  scheduled: { color: "text-yellow bg-yellow/20 border-yellow/30", label: "Scheduled" },
  active: { color: "text-cyan bg-cyan/20 border-cyan/30 shadow-[0_0_10px_rgba(0,245,255,0.2)]", label: "Active" },
  paused: { color: "text-orange-400 bg-orange-400/20 border-orange-400/30", label: "Paused" },
  completed: { color: "text-green bg-green/20 border-green/30", label: "Completed" },

  // Log Statuses
  sent: { color: "text-blue-400 bg-blue-400/20 border-blue-400/30", label: "Sent" },
  delivered: { color: "text-cyan bg-cyan/20 border-cyan/30", label: "Delivered" },
  opened: { color: "text-purple bg-purple/20 border-purple/30", label: "Opened" },
  clicked: { color: "text-yellow bg-yellow/20 border-yellow/30", label: "Clicked" },
  replied: { color: "text-green bg-green/20 border-green/30", label: "Replied" },
  converted: { color: "text-green bg-green/20 border-green/30 shadow-[0_0_10px_rgba(0,255,136,0.3)]", label: "Converted" },
  failed: { color: "text-pink bg-pink/20 border-pink/30", label: "Failed" },
};

export function StatusBadge({ status, className }: { status: string, className?: string }) {
  const config = STATUS_CONFIG[status as StatusType] || { color: "text-gray-400 bg-gray-400/20 border-gray-400/30", label: status };
  
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border backdrop-blur-sm whitespace-nowrap",
      config.color,
      className
    )}>
      {config.label}
    </span>
  );
}
