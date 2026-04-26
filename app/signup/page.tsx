"use client"

import type React from "react"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Loader2, Check, Users } from "lucide-react"
import { api } from "@/lib/api-client"
import { useAuthStore } from "@/lib/auth-store"
import { toast } from "sonner"

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("invite")
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")

  // If there's an invite token, fetch the invite details to pre-fill email
  useEffect(() => {
    if (inviteToken) {
      const fetchInvite = async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/invite/${inviteToken}`)
          const data = await res.json()
          if (res.ok && data.email) {
            setInviteEmail(data.email)
          }
        } catch (err) {
          // Silently fail — they can still type their email
        }
      }
      fetchInvite()
    }
  }, [inviteToken])

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(password) },
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string

    // Validate password requirements client-side too
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const { data } = await api.post("/auth/signup", {
        email,
        password,
        firstName,
        lastName
      })

      login(data.user, data.tokens)

      // If there's an invite token, accept the invite after signup
      if (inviteToken) {
        try {
          const { data: inviteData } = await api.post(`/invite/${inviteToken}/accept`)
          toast.success("Account created!", { description: "You've joined the project!" })
          router.push(`/dashboard?joined=${inviteData.projectId}&projectName=${encodeURIComponent(inviteData.projectName)}`)
          return
        } catch (inviteErr: any) {
          console.error("Invite accept failed:", inviteErr)
          toast.warning(inviteErr.response?.data?.message || "Account created but could not accept invitation")
        }
      }

      toast.success("Account created!", { description: "You have successfully signed up." })
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Signup error:", err)
      let message = err.response?.data?.message || "Something went wrong. Please try again."
      if (err.message && !err.response) {
        message += ` (Network Error: ${err.message})`
      } else if (err.response) {
        message += ` (Status: ${err.response.status})`
        if (err.response.data?.errors) {
          message += ": " + err.response.data.errors.map((e: any) => e.message).join(", ")
        }
      }
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" description={inviteToken ? "Sign up to join the project you've been invited to." : "Start your 14-day free trial. No credit card required."}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invite banner */}
        {inviteToken && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary text-sm">
            <Users className="h-4 w-4 shrink-0" />
            <span>You've been invited to a project. Create an account to join.</span>
          </div>
        )}

        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input name="firstName" id="firstName" placeholder="John" required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input name="lastName" id="lastName" placeholder="Doe" required className="h-11" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            name="email"
            id="email"
            type="email"
            placeholder="name@company.com"
            required
            className="h-11"
            defaultValue={inviteEmail}
            readOnly={!!inviteEmail}
          />
          {inviteEmail && (
            <p className="text-xs text-muted-foreground">This email was pre-filled from the invitation</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              name="password"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              required
              className="h-11 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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

        <div className="flex items-start gap-2">
          <Checkbox id="terms" required className="mt-1" />
          <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
            I agree to the{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        <Button type="submit" className="w-full h-11 btn-3d" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {inviteToken ? "Create Account & Join Project" : "Create Account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={inviteToken ? `/login?invite=${inviteToken}` : "/login"}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  )
}
