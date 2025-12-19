"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"

export function UpcomingTasks() {
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get("/tasks")
        setTasks(data.slice(0, 5)) // Top 5
      } catch (error) {
        console.error("Failed to fetch upcoming tasks", error)
      }
    }
    fetchTasks()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardDescription>Tasks assigned to you due soon.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <button className="mt-0.5 text-muted-foreground hover:text-primary">
                {task.status === 'DONE' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-sm", task.status === 'DONE' && "line-through text-muted-foreground")}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{task.project?.name || 'No Project'}</span>
                  {task.dueDate && (
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
                      new Date(task.dueDate) < new Date() ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                    )}>
                      <Clock className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming tasks.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
