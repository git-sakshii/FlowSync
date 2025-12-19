"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const taskCompletionData = [
  { name: "Week 1", completed: 18, created: 24 },
  { name: "Week 2", completed: 22, created: 20 },
  { name: "Week 3", completed: 28, created: 32 },
  { name: "Week 4", completed: 35, created: 28 },
  { name: "Week 5", completed: 30, created: 25 },
  { name: "Week 6", completed: 42, created: 38 },
]

const projectProgressData = [
  { name: "Marketing Website", progress: 75 },
  { name: "Mobile App", progress: 45 },
  { name: "Q4 Dashboard", progress: 90 },
  { name: "API Integration", progress: 30 },
  { name: "Customer Portal", progress: 100 },
]

const taskDistributionData = [
  { name: "To Do", value: 28, color: "hsl(var(--muted-foreground))" },
  { name: "In Progress", value: 35, color: "hsl(var(--primary))" },
  { name: "Review", value: 12, color: "hsl(var(--warning))" },
  { name: "Done", value: 56, color: "hsl(var(--success))" },
]

const workloadData = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "/woman-1.jpg",
    initials: "SC",
    tasks: 8,
    completed: 24,
    workload: 85,
  },
  {
    id: 2,
    name: "Alex Rivera",
    avatar: "/man-1.jpg",
    initials: "AR",
    tasks: 5,
    completed: 18,
    workload: 60,
  },
  {
    id: 3,
    name: "Jordan Lee",
    avatar: "/man-2.jpg",
    initials: "JL",
    tasks: 6,
    completed: 31,
    workload: 70,
  },
  {
    id: 4,
    name: "Emma Wilson",
    avatar: "/woman-2.jpg",
    initials: "EW",
    tasks: 4,
    completed: 42,
    workload: 45,
  },
  {
    id: 5,
    name: "Michael Brown",
    avatar: "/man-3.jpg",
    initials: "MB",
    tasks: 7,
    completed: 15,
    workload: 75,
  },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Insights and metrics for your projects and team.</p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Completion Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Task Completion Trend</CardTitle>
            <CardDescription>Tasks created vs completed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--success))" }}
                    name="Completed"
                  />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Completion status by project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`${value}%`, "Progress"]}
                  />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Tasks by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Workload */}
      <Card>
        <CardHeader>
          <CardTitle>Team Workload</CardTitle>
          <CardDescription>Current task distribution across team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {workloadData.map((member) => (
              <div key={member.id} className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{member.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {member.tasks} active • {member.completed} completed
                    </span>
                  </div>
                  <Progress value={member.workload} className="h-2" />
                </div>
                <span
                  className={`text-sm font-medium w-12 text-right ${member.workload > 80 ? "text-destructive" : member.workload > 60 ? "text-warning" : "text-success"}`}
                >
                  {member.workload}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
