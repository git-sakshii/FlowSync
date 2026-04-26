"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn, getInitials } from "@/lib/utils"
import { Search, Plus, Mail, MoreHorizontal, Shield, User, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api-client"
import { useAuthStore } from "@/lib/auth-store"
import { InviteMemberDialog } from "@/components/team/invite-member-dialog"

export default function TeamPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { user: currentUser } = useAuthStore()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/users")
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  // Frontend filter for immediate feedback, though API search exists
  const filteredUsers = users.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">Manage your team members and their roles.</p>
        </div>
        <InviteMemberDialog />
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

      {/* Team Content */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((member) => (
            <Card key={member.id} className="card-3d hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar || ""} />
                        <AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback>
                      </Avatar>
                      {/* Hardcoding status for now as backend doesn't track online status yet */}
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{member.firstName} {member.lastName}</h3>
                      <p className="text-sm text-muted-foreground">{member.role === 'ADMIN' ? 'Engineering' : 'Member'}</p>
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
                      {currentUser?.role === 'ADMIN' && (
                        <>
                          <DropdownMenuItem>Edit Role</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                        </>
                      )}
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
                  <Badge variant={member.role === "ADMIN" ? "default" : "secondary"} className="gap-1">
                    {member.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {member.role}
                  </Badge>
                </div>

                {/* Real Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t text-center">
                  <div>
                    <p className="text-xl font-bold">{member.activeTasks ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Active Tasks</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{member.completedTasks ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No team members found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
