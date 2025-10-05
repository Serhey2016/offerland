import React, { useState, useEffect } from 'react'
import { taskApi, Task, TaskFilters } from '../api/taskApi'
import { categoryApi, Category, Subcategory } from '../api/categoryApi'
import { useToasts } from '../hooks/useToasts'
import Toasts from './ui/Toasts'

// Приклад інтеграції TaskTracker з Django API
const TaskTrackerWithAPI: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use toasts hook
  const { toast, showError, showSuccess } = useToasts()

  // Завантаження категорій при ініціалізації
  useEffect(() => {
    loadCategories()
  }, [])

  // Завантаження задач при зміні категорії
  useEffect(() => {
    if (selectedCategory) {
      loadTasks({ category: selectedCategory })
    } else {
      loadTasks()
    }
  }, [selectedCategory])

  // Завантаження категорій
  const loadCategories = async () => {
    try {
      setLoading(true)
      const categoriesData = await categoryApi.getCategories()
      setCategories(categoriesData)
    } catch (err) {
      setError('Помилка завантаження категорій')
      console.error('Error loading categories:', err)
    } finally {
      setLoading(false)
    }
  }

  // Завантаження задач
  const loadTasks = async (filters?: TaskFilters) => {
    try {
      setLoading(true)
      const tasksData = await taskApi.getTasks(filters)
      setTasks(tasksData)
    } catch (err) {
      setError('Помилка завантаження задач')
      showError('Error loading tasks')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Створення нової задачі
  const handleCreateTask = async (taskData: {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
  }) => {
    try {
      setLoading(true)
      const newTask = await taskApi.createTask({
        ...taskData,
        category: selectedCategory || 'general',
        status: 'pending'
      })
      setTasks(prev => [...prev, newTask])
    } catch (err) {
      setError('Помилка створення задачі')
      showError('Error creating task')
      console.error('Error creating task:', err)
    } finally {
      setLoading(false)
    }
  }

  // Оновлення статусу задачі
  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    try {
      setLoading(true)
      const updatedTask = await taskApi.updateTaskStatus(taskId, status)
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
    } catch (err) {
      setError('Помилка оновлення задачі')
      console.error('Error updating task:', err)
    } finally {
      setLoading(false)
    }
  }

  // Видалення задачі
  const handleDeleteTask = async (taskId: number) => {
    try {
      setLoading(true)
      await taskApi.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err) {
      setError('Помилка видалення задачі')
      console.error('Error deleting task:', err)
    } finally {
      setLoading(false)
    }
  }

  // Фільтрація задач
  const handleFilterTasks = async (filters: TaskFilters) => {
    await loadTasks(filters)
  }

  if (loading) {
    return (
      <div>
        <Toasts toastRef={toast} />
        <div>Завантаження...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Toasts toastRef={toast} />
        <div>Помилка: {error}</div>
      </div>
    )
  }

  return (
    <div className="task-tracker-with-api">
      <Toasts toastRef={toast} />
      <h2>Task Tracker з Django API</h2>
      
      {/* Категорії */}
      <div className="categories">
        <h3>Категорії:</h3>
        <div className="category-list">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.slug ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Задачі */}
      <div className="tasks">
        <h3>Задачі ({tasks.length}):</h3>
        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className="task-item">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <div className="task-meta">
                <span className={`priority priority-${task.priority}`}>
                  {task.priority}
                </span>
                <span className={`status status-${task.status}`}>
                  {task.status}
                </span>
              </div>
              <div className="task-actions">
                <button
                  onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                  disabled={task.status === 'in-progress'}
                >
                  В роботу
                </button>
                <button
                  onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                  disabled={task.status === 'completed'}
                >
                  Завершити
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="delete-btn"
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TaskTrackerWithAPI
