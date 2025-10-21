// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import { useState, useEffect } from 'react'
import InfiniteDailyCalendar from '../InfiniteDailyCalendar'
import { taskApi, DjangoTask } from '../../api/taskApi'
import TaskNotesDialog from '../ui/TaskNotesDialog'
import Toasts from '../ui/Toasts'
import { useToasts } from '../../hooks/useToasts'
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
    description?: string
    note?: string
    taskId?: number
    taskSlug?: string
    onTaskDone?: (taskSlug: string) => void
    onTaskNote?: (taskSlug: string) => void
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
      await taskApi.updateTaskStatus(taskSlug, 'done')
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

  // Load tasks from backend with status='agenda' or is_agenda=true
  const loadAgendaTasks = async () => {
    try {
      setLoading(true)
      const loadedTasks = await taskApi.getTasksByCategory('agenda')
      
      setTasks(loadedTasks)
      
      // Transform tasks to calendar events
      const calendarEvents: CalendarEvent[] = loadedTasks.map((task: DjangoTask) => {
        // Get today's date for tasks without specific dates
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // If task has start and end dates, use them
        let startDate: Date
        let endDate: Date
        
        if (task.date_start && task.date_end) {
          startDate = new Date(task.date_start)
          endDate = new Date(task.date_end)
        } else if (task.date_start) {
          // Only start date provided
          startDate = new Date(task.date_start)
          endDate = new Date(task.date_start)
          endDate.setHours(23, 59, 59)
        } else {
          // No dates provided - show as all-day event today
          startDate = new Date(today)
          endDate = new Date(today)
          endDate.setHours(23, 59, 59)
        }
        
        // Determine if this should be an all-day event
        // Check if time_start and time_end have specific times (not just 00:00:00)
        const hasSpecificTime = task.time_start && task.time_end && 
          (new Date(task.time_start).getHours() !== 0 || 
           new Date(task.time_start).getMinutes() !== 0 ||
           new Date(task.time_end).getHours() !== 0 || 
           new Date(task.time_end).getMinutes() !== 0)
        
        // If task has specific times, use them for start and end dates
        if (hasSpecificTime) {
          startDate = new Date(task.time_start!)
          endDate = new Date(task.time_end!)
        }
        
        return {
          id: task.id.toString(),
          title: task.title,
          start: startDate,
          end: endDate,
          allDay: !hasSpecificTime, // Mark as all-day if no specific times
          resource: {
            priority: task.priority,
            status: task.status,
            description: task.description,
            note: task.note,
            taskId: task.id,
            taskSlug: task.slug,
            onTaskDone: handleTaskDone,
            onTaskNote: handleTaskNote
          }
        }
      })
      
      setEvents(calendarEvents)
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
    const handleTaskMoved = (event: Event) => {
      const customEvent = event as CustomEvent
      console.log('Task moved event received in AgendaView:', customEvent.detail)
      // Reload tasks after moving
      loadAgendaTasks()
    }

    window.addEventListener('taskMoved', handleTaskMoved)
    return () => {
      window.removeEventListener('taskMoved', handleTaskMoved)
    }
  }, [])

  const handleSelectEvent = (event: any) => {
    console.log('Event selected:', event)
    // You can add modal or detailed view here
  }

  const handleSelectSlot = (slotInfo: any) => {
    console.log('Slot selected:', slotInfo)
    // You can add new event creation here
  }

  const handleNavigate = (date: Date, view: string) => {
    console.log('Calendar navigated:', { date, view })
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
      />
    </div>
  )
}

export default AgendaView