import React from 'react'
import InfiniteDailyCalendar from '../InfiniteDailyCalendar'
// CSS styles moved to task_tracker.css

const AgendaView: React.FC = () => {
  const sampleEvents = [
    // Today's events
    {
      id: 'event1',
      title: 'Morning Workout',
      start: new Date(2025, 0, 14, 6, 0), // January 14, 2025, 6:00 AM
      end: new Date(2025, 0, 14, 7, 0),   // January 14, 2025, 7:00 AM
      priority: 'High' as const,
      category: 'Health'
    },
    {
      id: 'event2', 
      title: 'Team Standup',
      start: new Date(2025, 0, 14, 9, 0), // January 14, 2025, 9:00 AM
      end: new Date(2025, 0, 14, 9, 30),   // January 14, 2025, 9:30 AM
      priority: 'Medium' as const,
      category: 'Work'
    },
    {
      id: 'event3',
      title: 'Project Planning', 
      start: new Date(2025, 0, 14, 14, 0), // January 14, 2025, 2:00 PM
      end: new Date(2025, 0, 14, 15, 30),   // January 14, 2025, 3:30 PM
      priority: 'High' as const,
      category: 'Work'
    },
    {
      id: 'event4',
      title: 'Client Meeting',
      start: new Date(2025, 0, 14, 16, 0), // January 14, 2025, 4:00 PM
      end: new Date(2025, 0, 14, 17, 0), // January 14, 2025, 5:00 PM
      priority: 'High' as const,
      category: 'Meeting'
    },
    // Tomorrow's events
    {
      id: 'event5',
      title: 'Code Review',
      start: new Date(2025, 0, 15, 10, 0), // January 15, 2025, 10:00 AM
      end: new Date(2025, 0, 15, 11, 0), // January 15, 2025, 11:00 AM
      priority: 'Medium' as const,
      category: 'Work'
    },
    {
      id: 'event6',
      title: 'Design Workshop',
      start: new Date(2025, 0, 15, 14, 0), // January 15, 2025, 2:00 PM
      end: new Date(2025, 0, 15, 16, 0), // January 15, 2025, 4:00 PM
      priority: 'Low' as const,
      category: 'Work'
    },
    // Day after tomorrow
    {
      id: 'event7',
      title: 'Sprint Planning',
      start: new Date(2025, 0, 16, 9, 0), // January 16, 2025, 9:00 AM
      end: new Date(2025, 0, 16, 11, 0), // January 16, 2025, 11:00 AM
      priority: 'High' as const,
      category: 'Meeting'
    },
    {
      id: 'event8',
      title: 'Product Demo',
      start: new Date(2025, 0, 16, 15, 0), // January 16, 2025, 3:00 PM
      end: new Date(2025, 0, 16, 16, 0), // January 16, 2025, 4:00 PM
      priority: 'Medium' as const,
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
      daysToShow: 7
    })
  )
}

export default AgendaView