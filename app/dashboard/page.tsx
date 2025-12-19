"use client"

import { useEffect, useState } from "react"
import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ProjectOverview } from "@/components/dashboard/project-overview"
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks"
import { FolderKanban, CheckSquare, CheckCircle, Clock } from "lucide-react"
import { api } from "@/lib/api-client"
import { useAuthStore } from "@/lib/auth-store"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    completed: 0,
    pending: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: projects } = await api.get("/projects")

        const totalProjects = projects.length
        let totalTasks = 0
        let completedTasks = 0

        projects.forEach((p: any) => {
          totalTasks += p.taskCount || 0
          completedTasks += p.completedTasks || 0
        })

        setStats({
          projects: totalProjects,
          tasks: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks
        })
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error)
      }
    }

    fetchData()
  }, [])

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
        <StatCard title="Total Projects" value={stats.projects} change={0} icon={<FolderKanban className="h-6 w-6" />} />
        <StatCard title="Total Tasks" value={stats.tasks} change={0} icon={<CheckSquare className="h-6 w-6" />} />
        <StatCard title="Tasks Completed" value={stats.completed} change={0} icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard title="Tasks Pending" value={stats.pending} change={0} icon={<Clock className="h-6 w-6" />} />
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
    </div>
  )
}
