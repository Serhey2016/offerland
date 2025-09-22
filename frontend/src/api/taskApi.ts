import api from './client'

// Типи для Task API
export interface Task {
  id: number
  title: string
  description?: string
  category: string
  subcategory?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
  due_date?: string
  created_at: string
  updated_at: string
  assigned_to?: string
  tags?: string[]
}

export interface CreateTaskData {
  title: string
  description?: string
  category: string
  subcategory?: string
  priority: 'low' | 'medium' | 'high'
  status?: 'pending' | 'in-progress' | 'completed'
  due_date?: string
  assigned_to?: string
  tags?: string[]
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: number
}

export interface TaskFilters {
  category?: string
  subcategory?: string
  status?: string
  priority?: string
  assigned_to?: string
  search?: string
}

// Task API функції
export const taskApi = {
  // Отримати всі задачі
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks/', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  },

  // Отримати задачу за ID
  getTask: async (id: number): Promise<Task> => {
    try {
      const response = await api.get(`/tasks/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error)
      throw error
    }
  },

  // Створити нову задачу
  createTask: async (taskData: CreateTaskData): Promise<Task> => {
    try {
      const response = await api.post('/tasks/', taskData)
      return response.data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  // Оновити задачу
  updateTask: async (taskData: UpdateTaskData): Promise<Task> => {
    try {
      const { id, ...updateData } = taskData
      const response = await api.put(`/tasks/${id}/`, updateData)
      return response.data
    } catch (error) {
      console.error(`Error updating task ${taskData.id}:`, error)
      throw error
    }
  },

  // Видалити задачу
  deleteTask: async (id: number): Promise<void> => {
    try {
      await api.delete(`/tasks/${id}/`)
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error)
      throw error
    }
  },

  // Оновити статус задачі
  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    try {
      const response = await api.patch(`/tasks/${id}/`, { status })
      return response.data
    } catch (error) {
      console.error(`Error updating task ${id} status:`, error)
      throw error
    }
  },

  // Отримати задачі по категорії
  getTasksByCategory: async (category: string): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks/', { params: { category } })
      return response.data
    } catch (error) {
      console.error(`Error fetching tasks for category ${category}:`, error)
      throw error
    }
  },

  // Отримати статистику задач
  getTaskStats: async (): Promise<{
    total: number
    pending: number
    in_progress: number
    completed: number
    by_category: Record<string, number>
    by_priority: Record<string, number>
  }> => {
    try {
      const response = await api.get('/tasks/stats/')
      return response.data
    } catch (error) {
      console.error('Error fetching task stats:', error)
      throw error
    }
  }
}

export default taskApi
