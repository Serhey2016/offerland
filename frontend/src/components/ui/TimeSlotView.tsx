import React from 'react'
import { createPortal } from 'react-dom'
// CSS moved to static/css/ directory - loaded via Django template

interface TimeSlotViewProps {
  // Time Slot data
  taskId?: number
  companyName?: string
  userName: string
  hourPrice: number
  minSlotHours?: number
  availabilityStartDate: string
  availabilityEndDate: string
  timeSlotStartTime: string
  timeSlotEndTime: string
  reservedRoadTime?: string
  startLocation?: string
  description?: string
  tags?: string[]
  priority?: 'iu' | 'inu' | 'niu' | 'ninu' | null
  
  // UI states from hook
  tappedTaskId: number | null
  openDropdownTaskId: number | null
  showSubmenu: boolean
  dropdownPosition: { top: number; left: number }
  submenuPosition: { top: number; left: number }
  detailsPopupTaskId: number | null
  
  // Refs
  dropdownRef: React.RefObject<HTMLDivElement>
  submenuRef: React.RefObject<HTMLDivElement>
  
  // Event handlers from hook
  handleTaskTap: (taskId: number, e: React.MouseEvent) => void
  handleIconClick: (taskId: number, action: string, event?: React.MouseEvent<HTMLButtonElement>) => void
  handleDropdownItemClick: (action: string, taskId?: number, event?: React.MouseEvent<HTMLDivElement>) => void
  handleSubmenuItemClick: (action: string) => void
  closeDetailsPopup: () => void
  
  // Optional callbacks
  onBook?: () => void
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

const TimeSlotView: React.FC<TimeSlotViewProps> = ({
  taskId,
  companyName,
  userName,
  hourPrice,
  minSlotHours,
  availabilityStartDate,
  availabilityEndDate,
  timeSlotStartTime,
  timeSlotEndTime,
  reservedRoadTime,
  startLocation,
  description,
  tags = [],
  priority = null,
  tappedTaskId,
  openDropdownTaskId,
  showSubmenu,
  dropdownPosition,
  submenuPosition,
  detailsPopupTaskId,
  dropdownRef,
  submenuRef,
  handleTaskTap,
  handleIconClick,
  handleDropdownItemClick,
  handleSubmenuItemClick,
  closeDetailsPopup,
  onBook,
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

  const isTapped = taskId !== undefined && tappedTaskId === taskId

  return (
    <div 
      className={`time_slot_card_container ${getPriorityClass()} ${isTapped ? 'mobile-tap' : ''}`}
      onClick={(e) => {
        if (taskId !== undefined) {
          handleTaskTap(taskId, e)
        }
      }}
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
            if (taskId !== undefined) {
              handleIconClick(taskId, 'subtask', e)
            }
          }}
        >
          <i className="pi pi-reply"></i>
        </button>
        <button 
          className="task_tracker_icon_btn" 
          title="Note"
          onClick={(e) => {
            e.stopPropagation()
            if (onNote) {
              onNote()
            }
          }}
        >
          <i className="pi pi-clipboard"></i>
        </button>
        <button 
          className="task_tracker_icon_btn" 
          title="More options"
          onClick={(e) => {
            e.stopPropagation()
            if (taskId !== undefined) {
              handleIconClick(taskId, 'more', e)
            }
          }}
        >
          <i className="pi pi-ellipsis-v"></i>
        </button>
      </div>

      {/* Left Section - Main Details */}
      <div className="time_slot_left_section">
        <div className="ts_company_name">{companyName || 'No Company'}</div>
        <div className="ts_user_name">{userName}</div>
        <div className="ts_price">
          1 hour: <span className="ts_price_amount">{hourPrice} £</span>
        </div>
        {tags && tags.length > 0 && (
          <div className="ts_tags">
            <svg className="ts_tag_icon" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7" stroke="currentColor" strokeWidth="2"></line>
            </svg>
            <span className="ts_tags_text">{tags.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Middle Section - Availability Details */}
      <div className="time_slot_middle_section">
        <div className="ts_availability">
          Available at: {availabilityStartDate} - {availabilityEndDate}
        </div>
        <div className="ts_time_slot">
          Time-slot: {timeSlotStartTime} - {timeSlotEndTime}
        </div>
        <div className="ts_reserved_time">
          Reserved time on road: {reservedRoadTime || '1 hour'}
        </div>
        <div className="ts_location">
          start location: {startLocation || 'N/A'}
        </div>
      </div>

      {/* Dropdown Menu */}
      {taskId !== undefined && openDropdownTaskId === taskId && createPortal(
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
              handleDropdownItemClick('details', taskId)
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
            onClick={(e) => handleDropdownItemClick('move', taskId, e)}
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
    </div>
  )
}

export default TimeSlotView

