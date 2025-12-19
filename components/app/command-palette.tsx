"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Kanban,
  Activity,
  BarChart3,
  Users,
  Settings,
  Plus,
  Search,
} from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Kanban Board", href: "/dashboard/kanban", icon: Kanban },
  { name: "Activity Log", href: "/dashboard/activity", icon: Activity },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const quickActions = [
  { name: "Create New Project", action: "create-project", icon: Plus },
  { name: "Create New Task", action: "create-task", icon: Plus },
  { name: "Search Tasks", action: "search-tasks", icon: Search },
]

const recentProjects = [
  { name: "Marketing Website Redesign", href: "/dashboard/projects/1" },
  { name: "Mobile App Development", href: "/dashboard/projects/2" },
  { name: "Q4 Analytics Dashboard", href: "/dashboard/projects/3" },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const runCommand = (command: () => void) => {
    onOpenChange(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem key={action.action} onSelect={() => runCommand(() => console.log(action.action))}>
              <action.icon className="mr-2 h-4 w-4" />
              <span>{action.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {navigation.map((item) => (
            <CommandItem key={item.href} onSelect={() => runCommand(() => router.push(item.href))}>
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent Projects">
          {recentProjects.map((project) => (
            <CommandItem key={project.href} onSelect={() => runCommand(() => router.push(project.href))}>
              <FolderKanban className="mr-2 h-4 w-4" />
              <span>{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
