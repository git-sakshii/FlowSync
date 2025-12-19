"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Link from "next/link"

const projects = [
  {
    id: 1,
    name: "Marketing Website Redesign",
    progress: 75,
    status: "on-track",
    members: [
      { name: "SC", avatar: "/woman-1.jpg" },
      { name: "AR", avatar: "/man-1.jpg" },
      { name: "JL", avatar: "/man-2.jpg" },
    ],
    dueDate: "Dec 25",
  },
  {
    id: 2,
    name: "Mobile App Development",
    progress: 45,
    status: "at-risk",
    members: [
      { name: "EW", avatar: "/woman-2.jpg" },
      { name: "MB", avatar: "/man-3.jpg" },
    ],
    dueDate: "Jan 15",
  },
  {
    id: 3,
    name: "Q4 Analytics Dashboard",
    progress: 90,
    status: "on-track",
    members: [
      { name: "SC", avatar: "/woman-1.jpg" },
      { name: "AR", avatar: "/man-1.jpg" },
    ],
    dueDate: "Dec 20",
  },
  {
    id: 4,
    name: "API Integration",
    progress: 30,
    status: "behind",
    members: [
      { name: "JL", avatar: "/man-2.jpg" },
      { name: "EW", avatar: "/woman-2.jpg" },
      { name: "MB", avatar: "/man-3.jpg" },
      { name: "+2", avatar: "" },
    ],
    dueDate: "Jan 30",
  },
]

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

export function ProjectOverview() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Active Projects</h3>
        <Link href="/dashboard/projects" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="divide-y divide-border">
        {projects.map((project) => (
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
                {statusLabels[project.status as keyof typeof statusLabels]}
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
                {project.members.slice(0, 4).map((member, i) => (
                  <Avatar key={i} className="h-6 w-6 border-2 border-card">
                    {member.avatar ? (
                      <>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{member.name}</AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="text-xs bg-muted">{member.name}</AvatarFallback>
                    )}
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Due {project.dueDate}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
