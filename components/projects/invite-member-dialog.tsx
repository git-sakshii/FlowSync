"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserPlus, Loader2, Mail, Clock, CheckCircle2, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface InviteMemberDialogProps {
    projectId: string
    projectName: string
    onMemberAdded?: () => void
    trigger?: React.ReactNode
}

interface PendingInvite {
    id: string
    email: string
    status: string
    createdAt: string
    expiresAt: string
}

export function InviteMemberDialog({ projectId, projectName, onMemberAdded, trigger }: InviteMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
    const [inviteResult, setInviteResult] = useState<{ status: string; message: string } | null>(null)

    useEffect(() => {
        if (open) {
            fetchPendingInvites()
            setInviteResult(null)
            setEmail("")
        }
    }, [open])

    const fetchPendingInvites = async () => {
        try {
            const { data } = await api.get(`/projects/${projectId}/invites`)
            setPendingInvites(data)
        } catch (error) {
            console.error("Failed to fetch pending invites")
        }
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        try {
            setIsLoading(true)
            setInviteResult(null)
            const { data } = await api.post(`/projects/${projectId}/invite`, { email: email.trim() })

            setInviteResult({ status: data.status, message: data.message })

            if (data.status === "added") {
                toast.success(`${data.message}`)
                onMemberAdded?.()
            } else {
                toast.success("Invitation sent!", { description: `An email has been sent to ${email}` })
            }

            setEmail("")
            fetchPendingInvites()
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to send invitation"
            toast.error(msg)
            setInviteResult({ status: "error", message: msg })
        } finally {
            setIsLoading(false)
        }
    }

    const timeAgo = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
        if (diff < 60) return "just now"
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
        return `${Math.floor(diff / 86400)}d ago`
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Invite Member
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Invite to {projectName}
                    </DialogTitle>
                    <DialogDescription>
                        Invite someone by email. If they already have an account, they'll be added instantly.
                        Otherwise, they'll receive an invitation email.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleInvite} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="invite-email">Email address</Label>
                        <div className="flex gap-2">
                            <Input
                                id="invite-email"
                                type="email"
                                placeholder="colleague@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isLoading || !email.trim()} className="btn-3d gap-2">
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Invite
                            </Button>
                        </div>
                    </div>

                    {/* Result feedback */}
                    {inviteResult && (
                        <div className={cn(
                            "flex items-center gap-3 p-3 rounded-lg text-sm",
                            inviteResult.status === "added" && "bg-success/10 text-success",
                            inviteResult.status === "invited" && "bg-primary/10 text-primary",
                            inviteResult.status === "error" && "bg-destructive/10 text-destructive"
                        )}>
                            {inviteResult.status === "added" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                            {inviteResult.status === "invited" && <Mail className="h-4 w-4 shrink-0" />}
                            <span>{inviteResult.message}</span>
                        </div>
                    )}
                </form>

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-sm font-medium text-muted-foreground">Pending Invitations</h4>
                        <div className="space-y-2">
                            {pendingInvites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs bg-warning/10 text-warning">
                                                <Clock className="h-3.5 w-3.5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{invite.email}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Invited {timeAgo(invite.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-warning font-medium px-2 py-1 bg-warning/10 rounded-full">
                                        Pending
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
