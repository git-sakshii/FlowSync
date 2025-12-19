import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ProjectOverview } from "@/components/dashboard/project-overview"
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks"
import { FolderKanban, CheckSquare, CheckCircle, Clock } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, John. Here's what's happening with your projects.</p>
        </div>
        <QuickActions />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Projects" value={12} change={8} icon={<FolderKanban className="h-6 w-6" />} />
        <StatCard title="Total Tasks" value={84} change={12} icon={<CheckSquare className="h-6 w-6" />} />
        <StatCard title="Tasks Completed" value={56} change={15} icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard title="Tasks Pending" value={28} change={-5} icon={<Clock className="h-6 w-6" />} />
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
