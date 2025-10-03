import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../styles/tasktracker_task_design.css'

interface TaskDesignProps {
title: string
description?: string
timeRange?: string
category?: string
priority?: 'low' | 'medium' | 'high'
status?: 'pending' | 'in-progress' | 'completed'
dueDate?: string
assignedTo?: string
tags?: string[]
  startDate?: string
onEdit?: () => void
onDelete?: () => void
onStatusChange?: (status: string) => void
  onCreateTask?: () => void
  onSubTask?: () => void
  onNote?: () => void
  onStart?: () => void
  onDetails?: () => void
  onDelegate?: () => void
  onPublish?: () => void
  onMoveTo?: (destination: string) => void
}

const TaskDesign: React.FC<TaskDesignProps> = ({
title,
description,
timeRange,
category,
priority = 'medium',
status = 'pending',
dueDate,
assignedTo,
tags = [],
  startDate,
  onCreateTask,
  onSubTask,
  onNote,
  onStart,
onEdit,
  onDetails,
  onDelegate,
  onPublish,
  onMoveTo
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [showSubmenu, setShowSubmenu] = useState(false)
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 })
  const [mobileTapped, setMobileTapped] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target) &&
          submenuRef.current && !submenuRef.current.contains(target)) {
        setShowDropdown(false)
        setShowSubmenu(false)
      }
    }

    if (showDropdown || showSubmenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown, showSubmenu])

  // Handle dropdown positioning based on available screen space
  const calculateDropdownPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const dropdownWidth = 160
    const dropdownHeight = 200
    
    // Position dropdown to the right of the button
    let top = rect.bottom + 5
    let left = rect.right - dropdownWidth // Align right edge with button
    
    // If dropdown goes off the right edge, position it to the left of button
    if (left + dropdownWidth > viewportWidth - 10) {
      left = rect.left - dropdownWidth
    }
    
    // If dropdown goes off the left edge, position it below button centered
    if (left < 10) {
      left = rect.left + (rect.width / 2) - (dropdownWidth / 2)
      // Ensure it doesn't go off right edge
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10
      }
    }
    
    // Check if dropdown would go off the bottom edge
    if (top + dropdownHeight > viewportHeight - 10) {
      top = rect.top - dropdownHeight - 5
    }
    
    // Ensure dropdown doesn't go off the top edge
    if (top < 10) {
      top = 10
    }
    
    return { top, left }
  }

  // Handle submenu positioning
  const calculateSubmenuPosition = (parentElement: HTMLElement) => {
    const rect = parentElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const submenuWidth = 160
    
    // Position submenu to the right of parent item
    let top = rect.top
    let left = rect.right + 5
    
    // If submenu goes off the right edge, position it to the left
    if (left + submenuWidth > viewportWidth - 10) {
      left = rect.left - submenuWidth - 5
    }
    
    // Ensure submenu doesn't go off the top edge
    if (top < 10) {
      top = 10
    }
    
    return { top, left }
  }

  // Handle submenu item clicks
  const handleSubmenuItemClick = (action: string) => {
    setShowSubmenu(false)
    setShowDropdown(false)
    onMoveTo?.(action)
  }

  // Handle mobile tap for floating icons
  const handleTaskTap = (e: React.MouseEvent) => {
    // Only handle tap on mobile devices
    if (window.innerWidth <= 768) {
      e.preventDefault()
      setMobileTapped(!mobileTapped)
    }
  }

  // Handle dropdown menu item clicks
  const handleDropdownItemClick = (action: string, event?: React.MouseEvent<HTMLDivElement>) => {
    if (action === 'move' && event) {
      // Show submenu for Move to...
      const position = calculateSubmenuPosition(event.currentTarget)
      setSubmenuPosition(position)
      setShowSubmenu(true)
      return
    }
    
    setShowDropdown(false)
    
    switch (action) {
      case 'start':
        onStart?.()
        break
      case 'edit':
        onEdit?.()
        break
      case 'details':
        onDetails?.()
        break
      case 'delegate':
        onDelegate?.()
        break
      case 'publish':
        onPublish?.()
        break
default:
        break
    }
  }

  // Handle icon button clicks
  const handleIconClick = (action: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (action === 'more' && event) {
      const position = calculateDropdownPosition(event.currentTarget)
      setDropdownPosition(position)
      setShowDropdown(!showDropdown)
      return
    }
    
    switch (action) {
      case 'create':
        onCreateTask?.()
        break
      case 'subtask':
        onSubTask?.()
        break
      case 'note':
        onNote?.()
        break
default:
        break
}
}

return (
<div className="task-design-container">
      <div 
        className={`task_tracker_task_container ${mobileTapped ? 'mobile-tap' : ''}`}
        onClick={handleTaskTap}
      >
        {/* Floating action icons */}
        <div className="task_tracker_floating_icons">
          <button 
            className="task_tracker_icon_btn" 
            title="Create task"
            onClick={(e) => {
              e.stopPropagation()
              handleIconClick('create', e)
            }}
          >
            <i className="pi pi-check-circle"></i>
          </button>
          <button 
            className="task_tracker_icon_btn" 
            title="Sub Task"
            onClick={(e) => {
              e.stopPropagation()
              handleIconClick('subtask', e)
            }}
          >
            <i className="pi pi-reply"></i>
          </button>
          <button 
            className="task_tracker_icon_btn" 
            title="Note"
            onClick={(e) => {
              e.stopPropagation()
              handleIconClick('note', e)
            }}
          >
            <i className="pi pi-clipboard"></i>
          </button>
          <button 
            className="task_tracker_icon_btn" 
            title="More options"
            onClick={(e) => {
              e.stopPropagation()
              handleIconClick('more', e)
            }}
          >
            <i className="pi pi-ellipsis-v"></i>
          </button>
        </div>
        
        {/* Dropdown Menu */}
        {showDropdown && createPortal(
          <div 
            ref={dropdownRef}
            className="task_tracker_task_dropdown_menu"
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 9999,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '160px',
              padding: '4px 0'
            }}
          >
            <div 
              className="task_tracker_task_dropdown_item"
              onClick={() => handleDropdownItemClick('start')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Start
            </div>
            <div 
              className="task_tracker_task_dropdown_item"
              onClick={() => handleDropdownItemClick('edit')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Edit
            </div>
            <div 
              className="task_tracker_task_dropdown_item"
              onClick={() => handleDropdownItemClick('details')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Details
            </div>
            <div 
              className="task_tracker_task_dropdown_item"
              onClick={() => handleDropdownItemClick('delegate')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Delegate
            </div>
            <div 
              className="task_tracker_task_dropdown_item"
              onClick={() => handleDropdownItemClick('publish')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Publish
            </div>
            <div 
              className="task_tracker_task_dropdown_item task_tracker_task_dropdown_item_with_submenu"
              onClick={(e) => handleDropdownItemClick('move', e)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Move to...</span>
              <i className="pi pi-chevron-right" style={{ fontSize: '12px', opacity: 0.7 }}></i>
            </div>
          </div>,
          document.body
        )}
        
        {/* Submenu for Move to... */}
        {showSubmenu && createPortal(
          <div 
            ref={submenuRef}
            className="task_tracker_task_submenu"
            style={{
              position: 'fixed',
              top: submenuPosition.top,
              left: submenuPosition.left,
              zIndex: 10000,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '160px',
              padding: '4px 0'
            }}
          >
            <div 
              className="task_tracker_task_submenu_item"
              onClick={() => handleSubmenuItemClick('agenda')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Agenda
            </div>
            <div 
              className="task_tracker_task_submenu_item"
              onClick={() => handleSubmenuItemClick('backlog')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Backlog
            </div>
            <div 
              className="task_tracker_task_submenu_item"
              onClick={() => handleSubmenuItemClick('waiting')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Waiting
            </div>
            <div 
              className="task_tracker_task_submenu_item"
              onClick={() => handleSubmenuItemClick('someday')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Some day
</div>
            <div 
              className="task_tracker_task_submenu_item"
              onClick={() => handleSubmenuItemClick('project')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Convert to project
</div>
            <div 
              className="task_tracker_task_submenu_item"
              onClick={() => handleSubmenuItemClick('done')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Done
            </div>
            <div 
              className="task_tracker_task_submenu_item"
              onClick={() => handleSubmenuItemClick('archive')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              Archive
</div>
          </div>,
          document.body
        )}
        
        {/* Task metadata */}
        <div className="task_tracker_task_metadata">
          <div>
            <span className="task_tracker_task_category">{category || 'Agenda'}: </span>
            <span className="task_tracker_task_times">{timeRange || '6:00 am 7:00 am'}</span>
          </div>
          <div className="task_tracker_task_dates">
            <div className="task_tracker_task_date_item">
              <span>Start date:</span>
              <span className="task_tracker_task_date_value">{startDate || '20.09.2025'}</span>
            </div>
            <div className="task_tracker_task_date_item">
              <span>Due date:</span>
              <span className="task_tracker_task_date_value">{dueDate || '20.09.2025'}</span>
</div>
</div>
</div>

        {/* Task title */}
        <div className="task_tracker_task_title">{title}</div>
        
        {/* Task hashtags */}
{tags.length > 0 && (
          <div className="task_tracker_task_hashtags">
            <svg className="task_tracker_task_hashtag_icon" viewBox="0 0 24 24">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            <span className="task_tracker_task_hashtag_text">{tags.join(', ')}</span>
</div>
)}
</div>
</div>
)
}

export default TaskDesign