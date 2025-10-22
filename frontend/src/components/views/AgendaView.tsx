// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import { useState, useEffect, useCallback } from 'react'
import InfiniteDailyCalendar from '../InfiniteDailyCalendar'
import { taskApi, DjangoTask, InboxTaskData } from '../../api/taskApi'
import TaskNotesDialog from '../ui/TaskNotesDialog'
import TimeSlotDialog, { TimeSlotFormData } from '../ui/TimeSlotDialog'
import AdvertisingDialog, { AdvertisingFormData } from '../ui/AdvertisingDialog'
import CreateJobSearchDialog, { JobSearchFormData } from '../ui/CreateJobSearchDialog'
import InputContainer from '../ui/InputContainer'
import Toasts from '../ui/Toasts'
import { useToasts } from '../../hooks/useToasts'
import { useTasks } from '../../hooks/useTasks'
import { useInputContainer } from '../../hooks/useInputContainer'
import { convertTasksToCalendarEvents, CalendarEvent as CalendarEventType } from '../../utils/calendarHelpers'
// CSS styles moved to task_tracker.css

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: {
    priority?: string
    status?: string
    category?: string
    description?: string
    note?: string
    taskId?: number
    taskSlug?: string
    onTaskDone?: (taskSlug: string) => void
    onTaskNote?: (taskSlug: string) => void
    onTaskMoved?: (category: string, success: boolean, error?: string) => void
  }
}

const AgendaView = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<DjangoTask[]>([])
  
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
  
  // Use toasts hook
  const { toast, showError, showSuccess } = useToasts()
  
  // Use tasks hook for UI logic - pass toast functions to avoid null ref error
  const tasksHook = useTasks(undefined, { showSuccess, showError })

  // Handle task creation
  const handleCreateTask = async (taskData: InboxTaskData) => {
    await taskApi.createInboxTask(taskData)
    // Reload tasks after creation
    await loadAgendaTasks()
  }

  // Use input container hook
  const inputContainerProps = useInputContainer({
    onSubmit: handleCreateTask,
    onTaskCreated: () => loadAgendaTasks(),
    toastRef: toast,
    itemType: tasksHook.taskCreationItemType
  })

  // Handle marking task as done
  const handleTaskDone = async (taskSlug: string) => {
    try {
      // Use updateCategory instead of updateTaskStatus to properly handle is_agenda
      await taskApi.updateCategory(taskSlug, 'done')
      showSuccess('Task marked as done')
      // Reload tasks to reflect the change
      await loadAgendaTasks()
    } catch (error) {
      console.error('Error marking task as done:', error)
      showError('Error updating task status')
    }
  }

  // Handle opening notes dialog
  const handleTaskNote = async (taskSlug: string) => {
    try {
      // Fetch fresh task data by slug
      const loadedTasks = await taskApi.getTasksByCategory('agenda')
      const task = loadedTasks.find(t => t.slug === taskSlug)
      
      if (task) {
        setSelectedTaskForNotes(task)
        setShowNotesDialog(true)
      }
    } catch (error) {
      console.error('Error loading task for notes:', error)
      showError('Error loading task')
    }
  }

  // Handle save task notes
  const handleSaveNotes = async (taskSlug: string, notes: string) => {
    try {
      await taskApi.saveTaskNotes(taskSlug, notes)
      showSuccess('Notes saved successfully')
      // Reload tasks to reflect the changes
      await loadAgendaTasks()
      setShowNotesDialog(false)
      setSelectedTaskForNotes(null)
    } catch (error) {
      console.error('Error saving notes:', error)
      showError('Error saving notes')
    }
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
      await loadAgendaTasks()
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
      await loadAgendaTasks()
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
      await loadAgendaTasks()
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

  // Handle task moved callback for toast messages
  const handleTaskMoved = useCallback((category: string, success: boolean, error?: string) => {
    if (success) {
      const categoryLabels: Record<string, string> = {
        'inbox': 'Inbox',
        'backlog': 'Backlog',
        'agenda': 'Agenda',
        'waiting': 'Waiting',
        'someday': 'Someday',
        'subtask': 'Subtask',
        'done': 'Done',
        'archive': 'Archive'
      }
      const categoryLabel = categoryLabels[category] || category
      
      // Use showSuccess function from useToasts hook
      showSuccess(`Task moved to ${categoryLabel}`, 'Task Moved', 4000)
    } else {
      // Use showError function from useToasts hook
      showError(error || 'Failed to move task', 'Error', 3000)
    }
  }, [showSuccess, showError])

  // Load tasks from backend with status='agenda' or is_agenda=true
  const loadAgendaTasks = async () => {
    try {
      setLoading(true)
      const loadedTasks = await taskApi.getTasksByCategory('agenda')
      
      setTasks(loadedTasks)
      
      // Transform tasks to calendar events using helper
      // This now handles both regular tasks and recurring tasks with multiple slots
      const calendarEvents = convertTasksToCalendarEvents(loadedTasks)
      
      // Add callbacks to each event's resource
      const eventsWithCallbacks = calendarEvents.map(event => ({
        ...event,
        resource: {
          ...event.resource,
          onTaskDone: handleTaskDone,
          onTaskNote: handleTaskNote,
          onTaskMoved: handleTaskMoved
        }
      }))
      
      setEvents(eventsWithCallbacks)
    } catch (error) {
      console.error('Error loading agenda tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgendaTasks()
  }, [])

  // Listen for task moved events
  useEffect(() => {
    const handleTaskMovedEvent = (event: Event) => {
      const customEvent = event as CustomEvent
      // Reload tasks after moving
      loadAgendaTasks()
    }

    window.addEventListener('taskMoved', handleTaskMovedEvent)
    return () => {
      window.removeEventListener('taskMoved', handleTaskMovedEvent)
    }
  }, [])

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

  const handleSelectEvent = (event: any) => {
    // You can add modal or detailed view here
  }

  const handleSelectSlot = (slotInfo: any) => {
    // You can add new event creation here
  }

  const handleNavigate = (date: Date, view: string) => {
    // Handle navigation
  }

  if (loading) {
    return (
      <div className="agenda-view-container">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Loading agenda tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="agenda-view-container">
      <Toasts toastRef={toast} />
      
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
        mode={timeSlotEditMode}
        timeSlot={selectedTimeSlot}
        onHide={() => {
          setShowTimeSlotDialog(false)
          setSelectedTimeSlot(null)
          setTimeSlotEditMode('create')
        }}
        onSave={handleSaveTimeSlot}
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
        mode={jobSearchEditMode}
        jobSearch={selectedJobSearch}
        onHide={() => {
          setShowJobSearchDialog(false)
          setSelectedJobSearch(null)
          setJobSearchEditMode('create')
        }}
        onSave={handleSaveJobSearch}
      />

      {/* Task Creation Block */}
      <div className="touchpoint-container">
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
      
      <InfiniteDailyCalendar
        events={events}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onNavigate={handleNavigate}
        height="auto"
        daysToShow={3}
        onEventUpdate={loadAgendaTasks}
      />
    </div>
  )
}

export default AgendaView