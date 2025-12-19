"use client"

import { Button } from "@/components/ui/button"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { Plus, Filter, Users } from "lucide-react"

export default function KanbanPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kanban Board</h1>
          <p className="text-muted-foreground">Drag and drop tasks to update their status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Users className="mr-2 h-4 w-4" />
            Team
          </Button>
          <Button size="sm" className="btn-3d">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Board */}
      <KanbanBoard />
    </div>
  )
}
