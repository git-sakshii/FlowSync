"use client"

import { Button } from "@/components/ui/button"
import { Plus, FolderPlus, UserPlus, FileText } from "lucide-react"

const actions = [
  { label: "New Task", icon: Plus, variant: "default" as const },
  { label: "New Project", icon: FolderPlus, variant: "outline" as const },
  { label: "Invite Member", icon: UserPlus, variant: "outline" as const },
  { label: "Create Report", icon: FileText, variant: "outline" as const },
]

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          className={action.variant === "default" ? "btn-3d" : "bg-transparent"}
        >
          <action.icon className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      ))}
    </div>
  )
}
