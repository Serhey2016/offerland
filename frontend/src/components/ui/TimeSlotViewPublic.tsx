import React from 'react'
import { createPortal } from 'react-dom'
// CSS moved to static/css/ directory - loaded via Django template

interface TimeSlotViewPublicProps {
  // Time Slot data
  taskSlug?: number
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
  handleTaskTap: (taskSlug: number, e: React.MouseEvent) => void
  handleIconClick: (taskSlug: number, action: string, event?: React.MouseEvent<HTMLButtonElement>) => void
  handleDropdownItemClick: (action: string, taskSlug?: number, event?: React.MouseEvent<HTMLDivElement>) => void
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

const TimeSlotViewPublic: React.FC<TimeSlotViewPublicProps> = ({
  taskSlug,
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

  const isTapped = taskSlug !== undefined && tappedTaskId === taskSlug

  return (
    <div 
      className={`time_slot_card_container ${getPriorityClass()} ${isTapped ? 'mobile-tap' : ''}`}
      onClick={(e) => {
        if (taskSlug !== undefined) {
          handleTaskTap(taskSlug, e)
        }
      }}
    >
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

      {/* Right Section - Book Button */}
      <div 
        className="time_slot_right_section"
        onClick={(e) => {
          e.stopPropagation()
          if (onBook) {
            onBook()
          }
        }}
      >
        <span className="ts_book_text">Book</span>
      </div>
    </div>
  )
}

export default TimeSlotViewPublic

