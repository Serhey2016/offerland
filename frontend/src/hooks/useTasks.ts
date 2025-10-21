import React, { useState, useEffect, useCallback, useRef } from 'react'
import { taskApi, Task, TaskFilters, CreateTaskData } from '../api/taskApi'
import { useToasts } from './useToasts'

// Кастомний хук для роботи з задачами
export const useTasks = (initialFilters?: TaskFilters) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {})
  
  // Use toasts hook
  const { toast, showError, showSuccess } = useToasts()

  // UI states for task actions (moved from TaskDesign) - using slug as identifier
  const [openDropdownTaskId, setOpenDropdownTaskId] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [showSubmenu, setShowSubmenu] = useState(false)
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 })
  const [tappedTaskId, setTappedTaskId] = useState<string | null>(null)
  const [detailsPopupTaskId, setDetailsPopupTaskId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)

  // UI state for task creation block visibility
  const [showTaskCreation, setShowTaskCreation] = useState(false)
  const [taskCreationType, setTaskCreationType] = useState<string>('Task')
  const [taskCreationIcon, setTaskCreationIcon] = useState<string>('pi pi-check-circle')
  const [taskCreationItemType, setTaskCreationItemType] = useState<string>('note')

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
      showError('Error loading tasks')
      console.error('Error loading tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, showError])

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
      showError('Error creating task')
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
  const updateTaskStatus = useCallback(async (taskSlug: string, status: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedTask = await taskApi.updateTaskStatus(taskSlug, status)
      setTasks(prev => prev.map(task => 
        task.slug === taskSlug ? updatedTask : task
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

  // Close dropdown when clicking outside (moved from TaskDesign)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Check if click is outside dropdown
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target)
      // Check if click is outside submenu (or submenu doesn't exist)
      const isOutsideSubmenu = !submenuRef.current || !submenuRef.current.contains(target)
      
      // Close dropdown if click is outside both dropdown and submenu
      if (isOutsideDropdown && isOutsideSubmenu) {
        setOpenDropdownTaskId(null)
        setShowSubmenu(false)
      }
    }

    if (openDropdownTaskId !== null || showSubmenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdownTaskId, showSubmenu])

  // Handle dropdown positioning based on available screen space (moved from TaskDesign)
  const calculateDropdownPosition = useCallback((buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const dropdownWidth = 160
    const dropdownHeight = 200
    
    // Position dropdown to the right of the button
    let top = rect.bottom + 5
    let left = rect.right - dropdownWidth // Align right edge with button
    
    // If dropdown goes off the right edge, position it to the left of button
    if (left + dropdownWidth > viewportWidth - 10) {
      left = rect.left - dropdownWidth
    }
    
    // If dropdown goes off the left edge, position it below button centered
    if (left < 10) {
      left = rect.left + (rect.width / 2) - (dropdownWidth / 2)
      // Ensure it doesn't go off right edge
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10
      }
    }
    
    // Check if dropdown would go off the bottom edge
    if (top + dropdownHeight > viewportHeight - 10) {
      top = rect.top - dropdownHeight - 5
    }
    
    // Ensure dropdown doesn't go off the top edge
    if (top < 10) {
      top = 10
    }
    
    return { top, left }
  }, [])

  // Handle submenu positioning (moved from TaskDesign)
  const calculateSubmenuPosition = useCallback((parentElement: HTMLElement) => {
    const rect = parentElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const submenuWidth = 160
    const estimatedSubmenuHeight = 300 // Approximate height with all items
    const isMobile = viewportWidth <= 768
    
    // Position submenu to the right of parent item by default
    let top = rect.top
    let left = rect.right + 5
    
    // Mobile-specific positioning
    if (isMobile) {
      // On mobile, try to keep it within viewport
      // If there's not enough space on the right, show on the left
      if (left + submenuWidth > viewportWidth - 10) {
        left = rect.left - submenuWidth - 5
      }
      
      // If still not enough space on the left, center it with padding
      if (left < 10) {
        left = 10
      }
      
      // Ensure it doesn't extend beyond viewport width
      if (left + submenuWidth > viewportWidth - 10) {
        left = viewportWidth - submenuWidth - 10
      }
    } else {
      // Desktop positioning
      // If submenu goes off the right edge, position it to the left
      if (left + submenuWidth > viewportWidth - 10) {
        left = rect.left - submenuWidth - 5
      }
    }
    
    // Handle vertical positioning
    // Check if submenu would go off the bottom
    if (top + estimatedSubmenuHeight > viewportHeight - 20) {
      // Try to position it higher, aligning bottom with viewport
      top = viewportHeight - estimatedSubmenuHeight - 20
    }
    
    // Ensure submenu doesn't go off the top edge
    if (top < 10) {
      top = 10
    }
    
    // Final safety check for left edge
    if (left < 10) {
      left = 10
    }
    
    return { top, left }
  }, [])

  // Handle submenu item clicks (moved from TaskDesign)
  const handleSubmenuItemClick = useCallback(async (category: string) => {
    if (!openDropdownTaskId) return
    
    try {
      // Call API to update element position
      await taskApi.updateElementPosition(openDropdownTaskId, category)
      
      // Close menus
      setShowSubmenu(false)
      setOpenDropdownTaskId(null)
      
      // Show success message
      showSuccess(`Moved to ${category} successfully`)
      
      // Trigger reload by dispatching custom event
      window.dispatchEvent(new CustomEvent('taskMoved', {
        detail: { slug: openDropdownTaskId, category }
      }))
    } catch (error) {
      console.error('Error moving element:', error)
      showError('Error moving item. Please try again.')
      setShowSubmenu(false)
      setOpenDropdownTaskId(null)
    }
  }, [openDropdownTaskId, showSuccess, showError])

  // Handle mobile tap for floating icons (moved from TaskDesign)
  const handleTaskTap = useCallback((taskSlug: string, e: React.MouseEvent) => {
    // Only handle tap on mobile devices
    if (window.innerWidth <= 768) {
      e.preventDefault()
      setTappedTaskId(prevId => prevId === taskSlug ? null : taskSlug)
    }
  }, [])

  // Handle dropdown menu item clicks (moved from TaskDesign)
  const handleDropdownItemClick = useCallback((action: string, taskSlug?: string, event?: React.MouseEvent<HTMLDivElement>) => {
    if (action === 'move' && event) {
      // Show submenu for Move to...
      const position = calculateSubmenuPosition(event.currentTarget)
      setSubmenuPosition(position)
      setShowSubmenu(true)
      return
    }
    
    setOpenDropdownTaskId(null)
    
    switch (action) {
      case 'start':
        break
      case 'edit':
        break
      case 'details':
        if (taskSlug) {
          setDetailsPopupTaskId(taskSlug)
        }
        break
      case 'delegate':
        break
      case 'publish':
        break
      default:
        break
    }
  }, [calculateSubmenuPosition])
  
  // Handle closing details popup
  const closeDetailsPopup = useCallback(() => {
    setDetailsPopupTaskId(null)
  }, [])

  // Handle icon button clicks (moved from TaskDesign)
  const handleIconClick = useCallback((taskSlug: string, action: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (action === 'more' && event) {
      const position = calculateDropdownPosition(event.currentTarget)
      setDropdownPosition(position)
      setOpenDropdownTaskId(prevId => prevId === taskSlug ? null : taskSlug)
      return
    }
    
    switch (action) {
      case 'create':
        break
      case 'subtask':
        break
      case 'note':
        break
      default:
        break
    }
  }, [calculateDropdownPosition])

  // Handle task creation toggle (for Add Note button in SpeedDial)
  const toggleTaskCreation = useCallback((type: string = 'Task', icon: string = 'pi pi-check-circle', itemType: string = 'note') => {
    setShowTaskCreation(prev => {
      // If already showing with the same type, hide it
      if (prev && taskCreationType === type) {
        return false
      }
      // If not showing or showing different type, show it with new type and icon
      setTaskCreationType(type)
      setTaskCreationIcon(icon)
      setTaskCreationItemType(itemType)
      return true
    })
  }, [taskCreationType])

  // Show task creation block
  const showTaskCreationBlock = useCallback((type: string = 'Task', icon: string = 'pi pi-check-circle') => {
    setTaskCreationType(type)
    setTaskCreationIcon(icon)
    setShowTaskCreation(true)
  }, [])

  // Hide task creation block
  const hideTaskCreationBlock = useCallback(() => {
    setShowTaskCreation(false)
  }, [])

  return {
    // Дані
    tasks,
    loading,
    error,
    filters,
    toast,
    
    // UI states (moved from TaskDesign)
    openDropdownTaskId,
    dropdownPosition,
    showSubmenu,
    submenuPosition,
    tappedTaskId,
    detailsPopupTaskId,
    dropdownRef,
    submenuRef,
    showTaskCreation,
    taskCreationType,
    taskCreationIcon,
    taskCreationItemType,
    
    // Дії
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    applyFilters,
    refreshTasks,
    clearError,
    
    // UI handlers (moved from TaskDesign)
    handleTaskTap,
    handleIconClick,
    handleDropdownItemClick,
    handleSubmenuItemClick,
    closeDetailsPopup,
    toggleTaskCreation,
    showTaskCreationBlock,
    hideTaskCreationBlock,
    
    // Утиліти
    setTasks
  }
}

export default useTasks
