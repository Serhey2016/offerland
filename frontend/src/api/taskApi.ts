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

// Django Task Model Interface
export interface DjangoTask {
  id: number
  title: string
  description?: string
  date_start?: string
  date_end?: string
  time_start?: string
  time_end?: string
  priority?: 'iu' | 'inu' | 'niu' | 'ninu'
  status?: string
  task_mode: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  note?: string
  hashtags?: Array<{
    id: number
    tag_name: string
  }>
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

// Inbox Task Data Interface
export interface InboxTaskData {
  title: string
  date_start?: string  // format: YYYY-MM-DD or DD.MM.YYYY
  date_end?: string    // format: YYYY-MM-DD or DD.MM.YYYY
  priority?: 'iu' | 'inu' | 'niu' | 'ninu'  // Important & Urgent, etc.
  description?: string
  parent_id?: number  // Parent task ID for subtasks
}

// Task API функції
export const taskApi = {
  // Отримати всі задачі
  getTasks: async (filters?: TaskFilters): Promise<Task[]> => {
    try {
      const response = await api.get('/services_and_projects/user_tasks/', { params: filters })
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
      const response = await api.patch(`/services_and_projects/tasks/${id}/`, { status })
      return response.data
    } catch (error) {
      console.error(`Error updating task ${id} status:`, error)
      throw error
    }
  },

  // Отримати задачі по категорії
  getTasksByCategory: async (category: string): Promise<Task[]> => {
    try {
      const response = await api.get('/services_and_projects/user_tasks/', { params: { category } })
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
  },

  // Створити Inbox задачу
  createInboxTask: async (taskData: InboxTaskData): Promise<any> => {
    try {
      // Prepare FormData for Django form submission
      const formData = new FormData()
      formData.append('title', taskData.title)
      
      if (taskData.date_start) {
        formData.append('date_start', taskData.date_start)
      }
      
      if (taskData.date_end) {
        formData.append('date_end', taskData.date_end)
      }
      
      if (taskData.priority) {
        formData.append('priority', taskData.priority)
      }
      
      // Description is optional for inbox tasks, send empty string if not provided
      formData.append('description', taskData.description || '')
      
      // Parent task ID for subtasks
      if (taskData.parent_id) {
        formData.append('parent_id', taskData.parent_id.toString())
      }
      
      // Type of task - use "task" string value (not ID)
      formData.append('type_of_task', 'task')
      
      const response = await api.post('/services_and_projects/create_task/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating inbox task:', error)
      throw error
    }
  },

  // Отримати задачі авторизованого користувача
  getUserTasks: async (): Promise<DjangoTask[]> => {
    try {
      const response = await api.get('/services_and_projects/user_tasks/')
      return response.data
    } catch (error) {
      console.error('Error fetching user tasks:', error)
      throw error
    }
  },

  // Оновити Inbox задачу
  updateInboxTask: async (taskId: number, taskData: Partial<InboxTaskData>): Promise<any> => {
    try {
      // Prepare FormData for Django form submission
      const formData = new FormData()
      
      if (taskData.title) {
        formData.append('title', taskData.title)
      }
      
      if (taskData.date_start !== undefined) {
        formData.append('date_start', taskData.date_start)
      }
      
      if (taskData.date_end !== undefined) {
        formData.append('date_end', taskData.date_end)
      }
      
      if (taskData.priority !== undefined) {
        formData.append('priority', taskData.priority)
      }
      
      if (taskData.description !== undefined) {
        formData.append('description', taskData.description)
      }
      
      // Edit item ID
      formData.append('edit_item_id', taskId.toString())
      
      // Type of task - use "task" string value (not ID)
      formData.append('type_of_task', 'task')
      
      const response = await api.post('/services_and_projects/update_form/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error(`Error updating inbox task ${taskId}:`, error)
      throw error
    }
  },

  // Зберегти нотатки задачі
  saveTaskNotes: async (taskId: number, notes: string): Promise<any> => {
    try {
      const formData = new FormData()
      formData.append('notes', notes)
      
      const response = await api.post(`/services_and_projects/save_task_notes/${taskId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error(`Error saving task notes for task ${taskId}:`, error)
      throw error
    }
  },

  // Створити Job Search
  createJobSearch: async (title: string, startDate?: string, notes?: string): Promise<any> => {
    try {
      const formData = new FormData()
      formData.append('title', title)
      
      if (startDate) {
        formData.append('start_date', startDate)
      }
      
      if (notes) {
        formData.append('notes', notes)
      }
      
      const response = await api.post('/services_and_projects/create_job_search/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating job search:', error)
      throw error
    }
  },

  // Створити Project (Task with type_of_task='project')
  createProject: async (taskData: InboxTaskData): Promise<any> => {
    try {
      // Prepare FormData for Django form submission
      const formData = new FormData()
      formData.append('title', taskData.title)
      
      if (taskData.date_start) {
        formData.append('date_start', taskData.date_start)
      }
      
      if (taskData.date_end) {
        formData.append('date_end', taskData.date_end)
      }
      
      if (taskData.priority) {
        formData.append('priority', taskData.priority)
      }
      
      // Description is optional
      formData.append('description', taskData.description || '')
      
      // Parent task ID for subtasks
      if (taskData.parent_id) {
        formData.append('parent_id', taskData.parent_id.toString())
      }
      
      // Type of task - use 'project' type
      formData.append('type_of_task', 'project')
      
      const response = await api.post('/services_and_projects/create_task/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  },

  // Створити Advertising/Announcement (from InputContainer)
  createAdvertising: async (taskData: InboxTaskData): Promise<any> => {
    try {
      // Prepare FormData for Django form submission
      const formData = new FormData()
      formData.append('title', taskData.title)
      
      // Description is optional for advertising
      formData.append('description', taskData.description || '')
      
      if (taskData.date_start) {
        formData.append('date_start', taskData.date_start)
      }
      
      if (taskData.date_end) {
        formData.append('date_end', taskData.date_end)
      }
      
      if (taskData.priority) {
        formData.append('priority', taskData.priority)
      }
      
      // Parent task ID for subtasks
      if (taskData.parent_id) {
        formData.append('parent_id', taskData.parent_id.toString())
      }
      
      // Type of task - use 'advertising' type
      formData.append('type_of_task', 'advertising')
      
      const response = await api.post('/services_and_projects/create_advertising/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating advertising:', error)
      throw error
    }
  },

  // Створити Advertising/Announcement (from form dialog)
  createAdvertisingForm: async (advertisingData: { title: string, description: string, photos?: File[] }): Promise<any> => {
    try {
      // Prepare FormData for Django form submission
      const formData = new FormData()
      formData.append('title', advertisingData.title)
      formData.append('description', advertisingData.description)
      
      // Add photos if provided
      if (advertisingData.photos && advertisingData.photos.length > 0) {
        advertisingData.photos.forEach((photo) => {
          formData.append('photos', photo)
        })
      }
      
      // Type of task - use 'advertising' type
      formData.append('type_of_task', 'advertising')
      
      const response = await api.post('/services_and_projects/create_advertising/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating advertising from form:', error)
      throw error
    }
  },

  // Створити Time Slot
  createTimeSlot: async (timeSlotData: any): Promise<any> => {
    try {
      // Prepare FormData for Django form submission
      const formData = new FormData()
      
      if (timeSlotData.category) {
        formData.append('category', timeSlotData.category.toString())
      }
      
      if (timeSlotData.service) {
        formData.append('services', timeSlotData.service.toString())
      }
      
      if (timeSlotData.date_start) {
        formData.append('date_start', timeSlotData.date_start)
      }
      
      if (timeSlotData.date_end) {
        formData.append('date_end', timeSlotData.date_end)
      }
      
      if (timeSlotData.time_start) {
        formData.append('time_start', timeSlotData.time_start)
      }
      
      if (timeSlotData.time_end) {
        formData.append('time_end', timeSlotData.time_end)
      }
      
      if (timeSlotData.reserved_time_on_road) {
        formData.append('reserved_time_on_road', timeSlotData.reserved_time_on_road.toString())
      }
      
      if (timeSlotData.start_location) {
        formData.append('start_location', timeSlotData.start_location)
      }
      
      if (timeSlotData.cost_of_1_hour_of_work) {
        formData.append('cost_of_1_hour_of_work', timeSlotData.cost_of_1_hour_of_work.toString())
      }
      
      if (timeSlotData.minimum_time_slot) {
        formData.append('minimum_time_slot', timeSlotData.minimum_time_slot)
      }
      
      if (timeSlotData.hashtags) {
        formData.append('hashtags', timeSlotData.hashtags)
      }
      
      // Type of task for time slot
      formData.append('type_of_task', 'time slot')
      
      const response = await api.post('/services_and_projects/create_time_slot/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error creating time slot:', error)
      throw error
    }
  }
}

export default taskApi
