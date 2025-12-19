"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Plus, Search, Calendar, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const tasks = [
  {
    id: 1,
    title: "Research competitor products",
    project: "Marketing Website",
    status: "todo",
    priority: "high",
    assignee: { name: "Sarah Chen", avatar: "/woman-1.jpg", initials: "SC" },
    dueDate: "Dec 22, 2025",
    completed: false,
  },
  {
    id: 2,
    title: "Design dashboard mockups",
    project: "Q4 Dashboard",
    status: "in-progress",
    priority: "high",
    assignee: { name: "Jordan Lee", avatar: "/man-2.jpg", initials: "JL" },
    dueDate: "Dec 20, 2025",
    completed: false,
  },
  {
    id: 3,
    title: "Implement user authentication",
    project: "Mobile App",
    status: "in-progress",
    priority: "high",
    assignee: { name: "Emma Wilson", avatar: "/woman-2.jpg", initials: "EW" },
    dueDate: "Dec 25, 2025",
    completed: false,
  },
  {
    id: 4,
    title: "Write API documentation",
    project: "API Integration",
    status: "todo",
    priority: "medium",
    assignee: { name: "Alex Rivera", avatar: "/man-1.jpg", initials: "AR" },
    dueDate: "Dec 28, 2025",
    completed: false,
  },
  {
    id: 5,
    title: "Code review for payment module",
    project: "API Integration",
    status: "review",
    priority: "medium",
    assignee: { name: "Michael Brown", avatar: "/man-3.jpg", initials: "MB" },
    dueDate: "Dec 19, 2025",
    completed: false,
  },
  {
    id: 6,
    title: "Set up project repository",
    project: "Mobile App",
    status: "done",
    priority: "low",
    assignee: { name: "Sarah Chen", avatar: "/woman-1.jpg", initials: "SC" },
    dueDate: "Dec 15, 2025",
    completed: true,
  },
  {
    id: 7,
    title: "Create design system",
    project: "Marketing Website",
    status: "done",
    priority: "high",
    assignee: { name: "Jordan Lee", avatar: "/man-2.jpg", initials: "JL" },
    dueDate: "Dec 10, 2025",
    completed: true,
  },
]

const statusStyles: Record<string, string> = {
  todo: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/10 text-primary",
  review: "bg-warning/10 text-warning",
  done: "bg-success/10 text-success",
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
}

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted text-muted-foreground",
}

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleTask = (id: number) => {
    setSelectedTasks((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map((t) => t.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">View and manage all tasks across projects.</p>
        </div>
        <Button className="btn-3d">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
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
            {filteredTasks.map((task) => (
              <TableRow key={task.id} className={cn(task.completed && "opacity-60")}>
                <TableCell>
                  <Checkbox checked={selectedTasks.includes(task.id)} onCheckedChange={() => toggleTask(task.id)} />
                </TableCell>
                <TableCell>
                  <span className={cn("font-medium", task.completed && "line-through")}>{task.title}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{task.project}</TableCell>
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
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden lg:inline">{task.assignee.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {task.dueDate}
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
