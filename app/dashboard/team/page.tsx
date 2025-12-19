"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Search, Plus, Mail, MoreHorizontal, Shield, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const teamMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah@flowsync.com",
    avatar: "/woman-1.jpg",
    initials: "SC",
    role: "Admin",
    department: "Engineering",
    activeTasks: 8,
    completedTasks: 24,
    status: "online",
  },
  {
    id: 2,
    name: "Alex Rivera",
    email: "alex@flowsync.com",
    avatar: "/man-1.jpg",
    initials: "AR",
    role: "Member",
    department: "Engineering",
    activeTasks: 5,
    completedTasks: 18,
    status: "online",
  },
  {
    id: 3,
    name: "Jordan Lee",
    email: "jordan@flowsync.com",
    avatar: "/man-2.jpg",
    initials: "JL",
    role: "Member",
    department: "Design",
    activeTasks: 6,
    completedTasks: 31,
    status: "away",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@flowsync.com",
    avatar: "/woman-2.jpg",
    initials: "EW",
    role: "Admin",
    department: "Product",
    activeTasks: 4,
    completedTasks: 42,
    status: "online",
  },
  {
    id: 5,
    name: "Michael Brown",
    email: "michael@flowsync.com",
    avatar: "/man-3.jpg",
    initials: "MB",
    role: "Member",
    department: "Engineering",
    activeTasks: 7,
    completedTasks: 15,
    status: "offline",
  },
  {
    id: 6,
    name: "Lisa Park",
    email: "lisa@flowsync.com",
    avatar: "",
    initials: "LP",
    role: "Member",
    department: "Marketing",
    activeTasks: 3,
    completedTasks: 12,
    status: "online",
  },
]

const statusStyles = {
  online: "bg-success",
  away: "bg-warning",
  offline: "bg-muted-foreground",
}

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">Manage your team members and their roles.</p>
        </div>
        <Button className="btn-3d">
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Team Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="card-3d">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card",
                        statusStyles[member.status as keyof typeof statusStyles],
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.department}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit Role</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {member.email}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={member.role === "Admin" ? "default" : "secondary"} className="gap-1">
                  {member.role === "Admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  {member.role}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-2xl font-bold">{member.activeTasks}</p>
                  <p className="text-xs text-muted-foreground">Active Tasks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{member.completedTasks}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
