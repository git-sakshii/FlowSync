"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Link from "next/link"

import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { getInitials } from "@/lib/utils"

export function ProjectOverview() {
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/projects")
        // Map API data to UI structure
        const mappedProjects = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          progress: p.progress || 0,
          // logic for status based on progress for now
          status: p.progress === 100 ? "on-track" : p.progress < 30 ? "at-risk" : "on-track",
          members: p.members.map((m: any) => ({
            name: getInitials(m.user.firstName, m.user.lastName),
            avatar: m.user.avatar,
            fullName: `${m.user.firstName} ${m.user.lastName}`
          })),
          dueDate: "Ongoing" // Placeholder as Project model doesn't have dueDate yet
        }))
        setProjects(mappedProjects.slice(0, 5)) // Show top 5
      } catch (error) {
        console.error("Failed to fetch projects", error)
      }
    }
    fetchProjects()
  }, [])

  const statusStyles = {
    "on-track": "bg-success/10 text-success",
    "at-risk": "bg-warning/10 text-warning",
    behind: "bg-destructive/10 text-destructive",
  }

  const statusLabels = {
    "on-track": "On Track",
    "at-risk": "At Risk",
    behind: "Behind",
  }
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Active Projects</h3>
        <Link href="/dashboard/projects" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {projects.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No active projects found.
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="block p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">{project.name}</h4>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    statusStyles[project.status as keyof typeof statusStyles],
                  )}
                >
                  {statusLabels[project.status as keyof typeof statusLabels] || "On Track"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={project.progress} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">{project.progress}%</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex -space-x-2">
                  {project.members && project.members.slice(0, 4).map((member: any, i: number) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-card">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} />
                      ) : null}
                      <AvatarFallback className="text-[10px] bg-muted" title={member.fullName}>{member.name}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{project.dueDate}</span>
              </div>
            </Link>
          )))}
      </div>
    </div>
  )
}
