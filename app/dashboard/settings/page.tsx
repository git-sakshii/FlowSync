"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { Camera, Monitor, Moon, Sun, Bell, Shield, Palette, Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, updateUser, checkAuth } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Notifications State
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskAssigned: true, // Backend logic for these specific toggles might not exist yet besides 'emailNotif' and 'pushNotif'
    taskCompleted: true,
    mentions: true,
    deadlines: true,
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      })
      // Fetch current preferences if available
      const fetchPreferences = async () => {
        try {
          // We can use the user object directly if it has these fields, or fetch specifically
          // The auth store user object has "emailNotif", "pushNotif", "theme"
          // Typescript check on user object might reveal if these properties exist on the interface
          // Looking at auth-store, User interface has: id, email, firstName, lastName, avatar, role.
          // It does NOT have theme/preferences. We should fetch fresh profile data or update store.
          const { data } = await api.get("/users/me")
          setNotifications(prev => ({
            ...prev,
            email: data.emailNotif,
            push: data.pushNotif
          }))
          // Optional: sync theme from backend if different from local storage?
          // Usually theme is local preference, but let's stick to simple
        } catch (e) {
          console.error("Failed to fetch preferences", e)
        }
      }
      fetchPreferences()
    }
  }, [user])

  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.put("/users/me", {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        // email: profileData.email // user might verify email, let's keep it safe and update name first
      })
      updateUser(data)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    try {
      setIsLoading(true)
      await api.put("/users/me/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success("Password updated successfully")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    try {
      setIsLoading(true)
      await api.put("/users/me/preferences", {
        emailNotif: notifications.email,
        pushNotif: notifications.push,
        theme: theme as any
      })
      toast.success("Preferences saved")
    } catch (error) {
      toast.error("Failed to save preferences")
    } finally {
      setIsLoading(false)
    }
  }

  // TODO: Avatar upload handler

  if (!user) return <div className="p-8">Loading settings...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
                    <AvatarFallback className="text-2xl">{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                    onClick={() => toast.info("Avatar upload coming soon!")}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold">Profile Photo</h3>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              </div>

              {/* Form */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="btn-3d" onClick={handleProfileUpdate} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme
              </CardTitle>
              <CardDescription>Select your preferred theme for the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <div className="h-12 w-12 rounded-full bg-background border flex items-center justify-center shadow-sm">
                    <Sun className="h-6 w-6" />
                  </div>
                  <span className="font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <Moon className="h-6 w-6 text-slate-100" />
                  </div>
                  <span className="font-medium">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-background to-slate-900 border flex items-center justify-center">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <span className="font-medium">System</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications((n) => ({ ...n, push: checked }))}
                  />
                </div>
              </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-muted-foreground">Notify me about</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Task Assignments</p>
                      <p className="text-sm text-muted-foreground">When a task is assigned to you</p>
                    </div>
                    <Switch
                      checked={notifications.taskAssigned}
                      onCheckedChange={(checked) => setNotifications((n) => ({ ...n, taskAssigned: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Task Completions</p>
                      <p className="text-sm text-muted-foreground">When a task you created is completed</p>
                    </div>
                    <Switch
                      checked={notifications.taskCompleted}
                      onCheckedChange={(checked) => setNotifications((n) => ({ ...n, taskCompleted: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mentions</p>
                      <p className="text-sm text-muted-foreground">When someone mentions you in a comment</p>
                    </div>
                    <Switch
                      checked={notifications.mentions}
                      onCheckedChange={(checked) => setNotifications((n) => ({ ...n, mentions: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Deadline Reminders</p>
                      <p className="text-sm text-muted-foreground">When a task deadline is approaching</p>
                    </div>
                    <Switch
                      checked={notifications.deadlines}
                      onCheckedChange={(checked) => setNotifications((n) => ({ ...n, deadlines: checked }))}
                    />
                  </div>
                </div>

              <div className="flex justify-end">
                <Button className="btn-3d" onClick={handlePreferencesUpdate} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex justify-end">
                <Button className="btn-3d" onClick={handlePasswordUpdate} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone omitted for now */}

        </TabsContent>
      </Tabs>
    </div>
  )
}
