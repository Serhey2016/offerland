import { useState, useEffect, useCallback } from 'react'
import { taskApi, Task, TaskFilters, CreateTaskData } from '../api/taskApi'

// Кастомний хук для роботи з задачами
export const useTasks = (initialFilters?: TaskFilters) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {})

  // Завантаження задач
  const loadTasks = useCallback(async (newFilters?: TaskFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentFilters = newFilters || filters
      const tasksData = await taskApi.getTasks(currentFilters)
      setTasks(tasksData)
    } catch (err) {
      setError('Помилка завантаження задач')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Завантаження задач при зміні фільтрів
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Створення нової задачі
  const createTask = useCallback(async (taskData: CreateTaskData) => {
    try {
      setLoading(true)
      setError(null)
      
      const newTask = await taskApi.createTask(taskData)
      setTasks(prev => [...prev, newTask])
      return newTask
    } catch (err) {
      setError('Помилка створення задачі')
      console.error('Error creating task:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Оновлення задачі
  const updateTask = useCallback(async (taskId: number, updateData: Partial<CreateTaskData>) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedTask = await taskApi.updateTask({ id: taskId, ...updateData })
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
      return updatedTask
    } catch (err) {
      setError('Помилка оновлення задачі')
      console.error('Error updating task:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Видалення задачі
  const deleteTask = useCallback(async (taskId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      await taskApi.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err) {
      setError('Помилка видалення задачі')
      console.error('Error deleting task:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Оновлення статусу задачі
  const updateTaskStatus = useCallback(async (taskId: number, status: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedTask = await taskApi.updateTaskStatus(taskId, status)
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
      return updatedTask
    } catch (err) {
      setError('Помилка оновлення статусу')
      console.error('Error updating task status:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Застосування фільтрів
  const applyFilters = useCallback((newFilters: TaskFilters) => {
    setFilters(newFilters)
    loadTasks(newFilters)
  }, [loadTasks])

  // Очищення помилки
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Оновлення задач
  const refreshTasks = useCallback(() => {
    loadTasks()
  }, [loadTasks])

  return {
    // Дані
    tasks,
    loading,
    error,
    filters,
    
    // Дії
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    applyFilters,
    refreshTasks,
    clearError,
    
    // Утиліти
    setTasks
  }
}

export default useTasks
