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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Check, Plus, UserPlus } from "lucide-react"

interface AddMemberDialogProps {
    projectId: string
    currentMemberIds: string[]
    onMemberAdded: () => void
    trigger?: React.ReactNode
}

export function AddMemberDialog({ projectId, currentMemberIds, onMemberAdded, trigger }: AddMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            fetchUsers()
        }
    }, [open])

    const fetchUsers = async () => {
        try {
            const { data } = await api.get("/users")
            // Filter out users who are already members
            setUsers(data)
        } catch (error) {
            console.error("Failed to fetch users")
        }
    }

    const handleAddUser = async (userId: string) => {
        try {
            setLoading(true)
            await api.post(`/projects/${projectId}/members`, { userId })
            toast.success("Team member added successfully")
            setOpen(false)
            onMemberAdded()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add member")
        } finally {
            setLoading(false)
        }
    }

    // Filter local lists
    const availableUsers = users.filter(u => !currentMemberIds.includes(u.id))

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Team Members</DialogTitle>
                    <DialogDescription>
                        Search for users to add to this project.
                    </DialogDescription>
                </DialogHeader>
                <Command className="border rounded-md">
                    <CommandInput placeholder="Search users..." />
                    <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup heading="Available Users">
                            {availableUsers.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    onSelect={() => handleAddUser(user.id)}
                                    className="flex items-center gap-2 cursor-pointer p-2"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                    <Plus className="ml-auto h-4 w-4 bg-muted p-0.5 rounded-full" />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {availableUsers.length === 0 && users.length > 0 && (
                            <div className="p-4 text-sm text-center text-muted-foreground">
                                All (fetched) users are already members.
                            </div>
                        )}
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    )
}
