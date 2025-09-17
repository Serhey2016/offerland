import React, { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
const localizer = momentLocalizer(moment)

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  resource?: any
}

interface CalendarProps {
  events?: Event[]
  onSelectEvent?: (event: Event) => void
  onSelectSlot?: (slotInfo: any) => void
  onNavigate?: (date: Date, view: string) => void
  defaultView?: 'month' | 'week' | 'day' | 'agenda'
  height?: number | string
}

const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onSelectEvent,
  onSelectSlot,
  onNavigate,
  defaultView = 'month',
  height = 600
}) => {
  const [view, setView] = useState(defaultView)
  const [date, setDate] = useState(new Date())

  const handleNavigate = (newDate: Date, newView: string) => {
    setDate(newDate)
    setView(newView)
    onNavigate?.(newDate, newView)
  }

  const eventStyleGetter = (event: Event) => {
    // You can customize event styles here
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

  return React.createElement('div', { 
    style: { 
      height: typeof height === 'number' ? `${height}px` : height,
      margin: '20px 0'
    }
  },
    React.createElement(BigCalendar, {
      localizer,
      events,
      startAccessor: 'start',
      endAccessor: 'end',
      style: { height: '100%' },
      view: view as any,
      date: date,
      onNavigate: handleNavigate,
      onView: setView,
      onSelectEvent,
      onSelectSlot,
      eventPropGetter: eventStyleGetter,
      selectable: true,
      popup: true,
      showMultiDayTimes: true,
      step: 30,
      timeslots: 2,
      defaultDate: new Date(),
      views: [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]
    })
  )
}

export default Calendar
