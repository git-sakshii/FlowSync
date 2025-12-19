"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, Circle, GitBranch, MessageSquare, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api-client"

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get("/activity/me")
        setActivities(data.slice(0, 10))
      } catch (error) {
        console.error("Failed to fetch activity", error)
      }
    }
    fetchActivity()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'completed': return CheckCircle
      case 'commented': return MessageSquare
      case 'moved': return ArrowRight // GitBranch
      case 'created': return Circle
      case 'updated': return Clock
      default: return Circle
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'completed': return "text-success"
      case 'commented': return "text-accent"
      case 'moved': return "text-primary"
      case 'created': return "text-muted-foreground"
      case 'updated': return "text-warning"
      default: return "text-muted-foreground"
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type)
          return (
            <div key={activity.id} className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
              <Avatar className="h-8 w-8">
                {/* Fallback to user avatar if available in relation, otherwise placeholder */}
                <AvatarImage src={"/placeholder.svg"} />
                <AvatarFallback>UA</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">You</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium truncate block">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
              <Icon className={cn("h-5 w-5 shrink-0", getIconColor(activity.type))} />
            </div>
          )
        })}
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
        )}
      </div>
      <div className="p-4 border-t border-border">
        <button className="text-sm text-primary hover:underline w-full text-center">View all activity</button>
      </div>
    </div>
  )
}
