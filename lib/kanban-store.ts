import { create, StateCreator } from "zustand"
import { api } from "./api-client"
import { toast } from "sonner"

export interface Task {
  id: string
  title: string
  description?: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  assignee?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  dueDate?: string // ISO string
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
}

interface KanbanStore {
  columns: Column[]
  isLoading: boolean
  fetchTasks: (projectId?: string) => Promise<void>
  moveTask: (taskId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => Promise<void>
  addTask: (projectId: string | undefined, columnId: string, task: Partial<Task>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
}

// Helper to map DB status to Column ID
const mapStatusToColumn = (status: string) => status.toLowerCase().replace('_', '-')
const mapColumnToStatus = (colId: string) => colId.toUpperCase().replace('-', '_')

const createKanbanStore: StateCreator<KanbanStore> = (set, get) => ({
  columns: [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in-progress", title: "In Progress", tasks: [] },
    { id: "review", title: "Review", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ],
  isLoading: false,

  fetchTasks: async (projectId?: string) => {
    set({ isLoading: true })
    try {
      const endpoint = projectId ? `/projects/${projectId}/tasks` : `/tasks`
      const { data } = await api.get(endpoint)

      const columns = [
        { id: "todo", title: "To Do", tasks: [] as Task[] },
        { id: "in-progress", title: "In Progress", tasks: [] as Task[] },
        { id: "review", title: "Review", tasks: [] as Task[] },
        { id: "done", title: "Done", tasks: [] as Task[] },
      ]

      data.forEach((task: Task) => {
        const colId = mapStatusToColumn(task.status)
        const column = columns.find(c => c.id === colId)
        if (column) {
          column.tasks.push(task)
        }
      })

      set({ columns, isLoading: false })
    } catch (error) {
      console.error("Failed to fetch tasks", error)
      set({ isLoading: false })
      toast.error("Failed to load tasks")
    }
  },

  moveTask: async (taskId, sourceColumnId, targetColumnId, targetIndex) => {
    // Optimistic Update
    const oldColumns = [...get().columns]

    set((state) => {
      const newColumns = JSON.parse(JSON.stringify(state.columns))
      const sourceColumn = newColumns.find((col: Column) => col.id === sourceColumnId)
      const targetColumn = newColumns.find((col: Column) => col.id === targetColumnId)

      if (!sourceColumn || !targetColumn) return state

      const taskIndex = sourceColumn.tasks.findIndex((t: Task) => t.id === taskId)
      if (taskIndex === -1) return state

      const [task] = sourceColumn.tasks.splice(taskIndex, 1)
      task.status = mapColumnToStatus(targetColumnId) // Update internal status
      targetColumn.tasks.splice(targetIndex, 0, task)

      return { columns: newColumns }
    })

    try {
      await api.put(`/tasks/${taskId}/status`, {
        status: mapColumnToStatus(targetColumnId),
        order: targetIndex
      })
    } catch (error) {
      // Revert on error
      set({ columns: oldColumns })
      toast.error("Failed to move task")
    }
  },

  addTask: async (projectId, columnId, taskData) => {
    try {
      if (!projectId) {
        toast.error("Cannot create task without a project context")
        return
      }
      const status = mapColumnToStatus(columnId)
      const { data: newTask } = await api.post(`/projects/${projectId}/tasks`, {
        ...taskData,
        status
      })

      set((state) => {
        const newColumns = state.columns.map((col) => {
          if (col.id === columnId) {
            return { ...col, tasks: [...col.tasks, newTask] }
          }
          return col
        })
        return { columns: newColumns }
      })
      toast.success("Task created")
    } catch (error) {
      console.error(error)
      toast.error("Failed to create task")
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const { data: updatedTask } = await api.put(`/tasks/${taskId}`, updates)

      set((state) => {
        const newColumns = state.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) => t.id === taskId ? updatedTask : t)
        }))
        return { columns: newColumns }
      })
      toast.success("Task updated")
    } catch (error) {
      toast.error("Failed to update task")
    }
  },

  deleteTask: async (taskId) => {
    const oldColumns = get().columns
    set((state) => {
      const newColumns = state.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.id !== taskId)
      }))
      return { columns: newColumns }
    })

    try {
      await api.delete(`/tasks/${taskId}`)
      toast.success("Task deleted")
    } catch (error) {
      set({ columns: oldColumns })
      toast.error("Failed to delete task")
    }
  }
})

export const useKanbanStore = create<KanbanStore>(createKanbanStore)
