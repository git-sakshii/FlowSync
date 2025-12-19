"use client"

import type { Task } from "@/lib/kanban-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Calendar, GripVertical } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface KanbanCardProps {
  task: Task
  onClick: () => void
}

const priorityStyles = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-card border border-border rounded-lg p-3 cursor-pointer transition-all",
        isDragging && "opacity-50 shadow-lg rotate-2 scale-105",
        !isDragging && "hover:shadow-md hover:-translate-y-0.5",
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-0.5 -ml-1 touch-none"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
            <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded shrink-0", priorityStyles[task.priority])}>
              {task.priority}
            </span>
          </div>

          {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}

          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((label) => (
                <span key={label} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            {task.assignee ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
              </Avatar>
            ) : (
              <div />
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{task.dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
