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
  slug: string  // PRIMARY IDENTIFIER
  title: string
  description?: string
  date_start?: string
  date_end?: string
  time_start?: string
  time_end?: string
  priority?: 'iu' | 'inu' | 'niu' | 'ninu'
  status?: string  // element_position.name from backend
  element_position?: string  // Same as status, kept for clarity
  task_mode: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  note?: string
  hashtags?: Array<{
    id: number
    tag_name: string
  }>
  type_of_view?: 'task' | 'project' | 'tender' | 'advertising' | 'orders' | 'job_search' | 'timeslot' | 'timeslot_public'
  // TimeSlot-specific fields
  reserved_time_on_road?: number
  start_location?: string
  cost_of_1_hour_of_work?: number
  minimum_time_slot?: string
  user_name?: string
  company_name?: string
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
  updateTaskStatus: async (slug: string, status: string): Promise<Task> => {
    try {
      const response = await api.patch(`/services_and_projects/tasks/${slug}/`, { status })
      return response.data
    } catch (error) {
      console.error(`Error updating task ${slug} status:`, error)
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

  // Get all inbox items (Tasks, TimeSlots, Advertising) grouped by type_of_view
  getInboxItems: async (category: string): Promise<DjangoTask[]> => {
    try {
      const response = await api.get('/services_and_projects/user_inbox_items/', { 
        params: { category: category.toLowerCase() } 
      })
      return response.data
    } catch (error) {
      console.error('Error fetching inbox items:', error)
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
      
      // Type of view - use "task" string value (not ID)
      formData.append('type_of_view', 'task')
      
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
      
      // Type of view - use "task" string value (not ID)
      formData.append('type_of_view', 'task')
      
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
  saveTaskNotes: async (taskSlug: string, notes: string): Promise<any> => {
    try {
      const formData = new FormData()
      formData.append('notes', notes)
      
      const response = await api.post(`/services_and_projects/save_task_notes/${taskSlug}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error(`Error saving task notes for task ${taskSlug}:`, error)
      throw error
    }
  },

  // Створити Job Search
  createJobSearch: async (formData: FormData): Promise<any> => {
    try {
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

  // Оновити Job Search
  updateJobSearch: async (jobSearchId: number, jobSearchData: { title: string }): Promise<any> => {
    try {
      const formData = new FormData()
      formData.append('title', jobSearchData.title)
      formData.append('edit_item_id', jobSearchId.toString())
      formData.append('type_of_view', 'job_search')
      
      const response = await api.post('/services_and_projects/update_form/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error(`Error updating job search ${jobSearchId}:`, error)
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
      
      // Type of view - use 'project' type
      formData.append('type_of_view', 'project')
      
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
      
      // Type of view - use 'advertising' type
      formData.append('type_of_view', 'advertising')
      
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
      
      // Type of view - use 'advertising' type
      formData.append('type_of_view', 'advertising')
      
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
      
      // Type of view for time slot - must be 'task' (from model choices)
      formData.append('type_of_view', 'task')
      
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
  },

  // Оновити Time Slot
  updateTimeSlot: async (timeSlotId: number, timeSlotData: any): Promise<any> => {
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
      
      // Edit item ID for update
      formData.append('edit_item_id', timeSlotId.toString())
      
      // Type of view for time slot
      formData.append('type_of_view', 'timeslot')
      
      const response = await api.post('/services_and_projects/update_form/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
      
      return response.data
    } catch (error) {
      console.error(`Error updating time slot ${timeSlotId}:`, error)
      throw error
    }
  },

  // Create task with FormData (for new React dialogs)
  createTaskWithFormData: async (formData: FormData): Promise<any> => {
    try {
      const response = await api.post('/services_and_projects/create_task/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  // Update element position (universal for Tasks, TimeSlots, JobSearch)
  updateElementPosition: async (slug: string, position: string): Promise<any> => {
    try {
      const response = await api.patch(`/services_and_projects/elements/${slug}/position/`, { 
        position 
      })
      return response.data
    } catch (error) {
      console.error(`Error updating element ${slug} position:`, error)
      throw error
    }
  }
}

export default taskApi
