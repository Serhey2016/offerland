import React from 'react'
import { createPortal } from 'react-dom'
// CSS moved to static/css/ directory - loaded via Django template

interface JobSearchViewProps {
  // Job Search data
  taskSlug?: string
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
  createdAt?: string
  updatedAt?: string
  note?: string
  
  // UI states from hook
  tappedTaskId: string | null
  openDropdownTaskId: string | null
  showSubmenu: boolean
  dropdownPosition: { top: number; left: number }
  submenuPosition: { top: number; left: number }
  detailsPopupTaskId: string | null
  
  // Refs
  dropdownRef: React.RefObject<HTMLDivElement>
  submenuRef: React.RefObject<HTMLDivElement>
  
  // Event handlers from hook
  handleTaskTap: (taskSlug: string, e: React.MouseEvent) => void
  handleIconClick: (taskSlug: string, action: string, event?: React.MouseEvent<HTMLButtonElement>) => void
  handleDropdownItemClick: (action: string, taskSlug?: string, event?: React.MouseEvent<HTMLDivElement>) => void
  handleSubmenuItemClick: (action: string) => void
  closeDetailsPopup: () => void
  
  // Optional callbacks
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

const JobSearchView: React.FC<JobSearchViewProps> = ({
  taskSlug,
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
  createdAt,
  updatedAt,
  note,
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

  // Format datetime to "Oct. 22, 2025, 11:46 p.m." format
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }
      return date.toLocaleString('en-US', options)
    } catch (error) {
      return dateString
    }
  }

  const isTapped = taskSlug !== undefined && tappedTaskId === taskSlug

  return (
    <>
      <div 
        className={`task_tracker_task_container ${getPriorityClass()} ${isTapped ? 'mobile-tap' : ''}`}
        onClick={(e) => {
          if (taskSlug !== undefined) {
            handleTaskTap(taskSlug, e)
          }
        }}
      >
          {/* Floating action icons */}
          <div className="task_tracker_floating_icons">
          <button 
            className="task_tracker_icon_btn" 
            title="Publish"
            onClick={(e) => {
              e.stopPropagation()
              if (onDone) {
                onDone()
              }
            }}
          >
            <i className="pi pi-share-alt"></i>
          </button>
          <button 
            className="task_tracker_icon_btn" 
            title="Sub Task"
            onClick={(e) => {
              e.stopPropagation()
              if (onSubTask) {
                onSubTask()
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
              // Only proceed if taskSlug is defined and not empty
              if (taskSlug && taskSlug.trim() !== '') {
                handleIconClick(taskSlug, 'more', e)
              }
            }}
          >
            <i className="pi pi-ellipsis-v"></i>
          </button>
        </div>
        
        {/* Task Details Popup */}
        {taskSlug !== undefined && detailsPopupTaskId === taskSlug && createPortal(
          <div 
            className="task_details_popup_overlay"
            id="task-details-popup-overlay"
          >
            <div 
              className="task_details_popup_container"
              id="task-details-popup"
            >
              <div className="task_details_popup_header">
                <span 
                  className="task_details_close_icon" 
                  id="task-details-close-btn"
                  onClick={closeDetailsPopup}
                >
                  ✕
                </span>
              </div>
              
              <div className="task_details_info_container">
                {createdAt && (
                  <div className="task_details_info_row">
                    <div className="task_details_info_label">Created at:</div>
                    <div className="task_details_info_separator"></div>
                    <div className="task_details_info_value">{formatDateTime(createdAt)}</div>
                  </div>
                )}
                
                {updatedAt && (
                  <div className="task_details_info_row">
                    <div className="task_details_info_label">Updated at:</div>
                    <div className="task_details_info_separator"></div>
                    <div className="task_details_info_value">{formatDateTime(updatedAt)}</div>
                  </div>
                )}
                
                <div className="task_details_info_row">
                  <div className="task_details_info_label">Start date:</div>
                  <div className="task_details_info_separator"></div>
                  <div className="task_details_info_value">{startDate || '10.09.2025'}</div>
                </div>
                
                <div className="task_details_info_row">
                  <div className="task_details_info_label">Due date:</div>
                  <div className="task_details_info_separator"></div>
                  <div className="task_details_info_value">{dueDate || '10.10.2025'}</div>
                </div>
                
                <div className="task_details_info_row">
                  <div className="task_details_info_label">priority:</div>
                  <div className="task_details_info_separator"></div>
                  <div className="task_details_info_value">
                    {priority === 'iu' ? 'important & urgent' : 
                     priority === 'inu' ? 'important & not urgent' : 
                     priority === 'niu' ? 'not important & urgent' : 
                     priority === 'ninu' ? 'not important & not urgent' : 'no priority'}
                  </div>
                </div>
                
                <div className="task_details_info_bottom_line"></div>
              </div>

              <div className="task_details_title">
                {title}
              </div>
              
              {description && (
                <div className="task_details_description">
                  {description}
                </div>
              )}
              
              {note && (
                <>
                  <div className="task_details_section_heading">
                    Notes:
                  </div>
                  
                  <div className="task_details_notes_content">
                    {note}
                  </div>
                </>
              )}
              
              <div className="task_details_section_heading">
                Sub tasks:
              </div>
              
              <div className="task_details_subtasks_container">
                <div className="task_details_subtask_item">
                  <div className="task_details_subtask_status_bar"></div>
                  <div className="task_details_subtask_check_icon">
                    <i className="pi pi-check"></i>
                  </div>
                  <div className="task_details_subtask_content">
                    <span className="task_details_subtask_title">Send resume</span>
                    <span className="task_details_subtask_date">03.23.2025</span>
                  </div>
                  <button className="task_details_subtask_more_btn">
                    <i className="pi pi-ellipsis-v"></i>
                  </button>
                </div>
                
                <div className="task_details_subtask_item">
                  <div className="task_details_subtask_status_bar"></div>
                  <div className="task_details_subtask_check_icon">
                    <i className="pi pi-check"></i>
                  </div>
                  <div className="task_details_subtask_content">
                    <span className="task_details_subtask_title">Called to Vanessa ...</span>
                    <span className="task_details_subtask_date">03.23.2025</span>
                  </div>
                  <button className="task_details_subtask_more_btn">
                    <i className="pi pi-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
        
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

      {/* Dropdown Menu */}
      {taskSlug !== undefined && openDropdownTaskId === taskSlug && createPortal(
        <div 
          ref={dropdownRef}
          className="task_tracker_task_dropdown_menu"
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            zIndex: 9999,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '180px'
          }}
        >
          <div 
            className="task_tracker_task_dropdown_item"
            onClick={() => {
              handleDropdownItemClick('details', taskSlug)
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
            onClick={(e) => handleDropdownItemClick('move', taskSlug, e)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0',
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

      {/* Submenu */}
      {taskSlug !== undefined && openDropdownTaskId === taskSlug && showSubmenu && (() => {
        // Get current category and normalize it
        const currentCategory = category?.toLowerCase() || ''
        
        // Define all available categories
        const availableCategories = [
          { key: 'inbox', label: 'Inbox' },
          { key: 'backlog', label: 'Backlog' },
          { key: 'someday', label: 'Someday' },
          { key: 'projects', label: 'Projects' },
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
            className="task_tracker_task_submenu"
            style={{
              position: 'absolute',
              top: submenuPosition.top,
              left: submenuPosition.left,
              zIndex: 10000,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '160px'
            }}
          >
            {filteredCategories.map((cat, index) => (
              <div 
                key={cat.key}
                className="task_tracker_task_dropdown_item"
                onClick={() => {
                  handleSubmenuItemClick(cat.key)
                  if (onMoveTo) onMoveTo(cat.key)
                }}
                style={{ 
                  padding: '8px 16px', 
                  cursor: 'pointer', 
                  borderBottom: index < filteredCategories.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
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

export default JobSearchView


