import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

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

  // Generate initial days starting from current date
  useEffect(() => {
    const generateDays = (startDate: Date, count: number) => {
      const days: Date[] = []
      for (let i = 0; i < count; i++) {
        const day = new Date(startDate)
        day.setDate(startDate.getDate() + i)
        days.push(day)
      }
      return days
    }

    setVisibleDays(generateDays(currentDate, daysToShow))
  }, [currentDate, daysToShow])

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
      { threshold: 0.1 }
    )

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const loadMoreDays = useCallback(() => {
    if (isLoading) return

    setIsLoading(true)
    
    // Simulate loading delay
    setTimeout(() => {
      setVisibleDays(prevDays => {
        const lastDay = prevDays[prevDays.length - 1]
        const newDays: Date[] = []
        
        // Add 3 more days
        for (let i = 1; i <= 3; i++) {
          const newDay = new Date(lastDay)
          newDay.setDate(lastDay.getDate() + i)
          newDays.push(newDay)
        }
        
        return [...prevDays, ...newDays]
      })
      
      setIsLoading(false)
    }, 1000)
  }, [isLoading])

  const handleSelectEvent = (event: Event) => {
    onSelectEvent?.(event)
  }

  const handleSelectSlot = (slotInfo: any) => {
    onSelectSlot?.(slotInfo)
  }

  const eventStyleGetter = (event: Event) => {
    return {
      style: {
        backgroundColor: '#3B82F6',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  const formatDayHeader = (date: Date) => {
    const dayNumber = date.getDate()
    const dayName = moment(date).format('dddd')
    const monthYear = moment(date).format('MMMM YYYY').toUpperCase()
    
    return { dayNumber, dayName, monthYear }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate < today
  }

  const isFuture = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate > today
  }

  return React.createElement('div', {
    ref: containerRef,
    className: 'task_tracker_infinite_calendar_container'
  },
    // Render each day
    visibleDays.map((day, index) => {
      const { dayNumber, dayName, monthYear } = formatDayHeader(day)
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start)
        return eventDate.toDateString() === day.toDateString()
      })

      return React.createElement('div', {
        key: day.toISOString(),
        className: 'task_tracker_calendar_day_container'
      },
        // Day Header
        React.createElement('div', {
          className: 'task_tracker_calendar_day_header'
        },
          React.createElement('span', {
            className: 'task_tracker_calendar_day_number'
          }, dayNumber),
          React.createElement('span', {
            className: 'task_tracker_calendar_day_name'
          }, dayName),
          React.createElement('span', {
            className: 'task_tracker_calendar_day_date'
          }, monthYear)
        ),
        
        // Day Content - Calendar
        React.createElement('div', {
          className: 'task_tracker_calendar_day_content'
        },
          React.createElement('div', {
            className: 'task_tracker_calendar_instance',
            'data-day-index': index,
            'data-calendar-initialized': 'true'
          },
            React.createElement(BigCalendar, {
              localizer,
              events: dayEvents,
              startAccessor: 'start',
              endAccessor: 'end',
              style: { height: '100%' },
              view: Views.DAY,
              date: day,
              onSelectEvent: handleSelectEvent,
              onSelectSlot: handleSelectSlot,
              eventPropGetter: eventStyleGetter,
              selectable: true,
              popup: true,
              showMultiDayTimes: true,
              step: 30,
              timeslots: 2,
              defaultDate: day,
              views: [Views.DAY], // Only show day view
              toolbar: false, // Hide toolbar completely
              headerToolbar: false, // Hide header toolbar
              // Custom time range for 24 hours
              min: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0),
              max: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59),
              // Show all 24 hours
              slotMinTime: '00:00:00',
              slotMaxTime: '23:59:59',
              // Hour format
              formats: {
                timeGutterFormat: 'HH:mm'
              }
            })
          )
        )
      )
    }),

    // Loading indicator for infinite scroll
    React.createElement('div', {
      className: 'loading-trigger task_tracker_loading_spinner',
      ref: (el) => {
        if (el && observerRef.current) {
          observerRef.current.observe(el)
        }
      }
    },
      React.createElement('div', {
        className: 'task_tracker_spinner_day_header'
      },
        React.createElement('span', {
          className: 'task_tracker_spinner_day_number'
        }, '...'),
        React.createElement('span', {
          className: 'task_tracker_spinner_day_name'
        }, 'Loading'),
        React.createElement('span', {
          className: 'task_tracker_calendar_day_date'
        }, 'More Days')
      ),
      React.createElement('div', {
        className: 'task_tracker_spinner_content'
      },
        React.createElement('div', {
          className: 'task_tracker_spinner'
        }),
        'Loading more days...'
      )
    )
  )
}

export default InfiniteDailyCalendar
