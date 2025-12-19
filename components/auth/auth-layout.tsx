import type React from "react"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md mx-auto">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold">FlowSync</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>

          {children}
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/abstract-workflow-diagram-with-connected-nodes.jpg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <blockquote className="max-w-lg">
            <p className="text-2xl font-medium leading-relaxed">
              "FlowSync transformed how our team works. We shipped 40% faster in the first month."
            </p>
            <footer className="mt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-foreground/20" />
                <div>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-primary-foreground/80">Engineering Lead, TechCorp</div>
                </div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
