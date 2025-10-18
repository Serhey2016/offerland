import React, { useState, useEffect } from 'react'
// CSS moved to static/css/ directory - loaded via Django template
import { taskApi, InboxTaskData, DjangoTask } from '../../api/taskApi'
import Taskview from '../ui/Taskview'
import Projectview from '../ui/Projectview'
import TimeSlotView from '../ui/TimeSlotView'
import AnnouncementView from '../ui/AnnouncementView'
import JobSearchView from '../ui/JobSearchView'
import InputContainer from '../ui/InputContainer'
import EditTaskDialog, { EditTaskFormData } from '../ui/EditTaskDialog'
import TaskNotesDialog from '../ui/TaskNotesDialog'
import TimeSlotDialog, { TimeSlotFormData } from '../ui/TimeSlotDialog'
import AdvertisingDialog, { AdvertisingFormData } from '../ui/AdvertisingDialog'
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
  
  // Edit task dialog state
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<DjangoTask | null>(null)
  
  // Notes dialog state
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [selectedTaskForNotes, setSelectedTaskForNotes] = useState<DjangoTask | null>(null)
  
  // Time Slot dialog state
  const [showTimeSlotDialog, setShowTimeSlotDialog] = useState(false)
  
  // Advertising dialog state
  const [showAdvertisingDialog, setShowAdvertisingDialog] = useState(false)

  // Handle task creation
  const handleCreateTask = async (taskData: InboxTaskData) => {
    await taskApi.createInboxTask(taskData)
    // Reload tasks after creation (but don't show error if reload fails)
    await loadUserTasks(false)
  }

  // Handle Time Slot creation
  const handleCreateTimeSlot = async (timeSlotData: TimeSlotFormData) => {
    try {
      await taskApi.createTimeSlot(timeSlotData)
      showSuccess('Time slot created successfully!', 'Time Slot Saved', 4000)
      await loadUserTasks(false)
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Error creating time slot. Please try again.'
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
          // Add traceback if available for debugging
          if (error.response.data.traceback) {
            console.error('Server traceback:', error.response.data.traceback)
            // Show first line of traceback in error message for clarity
            const tracebackLines = error.response.data.traceback.split('\n')
            const relevantLine = tracebackLines.find((line: string) => line.includes('strftime') || line.includes('Error'))
            if (relevantLine) {
              errorMessage += '\n' + relevantLine.trim()
            }
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showError(errorMessage)
      throw error
    }
  }

  // Handle Advertising creation
  const handleCreateAdvertising = async (advertisingData: AdvertisingFormData) => {
    try {
      await taskApi.createAdvertisingForm(advertisingData)
      showSuccess('Announcement created successfully!', 'Announcement Saved', 4000)
      await loadUserTasks(false)
    } catch (error) {
      showError('Error creating announcement. Please try again.')
      throw error
    }
  }

  // Use toasts hook
  const { toast, showError, showSuccess } = useToasts()

  // Use tasks hook for UI logic
  const tasksHook = useTasks()

  // Use input container hook
  const inputContainerProps = useInputContainer({
    onSubmit: handleCreateTask,
    onTaskCreated: () => loadUserTasks(),
    toastRef: toast,
    itemType: tasksHook.taskCreationItemType
  })

  // Load user tasks on component mount and when category changes
  useEffect(() => {
    loadUserTasks()
  }, [category])

  // Listen for SpeedDial button clicks from SubMenuSection
  useEffect(() => {
    const handleSpeedDialClick = (event: Event) => {
      const customEvent = event as CustomEvent
      const itemType = customEvent.detail?.itemType
      
      // For 'task' itemType, show TimeSlotDialog instead of InputContainer
      if (itemType === 'task') {
        setShowTimeSlotDialog(true)
        return
      }
      
      // For 'project' itemType, show AdvertisingDialog instead of InputContainer
      if (itemType === 'project') {
        setShowAdvertisingDialog(true)
        return
      }
      
      // Map item types to labels and icons for other types
      const typeMap: Record<string, { label: string, icon: string }> = {
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
  }, [])

  // Load user tasks from API filtered by category
  const loadUserTasks = async (showErrorOnFailure: boolean = true) => {
    try {
      setLoadingTasks(true)
      // Use inbox items endpoint for Inbox category to get all types
      const tasks = category.toLowerCase() === 'inbox' 
        ? await taskApi.getInboxItems(category)
        : await taskApi.getTasksByCategory(category)
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
    
    // Remove time part if ISO format (e.g., "2025-09-10T00:00:00+00:00" -> "2025-09-10")
    let dateOnly = dateString.split('T')[0]
    
    // Split by dash to get date parts
    const parts = dateOnly.split('-')
    if (parts.length === 3) {
      // yyyy-mm-dd -> dd.mm.yyyy
      return `${parts[2]}.${parts[1]}.${parts[0]}`
    }
    
    // Return original if format is unexpected
    return dateString
  }


  // Handle task actions from TaskDesign component
  const handleTaskAction = (action: string, taskId?: number) => {
    switch (action) {
      case 'start': break
      case 'edit': 
        if (taskId) {
          const task = userTasks.find(t => t.id === taskId)
          if (task) {
            setSelectedTask(task)
            setShowEditDialog(true)
          }
        }
        break
      case 'note':
        if (taskId) {
          const task = userTasks.find(t => t.id === taskId)
          if (task) {
            setSelectedTaskForNotes(task)
            setShowNotesDialog(true)
          }
        }
        break
      case 'details': break
      case 'delegate': break
      case 'publish': break
      default: break
    }
  }
  
  // Handle save edited task
  const handleSaveTask = async (taskData: EditTaskFormData) => {
    try {
      await taskApi.updateInboxTask(taskData.id, {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        date_start: taskData.date_start,
        date_end: taskData.date_end
      })
      showSuccess('Task updated successfully')
      // Reload tasks to reflect the changes
      await loadUserTasks(false)
      setShowEditDialog(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
      showError('Error updating task')
    }
  }

  // Handle save task notes
  const handleSaveNotes = async (taskId: number, notes: string) => {
    try {
      await taskApi.saveTaskNotes(taskId, notes)
      showSuccess('Notes saved successfully')
      // Reload tasks to reflect the changes
      await loadUserTasks(false)
      setShowNotesDialog(false)
      setSelectedTaskForNotes(null)
    } catch (error) {
      console.error('Error saving notes:', error)
      showError('Error saving notes')
    }
  }

  // Handle move task action
  const handleMoveTask = (destination: string, taskId?: number) => {
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
      
      {/* Edit Task Dialog */}
      <EditTaskDialog
        visible={showEditDialog}
        task={selectedTask}
        onHide={() => {
          setShowEditDialog(false)
          setSelectedTask(null)
        }}
        onSave={handleSaveTask}
      />

      {/* Task Notes Dialog */}
      <TaskNotesDialog
        visible={showNotesDialog}
        taskId={selectedTaskForNotes?.id || null}
        taskTitle={selectedTaskForNotes?.title}
        initialNotes={selectedTaskForNotes?.note || ''}
        onHide={() => {
          setShowNotesDialog(false)
          setSelectedTaskForNotes(null)
        }}
        onSave={handleSaveNotes}
      />

      {/* Time Slot Dialog */}
      <TimeSlotDialog
        visible={showTimeSlotDialog}
        onHide={() => setShowTimeSlotDialog(false)}
        onSave={handleCreateTimeSlot}
      />

      {/* Advertising Dialog */}
      <AdvertisingDialog
        visible={showAdvertisingDialog}
        onHide={() => setShowAdvertisingDialog(false)}
        onSave={handleCreateAdvertising}
      />
      
      <div className="touchpoint-container">
        {/* Task Creation Block - New component */}
        {tasksHook.showTaskCreation && (
          <InputContainer
            {...inputContainerProps}
            label={tasksHook.taskCreationType}
            icon={tasksHook.taskCreationIcon}
            itemType={tasksHook.taskCreationItemType}
            isDescriptionMode={inputContainerProps.isDescriptionMode}
            activeLabel={inputContainerProps.activeLabel}
            setActiveLabel={inputContainerProps.setActiveLabel}
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
          (() => {
            // Group tasks by type_of_view
            const groupedTasks: Record<string, DjangoTask[]> = {}
            userTasks.forEach((task) => {
              const typeOfView = task.type_of_view || 'task'
              if (!groupedTasks[typeOfView]) {
                groupedTasks[typeOfView] = []
              }
              groupedTasks[typeOfView].push(task)
            })

            // Map type_of_view to display names
            const typeDisplayNames: Record<string, string> = {
              'task': 'Tasks',
              'project': 'Projects',
              'orders': 'Time Slots',
              'timeslot': 'Time Slots',
              'advertising': 'Announcements',
              'tender': 'Tenders',
              'job_search': 'Job Searches'
            }

            // Define order of groups
            const groupOrder = ['task', 'project', 'orders', 'timeslot', 'advertising', 'tender', 'job_search']

            return (
              <>
                {groupOrder.map((typeKey) => {
                  const tasks = groupedTasks[typeKey]
                  if (!tasks || tasks.length === 0) return null

                  return (
                    <div key={typeKey} className="inbox-group">
                      <div className="inbox-group-header">
                        <h3>{typeDisplayNames[typeKey] || typeKey}</h3>
                      </div>
                      <div className="inbox-group-content">
                        <div className="task-design-container">
                          {tasks.map((task) => {
                          // Select appropriate view component based on type_of_view
                          let ViewComponent
                          switch (task.type_of_view) {
                            case 'project':
                              ViewComponent = Projectview
                              break
                            case 'orders':
                            case 'timeslot':
                              ViewComponent = TimeSlotView
                              break
                            case 'advertising':
                              ViewComponent = AnnouncementView
                              break
                            case 'job_search':
                              ViewComponent = JobSearchView
                              break
                            case 'task':
                            case 'tender':
                            default:
                              ViewComponent = Taskview
                              break
                          }
                          
                          return (
                            <ViewComponent
                              key={task.id}
                              taskId={task.id}
                              title={task.title}
                              description={task.description}
                              startDate={task.date_start ? formatDateForDisplay(task.date_start) : undefined}
                              dueDate={task.date_end ? formatDateForDisplay(task.date_end) : undefined}
                              tags={task.hashtags?.map(h => h.tag_name) || []}
                              category={displayName || category}
                              priority={task.priority || null}
                              status={task.task_mode === 'published' ? 'in-progress' : 'pending'}
                              // UI states from hook
                              tappedTaskId={tasksHook.tappedTaskId}
                              openDropdownTaskId={tasksHook.openDropdownTaskId}
                              showSubmenu={tasksHook.showSubmenu}
                              dropdownPosition={tasksHook.dropdownPosition}
                              submenuPosition={tasksHook.submenuPosition}
                              detailsPopupTaskId={tasksHook.detailsPopupTaskId}
                              dropdownRef={tasksHook.dropdownRef}
                              submenuRef={tasksHook.submenuRef}
                              handleTaskTap={tasksHook.handleTaskTap}
                              handleIconClick={tasksHook.handleIconClick}
                              handleDropdownItemClick={tasksHook.handleDropdownItemClick}
                              handleSubmenuItemClick={tasksHook.handleSubmenuItemClick}
                              closeDetailsPopup={tasksHook.closeDetailsPopup}
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
                          )
                        })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )
          })()
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

