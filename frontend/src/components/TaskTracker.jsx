import React, { useState, useEffect, useRef } from 'react'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

const TaskTracker = () => {
  console.log('TaskTracker component rendering...')
  const calendarRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [greeting, setGreeting] = useState({ greeting: 'Good Morning.', subtitle: 'Today is a great day!' })
  const [calendar, setCalendar] = useState(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [todayDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const [allDays, setAllDays] = useState([])
  const [currentDayIndex, setCurrentDayIndex] = useState(0)

  // Update greeting based on time
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        setGreeting({ greeting: 'Good Morning.', subtitle: 'Today is a great day!' })
      } else if (hour >= 12 && hour < 17) {
        setGreeting({ greeting: 'Good Afternoon.', subtitle: 'Hope you\'re having a productive day!' })
      } else if (hour >= 17 && hour < 21) {
        setGreeting({ greeting: 'Good Evening.', subtitle: 'Time to wrap up and relax!' })
      } else {
        setGreeting({ greeting: 'Good Night.', subtitle: 'Time for some rest!' })
      }
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 3600000) // Update every hour
    return () => clearInterval(interval)
  }, [])

  // Update datetime section with current real date (not synced with scroll)
  useEffect(() => {
    const updateDateTimeSection = () => {
      const now = new Date()
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
      const dayNumber = now.getDate()
      const monthName = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()
      const currentTime = formatTime(now)
      
      console.log('Updating datetime_section with:', { dayName, dayNumber, monthName, currentTime })
      
      // Update day name
      const dayNameElement = document.querySelector('.day_name')
      if (dayNameElement) {
        dayNameElement.textContent = dayName
        console.log('Updated day_name to:', dayName)
      } else {
        console.log('day_name element not found')
      }
      
      // Update day number
      const dayNumberElement = document.querySelector('.day_number')
      if (dayNumberElement) {
        dayNumberElement.textContent = dayNumber
        console.log('Updated day_number to:', dayNumber)
      } else {
        console.log('day_number element not found')
      }
      
      // Update month name
      const monthNameElement = document.querySelector('.month_name')
      if (monthNameElement) {
        monthNameElement.textContent = monthName
        console.log('Updated month_name to:', monthName)
      } else {
        console.log('month_name element not found')
      }
      
      // Update current time
      const currentTimeElement = document.querySelector('.current_time')
      if (currentTimeElement) {
        currentTimeElement.textContent = currentTime
        console.log('Updated current_time to:', currentTime)
      } else {
        console.log('current_time element not found')
      }
    }

    // Wait a bit for DOM to be ready
    setTimeout(() => {
      updateDateTimeSection()
    }, 100)
    
    // Update every minute to keep it current
    const interval = setInterval(updateDateTimeSection, 60000)
    return () => clearInterval(interval)
  }, [])

  // Format time
  const formatTime = (date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}.${minutes}`
  }

  // Format date
  const formatDate = (date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                       'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
    
    return {
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      monthName: monthNames[date.getMonth()]
    }
  }

  // Initialize FullCalendar for each day
  useEffect(() => {
    if (allDays.length > 0) {
      // Create calendars for all days
      allDays.forEach((day, dayIndex) => {
        const calendarElement = document.querySelector(`.calendar_instance[data-day-index="${dayIndex}"]`)
        if (calendarElement && !calendarElement.hasAttribute('data-calendar-initialized')) {
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
                title: 'Meeting with client', 
                start: day.toISOString().split('T')[0] + 'T09:00:00',
                end: day.toISOString().split('T')[0] + 'T10:30:00',
                backgroundColor: '#282d3b',
                borderColor: '#282d3b',
                textColor: 'white'
              },
              { 
                id: `${dayIndex}-2`, 
                title: 'Code review', 
                start: day.toISOString().split('T')[0] + 'T14:00:00',
                end: day.toISOString().split('T')[0] + 'T15:00:00',
                backgroundColor: '#282d3b',
                borderColor: '#282d3b',
                textColor: 'white'
              }
            ],
            select: (info) => {
              const title = prompt('Enter task title:')
              if (title) {
                cal.addEvent({ 
                  title: title, 
                  start: info.start, 
                  end: info.end,
                  backgroundColor: '#282d3b',
                  borderColor: '#282d3b',
                  textColor: 'white'
                })
              }
            },
            eventDrop: (info) => {
              console.log('Task moved:', info.event.id, info.event.start, info.event.end)
            },
            eventResize: (info) => {
              console.log('Task resized:', info.event.id, info.event.start, info.event.end)
            },
            eventClick: (info) => {
              const newTitle = prompt('Edit task title:', info.event.title)
              if (newTitle) {
                info.event.setProp('title', newTitle)
              }
            }
          })

          cal.render()
          calendarElement.setAttribute('data-calendar-initialized', 'true')
          
          if (dayIndex === 0) {
            setCalendar(cal)
            setCurrentDate(day)
          }
        }
      })
    }
  }, [allDays])

  // Initialize days array
  useEffect(() => {
    const initialDays = [todayDate]
    setAllDays(initialDays)
    setCurrentDayIndex(0)
  }, [todayDate])

  // Add window scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleWindowScroll)
    return () => {
      window.removeEventListener('scroll', handleWindowScroll)
    }
  }, [isScrolling, showSpinner, isLoading, allDays, currentDayIndex])

  // Navigation functions
  const goToPreviousDay = () => {
    if (calendar) {
      calendar.prev()
      setCurrentDate(calendar.getDate())
    }
  }

  const goToNextDay = () => {
    if (calendar) {
      calendar.next()
      setCurrentDate(calendar.getDate())
    }
  }

  // Infinite scroll functions
  const generateDays = (startDate, count) => {
    const days = []
    for (let i = 0; i < count; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  const generateTimeSlots = (date) => {
    const timeSlots = []
    for (let hour = 0; hour < 24; hour++) {
      timeSlots.push({
        hour: hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        date: date
      })
    }
    return timeSlots
  }

  const handleWindowScroll = () => {
    if (isScrolling) return
    
    const scrollY = window.scrollY
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight
    
    // Check if scrolled near bottom (load more days - only forward)
    if (scrollY + windowHeight >= documentHeight - 200) {
      if (!showSpinner) {
        setShowSpinner(true)
        setIsScrolling(true)
        setIsLoading(true)
        
        // Simulate loading delay
        setTimeout(() => {
          const lastDay = allDays[allDays.length - 1]
          const nextDay = new Date(lastDay)
          nextDay.setDate(lastDay.getDate() + 1)
          
          setAllDays(prev => [...prev, nextDay])
          setCurrentDayIndex(allDays.length)
          setCurrentDate(nextDay)
          
          setIsLoading(false)
          setShowSpinner(false)
          setIsScrolling(false)
        }, 1000)
      }
    } else {
      // Hide spinner if scrolled away from bottom
      if (showSpinner && !isLoading) {
        setShowSpinner(false)
      }
    }
    
    // Check if scrolled near top (previous day - but not before today)
    if (scrollY <= 200) {
      if (currentDayIndex > 0) {
        setIsScrolling(true)
        const newIndex = currentDayIndex - 1
        setCurrentDayIndex(newIndex)
        setCurrentDate(allDays[newIndex])
        
        setTimeout(() => {
          setIsScrolling(false)
        }, 100)
      }
    }
  }


  const dateInfo = formatDate(currentDate)

  return (
    <div className="task-tracker-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 main-content">
            <div className="content-wrapper">
              {/* Filter and Search Section */}
              <section className="container">
                <div className="filter_search_container">
                  <div className="filter_search_container_content_left_side">
                    <div className="greeting_section">
                      <h1 className="greeting_main">
                        <span className="greeting_time">{greeting.greeting}</span>
                        <span className="greeting_name">Guest</span>
                      </h1>
                      <p className="greeting_subtitle">{greeting.subtitle}</p>
                    </div>
                  </div>
                  <div className="filter_search_container_content_right_side">
                    <div className="Amount_counted">
                      <div className="Amount_counted_main_icon">£</div>
                      <div className="Amount_counted_text_digits">
                        <span className="Amount_counted_amount">Earned</span>
                        <span className="Amount_counted_value">800000</span>
                      </div>
                    </div>
                    <div className="contracts_counted">
                      <div className="contracts_counted_main_icon">
                        <svg id="service-contract" xmlns="http://www.w3.org/2000/svg" width="34.802" height="39.586" viewBox="0 0 34.802 39.586">
                          <path id="Path_5230" data-name="Path 5230" d="M47.752,23.046l-7.519-7.519a.731.731,0,0,0-.57-.228.779.779,0,0,0-.8.8v6.038a2.285,2.285,0,0,0,2.278,2.278h6.038a.779.779,0,0,0,.8-.8A.731.731,0,0,0,47.752,23.046Zm.228,5.924a1.143,1.143,0,0,0-1.139-1.139H38.866a3.428,3.428,0,0,1-3.418-3.418V16.439A1.143,1.143,0,0,0,34.309,15.3H22.918A3.428,3.428,0,0,0,19.5,18.718v27.34a3.428,3.428,0,0,0,3.418,3.418H34.48c.911,0,1.139-.627,1.082-1.595a11.655,11.655,0,0,1,2.449-8.43c2.848-3.3,7.519-3.531,8.2-3.531s1.823-.057,1.766-1.025S47.979,28.97,47.979,28.97ZM23.487,22.477l2.791-.4c.057,0,.171-.057.171-.114L27.7,19.4a.267.267,0,0,1,.456,0l1.253,2.563c.057.057.114.114.171.114l2.791.4c.171.057.285.285.114.4l-2.051,1.994c-.057.057-.057.114-.057.228l.456,2.791a.223.223,0,0,1-.342.228l-2.506-1.31a.173.173,0,0,0-.228,0l-2.506,1.31a.223.223,0,0,1-.342-.228l.456-2.791a.342.342,0,0,0-.057-.228l-2.051-1.994C23.2,22.762,23.316,22.534,23.487,22.477ZM33.74,41.5A1.143,1.143,0,0,1,32.6,42.64H25.2A1.143,1.143,0,0,1,24.057,41.5V40.362A1.143,1.143,0,0,1,25.2,39.223h7.4a1.143,1.143,0,0,1,1.139,1.139Zm6.265-6.835a1.143,1.143,0,0,1-1.139,1.139H25.2a1.143,1.143,0,0,1-1.139-1.139V33.527A1.143,1.143,0,0,1,25.2,32.388h13.67a1.143,1.143,0,0,1,1.139,1.139Z" transform="translate(-19.5 -15.3)" fill="#282d3b" />
                          <path id="Path_5231" data-name="Path 5231" d="M60.145,56.2a8.145,8.145,0,1,0,8.145,8.145A8.143,8.143,0,0,0,60.145,56.2Zm1.424,8.886a2.86,2.86,0,0,1-.684-.114l-3.133,3.076a.9.9,0,0,1-.684.285.83.83,0,0,1-.684-.285,1.039,1.039,0,0,1,0-1.367l3.133-3.133a2.048,2.048,0,0,1-.114-.627,2.536,2.536,0,0,1,2.449-2.734,2.859,2.859,0,0,1,.684.114c.114,0,.114.114.057.228l-1.367,1.424a.214.214,0,0,0,0,.342l.968.968a.275.275,0,0,0,.4,0L63.961,61.9c.057-.057.228-.057.228.057a2.859,2.859,0,0,1,.114.684A2.536,2.536,0,0,1,61.569,65.086Z" transform="translate(-33.488 -32.904)" fill="#282d3b" />
                        </svg>
                      </div>
                      <div className="contracts_counted_text_digits">
                        <span className="contracts_counted_amount">Finished</span>
                        <span className="contracts_counted_value">23</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Date and Time Section */}
              <section className="container task_tracker_sides_separator">
                <div className="task_tracker_left_side_section">
                  <div className="task_tracker_left_side_menu">
                    {/* Main Navigation Items */}
                    <div className="menu_item_container">
                      <button className="task_tracker_menu_item">
                        <span className="menu_item_text">Touchpoint</span>
                        <span className="menu_item_arrow">→</span>
                      </button>
                    </div>
                    
                    <div className="menu_item_container">
                      <button className="task_tracker_menu_item">
                        <span className="menu_item_text">Inbox</span>
                        <span className="menu_item_arrow">→</span>
                      </button>
                    </div>
                    
                    <div className="menu_item_container">
                      <button className="task_tracker_menu_item">
                        <span className="menu_item_text">Agenda</span>
                        <span className="menu_item_arrow">↓</span>
                      </button>
                    </div>
                    
                    {/* Separator */}
                    <div className="menu_separator"></div>
                    
                    {/* Bottom Section */}
                    <div className="menu_item_container">
                      <button className="task_tracker_menu_item">
                        <span className="menu_item_text">Waiting</span>
                      </button>
                    </div>
                    
                    <div className="menu_item_container">
                      <button className="task_tracker_menu_item">
                        <span className="menu_item_text">Someday</span>
                      </button>
                    </div>
                    
                    <div className="menu_item_container">
                      <button className="task_tracker_menu_item">
                        <span className="menu_item_text">Projects</span>
                      </button>
                    </div>
                    
                    <div className="menu_item_container">
                      <button className="task_tracker_menu_item">
                        <span className="menu_item_text">Lockbook (Done)</span>
                      </button>
                    </div>
                    
                    <div className="menu_item_container">
                      <button className="task_tracker_menu_item">
                        <span className="menu_item_text">Archive</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="task_tracker_right_side_section">
                  <div className="sub_menu_section_task_tracker">
                    {/* Filter Button (Fixed Left) */}
                    <button className="sub_menu_filter_btn">🔍</button>
                    
                    {/* Scrollable Navigation Center */}
                    <div className="sub_menu_scrollable_container">
                      <div className="sub_menu_navigation_items">
                        <button className="sub_menu_nav_btn active">Agenda</button>
                        <button className="sub_menu_nav_btn">All</button>
                        <button className="sub_menu_nav_btn">Business support</button>
                        <button className="sub_menu_nav_btn">Personal support</button>
                      </div>
                    </div>
                    
                    {/* Add Button (Fixed Right) */}
                    <button className="sub_menu_add_btn">
                      <span className="add_icon">+</span>
                    </button>
                  </div>

                  <div className="task_tracker_right_side_sub_cat_menu">
                    <div className="sub_cat_menu_item">Favorites</div>
                    <div className="sub_cat_menu_item">Orders</div>
                    <div className="sub_cat_menu_item">Subscriptions</div>
                    <div className="sub_cat_menu_item">Published</div>
                  </div>

                  <div className="list_of_tasks_task_tracker task_tracker_tasks_sides_separator">
                    {/* Tasks Timeline Container */}
                    <div className="datetime_section">
                      {/* Left Part - Date */}
                      <div className="datetime_left">
                        <div className="datetime_row_1">
                          <span className="day_name">Loading...</span>
                          <span className="weather_icon">⛅</span>
                        </div>
                        <div className="datetime_row_2">
                          <span className="day_number">--</span>
                        </div>
                        <div className="datetime_row_3">
                          <span className="month_name">LOADING</span>
                        </div>
                      </div>
                      
                      {/* Center Divider */}
                      <div className="datetime_divider_center"></div>
                      
                      {/* Right Part - Time and Location */}
                      <div className="datetime_right">
                        <div className="datetime_right_left">
                          <div className="time_row_1">
                            <span className="current_time">{formatTime(new Date())}</span>
                          </div>
                          <div className="time_row_2">
                            <span className="location">London</span>
                          </div>
                        </div>
                        <div className="datetime_right_right">
                          <div className="action_icons">
                            <div className="icon_item">🔍</div>
                            <div className="icon_item">⏳</div>
                            <div className="icon_item">🤓</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Divider */}
                      <div className="datetime_divider_bottom"></div>
                    </div>
                    
                    {/* FullCalendar Container with Infinite Scroll */}
                    <div className="task_tracker_calendar_container">
                      {/* FullCalendar with Infinite Scroll */}
                      <div 
                        className="infinite_calendar_container"
                        ref={scrollContainerRef}
                      >
                        {/* FullCalendar for each day */}
                        {allDays.map((day, dayIndex) => (
                          <div key={dayIndex} className="calendar_day_container">
                            <div className="calendar_day_header">
                              <span className="calendar_day_number">{day.getDate()}</span>
                              <span className="calendar_day_name">{day.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                              <span className="calendar_day_date">{day.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()} {day.getFullYear()}</span>
                            </div>
                            <div className="calendar_day_content">
                              <div 
                                ref={dayIndex === 0 ? calendarRef : null} 
                                className="calendar_instance"
                                data-day-index={dayIndex}
                              ></div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Loading Spinner - имитация следующего дня */}
                        {showSpinner && (
                          <div className="loading_spinner">
                            <div className="spinner_day_header">
                              <span className="spinner_day_number">--</span>
                              <span className="spinner_day_name">Loading...</span>
                            </div>
                            <div className="spinner_content">
                              <div className="spinner"></div>
                              <span>Loading next day...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskTracker
