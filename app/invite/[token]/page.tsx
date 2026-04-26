"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Users, ArrowRight, LogIn, UserPlus2, AlertCircle, Clock } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface InviteDetails {
    email: string
    project: { id: string; name: string; description: string }
    inviter: { name: string; avatar: string | null } | null
    expiresAt: string
}

export default function InviteLandingPage() {
    const params = useParams()
    const router = useRouter()
    const [invite, setInvite] = useState<InviteDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/invite/${params.token}`)
                const data = await res.json()

                if (!res.ok) {
                    setError(data.message || "Invalid invitation")
                    return
                }

                setInvite(data)
            } catch (err) {
                setError("Failed to load invitation details")
            } finally {
                setLoading(false)
            }
        }

        if (params.token) {
            fetchInvite()
        }
    }, [params.token])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8 pb-8 text-center space-y-4">
                        <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-bold">Invitation Error</h2>
                        <p className="text-muted-foreground">{error}</p>
                        <Button onClick={() => router.push("/login")} variant="outline" className="mt-4">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!invite) return null

    const inviterNameParts = invite.inviter?.name?.split(" ") || ["?"]

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
            {/* Decorative backgrounds */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Logo */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        FlowSync
                    </h1>
                </div>

                {/* Main invite card */}
                <Card className="overflow-hidden border-0 shadow-2xl shadow-primary/10">
                    {/* Gradient header */}
                    <div className="bg-gradient-to-r from-primary to-purple-500 p-6 text-center text-white">
                        <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                            <Users className="h-7 w-7" />
                        </div>
                        <h2 className="text-xl font-bold">You're Invited!</h2>
                    </div>

                    <CardContent className="p-6 space-y-6">
                        {/* Inviter info */}
                        {invite.inviter && (
                            <div className="flex items-center gap-3 justify-center">
                                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                                    <AvatarImage src={invite.inviter.avatar || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                        {getInitials(inviterNameParts[0], inviterNameParts[1] || "")}
                                    </AvatarFallback>
                                </Avatar>
                                <p className="text-sm text-muted-foreground">
                                    <strong className="text-foreground">{invite.inviter.name}</strong> invited you to join
                                </p>
                            </div>
                        )}

                        {/* Project info */}
                        <div className="bg-muted/50 rounded-xl p-4 border border-border/50 text-center">
                            <h3 className="text-lg font-bold">{invite.project.name}</h3>
                            {invite.project.description && (
                                <p className="text-sm text-muted-foreground mt-1">{invite.project.description}</p>
                            )}
                        </div>

                        {/* Expiry note */}
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                                Expires {new Date(invite.expiresAt).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric"
                                })}
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-3">
                            <Link href={`/login?invite=${params.token}`} className="block">
                                <Button className="w-full h-12 btn-3d gap-2 text-base">
                                    <LogIn className="h-4 w-4" />
                                    Sign In to Join
                                    <ArrowRight className="h-4 w-4 ml-auto" />
                                </Button>
                            </Link>
                            <Link href={`/signup?invite=${params.token}`} className="block">
                                <Button variant="outline" className="w-full h-12 gap-2 text-base bg-transparent">
                                    <UserPlus2 className="h-4 w-4" />
                                    Create an Account
                                    <ArrowRight className="h-4 w-4 ml-auto" />
                                </Button>
                            </Link>
                        </div>

                        <p className="text-xs text-center text-muted-foreground">
                            This invitation was sent to <strong>{invite.email}</strong>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
