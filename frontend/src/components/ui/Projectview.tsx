import React from 'react'
import { createPortal } from 'react-dom'
// CSS moved to static/css/ directory - loaded via Django template
// Uses the same CSS classes as Taskview but with different HTML structure

interface ProjectviewProps {
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

const Projectview: React.FC<ProjectviewProps> = ({
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

  const isTapped = taskId !== undefined && tappedTaskId === taskId

  return (
    <div 
      className={`task_tracker_task_container ${getPriorityClass()} ${isTapped ? 'mobile-tap' : ''}`}
      onClick={(e) => {
        if (taskId !== undefined) {
          handleTaskTap(taskId, e)
        }
      }}
    >
        {/* PROJECT STRUCTURE: Title first with briefcase icon */}
        <div className="task_tracker_task_title">
          <i className="pi pi-briefcase" style={{ fontSize: '1.3rem', marginRight: '10px' }}></i>
          {title}
        </div>
        
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
              onClick={() => handleSubmenuItemClick('task')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              Convert to task
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
        
        {/* Task Details Popup */}
        {taskId !== undefined && detailsPopupTaskId === taskId && createPortal(
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
              
              <div className="task_details_dates_priority_row">
                <div className="task_details_date_block">
                  <div className="task_details_date_label">Start date</div>
                  <div className="task_details_date_value">{startDate || '10.09.2025'}</div>
                </div>
                
                <div className="task_details_date_block">
                  <div className="task_details_date_label">Due date</div>
                  <div className="task_details_date_value">{dueDate || '10.10.2025'}</div>
                </div>
              </div>
              
              <div className="task_details_priority_label">
                  {priority === 'iu' ? 'important & urgent' : 
                   priority === 'inu' ? 'important & not urgent' : 
                   priority === 'niu' ? 'not important & urgent' : 
                   priority === 'ninu' ? 'not important & not urgent' : 'no priority'}
                </div>

              <div className="task_details_title">
                <i className="pi pi-briefcase" style={{ fontSize: '1.3rem', marginRight: '10px' }}></i>
                {title}
              </div>
              
              <div className="task_details_description">
                {description || 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)'}
              </div>
              
              <div className="task_details_section_heading">
                Notes:
              </div>
              
              <div className="task_details_notes_content">
                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using
              </div>
              
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

        {/* Task hashtags - last position */}
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
  )
}

export default Projectview

