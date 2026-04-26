"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, getInitials } from "@/lib/utils"
import { Plus, Search, Calendar, MoreHorizontal, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api-client"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog"
import { toast } from "sonner"

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [editingTask, setEditingTask] = useState<any | null>(null)

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get("/tasks")
      setTasks(data)
    } catch (error) {
      console.error("Failed to fetch tasks", error)
      toast.error("Failed to load tasks")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter.toUpperCase() // API returns uppercase
    return matchesSearch && matchesStatus
  })

  const toggleTask = (id: string) => {
    setSelectedTasks((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map((t) => t.id))
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`)
      toast.success("Task deleted")
      fetchTasks()
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  const statusStyles: Record<string, string> = {
    TODO: "bg-muted text-muted-foreground",
    IN_PROGRESS: "bg-primary/10 text-primary",
    REVIEW: "bg-warning/10 text-warning",
    DONE: "bg-success/10 text-success",
  }

  const statusLabels: Record<string, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    REVIEW: "Review",
    DONE: "Done",
  }

  const priorityStyles: Record<string, string> = {
    HIGH: "bg-destructive/10 text-destructive",
    MEDIUM: "bg-warning/10 text-warning",
    LOW: "bg-muted text-muted-foreground",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">View and manage all tasks across projects.</p>
        </div>
        <CreateTaskDialog
          onTaskCreated={fetchTasks}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="p-8 text-center flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tasks found. Create one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id} className={cn(task.status === 'DONE' && "opacity-60")}>
                    <TableCell>
                      <Checkbox checked={selectedTasks.includes(task.id)} onCheckedChange={() => toggleTask(task.id)} />
                    </TableCell>
                    <TableCell>
                      <span className={cn("font-medium", task.status === 'DONE' && "line-through")}>{task.title}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{task.project?.name || 'No Project'}</TableCell>
                    <TableCell>
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusStyles[task.status])}>
                        {statusLabels[task.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", priorityStyles[task.priority])}>
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {task.assignee && (
                          <>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assignee.avatar || ""} />
                              <AvatarFallback className="text-xs">{getInitials(task.assignee.firstName, task.assignee.lastName)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm hidden lg:inline">{task.assignee.firstName} {task.assignee.lastName}</span>
                          </>
                        )}
                        {!task.assignee && <span className="text-xs text-muted-foreground">Unassigned</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTask(task)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTask(task.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        onTaskUpdated={fetchTasks}
      />
    </div>
  )
}
