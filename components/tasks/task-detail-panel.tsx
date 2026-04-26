"use client"

import { useState, useEffect } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Loader2, Calendar, MessageSquare, Send, Clock, User, CheckCircle2 } from "lucide-react"
import { api } from "@/lib/api-client"
import { useAuthStore } from "@/lib/auth-store"
import { getInitials, cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface TaskDetailPanelProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: any | null
    onTaskUpdated?: () => void
}

export function TaskDetailPanel({ open, onOpenChange, task, onTaskUpdated }: TaskDetailPanelProps) {
    const { user } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState("")
    const [isCommenting, setIsCommenting] = useState(false)

    // Inline edit state
    const [description, setDescription] = useState("")
    const [isEditingDesc, setIsEditingDesc] = useState(false)

    useEffect(() => {
        if (task && open) {
            setDescription(task.description || "")
            setIsEditingDesc(false)
            fetchComments()
        }
    }, [task, open])

    const fetchComments = async () => {
        if (!task) return
        try {
            const { data } = await api.get(`/tasks/${task.id}/comments`)
            setComments(data)
        } catch (error) {
            console.error("Failed to fetch comments", error)
        }
    }

    const handleSaveDescription = async () => {
        if (!task) return
        try {
            setIsLoading(true)
            await api.put(`/tasks/${task.id}`, { description })
            toast.success("Description updated")
            setIsEditingDesc(false)
            onTaskUpdated?.()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update description")
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!task) return
        try {
            await api.put(`/tasks/${task.id}/status`, { status: newStatus })
            toast.success("Status updated")
            onTaskUpdated?.()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Not authorized to change status")
        }
    }

    const handleAddComment = async () => {
        if (!task || !newComment.trim()) return
        try {
            setIsCommenting(true)
            const { data } = await api.post(`/tasks/${task.id}/comments`, { content: newComment })
            setComments((prev) => [...prev, data])
            setNewComment("")
            toast.success("Comment added")
        } catch (error) {
            toast.error("Failed to add comment")
        } finally {
            setIsCommenting(false)
        }
    }

    if (!task) return null

    const isAssignee = task.assigneeId === user?.id
    const isOwner = task.project?.ownerId === user?.id
    const isAdmin = user?.role === "ADMIN"
    const canEdit = isAssignee || isOwner || isAdmin

    const statusStyles: Record<string, string> = {
        TODO: "text-muted-foreground",
        IN_PROGRESS: "text-primary",
        REVIEW: "text-warning",
        DONE: "text-success",
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col gap-0 border-l bg-background/95 backdrop-blur-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b bg-muted/30">
                    <div className="flex items-center gap-3 mb-2">
                        <Select
                            value={task.status}
                            onValueChange={handleStatusChange}
                            disabled={!canEdit}
                        >
                            <SelectTrigger className={cn("h-8 w-[140px] border-dashed", statusStyles[task.status])}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODO">To Do</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="REVIEW">Review</SelectItem>
                                <SelectItem value="DONE">Done</SelectItem>
                            </SelectContent>
                        </Select>
                        {task.dueDate && (
                            <div className={cn(
                                "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-muted",
                                new Date(task.dueDate) < new Date() && task.status !== "DONE" && "bg-destructive/10 text-destructive"
                            )}>
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(task.dueDate).toLocaleDateString()}
                                {new Date(task.dueDate) < new Date() && task.status !== "DONE" && " (Overdue)"}
                            </div>
                        )}
                    </div>
                    <SheetTitle className="text-xl leading-snug">{task.title}</SheetTitle>
                    <SheetDescription className="mt-1">
                        in <span className="font-medium text-foreground">{task.project?.name || "Unknown Project"}</span>
                    </SheetDescription>
                </div>

                <ScrollArea className="flex-1 px-6 py-6">
                    <div className="space-y-8">
                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div className="space-y-1.5">
                                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Assignee</span>
                                <div className="flex items-center gap-2">
                                    {task.assignee ? (
                                        <>
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={task.assignee.avatar || ""} />
                                                <AvatarFallback className="text-[10px]">{getInitials(task.assignee.firstName, task.assignee.lastName)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{task.assignee.firstName} {task.assignee.lastName}</span>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <div className="h-6 w-6 rounded-full border border-dashed flex items-center justify-center">
                                                <User className="h-3 w-3" />
                                            </div>
                                            Unassigned
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Priority</span>
                                <div className="flex items-center gap-2 font-medium">
                                    {task.priority === "HIGH" && <span className="text-destructive flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> High</span>}
                                    {task.priority === "MEDIUM" && <span className="text-warning flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Medium</span>}
                                    {task.priority === "LOW" && <span className="text-muted-foreground flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Low</span>}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    Description
                                </h3>
                                {canEdit && !isEditingDesc && (
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsEditingDesc(true)}>
                                        Edit
                                    </Button>
                                )}
                            </div>
                            {isEditingDesc ? (
                                <div className="space-y-3 animate-in fade-in">
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="min-h-[120px] resize-none"
                                        placeholder="Add more details to this task..."
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setDescription(task.description || "")
                                            setIsEditingDesc(false)
                                        }}>
                                            Cancel
                                        </Button>
                                        <Button size="sm" onClick={handleSaveDescription} disabled={isLoading}>
                                            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={cn(
                                        "text-sm prose prose-sm dark:prose-invert max-w-none",
                                        !task.description && "text-muted-foreground italic",
                                        canEdit && "cursor-text hover:bg-muted/50 p-2 -mx-2 rounded-md transition-colors"
                                    )}
                                    onClick={() => canEdit && setIsEditingDesc(true)}
                                >
                                    {task.description || "Click to add a description..."}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Comments Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comments
                            </h3>

                            <div className="space-y-4">
                                {comments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No comments yet. Start the conversation!</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarImage src={comment.user.avatar || ""} />
                                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                    {getInitials(comment.user.firstName, comment.user.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{comment.user.firstName} {comment.user.lastName}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/50 p-3 rounded-lg rounded-tl-none">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Comment Input Sticky Footer */}
                <div className="p-4 border-t bg-background">
                    <div className="relative">
                        <Textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[80px] resize-none pr-12 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleAddComment()
                                }
                            }}
                        />
                        <Button
                            size="icon"
                            className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isCommenting}
                        >
                            {isCommenting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                        Press <kbd className="font-sans px-1 rounded bg-muted">Enter</kbd> to send, <kbd className="font-sans px-1 rounded bg-muted">Shift + Enter</kbd> for new line
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
}
