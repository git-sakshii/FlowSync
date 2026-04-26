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

import { useEffect } from "react"
import { api } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchActivities = async (currentPage: number, append = false) => {
    try {
      if (!append) setIsLoading(true)
      const { data } = await api.get(`/activity/me?page=${currentPage}&limit=10`)
      // Backend returns paginated array based on page/limit params

      const newActivities = data.map((a: any) => ({
        id: a.id,
        user: {
          name: a.user.firstName + " " + a.user.lastName,
          avatar: a.user.avatar,
          initials: a.user.firstName[0] + a.user.lastName[0]
        },
        action: a.action,
        type: a.type, // 'TASK_CREATE', etc.
        target: a.entityTitle,
        project: a.project?.name,
        time: new Date(a.createdAt).toLocaleTimeString(),
        date: new Date(a.createdAt).toLocaleDateString(),
        icon: getIconForType(a.type),
        iconColor: getIconColorForType(a.type),
        details: a.details?.details // specific logic depending on activity type
      }))

      if (append) {
        setActivities(prev => [...prev, ...newActivities])
      } else {
        setActivities(newActivities)
      }

      if (newActivities.length < 10) setHasMore(false)

    } catch (error) {
      console.error("Failed to fetch activities", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities(1)
  }, [])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage, true)
  }

  const getIconForType = (type: string) => {
    if (type.includes("COMPLETE")) return CheckCircle
    if (type.includes("COMMENT")) return MessageSquare
    if (type.includes("STATUS")) return GitBranch
    if (type.includes("CREATE")) return Circle
    if (type.includes("DELETE")) return Trash2
    if (type.includes("ASSIGN")) return UserPlus
    return Circle
  }

  const getIconColorForType = (type: string) => {
    if (type.includes("COMPLETE")) return "text-success bg-success/10"
    if (type.includes("COMMENT")) return "text-accent bg-accent/10"
    if (type.includes("STATUS")) return "text-primary bg-primary/10"
    if (type.includes("DELETE")) return "text-destructive bg-destructive/10"
    return "text-muted-foreground bg-muted"
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      (activity.target?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (activity.user?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || activity.type?.toLowerCase().includes(typeFilter)
    return matchesSearch && matchesType
  })

  // Group activities by date
  const groupedActivities: Record<string, typeof activities> = filteredActivities.reduce(
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
            <SelectItem value="complete">Completions</SelectItem>
            <SelectItem value="create">Creations</SelectItem>
            <SelectItem value="status">Status Changes</SelectItem>
            <SelectItem value="assignment">Assignments</SelectItem>
            <SelectItem value="delete">Deletions</SelectItem>
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
      {hasMore && (
        <div className="text-center">
          <Button variant="outline" className="bg-transparent" onClick={handleLoadMore}>
            Load More Activity
          </Button>
        </div>
      )}
    </div>
  )
}
