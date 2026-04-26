"use client"

import { useEffect, useState } from "react"
import type { Task } from "@/lib/kanban-store"
import { useKanbanStore } from "@/lib/kanban-store"
import { KanbanColumn } from "./kanban-column"
import { TaskDetailModal } from "./task-detail-modal"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { KanbanCard } from "./kanban-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface KanbanBoardProps {
  projectId?: string
}

const columnStatusMap: Record<string, string> = {
  "todo": "TODO",
  "in-progress": "IN_PROGRESS",
  "review": "REVIEW",
  "done": "DONE",
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { columns, moveTask, fetchTasks, isLoading } = useKanbanStore()
  const [selectedTask, setSelectedTask] = useState<{ task: Task; columnId: string } | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [addToColumnId, setAddToColumnId] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks(projectId)
  }, [projectId, fetchTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const taskId = active.id as string

    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === taskId)
      if (task) {
        setActiveTask(task)
        break
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Find source column
    let sourceColumnId = ""
    for (const column of columns) {
      if (column.tasks.find((t) => t.id === taskId)) {
        sourceColumnId = column.id
        break
      }
    }

    // Determine target column and index
    let targetColumnId = ""
    let targetIndex = 0

    // Check if dropping on a column
    const targetColumn = columns.find((col) => col.id === overId)
    if (targetColumn) {
      targetColumnId = targetColumn.id
      targetIndex = targetColumn.tasks.length
    } else {
      // Dropping on a task, find its column
      for (const column of columns) {
        const taskIndex = column.tasks.findIndex((t) => t.id === overId)
        if (taskIndex !== -1) {
          targetColumnId = column.id
          targetIndex = taskIndex
          break
        }
      }
    }

    if (sourceColumnId && targetColumnId) {
      moveTask(taskId, sourceColumnId, targetColumnId, targetIndex)
    }
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading tasks...</div>
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onTaskClick={(task) => setSelectedTask({ task, columnId: column.id })}
              onAddTask={() => setAddToColumnId(column.id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="rotate-3 scale-105">
              <KanbanCard task={activeTask} onClick={() => { }} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        task={selectedTask?.task || null}
        columnId={selectedTask?.columnId || ""}
      />

      {/* Column-level Add Task Dialog */}
      <CreateTaskDialog
        open={!!addToColumnId}
        onOpenChange={(open: boolean) => !open && setAddToColumnId(null)}
        defaultStatus={addToColumnId ? columnStatusMap[addToColumnId] : undefined}
        onTaskCreated={() => {
          fetchTasks(projectId)
          setAddToColumnId(null)
        }}
        trigger={<span />}
      />
    </>
  )
}

