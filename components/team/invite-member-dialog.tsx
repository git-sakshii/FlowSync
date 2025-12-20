"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Mail, Loader2, Send } from "lucide-react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

const formSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

interface InviteMemberDialogProps {
    trigger?: React.ReactNode
}

export function InviteMemberDialog({ trigger }: InviteMemberDialogProps) {
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    const isLoading = form.formState.isSubmitting

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const { data } = await api.post("/users/invite", values)

            if (data.existingUser) {
                toast.info("User already exists", {
                    description: `${data.existingUser.firstName} ${data.existingUser.lastName} is already on FlowSync.`
                })
            } else {
                toast.success("Invitation Sent", {
                    description: `We've sent an invite link to ${values.email}`
                })
            }
            setOpen(false)
            form.reset()
        } catch (error: any) {
            toast.error("Failed to send invitation", {
                description: error.response?.data?.message || "Something went wrong"
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="btn-3d">
                        <Mail className="mr-2 h-4 w-4" />
                        Invite Member
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        Send an invitation email to add a new member to your team.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="colleague@company.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {!isLoading && <Send className="mr-2 h-4 w-4" />}
                                Send Invitation
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
