import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
// CSS moved to static/css/ directory - loaded via Django template
import { taskApi, InboxTaskData, DjangoTask } from '../../api/taskApi'
import Taskview from '../ui/Taskview'
import Projectview from '../ui/Projectview'
import TimeSlotView from '../ui/TimeSlotView'
import TimeSlotViewPublic from '../ui/TimeSlotViewPublic'
import AnnouncementView from '../ui/AnnouncementView'
import JobSearchView from '../ui/JobSearchView'
import InputContainer from '../ui/InputContainer'
import EditTaskDialog, { EditTaskFormData } from '../ui/EditTaskDialog'
import TaskNotesDialog from '../ui/TaskNotesDialog'
import TimeSlotDialog, { TimeSlotFormData } from '../ui/TimeSlotDialog'
import AdvertisingDialog, { AdvertisingFormData } from '../ui/AdvertisingDialog'
import CreateJobSearchDialog, { JobSearchFormData } from '../ui/CreateJobSearchDialog'
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
  const [timeSlotEditMode, setTimeSlotEditMode] = useState<'create' | 'edit'>('create')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<DjangoTask | null>(null)
  
  // Advertising dialog state
  const [showAdvertisingDialog, setShowAdvertisingDialog] = useState(false)
  
  // Job Search dialog state
  const [showJobSearchDialog, setShowJobSearchDialog] = useState(false)
  const [jobSearchEditMode, setJobSearchEditMode] = useState<'create' | 'edit'>('create')
  const [selectedJobSearch, setSelectedJobSearch] = useState<DjangoTask | null>(null)

  // Handle task creation
  const handleCreateTask = async (taskData: InboxTaskData) => {
    await taskApi.createInboxTask(taskData)
    // Reload tasks after creation (but don't show error if reload fails)
    await loadUserTasks(false)
  }

  // Handle Time Slot creation/update
  const handleSaveTimeSlot = async (timeSlotData: TimeSlotFormData) => {
    try {
      if (timeSlotEditMode === 'edit' && selectedTimeSlot) {
        // Update existing time slot
        await taskApi.updateTimeSlot(selectedTimeSlot.id, timeSlotData)
        showSuccess('Time slot updated successfully!', 'Time Slot Updated', 4000)
      } else {
        // Create new time slot
        await taskApi.createTimeSlot(timeSlotData)
        showSuccess('Time slot created successfully!', 'Time Slot Saved', 4000)
      }
      await loadUserTasks(false)
      setShowTimeSlotDialog(false)
      setSelectedTimeSlot(null)
      setTimeSlotEditMode('create')
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = timeSlotEditMode === 'edit' 
        ? 'Error updating time slot. Please try again.'
        : 'Error creating time slot. Please try again.'
      
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

  // Handle Job Search creation/update
  const handleSaveJobSearch = async (jobSearchData: JobSearchFormData) => {
    try {
      if (jobSearchEditMode === 'edit' && selectedJobSearch && jobSearchData.id) {
        // Update existing job search
        await taskApi.updateJobSearch(jobSearchData.id, { title: jobSearchData.title })
        showSuccess('Job search updated successfully!', 'Job Search Updated', 4000)
      } else {
        // Create new job search
        const formData = new FormData()
        formData.append('title', jobSearchData.title)
        await taskApi.createJobSearch(formData)
        showSuccess('Job search created successfully!', 'Job Search Saved', 4000)
      }
      await loadUserTasks(false)
      setShowJobSearchDialog(false)
      setSelectedJobSearch(null)
      setJobSearchEditMode('create')
    } catch (error: any) {
      let errorMessage = jobSearchEditMode === 'edit'
        ? 'Error updating job search. Please try again.'
        : 'Error creating job search. Please try again.'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      showError(errorMessage)
      throw error
    }
  }

  // Use toasts hook
  const { toast, showError, showSuccess } = useToasts()

  // Use tasks hook for UI logic - pass toast functions to avoid null ref error
  const tasksHook = useTasks(undefined, { showSuccess, showError })

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

  // Listen for task moved events
  useEffect(() => {
    const handleTaskMoved = (event: Event) => {
      const customEvent = event as CustomEvent
      // Reload tasks after moving
      loadUserTasks(false)
    }

    window.addEventListener('taskMoved', handleTaskMoved)
    return () => {
      window.removeEventListener('taskMoved', handleTaskMoved)
    }
  }, [category])

  // Listen for SpeedDial button clicks from SubMenuSection
  useEffect(() => {
    const handleSpeedDialClick = (event: Event) => {
      const customEvent = event as CustomEvent
      const itemType = customEvent.detail?.itemType
      
      // For 'task' itemType, show TimeSlotDialog instead of InputContainer
      if (itemType === 'task') {
        setTimeSlotEditMode('create')
        setSelectedTimeSlot(null)
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
      // Use inbox items endpoint for all categories to get all types (Tasks, TimeSlots, JobSearch)
      const tasks = await taskApi.getInboxItems(category)
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
  const handleTaskAction = (action: string, taskSlug?: string) => {
    switch (action) {
      case 'start': break
      case 'edit': 
        if (taskSlug) {
          const task = userTasks.find(t => t.slug === taskSlug)
          if (task) {
            // Check if it's a time slot
            if (task.card_template === 'timeslot' || task.card_template === 'orders') {
              setSelectedTimeSlot(task)
              setTimeSlotEditMode('edit')
              setShowTimeSlotDialog(true)
            } else if (task.card_template === 'job_search') {
              // Job Search edit
              setSelectedJobSearch(task)
              setJobSearchEditMode('edit')
              setShowJobSearchDialog(true)
            } else {
              // Regular task edit
              setSelectedTask(task)
              setShowEditDialog(true)
            }
          }
        }
        break
      case 'note':
        if (taskSlug) {
          const task = userTasks.find(t => t.slug === taskSlug)
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
  const handleSaveNotes = async (taskSlug: string, notes: string) => {
    try {
      await taskApi.saveTaskNotes(taskSlug, notes)
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
  const handleMoveTask = (destination: string, taskSlug?: string) => {
    // TODO: Implement move task logic
  }

  // Handle marking task as done
  const handleMarkTaskDone = async (taskSlug: string) => {
    try {
      await tasksHook.updateTaskStatus(taskSlug, 'done')
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
        taskId={selectedTaskForNotes?.slug || null}
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
        onHide={() => {
          setShowTimeSlotDialog(false)
          setSelectedTimeSlot(null)
          setTimeSlotEditMode('create')
        }}
        onSave={handleSaveTimeSlot}
        mode={timeSlotEditMode}
        editData={selectedTimeSlot ? {
          category: (selectedTimeSlot as any).category,
          service: (selectedTimeSlot as any).service,
          date_start: selectedTimeSlot.date_start?.split('T')[0] || '',
          date_end: selectedTimeSlot.date_end?.split('T')[0] || '',
          time_start: (selectedTimeSlot as any).time_start || '',
          time_end: (selectedTimeSlot as any).time_end || '',
          reserved_time_on_road: (selectedTimeSlot as any).reserved_time_on_road || 30,
          start_location: (selectedTimeSlot as any).start_location || '',
          cost_of_1_hour_of_work: (selectedTimeSlot as any).cost_of_1_hour_of_work || 0,
          minimum_time_slot: (selectedTimeSlot as any).minimum_time_slot || '1 hour'
        } : null}
      />

      {/* Advertising Dialog */}
      <AdvertisingDialog
        visible={showAdvertisingDialog}
        onHide={() => setShowAdvertisingDialog(false)}
        onSave={handleCreateAdvertising}
      />

      {/* Job Search Dialog */}
      <CreateJobSearchDialog
        visible={showJobSearchDialog}
        onHide={() => {
          setShowJobSearchDialog(false)
          setSelectedJobSearch(null)
          setJobSearchEditMode('create')
        }}
        onSave={handleSaveJobSearch}
        mode={jobSearchEditMode}
        editData={selectedJobSearch}
      />

      {/* Centralized Dropdown Menu */}
      {tasksHook.openDropdownTaskId !== null && (() => {
        // Find current task to determine its type
        const currentTask = userTasks.find(t => t.slug === tasksHook.openDropdownTaskId)
        const taskType = currentTask?.card_template || 'task'
        
        // Determine which menu items to show based on task type
        const showStartAndDelegate = taskType === 'task' || taskType === 'tender' || taskType === 'project'
        const showMoveTo = taskType === 'task' || taskType === 'tender' || taskType === 'project'
        
        return createPortal(
          <div 
            ref={tasksHook.dropdownRef}
            className="task_tracker_task_dropdown_menu"
            style={{
              position: 'fixed',
              top: tasksHook.dropdownPosition.top,
              left: tasksHook.dropdownPosition.left,
              zIndex: 9999,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '160px',
              padding: '4px 0'
            }}
          >
            <div 
              className="task_tracker_task_dropdown_item"
              onClick={() => {
                tasksHook.handleDropdownItemClick('details', tasksHook.openDropdownTaskId!)
                handleTaskAction('details', tasksHook.openDropdownTaskId!)
              }}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Details
            </div>
            
            {showStartAndDelegate && (
              <div 
                className="task_tracker_task_dropdown_item"
                onClick={() => {
                  tasksHook.handleDropdownItemClick('start')
                  handleTaskAction('start', tasksHook.openDropdownTaskId!)
                }}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                Start
              </div>
            )}
            
            <div 
              className="task_tracker_task_dropdown_item"
              onClick={() => {
                tasksHook.handleDropdownItemClick('edit')
                handleTaskAction('edit', tasksHook.openDropdownTaskId!)
              }}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Edit
            </div>
            
            {showStartAndDelegate && (
              <div 
                className="task_tracker_task_dropdown_item"
                onClick={() => {
                  tasksHook.handleDropdownItemClick('delegate')
                  handleTaskAction('delegate', tasksHook.openDropdownTaskId!)
                }}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0'
                }}
              >
                Delegate
              </div>
            )}
            
            <div 
              className="task_tracker_task_dropdown_item"
              onClick={() => {
                tasksHook.handleDropdownItemClick('publish')
                handleTaskAction('publish', tasksHook.openDropdownTaskId!)
              }}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Publish
            </div>
            
            {showMoveTo && (
              <div 
                className="task_tracker_task_dropdown_item task_tracker_task_dropdown_item_with_submenu"
                onClick={(e) => tasksHook.handleDropdownItemClick('move', tasksHook.openDropdownTaskId!, e)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>Move to...</span>
                <i className="pi pi-chevron-right" style={{ fontSize: '12px', opacity: 0.7 }}></i>
              </div>
            )}
            
            {!showMoveTo && (
              <div 
                className="task_tracker_task_dropdown_item"
                onClick={() => {
                  tasksHook.handleDropdownItemClick('archive')
                }}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Archive
              </div>
            )}
          </div>,
          document.body
        )
      })()}

      {/* Centralized Submenu */}
      {tasksHook.showSubmenu && (() => {
        // Find current task to determine its type and current position
        const currentTask = userTasks.find(t => t.slug === tasksHook.openDropdownTaskId)
        const taskType = currentTask?.card_template || 'task'
        const currentPosition = currentTask?.status?.toLowerCase() || ''
        
        // Don't show centralized submenu for job_search - it has its own
        if (taskType === 'job_search') {
          return null
        }
        
        // Define available categories based on task type
        // Tasks have more options including agenda and waiting, but can't be moved to Projects
        // Projects and other types have similar but slightly different options
        let availableCategories
        if (taskType === 'task' || taskType === 'tender') {
          availableCategories = [
            { key: 'inbox', label: 'Inbox' },
            { key: 'backlog', label: 'Backlog' },
            { key: 'agenda', label: 'Agenda' },
            { key: 'waiting', label: 'Waiting' },
            { key: 'someday', label: 'Someday' },
            { key: 'subtask', label: 'Subtask' },
            { key: 'done', label: 'Done' },
            { key: 'archive', label: 'Archive' }
          ]
        } else {
          // For projects and other types
          availableCategories = [
            { key: 'inbox', label: 'Inbox' },
            { key: 'backlog', label: 'Backlog' },
            { key: 'someday', label: 'Someday' },
            { key: 'projects', label: 'Projects' },
            { key: 'subtask', label: 'Subtask' },
            { key: 'done', label: 'Done' },
            { key: 'archive', label: 'Archive' }
          ]
        }
        
        // Filter out the current position
        const filteredCategories = availableCategories.filter(
          cat => cat.key !== currentPosition
        )
        
        return createPortal(
        <div 
          ref={tasksHook.submenuRef}
          className="task_tracker_task_submenu"
          style={{
            position: 'fixed',
            top: tasksHook.submenuPosition.top,
            left: tasksHook.submenuPosition.left,
            zIndex: 10000,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '160px',
            padding: '4px 0'
          }}
        >
          {filteredCategories.map((cat, index) => (
            <div 
              key={cat.key}
              className="task_tracker_task_submenu_item"
              onClick={() => tasksHook.handleSubmenuItemClick(cat.key)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: index < filteredCategories.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              {cat.label}
            </div>
          ))}
        </div>,
        document.body
      )
      })()}
      
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
            // Group tasks by card_template
            const groupedTasks: Record<string, DjangoTask[]> = {}
            userTasks.forEach((task) => {
              const cardTemplate = task.card_template || 'task'
              if (!groupedTasks[cardTemplate]) {
                groupedTasks[cardTemplate] = []
              }
              groupedTasks[cardTemplate].push(task)
            })

            // Map card_template to display names
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
                          // Select appropriate view component based on card_template
                          let ViewComponent
                          switch (task.card_template) {
                            case 'project':
                              ViewComponent = Projectview
                              break
                            case 'orders':
                            case 'timeslot':
                              ViewComponent = TimeSlotView
                              break
                            case 'timeslot_public':
                              ViewComponent = TimeSlotViewPublic
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
                          
                          // Prepare props based on view type
                          const commonProps = {
                            taskSlug: task.slug,
                            tags: task.hashtags?.map(h => h.tag_name) || [],
                            priority: task.priority || null,
                            tappedTaskId: tasksHook.tappedTaskId,
                            openDropdownTaskId: tasksHook.openDropdownTaskId,
                            showSubmenu: tasksHook.showSubmenu,
                            dropdownPosition: tasksHook.dropdownPosition,
                            submenuPosition: tasksHook.submenuPosition,
                            detailsPopupTaskId: tasksHook.detailsPopupTaskId,
                            dropdownRef: tasksHook.dropdownRef,
                            submenuRef: tasksHook.submenuRef,
                            handleTaskTap: tasksHook.handleTaskTap,
                            handleIconClick: tasksHook.handleIconClick,
                            handleDropdownItemClick: tasksHook.handleDropdownItemClick,
                            handleSubmenuItemClick: tasksHook.handleSubmenuItemClick,
                            closeDetailsPopup: tasksHook.closeDetailsPopup,
                            onDone: () => handleMarkTaskDone(task.slug),
                            onCreateTask: () => handleTaskAction('create', task.slug),
                            onSubTask: () => handleTaskAction('subtask', task.slug),
                            onNote: () => handleTaskAction('note', task.slug),
                            onStart: () => handleTaskAction('start', task.slug),
                            onEdit: () => handleTaskAction('edit', task.slug),
                            onDetails: () => handleTaskAction('details', task.slug),
                            onDelegate: () => handleTaskAction('delegate', task.slug),
                            onPublish: () => handleTaskAction('publish', task.slug),
                            onMoveTo: (destination) => handleMoveTask(destination, task.slug)
                          }

                          // TimeSlot-specific props
                          if (task.card_template === 'timeslot' || task.card_template === 'timeslot_public' || task.card_template === 'orders') {
                            return (
                              <ViewComponent
                                key={task.slug}
                                {...commonProps}
                                companyName={(task as any).company_name || undefined}
                                userName={(task as any).user_name || task.title || 'Unknown User'}
                                hourPrice={(task as any).cost_of_1_hour_of_work || 0}
                                minSlotHours={(task as any).minimum_time_slot}
                                availabilityStartDate={task.date_start ? formatDateForDisplay(task.date_start) : ''}
                                availabilityEndDate={task.date_end ? formatDateForDisplay(task.date_end) : ''}
                                timeSlotStartTime={(task as any).time_start || ''}
                                timeSlotEndTime={(task as any).time_end || ''}
                                reservedRoadTime={(task as any).reserved_time_on_road ? `${(task as any).reserved_time_on_road} minutes` : undefined}
                                startLocation={(task as any).start_location}
                                description={task.description}
                                onBook={() => handleTaskAction('book', task.slug)}
                              />
                            )
                          }
                          
                          // Default task props
                          return (
                            <ViewComponent
                              key={task.slug}
                              {...commonProps}
                              title={task.title}
                              description={task.description}
                              startDate={task.date_start ? formatDateForDisplay(task.date_start) : undefined}
                              dueDate={task.date_end ? formatDateForDisplay(task.date_end) : undefined}
                              category={displayName || category}
                              status={task.task_mode === 'published' ? 'in-progress' : 'pending'}
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

