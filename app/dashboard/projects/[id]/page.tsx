"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { InviteMemberDialog } from "@/components/projects/invite-member-dialog"
import { Loader2, Calendar, ArrowLeft, UserPlus, Users, Clock } from "lucide-react"

interface Project {
    id: string
    name: string
    description: string
    createdAt: string
    ownerId: string
    loading?: boolean
    owner: {
        firstName: string
        lastName: string
        avatar: string
    }
    tasks: any[]
    members: any[]
}

export default function ProjectDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProject = async () => {
        try {
            setLoading(true)
            const { data } = await api.get(`/projects/${params.id}`)
            setProject(data)
        } catch (error) {
            console.error("Failed to fetch project", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (params.id) {
            fetchProject()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">Project not found</h2>
                <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </div>
        )
    }

    // Calculate progress
    const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length
    const totalTasks = project.tasks.length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    className="w-fit pl-0 hover:bg-transparent hover:text-primary"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                        <p className="text-muted-foreground mt-1">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <InviteMemberDialog
                            projectId={project.id}
                            projectName={project.name}
                            onMemberAdded={fetchProject}
                        />
                        <CreateTaskDialog
                            defaultProjectId={project.id}
                            onTaskCreated={fetchProject}
                        />
                    </div>
                </div>

                {/* Project Meta */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={project.owner.avatar} />
                            <AvatarFallback>{getInitials(project.owner.firstName, project.owner.lastName)}</AvatarFallback>
                        </Avatar>
                        <span>Owner: {project.owner.firstName} {project.owner.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{project.members?.length || 0} members</span>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-2">
                            <Progress value={progress} className="h-2 flex-1" />
                            <span className="text-sm font-bold">{progress}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{completedTasks} of {totalTasks} tasks completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                            <InviteMemberDialog
                                projectId={project.id}
                                projectName={project.name}
                                onMemberAdded={fetchProject}
                                trigger={
                                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                }
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex -space-x-2 overflow-hidden">
                            {project.members && project.members.map((member: any) => (
                                <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src={member.user.avatar} />
                                    <AvatarFallback>{getInitials(member.user.firstName, member.user.lastName)}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="tasks" className="w-full">
                <TabsList>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="kanban">Board</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>
                <TabsContent value="tasks" className="mt-6">
                    <div className="rounded-md border">
                        <div className="p-4 space-y-4">
                            {project.tasks.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No tasks yet.</p>
                            ) : (
                                project.tasks.map((task: any) => (
                                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${task.status === 'DONE' ? 'bg-success' : 'bg-primary'}`} />
                                            <span className={task.status === 'DONE' ? 'line-through text-muted-foreground' : 'font-medium'}>{task.title}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${task.priority === 'HIGH' ? 'bg-destructive/10 text-destructive' :
                                                task.priority === 'MEDIUM' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            {task.dueDate && <span className="text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="kanban">
                    <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20 text-muted-foreground">
                        Kanban Board View (Coming Soon)
                    </div>
                </TabsContent>
                <TabsContent value="members" className="mt-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {project.members && project.members.map((member: any) => (
                            <Card key={member.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={member.user.avatar} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {getInitials(member.user.firstName, member.user.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {member.user.firstName} {member.user.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                                        </div>
                                        {member.userId === project.ownerId && (
                                            <Badge variant="secondary" className="text-xs shrink-0">Owner</Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Invite card */}
                        <InviteMemberDialog
                            projectId={project.id}
                            projectName={project.name}
                            onMemberAdded={fetchProject}
                            trigger={
                                <Card className="overflow-hidden border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                                <UserPlus className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-muted-foreground">Invite Member</p>
                                                <p className="text-xs text-muted-foreground">Add someone by email</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            }
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
