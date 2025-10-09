import React, { useState, useEffect } from 'react'
// CSS moved to static/css/ directory - loaded via Django template
import { taskApi, InboxTaskData, DjangoTask } from '../../api/taskApi'
import Taskview from '../ui/Taskview'
import InputContainer from '../ui/InputContainer'
import { useInputContainer } from '../../hooks/useInputContainer'
import { useTasks } from '../../hooks/useTasks'
import { useToasts } from '../../hooks/useToasts'
import Toasts from '../ui/Toasts'

interface GenericViewProps {
  category: string
  subcategory?: string
  displayName?: string
}

const GenericView: React.FC<GenericViewProps> = ({ category, subcategory, displayName }) => {
  // States for category-specific logic
  const [userTasks, setUserTasks] = useState<DjangoTask[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [hasShownError, setHasShownError] = useState(false)

  // Handle task creation
  const handleCreateTask = async (taskData: InboxTaskData) => {
    await taskApi.createInboxTask(taskData)
    // Reload tasks after creation (but don't show error if reload fails)
    await loadUserTasks(false)
  }

  // Use toasts hook
  const { toast, showError, showSuccess } = useToasts()

  // Use input container hook
  const inputContainerProps = useInputContainer({
    onSubmit: handleCreateTask,
    onTaskCreated: () => loadUserTasks(),
    toastRef: toast
  })

  // Use tasks hook for UI logic
  const tasksHook = useTasks()

  // Load user tasks on component mount and when category changes
  useEffect(() => {
    loadUserTasks()
  }, [category])

  // Listen for SpeedDial button clicks from SubMenuSection
  useEffect(() => {
    const handleSpeedDialClick = (event: Event) => {
      const customEvent = event as CustomEvent
      const itemType = customEvent.detail?.itemType
      
      // Map item types to labels and icons
      const typeMap: Record<string, { label: string, icon: string }> = {
        'task': { label: 'Time slot', icon: 'pi pi-calendar-clock' },
        'project': { label: 'Announcement', icon: 'pi pi-megaphone' },
        'contact': { label: 'Project', icon: 'pi pi-briefcase' },
        'note': { label: 'Task', icon: 'pi pi-check-circle' }
      }
      
      if (itemType && typeMap[itemType]) {
        tasksHook.toggleTaskCreation(typeMap[itemType].label, typeMap[itemType].icon, itemType)
      }
    }

    window.addEventListener('subMenuAdd', handleSpeedDialClick)
    return () => {
      window.removeEventListener('subMenuAdd', handleSpeedDialClick)
    }
  }, [tasksHook.toggleTaskCreation])

  // Load user tasks from API filtered by category
  const loadUserTasks = async (showErrorOnFailure: boolean = true) => {
    try {
      setLoadingTasks(true)
      const tasks = await taskApi.getTasksByCategory(category)
      setUserTasks(tasks)
    } catch (error) {
      console.error('Error loading user tasks:', error)
      if (showErrorOnFailure && !hasShownError) {
        setHasShownError(true)
        showError('Error loading tasks')
      }
    } finally {
      setLoadingTasks(false)
    }
  }

  // Helper function to format date from yyyy-mm-dd to dd.mm.yyyy
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return ''
    const parts = dateString.split('-')
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`
    }
    return dateString
  }


  // Handle task actions from TaskDesign component
  const handleTaskAction = (action: string, taskId?: number) => {
    console.log(`Task action: ${action}`, taskId ? `for task ${taskId}` : '')
    switch (action) {
      case 'start': console.log('Start task clicked'); break
      case 'edit': console.log('Edit task clicked'); break
      case 'details': console.log('Details clicked'); break
      case 'delegate': console.log('Delegate clicked'); break
      case 'publish': console.log('Publish clicked'); break
      default: break
    }
  }

  // Handle move task action
  const handleMoveTask = (destination: string, taskId?: number) => {
    console.log(`Move task ${taskId} to: ${destination}`)
    // TODO: Implement move task logic
  }

  // Handle marking task as done
  const handleMarkTaskDone = async (taskId: number) => {
    try {
      await tasksHook.updateTaskStatus(taskId, 'done')
      showSuccess('Task marked as done')
      // Reload tasks to reflect the change
      await loadUserTasks(false)
    } catch (error) {
      console.error('Error marking task as done:', error)
      showError('Error updating task status')
    }
  }

  return (
    <div className="task_tracker_calendar_container">
      <Toasts toastRef={toast} />
      <div className="touchpoint-container">
        {/* Task Creation Block - New component */}
        {tasksHook.showTaskCreation && (
          <InputContainer
            {...inputContainerProps}
            label={tasksHook.taskCreationType}
            icon={tasksHook.taskCreationIcon}
            itemType={tasksHook.taskCreationItemType}
          />
        )}

      </div>


      {/* User Tasks Display */}
      <div className="touchpoint-content">
        {loadingTasks ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading tasks...</p>
          </div>
        ) : userTasks.length > 0 ? (
          userTasks.map((task) => (
            <Taskview
              key={task.id}
              taskId={task.id}
              title={task.title}
              description={task.description}
              startDate={task.date_start ? formatDateForDisplay(task.date_start) : undefined}
              dueDate={task.date_end ? formatDateForDisplay(task.date_end) : undefined}
              tags={task.hashtags?.map(h => h.tag_name) || []}
              category={displayName || category}
              priority={task.priority === 'iu' ? 'high' : task.priority === 'inu' ? 'medium' : 'low'}
              status={task.task_mode === 'published' ? 'in-progress' : 'pending'}
              // UI states from hook
              mobileTapped={tasksHook.mobileTapped}
              showDropdown={tasksHook.showDropdown}
              showSubmenu={tasksHook.showSubmenu}
              dropdownPosition={tasksHook.dropdownPosition}
              submenuPosition={tasksHook.submenuPosition}
              dropdownRef={tasksHook.dropdownRef}
              submenuRef={tasksHook.submenuRef}
              handleTaskTap={tasksHook.handleTaskTap}
              handleIconClick={tasksHook.handleIconClick}
              handleDropdownItemClick={tasksHook.handleDropdownItemClick}
              handleSubmenuItemClick={tasksHook.handleSubmenuItemClick}
              // Callbacks
              onDone={() => handleMarkTaskDone(task.id)}
              onCreateTask={() => handleTaskAction('create', task.id)}
              onSubTask={() => handleTaskAction('subtask', task.id)}
              onNote={() => handleTaskAction('note', task.id)}
              onStart={() => handleTaskAction('start', task.id)}
              onEdit={() => handleTaskAction('edit', task.id)}
              onDetails={() => handleTaskAction('details', task.id)}
              onDelegate={() => handleTaskAction('delegate', task.id)}
              onPublish={() => handleTaskAction('publish', task.id)}
              onMoveTo={(destination) => handleMoveTask(destination, task.id)}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <p>No tasks found. Create your first task above!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default GenericView

