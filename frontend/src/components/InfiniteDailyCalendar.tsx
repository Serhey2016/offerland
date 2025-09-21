import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../styles/task_tracker_infinity_cal.css'

// Setup the localizer by providing the moment (or globalize) Object
const localizer = momentLocalizer(moment)

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  resource?: any
}

interface InfiniteDailyCalendarProps {
  events?: Event[]
  onSelectEvent?: (event: Event) => void
  onSelectSlot?: (slotInfo: any) => void
  onNavigate?: (date: Date, view: string) => void
  height?: number | string
  daysToShow?: number
}

const InfiniteDailyCalendar: React.FC<InfiniteDailyCalendarProps> = ({
  events = [],
  onSelectEvent,
  onSelectSlot,
  onNavigate,
  height = 600,
  daysToShow = 7
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [visibleDays, setVisibleDays] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Generate initial days starting from TODAY
  useEffect(() => {
    const generateDays = (startDate: Date, count: number) => {
      const days: Date[] = []
      // Start from TODAY (current date)
      const startFromDate = new Date(startDate)
      // No need to subtract days - start from today
      
      for (let i = 0; i < count; i++) {
        const day = new Date(startFromDate)
        day.setDate(startFromDate.getDate() + i)
        days.push(day)
      }
      
      
      return days
    }

    setVisibleDays(generateDays(currentDate, daysToShow))
  }, [currentDate, daysToShow])

  const loadMoreDays = useCallback(() => {
    if (isLoading) {
      return
    }

    // Use functional update to get the latest state
    setVisibleDays(currentVisibleDays => {
      if (currentVisibleDays.length === 0) {
        return currentVisibleDays
      }

      setIsLoading(true)
      const lastDay = currentVisibleDays[currentVisibleDays.length - 1]
      const nextDay = new Date(lastDay)
      nextDay.setDate(lastDay.getDate() + 1)

      // Load only 1 day at a time
      const newDays: Date[] = [nextDay]

      setTimeout(() => {
        setVisibleDays(prev => [...prev, ...newDays])
        setIsLoading(false)
      }, 500)

      return currentVisibleDays
    })
  }, [isLoading])

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.classList.contains('loading-trigger')) {
            loadMoreDays()
          }
        })
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading when element is 50px away from viewport
      }
    )

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMoreDays])

  // Format day header
  const formatDayHeader = (date: Date) => {
    const dayNumber = date.getDate().toString()
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    return { dayNumber, dayName, monthYear }
  }

  // Event handlers
  const handleSelectEvent = (event: Event) => {
    if (onSelectEvent) {
      onSelectEvent(event)
    }
  }

  const handleSelectSlot = (slotInfo: any) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo)
    }
  }

  // Event style getter
  const eventStyleGetter = (event: Event) => {
    let backgroundColor = '#3174ad'
    
    if (event.resource && event.resource.priority) {
      switch (event.resource.priority) {
        case 'high':
          backgroundColor = '#f56565'
          break
        case 'medium':
          backgroundColor = '#ed8936'
          break
        case 'low':
          backgroundColor = '#48bb78'
          break
        default:
          backgroundColor = '#3174ad'
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '3px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }


  return (
    <div 
      ref={containerRef}
      className="task_tracker_infinite_calendar_container"
    >
      
      {/* Render each day */}
      {visibleDays.map((day, index) => {
        const { dayNumber, dayName, monthYear } = formatDayHeader(day)
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.start)
          return eventDate.toDateString() === day.toDateString()
        })

        return (
          <div
            key={day.toISOString()}
            className="task_tracker_calendar_day_container"
          >
            {/* Day Header */}
            <div className="task_tracker_calendar_day_header">
              <span className="task_tracker_calendar_day_number">{dayNumber}</span>
              <span className="task_tracker_calendar_day_name">{dayName}</span>
              <span className="task_tracker_calendar_day_date">{monthYear}</span>
            </div>
        
            {/* Day Content - Calendar */}
            <div className="task_tracker_calendar_day_content">
              <div 
                className="task_tracker_calendar_instance"
                data-day-index={index}
                data-calendar-initialized="true"
              >
                <BigCalendar
                  localizer={localizer}
                  events={dayEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  view={Views.DAY}
                  date={day}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  eventPropGetter={eventStyleGetter}
                  selectable={true}
                  popup={true}
                  showMultiDayTimes={true}
                  step={30}
                  timeslots={2}
                  defaultDate={day}
                  views={[Views.DAY]} // Only show day view
                  toolbar={false} // Hide toolbar completely
                  headerToolbar={false} // Hide header toolbar
                  // Custom time range for 24 hours
                  min={new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0)}
                  max={new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)}
                  // Show all 24 hours
                  slotMinTime="00:00:00"
                  slotMaxTime="23:59:59"
                  // Hour format
                  formats={{
                    timeGutterFormat: 'HH:mm'
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}

      {/* Loading indicator for infinite scroll */}
      <div 
        className="loading-trigger task_tracker_loading_spinner"
        ref={(el) => {
          if (el && observerRef.current) {
            observerRef.current.observe(el)
          }
        }}
      >
        <div className="task_tracker_spinner_day_header">
          <span className="task_tracker_spinner_day_number">...</span>
          <span className="task_tracker_spinner_day_name">Loading</span>
          <span className="task_tracker_calendar_day_date">More Days</span>
        </div>
        <div className="task_tracker_spinner_content">
          <div className="task_tracker_spinner" />
          Loading more days...
        </div>
      </div>
    </div>
  )
}

export default InfiniteDailyCalendar