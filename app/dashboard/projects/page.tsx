"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjectCard } from "@/components/projects/project-card"
import { Plus, Search, LayoutGrid, List } from "lucide-react"

const projects = [
  {
    id: 1,
    name: "Marketing Website Redesign",
    description: "Complete overhaul of the company website with new branding and improved user experience.",
    progress: 75,
    status: "on-track" as const,
    members: [
      { name: "SC", avatar: "/woman-1.jpg" },
      { name: "AR", avatar: "/man-1.jpg" },
      { name: "JL", avatar: "/man-2.jpg" },
    ],
    dueDate: "Dec 25, 2025",
    taskCount: 24,
    completedTasks: 18,
  },
  {
    id: 2,
    name: "Mobile App Development",
    description: "Native iOS and Android app for customer self-service and account management.",
    progress: 45,
    status: "at-risk" as const,
    members: [
      { name: "EW", avatar: "/woman-2.jpg" },
      { name: "MB", avatar: "/man-3.jpg" },
    ],
    dueDate: "Jan 15, 2026",
    taskCount: 42,
    completedTasks: 19,
  },
  {
    id: 3,
    name: "Q4 Analytics Dashboard",
    description: "Real-time analytics dashboard for tracking key business metrics and KPIs.",
    progress: 90,
    status: "on-track" as const,
    members: [
      { name: "SC", avatar: "/woman-1.jpg" },
      { name: "AR", avatar: "/man-1.jpg" },
    ],
    dueDate: "Dec 20, 2025",
    taskCount: 16,
    completedTasks: 14,
  },
  {
    id: 4,
    name: "API Integration",
    description: "RESTful API development for third-party integrations and partner ecosystem.",
    progress: 30,
    status: "behind" as const,
    members: [
      { name: "JL", avatar: "/man-2.jpg" },
      { name: "EW", avatar: "/woman-2.jpg" },
      { name: "MB", avatar: "/man-3.jpg" },
      { name: "SC", avatar: "/woman-1.jpg" },
      { name: "AR", avatar: "/man-1.jpg" },
    ],
    dueDate: "Jan 30, 2026",
    taskCount: 38,
    completedTasks: 11,
  },
  {
    id: 5,
    name: "Customer Portal v2",
    description: "Next-generation customer portal with enhanced security and self-service capabilities.",
    progress: 100,
    status: "completed" as const,
    members: [
      { name: "MB", avatar: "/man-3.jpg" },
      { name: "SC", avatar: "/woman-1.jpg" },
    ],
    dueDate: "Dec 10, 2025",
    taskCount: 20,
    completedTasks: 20,
  },
  {
    id: 6,
    name: "Data Migration Project",
    description: "Migration of legacy data systems to new cloud infrastructure.",
    progress: 60,
    status: "on-track" as const,
    members: [
      { name: "AR", avatar: "/man-1.jpg" },
      { name: "JL", avatar: "/man-2.jpg" },
    ],
    dueDate: "Feb 28, 2026",
    taskCount: 30,
    completedTasks: 18,
  },
]

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your team projects.</p>
        </div>
        <Button className="btn-3d">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
            <SelectItem value="behind">Behind</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="rounded-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="rounded-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
