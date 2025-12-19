"use client"

import * as React from "react"
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
  CommandShortcut,
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
  ListTodo,
  CheckCircle,
  User,
} from "lucide-react"

import { api } from "@/lib/api-client"
// import { useDebounce } from "@/hooks/use-debounce" // Assuming this hook exists or I'll implement simpler debounce

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
  { name: "Settings", href: "/dashboard/settings", icon: Settings }, // Added from existing code
]

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<{
    projects: any[]
    tasks: any[]
    users: any[]
  }>({ projects: [], tasks: [], users: [] })
  const [loading, setLoading] = React.useState(false)

  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setResults({ projects: [], tasks: [], users: [] })
    }
  }, [open])

  React.useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults({ projects: [], tasks: [], users: [] })
        return
      }

      setLoading(true)
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`)
        setResults(data)
      } catch (error) {
        console.error("Search failed", error)
      } finally {
        setLoading(false)
      }
    }

    // Simple debounce
    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [query])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64 border border-input px-4 py-2 text-left"
      >
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation Group */}
          {query === "" && (
            <CommandGroup heading="Suggestions">
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/projects"))}>
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Projects</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/kanban"))}>
                <ListTodo className="mr-2 h-4 w-4" />
                <span>Kanban Board</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          )}

          {/* Search Results */}
          {results.projects?.length > 0 && (
            <CommandGroup heading="Projects">
              {results.projects.map((project: any) => (
                <CommandItem key={project.id} onSelect={() => runCommand(() => router.push(`/dashboard/projects/${project.id}`))}>
                  <FolderKanban className="mr-2 h-4 w-4" />
                  <span>{project.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.tasks?.length > 0 && (
            <CommandGroup heading="Tasks">
              {results.tasks.map((task: any) => (
                <CommandItem key={task.id} onSelect={() => runCommand(() => router.push(`/dashboard/kanban?task=${task.id}`))}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>{task.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.users?.length > 0 && (
            <CommandGroup heading="People">
              {results.users.map((user: any) => (
                <CommandItem key={user.id} onSelect={() => runCommand(() => { })}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.firstName} {user.lastName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
