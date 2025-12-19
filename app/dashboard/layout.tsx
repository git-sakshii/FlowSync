"use client"

import type React from "react"

import { useState } from "react"
import { AppSidebar } from "@/components/app/app-sidebar"
import { AppHeader } from "@/components/app/app-header"
import { CommandPalette } from "@/components/app/command-palette"
import { NotificationsPanel } from "@/components/app/notifications-panel"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-64 transition-all duration-300">
        <AppHeader onOpenSearch={() => setSearchOpen(true)} onOpenNotifications={() => setNotificationsOpen(true)} />
        <main className="p-6">{children}</main>
      </div>
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationsPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </div>
  )
}
