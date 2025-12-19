"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useState } from "react"

const initialTasks = [
  {
    id: 1,
    title: "Review design mockups",
    priority: "high",
    project: "Marketing Website",
    dueDate: "Today",
    completed: false,
  },
  {
    id: 2,
    title: "Update API documentation",
    priority: "medium",
    project: "API Integration",
    dueDate: "Tomorrow",
    completed: false,
  },
  {
    id: 3,
    title: "Fix mobile navigation bug",
    priority: "high",
    project: "Mobile App",
    dueDate: "Tomorrow",
    completed: false,
  },
  {
    id: 4,
    title: "Prepare sprint retrospective",
    priority: "low",
    project: "Q4 Dashboard",
    dueDate: "Dec 22",
    completed: true,
  },
  {
    id: 5,
    title: "Database schema review",
    priority: "medium",
    project: "API Integration",
    dueDate: "Dec 23",
    completed: false,
  },
]

const priorityStyles = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
}

export function UpcomingTasks() {
  const [tasks, setTasks] = useState(initialTasks)

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Upcoming Tasks</h3>
        <span className="text-sm text-muted-foreground">{tasks.filter((t) => !t.completed).length} remaining</span>
      </div>
      <div className="divide-y divide-border">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors",
              task.completed && "opacity-60",
            )}
          >
            <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", task.completed && "line-through")}>{task.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{task.project}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{task.dueDate}</span>
              </div>
            </div>
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full shrink-0",
                priorityStyles[task.priority as keyof typeof priorityStyles],
              )}
            >
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
