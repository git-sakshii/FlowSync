"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Search,
  CheckCircle,
  Circle,
  GitBranch,
  MessageSquare,
  Clock,
  UserPlus,
  Trash2,
  Edit,
  Calendar,
} from "lucide-react"

const activities = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: "/woman-1.jpg", initials: "SC" },
    action: "completed",
    type: "task-complete",
    target: "Design system documentation",
    project: "Marketing Website",
    time: "5 minutes ago",
    date: "Today",
    icon: CheckCircle,
    iconColor: "text-success bg-success/10",
  },
  {
    id: 2,
    user: { name: "Alex Rivera", avatar: "/man-1.jpg", initials: "AR" },
    action: "commented on",
    type: "comment",
    target: "API integration task",
    project: "API Integration",
    time: "15 minutes ago",
    date: "Today",
    icon: MessageSquare,
    iconColor: "text-accent bg-accent/10",
    comment: "I've reviewed the endpoints and they look good. Let me know when you're ready for the final review.",
  },
  {
    id: 3,
    user: { name: "Jordan Lee", avatar: "/man-2.jpg", initials: "JL" },
    action: "moved",
    type: "status-change",
    target: "Mobile app wireframes",
    project: "Mobile App",
    time: "1 hour ago",
    date: "Today",
    icon: GitBranch,
    iconColor: "text-primary bg-primary/10",
    details: "To Do → In Progress",
  },
  {
    id: 4,
    user: { name: "Emma Wilson", avatar: "/woman-2.jpg", initials: "EW" },
    action: "created",
    type: "task-create",
    target: "Q4 Marketing Campaign project",
    project: "Marketing Website",
    time: "2 hours ago",
    date: "Today",
    icon: Circle,
    iconColor: "text-muted-foreground bg-muted",
  },
  {
    id: 5,
    user: { name: "Michael Brown", avatar: "/man-3.jpg", initials: "MB" },
    action: "updated deadline for",
    type: "deadline",
    target: "Database migration",
    project: "API Integration",
    time: "3 hours ago",
    date: "Today",
    icon: Clock,
    iconColor: "text-warning bg-warning/10",
    details: "Dec 20 → Dec 25",
  },
  {
    id: 6,
    user: { name: "Sarah Chen", avatar: "/woman-1.jpg", initials: "SC" },
    action: "assigned",
    type: "assignment",
    target: "Code review for payment module",
    project: "API Integration",
    time: "Yesterday",
    date: "Yesterday",
    icon: UserPlus,
    iconColor: "text-primary bg-primary/10",
    details: "to Michael Brown",
  },
  {
    id: 7,
    user: { name: "Alex Rivera", avatar: "/man-1.jpg", initials: "AR" },
    action: "edited",
    type: "edit",
    target: "Homepage hero section",
    project: "Marketing Website",
    time: "Yesterday",
    date: "Yesterday",
    icon: Edit,
    iconColor: "text-muted-foreground bg-muted",
  },
  {
    id: 8,
    user: { name: "Jordan Lee", avatar: "/man-2.jpg", initials: "JL" },
    action: "deleted",
    type: "delete",
    target: "Outdated design files",
    project: "Q4 Dashboard",
    time: "2 days ago",
    date: "Dec 17, 2025",
    icon: Trash2,
    iconColor: "text-destructive bg-destructive/10",
  },
  {
    id: 9,
    user: { name: "Emma Wilson", avatar: "/woman-2.jpg", initials: "EW" },
    action: "set due date for",
    type: "deadline",
    target: "User testing sessions",
    project: "Mobile App",
    time: "2 days ago",
    date: "Dec 17, 2025",
    icon: Calendar,
    iconColor: "text-warning bg-warning/10",
    details: "Jan 5, 2026",
  },
]

export default function ActivityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || activity.type === typeFilter
    return matchesSearch && matchesType
  })

  // Group activities by date
  const groupedActivities = filteredActivities.reduce(
    (groups, activity) => {
      const date = activity.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
      return groups
    },
    {} as Record<string, typeof activities>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">Track all changes and updates across your projects.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="task-complete">Completions</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="status-change">Status Changes</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="deadline">Deadlines</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4 sticky top-0 bg-background py-2">{date}</h3>
            <div className="space-y-1">
              {dateActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="relative flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Timeline line */}
                  {index < dateActivities.length - 1 && (
                    <div className="absolute left-[30px] top-14 bottom-0 w-px bg-border" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      activity.iconColor,
                    )}
                  >
                    <activity.icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{activity.user.name}</span>
                        <span className="text-sm text-muted-foreground">{activity.action}</span>
                        <span className="font-medium text-sm">{activity.target}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{activity.project}</span>
                      {activity.details && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{activity.details}</span>
                        </>
                      )}
                    </div>

                    {activity.comment && (
                      <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        {activity.comment}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      <div className="text-center">
        <Button variant="outline" className="bg-transparent">
          Load More Activity
        </Button>
      </div>
    </div>
  )
}
