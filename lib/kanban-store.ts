import { create } from "zustand"

export interface Task {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  assignee?: {
    name: string
    avatar?: string
    initials: string
  }
  dueDate?: string
  labels?: string[]
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
}

interface KanbanStore {
  columns: Column[]
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => void
  addTask: (columnId: string, task: Task) => void
  updateTask: (columnId: string, taskId: string, updates: Partial<Task>) => void
  deleteTask: (columnId: string, taskId: string) => void
}

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      {
        id: "task-1",
        title: "Research competitor products",
        description: "Analyze top 5 competitors and document key features",
        priority: "high",
        assignee: { name: "Sarah Chen", avatar: "/woman-1.jpg", initials: "SC" },
        dueDate: "Dec 22",
        labels: ["Research"],
      },
      {
        id: "task-2",
        title: "Write API documentation",
        priority: "medium",
        assignee: { name: "Alex Rivera", avatar: "/man-1.jpg", initials: "AR" },
        dueDate: "Dec 25",
      },
      {
        id: "task-3",
        title: "Set up CI/CD pipeline",
        priority: "low",
        labels: ["DevOps"],
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      {
        id: "task-4",
        title: "Design dashboard mockups",
        description: "Create high-fidelity mockups for the new dashboard",
        priority: "high",
        assignee: { name: "Jordan Lee", avatar: "/man-2.jpg", initials: "JL" },
        dueDate: "Dec 20",
        labels: ["Design", "UI"],
      },
      {
        id: "task-5",
        title: "Implement user authentication",
        priority: "high",
        assignee: { name: "Emma Wilson", avatar: "/woman-2.jpg", initials: "EW" },
        labels: ["Backend"],
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    tasks: [
      {
        id: "task-6",
        title: "Code review for payment module",
        priority: "medium",
        assignee: { name: "Michael Brown", avatar: "/man-3.jpg", initials: "MB" },
        dueDate: "Dec 19",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      {
        id: "task-7",
        title: "Set up project repository",
        priority: "low",
        assignee: { name: "Sarah Chen", avatar: "/woman-1.jpg", initials: "SC" },
        labels: ["DevOps"],
      },
      {
        id: "task-8",
        title: "Create design system",
        priority: "high",
        assignee: { name: "Jordan Lee", avatar: "/man-2.jpg", initials: "JL" },
        labels: ["Design"],
      },
    ],
  },
]

export const useKanbanStore = create<KanbanStore>((set) => ({
  columns: initialColumns,
  moveTask: (taskId, sourceColumnId, targetColumnId, targetIndex) =>
    set((state) => {
      const newColumns = [...state.columns]
      const sourceColumn = newColumns.find((col) => col.id === sourceColumnId)
      const targetColumn = newColumns.find((col) => col.id === targetColumnId)

      if (!sourceColumn || !targetColumn) return state

      const taskIndex = sourceColumn.tasks.findIndex((t) => t.id === taskId)
      if (taskIndex === -1) return state

      const [task] = sourceColumn.tasks.splice(taskIndex, 1)
      targetColumn.tasks.splice(targetIndex, 0, task)

      return { columns: newColumns }
    }),
  addTask: (columnId, task) =>
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, tasks: [...col.tasks, task] }
        }
        return col
      })
      return { columns: newColumns }
    }),
  updateTask: (columnId, taskId, updates) =>
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: col.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
          }
        }
        return col
      })
      return { columns: newColumns }
    }),
  deleteTask: (columnId, taskId) =>
    set((state) => {
      const newColumns = state.columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) }
        }
        return col
      })
      return { columns: newColumns }
    }),
}))
