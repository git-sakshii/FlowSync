"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { CheckSquare, MessageSquare, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const notifications = [
  {
    id: 1,
    type: "assignment",
    icon: CheckSquare,
    title: "New task assigned",
    description: 'You were assigned to "Update landing page copy"',
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "comment",
    icon: MessageSquare,
    title: "New comment",
    description: 'Sarah commented on "API Integration"',
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "deadline",
    icon: AlertCircle,
    title: "Deadline approaching",
    description: '"Mobile App Design" is due tomorrow',
    time: "2 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "status",
    icon: Clock,
    title: "Status updated",
    description: '"Database migration" moved to In Progress',
    time: "Yesterday",
    read: true,
  },
]

export function NotificationsPanel({ open, onOpenChange }: NotificationsPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Mark all as read
            </Button>
          </div>
        </SheetHeader>
        <div className="mt-4 space-y-1">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50 cursor-pointer",
                !notification.read && "bg-primary/5",
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                  notification.type === "assignment" && "bg-primary/10 text-primary",
                  notification.type === "comment" && "bg-accent/10 text-accent",
                  notification.type === "deadline" && "bg-warning/10 text-warning",
                  notification.type === "status" && "bg-muted text-muted-foreground",
                )}
              >
                <notification.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{notification.title}</p>
                  {!notification.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full bg-transparent">
            View all notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
