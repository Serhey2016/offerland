// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import { useState, useEffect, useCallback } from 'react'
import InfiniteDailyCalendar from '../InfiniteDailyCalendar'
import { taskApi, DjangoTask } from '../../api/taskApi'
import TaskNotesDialog from '../ui/TaskNotesDialog'
import Toasts from '../ui/Toasts'
import { useToasts } from '../../hooks/useToasts'
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
  
  // Use toasts hook
  const { toast, showError, showSuccess } = useToasts()

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