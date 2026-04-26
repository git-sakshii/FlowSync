"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, CheckCircle, Check } from "lucide-react"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

export default function ResetPasswordPage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const passwordRequirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "Contains a number", met: /\d/.test(password) },
        { label: "Contains uppercase", met: /[A-Z]/.test(password) },
    ]

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters")
            return
        }

        setIsLoading(true)

        try {
            await api.post("/auth/reset-password", { token, password })
            setIsSuccess(true)
            toast.success("Password reset successfully!")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password. The link may have expired.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <AuthLayout title="Password Reset!" description="Your password has been changed successfully">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-success" />
                        </div>
                    </div>
                    <p className="text-muted-foreground">
                        You can now sign in with your new password.
                    </p>
                    <Button asChild className="w-full h-11 btn-3d">
                        <Link href="/login">
                            Go to Login
                        </Link>
                    </Button>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout title="Create new password" description="Enter your new password below">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        required
                        className="h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {password && (
                        <div className="space-y-1 mt-2">
                            {passwordRequirements.map((req) => (
                                <div key={req.label} className="flex items-center gap-2 text-xs">
                                    <Check className={`h-3 w-3 ${req.met ? "text-success" : "text-muted-foreground"}`} />
                                    <span className={req.met ? "text-success" : "text-muted-foreground"}>{req.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        required
                        className="h-11"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <Button type="submit" className="w-full h-11 btn-3d" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Password
                </Button>

                <Button variant="outline" asChild className="w-full h-11 bg-transparent">
                    <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
                    </Link>
                </Button>
            </form>
        </AuthLayout>
    )
}
