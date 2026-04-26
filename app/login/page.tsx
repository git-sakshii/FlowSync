"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Users } from "lucide-react"
import { api } from "@/lib/api-client"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("invite")
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { data } = await api.post("/auth/login", { email, password })

      login(data.user, data.tokens)

      // If there's an invite token, accept the invite after login
      if (inviteToken) {
        try {
          const { data: inviteData } = await api.post(`/invite/${inviteToken}/accept`)
          toast.success("Welcome back!", { description: "You've joined the project!" })
          router.push(`/dashboard?joined=${inviteData.projectId}&projectName=${encodeURIComponent(inviteData.projectName)}`)
          return
        } catch (inviteErr: any) {
          // If invite fails (already accepted, expired, wrong email), proceed to dashboard
          console.error("Invite accept failed:", inviteErr)
          toast.warning(inviteErr.response?.data?.message || "Could not accept invitation")
        }
      }

      toast.success("Welcome back!", { description: "You have successfully logged in." })
      router.push("/dashboard")
    } catch (err: any) {
      const message = err.response?.data?.message || "Something went wrong. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to your account to continue">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invite banner */}
        {inviteToken && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary text-sm">
            <Users className="h-4 w-4 shrink-0" />
            <span>You've been invited to a project. Sign in to join.</span>
          </div>
        )}

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input name="email" id="email" type="email" placeholder="name@company.com" required className="h-11" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              name="password"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 btn-3d" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {inviteToken ? "Sign In & Join Project" : "Sign In"}
        </Button>


        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href={inviteToken ? `/signup?invite=${inviteToken}` : "/signup"}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
