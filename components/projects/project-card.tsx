"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Calendar, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectCardProps {
  id: number
  name: string
  description: string
  progress: number
  status: "on-track" | "at-risk" | "behind" | "completed"
  members: { name: string; avatar?: string }[]
  dueDate: string
  taskCount: number
  completedTasks: number
}

const statusStyles = {
  "on-track": "bg-success/10 text-success border-success/20",
  "at-risk": "bg-warning/10 text-warning border-warning/20",
  behind: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-primary/10 text-primary border-primary/20",
}

const statusLabels = {
  "on-track": "On Track",
  "at-risk": "At Risk",
  behind: "Behind",
  completed: "Completed",
}

export function ProjectCard({
  id,
  name,
  description,
  progress,
  status,
  members,
  dueDate,
  taskCount,
  completedTasks,
}: ProjectCardProps) {
  return (
    <div className="card-3d group rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Link href={`/dashboard/projects/${id}`} className="flex-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{name}</h3>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>View Tasks</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Archive Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", statusStyles[status])}>
            {statusLabels[status]}
          </span>
          <span className="text-xs text-muted-foreground">
            {completedTasks}/{taskCount} tasks
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member, i) => (
              <Avatar key={i} className="h-7 w-7 border-2 border-card">
                {member.avatar ? (
                  <>
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{member.name}</AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{member.name}</AvatarFallback>
                )}
              </Avatar>
            ))}
            {members.length > 4 && (
              <Avatar className="h-7 w-7 border-2 border-card">
                <AvatarFallback className="text-xs bg-muted">+{members.length - 4}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{dueDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
