import React, { useState, useEffect, useRef } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

const AgendaView = () => {
  const calendarRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [greeting, setGreeting] = useState({ greeting: 'Good Morning.', subtitle: 'Today is a great day!' })
  
  // Motivational time management quotes
  const timeManagementQuotes = [
    "Focus on progress, not perfection.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Time is the most valuable asset you have. Invest it wisely.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Don't watch the clock; do what it does. Keep going.",
    "The way to get started is to quit talking and begin doing.",
    "Your time is limited, so don't waste it living someone else's life.",
    "The future depends on what you do today, not tomorrow.",
    "Productivity is never an accident. It's always the result of commitment to excellence.",
    "Time management is life management.",
    "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    "You have the same number of hours per day that were given to the most successful people.",
    "The secret of getting ahead is getting started.",
    "Don't count the days, make the days count.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The way to get started is to quit talking and begin doing.",
    "Time is what we want most, but what we use worst.",
    "The best preparation for tomorrow is doing your best today.",
    "You don't have to be great to get started, but you have to get started to be great.",
    "Every moment is a fresh beginning."
  ]
  const [calendar, setCalendar] = useState(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [todayDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const [allDays, setAllDays] = useState([])
  const [currentDayIndex, setCurrentDayIndex] = useState(0)

  // Generate days for calendar (current day + next 6 days)
  useEffect(() => {
    const generateDays = () => {
      const days = []
      const today = new Date()
      for (let i = 0; i < 7; i++) {
        const day = new Date(today)
        day.setDate(today.getDate() + i)
        days.push(day)
      }
      setAllDays(days)
    }
    generateDays()
  }, [])

  // Update greeting based on time
  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date()
      const hour = now.getHours()
      let greeting = ''
      let subtitle = ''

      if (hour < 12) {
        greeting = 'Good Morning.'
        subtitle = 'Today is a great day!'
      } else if (hour < 17) {
        greeting = 'Good Afternoon.'
        subtitle = 'Keep up the great work!'
      } else {
        greeting = 'Good Evening.'
        subtitle = 'Time to wrap up!'
      }

      setGreeting({ greeting, subtitle })
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Initialize FullCalendar for each day
  useEffect(() => {
    if (allDays.length > 0) {
      // Create calendars for all days
      allDays.forEach((day, dayIndex) => {
        const calendarElement = document.querySelector(`.task_tracker_calendar_instance[data-day-index="${dayIndex}"]`)
        if (calendarElement && !calendarElement.hasAttribute('data-calendar-initialized')) {
          try {
            const cal = new Calendar(calendarElement, {
              plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
              initialView: 'timeGridDay',
              initialDate: day,
              headerToolbar: false,
              selectable: true,
              editable: true,
              droppable: true,
              nowIndicator: dayIndex === 0, // Only show now indicator for today
              firstDay: 1,
              height: 'auto',
              slotMinTime: '00:00:00',
              slotMaxTime: '23:59:59',
              slotDuration: '01:00:00',
              slotLabelInterval: '01:00:00',
              allDaySlot: false,
              dayHeaderFormat: { weekday: 'long' },
              slotLabelFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              },
              eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              },
              dayMaxEvents: false,
              moreLinkClick: 'popover',
              events: [
                { 
                  id: `${dayIndex}-1`, 
                  title: 'Sample Task 1', 
                  start: `${day.toISOString().split('T')[0]}T09:00:00`,
                  end: `${day.toISOString().split('T')[0]}T10:00:00`,
                  backgroundColor: '#3b82f6',
                  borderColor: '#3b82f6'
                },
                { 
                  id: `${dayIndex}-2`, 
                  title: 'Sample Task 2', 
                  start: `${day.toISOString().split('T')[0]}T14:00:00`,
                  end: `${day.toISOString().split('T')[0]}T15:30:00`,
                  backgroundColor: '#10b981',
                  borderColor: '#10b981'
                }
              ],
              select: (selectInfo) => {
                // Handle task creation
              },
              eventClick: (clickInfo) => {
                // Handle task editing
              },
              eventDrop: (dropInfo) => {
                // Handle task rescheduling
              },
              eventResize: (resizeInfo) => {
                // Handle task duration change
              }
            })
            
            cal.render()
            calendarElement.setAttribute('data-calendar-initialized', 'true')
          } catch (error) {
            console.error(`Error creating FullCalendar for day ${dayIndex}:`, error)
          }
        }
      })
    }
  }, [allDays])

  // Handle infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
    
    if (scrollPercentage > 80 && !isLoading) {
      setIsLoading(true)
      setShowSpinner(true)
      
      // Simulate loading more days
      setTimeout(() => {
        const newDays = []
        const lastDay = allDays[allDays.length - 1]
        for (let i = 1; i <= 3; i++) {
          const newDay = new Date(lastDay)
          newDay.setDate(lastDay.getDate() + i)
          newDays.push(newDay)
        }
        setAllDays(prev => [...prev, ...newDays])
        setShowSpinner(false)
        setIsLoading(false)
      }, 1000)
    }
  }

  // Get current time
  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Get current date info
  const getCurrentDateInfo = () => {
    const now = new Date()
    return {
      dayName: now.toLocaleDateString('en-US', { weekday: 'long' }),
      dayNumber: now.getDate(),
      monthName: now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase(),
      time: getCurrentTime()
    }
  }

  const dateInfo = getCurrentDateInfo()

  return (
    <div className="task_tracker_calendar_container">
        {/* FullCalendar with Infinite Scroll */}
        <div 
          className="task_tracker_infinite_calendar_container"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {/* FullCalendar for each day */}
          {allDays.map((day, dayIndex) => {
            return (
              <div key={dayIndex} className="task_tracker_calendar_day_container">
                <div className="task_tracker_calendar_day_header">
                  <span className="task_tracker_calendar_day_number">{day.getDate()}</span>
                  <span className="task_tracker_calendar_day_name">{day.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                  <span className="task_tracker_calendar_day_date">{day.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()} {day.getFullYear()}</span>
                </div>
                <div className="task_tracker_calendar_day_content">
                  <div 
                    ref={dayIndex === 0 ? calendarRef : null} 
                    className="task_tracker_calendar_instance"
                    data-day-index={dayIndex}
                  ></div>
                </div>
              </div>
            )
          })}
          
          {/* Loading Spinner */}
          {showSpinner && (
            <div className="task_tracker_loading_spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}

export default AgendaView
