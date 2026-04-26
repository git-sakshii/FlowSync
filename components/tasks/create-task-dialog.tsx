"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/auth-store"

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
    projectId: z.string().min(1, "Project is required"),
    assigneeId: z.string().optional(),
    dueDate: z.string().optional(),
})

interface CreateTaskDialogProps {
    onTaskCreated?: () => void
    defaultProjectId?: string
    defaultStatus?: string
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CreateTaskDialog({ onTaskCreated, defaultProjectId, defaultStatus, trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: CreateTaskDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen
    const setOpen = controlledOnOpenChange || setInternalOpen
    const [projects, setProjects] = useState<any[]>([])
    const [projectMembers, setProjectMembers] = useState<any[]>([])
    const router = useRouter()

    useEffect(() => {
        if (open) {
            const fetchProjects = async () => {
                try {
                    const { data } = await api.get("/projects")
                    setProjects(data)
                } catch (error) {
                    console.error("Failed to fetch projects")
                }
            }
            fetchProjects()
        }
    }, [open])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "MEDIUM",
            status: (defaultStatus as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE") || "TODO",
            projectId: defaultProjectId || "",
            assigneeId: "",
            dueDate: ""
        },
    })

    // Watch projectId to update members list
    const selectedProjectId = form.watch("projectId")

    useEffect(() => {
        if (selectedProjectId && projects.length > 0) {
            const project = projects.find(p => p.id === selectedProjectId)
            if (project) {
                setProjectMembers(project.members || [])
            }
        } else if (defaultProjectId) {
            // If we have defaultId but projects aren't loaded yet, we wait. 
            // Or if defaultId is passed, we might need to fetch that specific project if not in list
            // But for now assuming projects list covers it or we fallback
            const project = projects.find(p => p.id === defaultProjectId)
            if (project) setProjectMembers(project.members || [])
        }
    }, [selectedProjectId, projects, defaultProjectId])

    const { user } = useAuthStore()
    const isLoading = form.formState.isSubmitting

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // Use selected assignee or default to creator if not specified (though now we have a selector)
            // If the user selects nothing, it sends "" which might fail schema validation if we don't handle it
            // Backend expects optional string.
            const payload = {
                ...values,
                assigneeId: values.assigneeId || user?.id
            }
            if (!payload.assigneeId && user?.id) payload.assigneeId = user.id // Fallback ensure

            await api.post(`/projects/${values.projectId}/tasks`, payload)
            setOpen(false)
            form.reset()
            toast.success("Task created successfully")
            onTaskCreated?.()
            router.refresh()
        } catch (error) {
            toast.error("Failed to create task")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="btn-3d">
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to a project.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Task title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {!defaultProjectId && (
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="TODO">To Do</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="REVIEW">Review</SelectItem>
                                                <SelectItem value="DONE">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="assigneeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assignee</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select member" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {projectMembers.map((member: any) => (
                                                <SelectItem key={member.user.id} value={member.user.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{member.user.firstName} {member.user.lastName}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Task details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Due Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Task
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
