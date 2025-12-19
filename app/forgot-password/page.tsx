"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    // Simulate password reset
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <AuthLayout title="Check your email" description="We've sent password reset instructions to your email">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>
          <p className="text-muted-foreground">
            We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
          </p>
          <Button variant="outline" asChild className="w-full h-11 bg-transparent">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Didn't receive the email?{" "}
            <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline font-medium">
              Click to resend
            </button>
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your password" description="Enter your email and we'll send you instructions">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            required
            className="h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full h-11 btn-3d" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
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
