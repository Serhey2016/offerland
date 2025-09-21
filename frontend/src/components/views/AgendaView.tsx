import React from 'react'
import InfiniteDailyCalendar from '../InfiniteDailyCalendar'
// CSS styles moved to task_tracker.css

const AgendaView: React.FC = () => {
  // Get current date and generate events for the next 3 days
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(today.getDate() + 2)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const dayBeforeYesterday = new Date(today)
  dayBeforeYesterday.setDate(today.getDate() - 2)

  const sampleEvents = [
    // Day before yesterday's events
    {
      id: 'event1',
      title: 'Previous Task',
      start: new Date(dayBeforeYesterday.getFullYear(), dayBeforeYesterday.getMonth(), dayBeforeYesterday.getDate(), 10, 0),
      end: new Date(dayBeforeYesterday.getFullYear(), dayBeforeYesterday.getMonth(), dayBeforeYesterday.getDate(), 11, 0),
      priority: 'Low' as const,
      category: 'Work'
    },
    // Yesterday's events
    {
      id: 'event2',
      title: 'Yesterday Meeting',
      start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 14, 0),
      end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 15, 0),
      priority: 'Medium' as const,
      category: 'Meeting'
    },
    // Today's events
    {
      id: 'event3',
      title: 'Morning Workout',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0),
      priority: 'High' as const,
      category: 'Health'
    },
    {
      id: 'event4', 
      title: 'Team Standup',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
      priority: 'Medium' as const,
      category: 'Work'
    },
    {
      id: 'event5',
      title: 'Project Planning', 
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30),
      priority: 'High' as const,
      category: 'Work'
    },
    {
      id: 'event6',
      title: 'Client Meeting',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
      priority: 'High' as const,
      category: 'Meeting'
    },
    // Tomorrow's events
    {
      id: 'event7',
      title: 'Code Review',
      start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
      end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0),
      priority: 'Medium' as const,
      category: 'Work'
    },
    {
      id: 'event8',
      title: 'Design Workshop',
      start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
      end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0),
      priority: 'Low' as const,
      category: 'Work'
    }
  ]

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

  return React.createElement('div', { className: 'agenda-view-container' },
    React.createElement(InfiniteDailyCalendar, {
      events: sampleEvents,
      onSelectEvent: handleSelectEvent,
      onSelectSlot: handleSelectSlot,
      onNavigate: handleNavigate,
      height: 'auto',
      daysToShow: 3
    })
  )
}

export default AgendaView