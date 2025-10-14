import React from 'react'
import { createPortal } from 'react-dom'
// CSS moved to static/css/ directory - loaded via Django template

interface TaskviewProps {
  // Task data
  taskId?: number
  title: string
  description?: string
  timeRange?: string
  category?: string
  priority?: 'iu' | 'inu' | 'niu' | 'ninu' | null
  status?: 'pending' | 'in-progress' | 'completed'
  dueDate?: string
  assignedTo?: string
  tags?: string[]
  startDate?: string
  
  // UI states from hook
  mobileTapped: boolean
  showDropdown: boolean
  showSubmenu: boolean
  dropdownPosition: { top: number; left: number }
  submenuPosition: { top: number; left: number }
  
  // Refs
  dropdownRef: React.RefObject<HTMLDivElement>
  submenuRef: React.RefObject<HTMLDivElement>
  
  // Event handlers from hook
  handleTaskTap: (e: React.MouseEvent) => void
  handleIconClick: (action: string, event?: React.MouseEvent<HTMLButtonElement>) => void
  handleDropdownItemClick: (action: string, event?: React.MouseEvent<HTMLDivElement>) => void
  handleSubmenuItemClick: (action: string) => void
  
  // Optional callbacks (keep if not transferable to hook)
  onEdit?: () => void
  onDelete?: () => void
  onStatusChange?: (status: string) => void
  onDone?: () => void
  onCreateTask?: () => void
  onSubTask?: () => void
  onNote?: () => void
  onStart?: () => void
  onDetails?: () => void
  onDelegate?: () => void
  onPublish?: () => void
  onMoveTo?: (destination: string) => void
}

const Taskview: React.FC<TaskviewProps> = ({
  taskId,
  title,
  description,
  timeRange,
  category,
  priority = null,
  status = 'pending',
  dueDate,
  assignedTo,
  tags = [],
  startDate,
  mobileTapped,
  showDropdown,
  showSubmenu,
  dropdownPosition,
  submenuPosition,
  dropdownRef,
  submenuRef,
  handleTaskTap,
  handleIconClick,
  handleDropdownItemClick,
  handleSubmenuItemClick,
  onEdit,
  onDelete,
  onStatusChange,
  onDone,
  onCreateTask,
  onSubTask,
  onNote,
  onStart,
  onDetails,
  onDelegate,
  onPublish,
  onMoveTo
}) => {
  // Determine priority class for the color bar
  const getPriorityClass = () => {
    if (!priority) return 'priority-none'
    return `priority-${priority}`
  }

  return (
    <div className="task-design-container">
      <div 
        className={`task_tracker_task_container ${getPriorityClass()} ${mobileTapped ? 'mobile-tap' : ''}`}
        onClick={handleTaskTap}
      >
        {/* Floating action icons */}
        <div className="task_tracker_floating_icons">
          <button 
            className="task_tracker_icon_btn" 
            title="Done"
            onClick={(e) => {
              e.stopPropagation()
              if (onDone) {
                onDone()
              }
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
              onClick={() => {
                handleDropdownItemClick('start')
                if (onStart) onStart()
              }}
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
              onClick={() => {
                handleDropdownItemClick('edit')
                if (onEdit) onEdit()
              }}
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
              onClick={() => {
                handleDropdownItemClick('details')
                if (onDetails) onDetails()
              }}
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
              onClick={() => {
                handleDropdownItemClick('delegate')
                if (onDelegate) onDelegate()
              }}
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
              onClick={() => {
                handleDropdownItemClick('publish')
                if (onPublish) onPublish()
              }}
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

export default Taskview
