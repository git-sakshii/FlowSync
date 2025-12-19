"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, Circle, GitBranch, MessageSquare, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: "/professional-woman-asian.jpg", initials: "SC" },
    action: "completed",
    target: "Design system documentation",
    time: "5 minutes ago",
    icon: CheckCircle,
    iconColor: "text-success",
  },
  {
    id: 2,
    user: { name: "Alex Rivera", avatar: "/professional-man-hispanic.jpg", initials: "AR" },
    action: "commented on",
    target: "API integration task",
    time: "15 minutes ago",
    icon: MessageSquare,
    iconColor: "text-accent",
  },
  {
    id: 3,
    user: { name: "Jordan Lee", avatar: "/professional-man-asian.jpg", initials: "JL" },
    action: "moved",
    target: "Mobile app wireframes to In Progress",
    time: "1 hour ago",
    icon: GitBranch,
    iconColor: "text-primary",
  },
  {
    id: 4,
    user: { name: "Emma Wilson", avatar: "/professional-woman-blonde.jpg", initials: "EW" },
    action: "created",
    target: "Q4 Marketing Campaign project",
    time: "2 hours ago",
    icon: Circle,
    iconColor: "text-muted-foreground",
  },
  {
    id: 5,
    user: { name: "Michael Brown", avatar: "/professional-man-beard.jpg", initials: "MB" },
    action: "updated deadline for",
    target: "Database migration",
    time: "3 hours ago",
    icon: Clock,
    iconColor: "text-warning",
  },
]

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
              <AvatarFallback>{activity.user.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
            <activity.icon className={cn("h-5 w-5 shrink-0", activity.iconColor)} />
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border">
        <button className="text-sm text-primary hover:underline w-full text-center">View all activity</button>
      </div>
    </div>
  )
}
