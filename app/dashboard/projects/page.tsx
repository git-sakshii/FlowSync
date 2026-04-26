"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjectCard } from "@/components/projects/project-card"
import { Search, LayoutGrid, List, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"

export default function ProjectsPage() {
  interface Project {
    id: string
    name: string
    description: string
    progress: number
    updatedAt: string
    members: Array<{
      user: {
        firstName: string
        avatar?: string
      }
    }>
  }

  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get("/projects")
      setProjects(data)
    } catch (error) {
      console.error("Failed to fetch projects", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase())
    // Status filter logic might need adjustment based on how we define project status in backend
    // Backend doesn't explicitly store project 'status', but we can infer or ignore for now
    // For now, let's say "completed" is if progress is 100
    let matchesStatus = true
    if (statusFilter === "completed") matchesStatus = project.progress === 100
    if (statusFilter === "on-track") matchesStatus = project.progress < 100

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
        <CreateProjectDialog onProjectCreated={fetchProjects} />
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
            <SelectItem value="on-track">Active</SelectItem>
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Project Grid */}
      {!isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              // Map backend fields to frontend component expectations
              status={project.progress === 100 ? "completed" : "on-track"}
              dueDate={project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "No date"}
              members={project.members.map((m: any) => ({
                name: m.user.firstName,
                avatar: m.user.avatar
              }))}
              onProjectUpdated={fetchProjects}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
