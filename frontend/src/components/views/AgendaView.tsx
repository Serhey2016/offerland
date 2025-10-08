// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import { useState, useEffect } from 'react'
import InfiniteDailyCalendar from '../InfiniteDailyCalendar'
import { taskApi, DjangoTask } from '../../api/taskApi'
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
  }
}

const AgendaView = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  // Load tasks from backend with status='agenda'
  useEffect(() => {
    const loadAgendaTasks = async () => {
      try {
        setLoading(true)
        const tasks = await taskApi.getTasksByCategory('agenda')
        
        console.log('Loaded agenda tasks:', tasks)
        
        // Transform tasks to calendar events
        const calendarEvents: CalendarEvent[] = tasks.map((task: DjangoTask) => {
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
          
          return {
            id: task.id.toString(),
            title: task.title,
            start: startDate,
            end: endDate,
            allDay: !task.date_start || !task.date_end, // Mark as all-day if no specific times
            resource: {
              priority: task.priority,
              status: task.status,
              description: task.description
            }
          }
        })
        
        console.log('Transformed calendar events:', calendarEvents)
        setEvents(calendarEvents)
      } catch (error) {
        console.error('Error loading agenda tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAgendaTasks()
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