"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ProjectOverview } from "@/components/dashboard/project-overview"
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks"
import { InviteAcceptedDialog } from "@/components/projects/invite-accepted-dialog"
import { FolderKanban, CheckSquare, CheckCircle, Clock, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { useAuthStore } from "@/lib/auth-store"

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const [showJoinedDialog, setShowJoinedDialog] = useState(false)
  const [joinedProject, setJoinedProject] = useState({ id: "", name: "" })
  const [stats, setStats] = useState({
    projects: 0,
    projectsChange: 0,
    tasks: 0,
    tasksChange: 0,
    completed: 0,
    completedChange: 0,
    pending: 0,
    pendingChange: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/analytics/dashboard")
        setStats({
          projects: data.projects,
          projectsChange: data.projectsChange,
          tasks: data.tasks,
          tasksChange: data.tasksChange,
          completed: data.completed,
          completedChange: data.completedChange,
          pending: data.pending,
          pendingChange: data.pendingChange,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error)
      }
    }

    fetchData()
  }, [])

  // Handle ?joined=... query param from invite flow
  useEffect(() => {
    const joinedId = searchParams.get("joined")
    const projectName = searchParams.get("projectName")
    if (joinedId) {
      setJoinedProject({ id: joinedId, name: projectName || "the project" })
      setShowJoinedDialog(true)
      // Clean URL without reload
      window.history.replaceState({}, "", "/dashboard")
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName}. Here's what's happening with your projects.</p>
        </div>
        <QuickActions />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Projects" value={stats.projects} change={stats.projectsChange} icon={<FolderKanban className="h-6 w-6" />} />
        <StatCard title="Total Tasks" value={stats.tasks} change={stats.tasksChange} icon={<CheckSquare className="h-6 w-6" />} />
        <StatCard title="Tasks Completed" value={stats.completed} change={stats.completedChange} icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard title="Tasks Pending" value={stats.pending} change={stats.pendingChange} icon={<Clock className="h-6 w-6" />} />
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ProjectOverview />
          <UpcomingTasks />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>

      {/* Invite accepted popup */}
      <InviteAcceptedDialog
        open={showJoinedDialog}
        onOpenChange={setShowJoinedDialog}
        projectId={joinedProject.id}
        projectName={joinedProject.name}
        onGoToProject={() => {
          setShowJoinedDialog(false)
          router.push(`/dashboard/projects/${joinedProject.id}`)
        }}
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
