"use client"

import { Button } from "@/components/ui/button"
import { Plus, FolderPlus, UserPlus, FileText } from "lucide-react"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { InviteMemberDialog } from "@/components/team/invite-member-dialog"
import { CreateReportDialog } from "@/components/reports/create-report-dialog"

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <CreateTaskDialog
        trigger={
          <Button className="btn-3d">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        }
      />

      <CreateProjectDialog />

      <InviteMemberDialog
        trigger={
          <Button variant="outline" className="bg-transparent">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        }
      />
      <CreateReportDialog
        trigger={
          <Button variant="outline" className="bg-transparent">
            <FileText className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        }
      />
    </div>
  )
}
