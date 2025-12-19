"use client"

import type { Column, Task } from "@/lib/kanban-store"
import { KanbanCard } from "./kanban-card"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  column: Column
  onTaskClick: (task: Task) => void
  onAddTask: () => void
}

const columnStyles: Record<string, string> = {
  todo: "border-t-muted-foreground",
  "in-progress": "border-t-primary",
  review: "border-t-warning",
  done: "border-t-success",
}

export function KanbanColumn({ column, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-t-lg border-t-4 bg-muted/30",
          columnStyles[column.id],
        )}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{column.tasks.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddTask}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 space-y-2 min-h-[200px] rounded-b-lg transition-colors",
          isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset",
        )}
      >
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={onAddTask}>
              <Plus className="mr-1 h-3 w-3" />
              Add task
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
