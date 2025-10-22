import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Calendar as BigCalendar, momentLocalizer, Views, Components, EventProps } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { taskApi } from '../api/taskApi'
// CSS moved to static/css/ directory - loaded via Django template

// Setup the localizer by providing the moment (or globalize) Object
const localizer = momentLocalizer(moment)

// Create DnD Calendar component
const DnDCalendar = withDragAndDrop(BigCalendar)

// Custom TimeGutterHeader component to show "All day" label
const TimeGutterHeader = () => {
  return (
    <div className="rbc-label rbc-time-header-gutter" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 500,
      color: '#495057'
    }}>
      All day
    </div>
  )
}

// Custom Event component with floating action buttons
const CustomEvent: React.FC<EventProps> = ({ event, title }) => {
  // Get onTaskMoved from event resource
  const onTaskMoved = event.resource?.onTaskMoved
  const [isTapped, setIsTapped] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [showSubmenu, setShowSubmenu] = useState(false)
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)

  const handleTap = (e: React.MouseEvent) => {
    // Toggle tap state for mobile
    if (window.innerWidth <= 768) {
      e.stopPropagation()
      setIsTapped(!isTapped)
    }
  }

  const handleButtonClick = (action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (action === 'more') {
      const rect = (e.target as HTMLElement).closest('.agenda_icon_btn')?.getBoundingClientRect()
      if (rect) {
        setDropdownPosition({
          top: rect.bottom + 5,
          left: rect.left - 150
        })
        setShowDropdown(!showDropdown)
      }
    } else if (action === 'done') {
      // Handle done action
      const taskSlug = event.resource?.taskSlug
      const onTaskDone = event.resource?.onTaskDone
      if (taskSlug && onTaskDone) {
        onTaskDone(taskSlug)
      }
    } else if (action === 'note') {
      // Handle note action
      const taskSlug = event.resource?.taskSlug
      const onTaskNote = event.resource?.onTaskNote
      if (taskSlug && onTaskNote) {
        onTaskNote(taskSlug)
      }
    } else {
      // TODO: Implement actual actions
    }
  }

  const handleDropdownItemClick = (action: string) => {
    setShowDropdown(false)
    // TODO: Implement actual actions
  }

  const handleMoveToHover = (e: React.MouseEvent) => {
    // Desktop: show submenu on hover
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    
    // Calculate optimal position considering viewport height and width
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const submenuHeight = 300 // Approximate submenu height (7 items * ~40px)
    const submenuWidth = 180 // Approximate submenu width
    
    let topPosition = rect.top
    let leftPosition = rect.right + 5
    
    // Check if submenu would overflow bottom of screen
    if (topPosition + submenuHeight > viewportHeight) {
      // Position submenu so it ends at the bottom of viewport with some padding
      topPosition = viewportHeight - submenuHeight - 20
      
      // Make sure it doesn't go above the top of viewport
      if (topPosition < 20) {
        topPosition = 20
      }
    }
    
    // Check if submenu would overflow right of screen
    if (leftPosition + submenuWidth > viewportWidth) {
      // Position submenu to the left of "Move to..." item
      leftPosition = rect.left - submenuWidth - 5
      
      // If still doesn't fit, center it on screen
      if (leftPosition < 20) {
        leftPosition = (viewportWidth - submenuWidth) / 2
        // Make sure it's not negative
        if (leftPosition < 20) {
          leftPosition = 20
        }
      }
    }
    
    setSubmenuPosition({
      top: topPosition,
      left: leftPosition
    })
    setShowSubmenu(true)
  }

  const handleMoveToLeave = () => {
    // Desktop: delay before closing to allow moving to submenu
    setTimeout(() => {
      // Check if mouse is over submenu before closing
      const submenuElement = document.querySelector('.agenda_submenu')
      const isHoveringSubmenu = submenuElement && submenuElement.matches(':hover')
      
      if (!isHoveringSubmenu) {
        setShowSubmenu(false)
      }
    }, 300)
  }

  const handleMoveToClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    
    // Calculate optimal position considering viewport height and width
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const submenuHeight = 300 // Approximate submenu height (7 items * ~40px)
    const submenuWidth = 180 // Approximate submenu width
    
    let topPosition = rect.top
    let leftPosition = rect.right + 5
    
    // Check if submenu would overflow bottom of screen
    if (topPosition + submenuHeight > viewportHeight) {
      // Position submenu so it ends at the bottom of viewport with some padding
      topPosition = viewportHeight - submenuHeight - 20
      
      // Make sure it doesn't go above the top of viewport
      if (topPosition < 20) {
        topPosition = 20
      }
    }
    
    // Check if submenu would overflow right of screen
    if (leftPosition + submenuWidth > viewportWidth) {
      // Position submenu to the left of "Move to..." item
      leftPosition = rect.left - submenuWidth - 5
      
      // If still doesn't fit, center it on screen
      if (leftPosition < 20) {
        leftPosition = (viewportWidth - submenuWidth) / 2
        // Make sure it's not negative
        if (leftPosition < 20) {
          leftPosition = 20
        }
      }
    }
    
    setSubmenuPosition({
      top: topPosition,
      left: leftPosition
    })
    // Toggle submenu for both desktop and mobile
    const newState = !showSubmenu
    setShowSubmenu(newState)
  }

  const handleSubmenuItemClick = async (category: string) => {
    try {
      // Get task slug from event resource (prefer slug over id)
      const taskSlug = event.resource?.taskSlug || event.resource?.taskId?.toString()
      
      if (!taskSlug) {
        // Show error toast if callback available
        if (onTaskMoved) {
          onTaskMoved(category, false, 'Task identifier not found')
        }
        setShowSubmenu(false)
        setShowDropdown(false)
        return
      }
      
      // Call API to update category
      await taskApi.updateCategory(taskSlug, category)
      
      // Close menus
      setShowSubmenu(false)
      setShowDropdown(false)
      
      // Trigger reload by dispatching custom event
      const taskMovedEvent = new window.CustomEvent('taskMoved', {
        detail: { slug: taskSlug, category },
        bubbles: true
      })
      window.dispatchEvent(taskMovedEvent)
      
      // Call callback to show success toast
      if (onTaskMoved) {
        onTaskMoved(category, true)
      }
    } catch (error: any) {
      setShowSubmenu(false)
      setShowDropdown(false)
      
      // Call callback to show error toast
      if (onTaskMoved) {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to move task'
        onTaskMoved(category, false, errorMessage)
      }
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setShowSubmenu(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  return (
    <>
      <div 
        className={`agenda-calendar-event ${isTapped ? 'mobile-tap' : ''} ${event.resource?.status === 'done' ? 'done' : ''}`}
        onClick={handleTap}
      >
        <div className="agenda-event-title">{title}</div>
        <div className="agenda_floating_icons">
          <button 
            className="agenda_icon_btn" 
            title="Done"
            onClick={(e) => handleButtonClick('done', e)}
          >
            <i className="pi pi-check-circle"></i>
          </button>
          <button 
            className="agenda_icon_btn" 
            title="Sub Task"
            onClick={(e) => handleButtonClick('subtask', e)}
          >
            <i className="pi pi-reply"></i>
          </button>
          <button 
            className="agenda_icon_btn" 
            title="Note"
            onClick={(e) => handleButtonClick('note', e)}
          >
            <i className="pi pi-clipboard"></i>
          </button>
          <button 
            className="agenda_icon_btn" 
            title="More options"
            onClick={(e) => handleButtonClick('more', e)}
          >
            <i className="pi pi-ellipsis-v"></i>
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && createPortal(
        <div 
          ref={dropdownRef}
          className="agenda_dropdown_menu"
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            zIndex: 9999
          }}
        >
          <div 
            className="agenda_dropdown_item"
            onClick={() => handleDropdownItemClick('start')}
          >
            Start
          </div>
          <div 
            className="agenda_dropdown_item"
            onClick={() => handleDropdownItemClick('edit')}
          >
            Edit
          </div>
          <div 
            className="agenda_dropdown_item"
            onClick={() => handleDropdownItemClick('details')}
          >
            Details
          </div>
          <div 
            className="agenda_dropdown_item"
            onClick={() => handleDropdownItemClick('delegate')}
          >
            Delegate
          </div>
          <div 
            className="agenda_dropdown_item"
            onClick={() => handleDropdownItemClick('publish')}
          >
            Publish
          </div>
          <div 
            className="agenda_dropdown_item agenda_dropdown_item_with_submenu"
            onClick={handleMoveToClick}
            onMouseEnter={handleMoveToHover}
            onMouseLeave={handleMoveToLeave}
          >
            <span>Move to...</span>
            <i className="pi pi-chevron-right"></i>
          </div>
        </div>,
        document.body
      )}

      {/* Submenu - SEPARATE portal */}
      {showSubmenu && (() => {
        // Get current category/status from event resource
        // Use category if available, fallback to status, or default to 'agenda' for agenda view
        const currentCategory = (event.resource?.category || event.resource?.status || 'agenda').toLowerCase()
        
        // Define all available categories for agenda items (same as standard task categories)
        const availableCategories = [
          { key: 'inbox', label: 'Inbox' },
          { key: 'backlog', label: 'Backlog' },
          { key: 'agenda', label: 'Agenda' },
          { key: 'waiting', label: 'Waiting' },
          { key: 'someday', label: 'Someday' },
          { key: 'subtask', label: 'Subtask' },
          { key: 'done', label: 'Done' },
          { key: 'archive', label: 'Archive' }
        ]
        
        // Filter out the current category
        const filteredCategories = availableCategories.filter(
          cat => cat.key !== currentCategory
        )
        
        return createPortal(
          <div 
            ref={submenuRef}
            className="agenda_submenu"
            style={{
              position: 'fixed',
              top: submenuPosition.top,
              left: submenuPosition.left,
              zIndex: 10000
            }}
            onMouseEnter={() => {
              // Keep submenu open when hovering over it
              setShowSubmenu(true)
            }}
            onMouseLeave={() => {
              // Close submenu when leaving it with delay
              setTimeout(() => {
                // Check if mouse returned to "Move to..." item
                const moveToElement = document.querySelector('.agenda_dropdown_item_with_submenu')
                const isHoveringMoveToItem = moveToElement && moveToElement.matches(':hover')
                
                if (!isHoveringMoveToItem) {
                  setShowSubmenu(false)
                }
              }, 200)
            }}
          >
            {filteredCategories.map(cat => (
              <div 
                key={cat.key}
                className="agenda_submenu_item" 
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSubmenuItemClick(cat.key)
                }}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              >
                {cat.label}
              </div>
            ))}
          </div>,
          document.body
        )
      })()}
    </>
  )
}

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: any
}

interface InfiniteDailyCalendarProps {
  events?: Event[]
  onSelectEvent?: (event: Event) => void
  onSelectSlot?: (slotInfo: any) => void
  onNavigate?: (date: Date, view: string) => void
  height?: number | string
  daysToShow?: number
  onEventUpdate?: () => void  // Callback to reload events after drag-drop
}

const InfiniteDailyCalendar: React.FC<InfiniteDailyCalendarProps> = ({
  events = [],
  onSelectEvent,
  onSelectSlot,
  onNavigate,
  height = 600,
  daysToShow = 7,
  onEventUpdate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [visibleDays, setVisibleDays] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef(false)

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
    if (isLoading || loadingRef.current) {
      return
    }

    loadingRef.current = true
    setIsLoading(true)

    // Get current visible days and calculate next day
    setVisibleDays(currentVisibleDays => {
      if (currentVisibleDays.length === 0) {
        setIsLoading(false)
        loadingRef.current = false
        return currentVisibleDays
      }

      const lastDay = currentVisibleDays[currentVisibleDays.length - 1]
      const nextDay = new Date(lastDay)
      nextDay.setDate(lastDay.getDate() + 1)

      // Check if this day already exists to prevent duplicates
      const dayAlreadyExists = currentVisibleDays.some(day => 
        day.toDateString() === nextDay.toDateString()
      )

      if (dayAlreadyExists) {
        // Don't add duplicate day, just reset loading state
        setTimeout(() => {
          setIsLoading(false)
          loadingRef.current = false
        }, 500)
        return currentVisibleDays
      }

      // Add new day immediately and reset loading state
      setTimeout(() => {
        setIsLoading(false)
        loadingRef.current = false
      }, 500)

      // Return updated days with new day added
      return [...currentVisibleDays, nextDay]
    })
  }, [isLoading])

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && 
              entry.target.classList.contains('loading-trigger') && 
              !isLoading && 
              !loadingRef.current) {
            // Add a small delay to prevent rapid firing
            setTimeout(() => {
              if (!isLoading && !loadingRef.current) {
                loadMoreDays()
              }
            }, 100)
          }
        })
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Increase margin to reduce sensitivity
      }
    )

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMoreDays, isLoading])

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

  // Handle event drop (drag and drop)
  const handleEventDrop = async ({ event, start, end, isAllDay }: any) => {
    try {
      const taskSlug = event.resource?.taskSlug || event.resource?.taskId?.toString()
      
      if (!taskSlug) {
        console.error('Task identifier not found for event:', event)
        return
      }

      // Calculate proper end time
      let finalEnd = end
      
      // If dragging from all-day to a time slot, set 30-minute duration
      if (event.allDay && !isAllDay) {
        finalEnd = new Date(start)
        finalEnd.setMinutes(start.getMinutes() + 30)
      }
      // If the end time is more than 24 hours after start (whole day event), set 30-minute duration
      else if (!isAllDay && (end.getTime() - start.getTime()) > (23 * 60 * 60 * 1000)) {
        finalEnd = new Date(start)
        finalEnd.setMinutes(start.getMinutes() + 30)
      }

      // Update task datetime via API
      await taskApi.updateTaskDatetime(taskSlug, {
        start_datetime: start.toISOString(),
        end_datetime: finalEnd.toISOString(),
        all_day: isAllDay || false
      })

      // Trigger reload
      if (onEventUpdate) {
        onEventUpdate()
      }
      
      // Dispatch event to notify other components
      const taskMovedEvent = new window.CustomEvent('taskMoved', {
        detail: { slug: taskSlug, datetime_updated: true },
        bubbles: true
      })
      window.dispatchEvent(taskMovedEvent)
    } catch (error: any) {
      console.error('Error updating task datetime:', error)
      alert(`Failed to update task time: ${error.message || 'Unknown error'}`)
    }
  }

  // Handle event resize
  const handleEventResize = async ({ event, start, end }: any) => {
    try {
      const taskSlug = event.resource?.taskSlug || event.resource?.taskId?.toString()
      
      if (!taskSlug) {
        console.error('Task identifier not found for event:', event)
        return
      }

      // Update task datetime via API
      await taskApi.updateTaskDatetime(taskSlug, {
        start_datetime: start.toISOString(),
        end_datetime: end.toISOString(),
        all_day: event.allDay || false
      })

      // Trigger reload
      if (onEventUpdate) {
        onEventUpdate()
      }
      
      // Dispatch event to notify other components
      const taskMovedEvent = new window.CustomEvent('taskMoved', {
        detail: { slug: taskSlug, datetime_updated: true },
        bubbles: true
      })
      window.dispatchEvent(taskMovedEvent)
    } catch (error: any) {
      console.error('Error resizing task:', error)
      alert(`Failed to resize task: ${error.message || 'Unknown error'}`)
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
            key={`day-${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}-${index}`}
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
                <DnDCalendar
                  localizer={localizer}
                  events={dayEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  view={Views.DAY}
                  date={day}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  onEventDrop={handleEventDrop}
                  onEventResize={handleEventResize}
                  eventPropGetter={eventStyleGetter}
                  selectable={true}
                  resizable={true}
                  draggableAccessor={() => true}
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
                  // Custom components
                  components={{
                    timeGutterHeader: TimeGutterHeader,
                    event: CustomEvent
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