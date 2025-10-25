import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { servicesApi, ServiceCategory, Service } from '../../api/servicesApi'
import { taskApi, DjangoTask } from '../../api/taskApi'
// CSS moved to static/css/ directory - loaded via Django template

interface TaskviewProps {
  // Task data
  taskSlug?: string
  taskId?: number  // Add task ID to fetch subtasks
  title: string
  description?: string
  priority?: 'iu' | 'inu' | 'niu' | 'ninu' | null
  status?: 'pending' | 'in-progress' | 'completed'
  dueDate?: string
  assignedTo?: string
  tags?: string[]
  startDate?: string
  createdAt?: string
  updatedAt?: string
  note?: string
  subtasksMetadata?: {
    count: number
    completed_count: number
    last_updated: string
  } | null
  
  // UI states from hook
  tappedTaskId: string | null
  openDropdownTaskId: string | null
  showSubmenu: boolean
  dropdownPosition: { top: number; left: number }
  submenuPosition: { top: number; left: number }
  detailsPopupTaskId: string | null
  publishPopupTaskId: string | null
  
  // Refs
  dropdownRef: React.RefObject<HTMLDivElement>
  submenuRef: React.RefObject<HTMLDivElement>
  
  // Event handlers from hook
  handleTaskTap: (taskSlug: string, e: React.MouseEvent) => void
  handleIconClick: (taskSlug: string, action: string, event?: React.MouseEvent<HTMLButtonElement>) => void
  handleDropdownItemClick: (action: string, taskSlug?: string, event?: React.MouseEvent<HTMLDivElement>) => void
  handleSubmenuItemClick: (action: string) => void
  closeDetailsPopup: () => void
  closePublishPopup: () => void
  
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
  taskSlug,
  taskId,
  title,
  description,
  priority = null,
  status = 'pending',
  dueDate,
  assignedTo,
  tags = [],
  startDate,
  createdAt,
  updatedAt,
  note,
  subtasksMetadata,
  tappedTaskId,
  openDropdownTaskId,
  showSubmenu,
  dropdownPosition,
  submenuPosition,
  detailsPopupTaskId,
  publishPopupTaskId,
  dropdownRef,
  submenuRef,
  handleTaskTap,
  handleIconClick,
  handleDropdownItemClick,
  handleSubmenuItemClick,
  closeDetailsPopup,
  closePublishPopup,
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
  // State for categories and services
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  
  // State for subtasks
  const [subtasks, setSubtasks] = useState<DjangoTask[]>([])
  const [loadingSubtasks, setLoadingSubtasks] = useState(false)

  // Fetch categories on mount (only when publish popup is open)
  useEffect(() => {
    if (taskSlug !== undefined && publishPopupTaskId === taskSlug) {
      loadCategories()
    }
  }, [publishPopupTaskId, taskSlug])

  // Fetch subtasks when details popup opens
  useEffect(() => {
    if (taskSlug !== undefined && detailsPopupTaskId === taskSlug && taskId) {
      loadSubtasks()
    }
  }, [detailsPopupTaskId, taskSlug, taskId])

  // Listen for subtask creation events to reload subtasks
  useEffect(() => {
    const handleSubtaskCreated = (event: CustomEvent) => {
      // Reload subtasks if a new subtask was created for this task
      if (event.detail?.parentId === taskId && detailsPopupTaskId === taskSlug) {
        console.log('Subtask created event received, reloading subtasks for task:', taskId)
        loadSubtasks()
      }
    }

    window.addEventListener('subtaskCreated', handleSubtaskCreated as EventListener)
    
    return () => {
      window.removeEventListener('subtaskCreated', handleSubtaskCreated as EventListener)
    }
  }, [taskId, taskSlug, detailsPopupTaskId])

  const loadSubtasks = async () => {
    if (!taskId) return
    
    try {
      setLoadingSubtasks(true)
      const subtasksData = await taskApi.getSubtasks(taskId)
      setSubtasks(subtasksData)
    } catch (error) {
      console.error('Error loading subtasks:', error)
    } finally {
      setLoadingSubtasks(false)
    }
  }

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const categoriesData = await servicesApi.getServicesCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  // Fetch all services once
  useEffect(() => {
    if (taskSlug !== undefined && publishPopupTaskId === taskSlug && categories.length > 0) {
      loadAllServices()
    }
  }, [categories, publishPopupTaskId, taskSlug])

  const loadAllServices = async () => {
    try {
      setLoadingServices(true)
      const servicesData = await servicesApi.getServices()
      setAllServices(servicesData)
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoadingServices(false)
    }
  }

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null
    setSelectedCategoryId(categoryId)
    
    // Filter services by selected category
    if (categoryId) {
      const filtered = allServices.filter(service => service.category_id === categoryId)
      setFilteredServices(filtered)
    } else {
      setFilteredServices([])
    }
  }

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
              if (taskSlug !== undefined) {
                handleIconClick(taskSlug, 'subtask', e)
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
                Sub tasks: {subtasksMetadata?.count || 0}
                {subtasksMetadata && subtasksMetadata.completed_count > 0 && 
                  ` (${subtasksMetadata.completed_count} completed)`
                }
              </div>
              
              <div className="task_details_subtasks_container">
                {loadingSubtasks ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Loading subtasks...
                  </div>
                ) : subtasks.length > 0 ? (
                  subtasks.map((subtask) => {
                    // Format date for display
                    const subtaskDate = subtask.date_end || subtask.date_start || subtask.created_at
                    const formattedDate = subtaskDate ? new Date(subtaskDate).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    }).replace(/\//g, '.') : ''
                    
                    // Check if subtask is completed
                    const isCompleted = subtask.status === 'done' || subtask.completed_at
                    
                    return (
                      <div key={subtask.id} className="task_details_subtask_item">
                        <div className="task_details_subtask_status_bar"></div>
                        <div className="task_details_subtask_check_icon">
                          {isCompleted && <i className="pi pi-check"></i>}
                        </div>
                        <div className="task_details_subtask_content">
                          <span className="task_details_subtask_title">{subtask.title}</span>
                          {formattedDate && (
                            <span className="task_details_subtask_date">{formattedDate}</span>
                          )}
                        </div>
                        <button className="task_details_subtask_more_btn">
                          <i className="pi pi-ellipsis-v"></i>
                        </button>
                      </div>
                    )
                  })
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                    No subtasks yet
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
        
        {/* Publish Form Popup */}
        {taskSlug !== undefined && publishPopupTaskId === taskSlug && createPortal(
          <div 
            className="task_details_popup_overlay"
            id="publish-form-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <div 
              className="publish_form_container"
              id="publish_form_container"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className="publish_form_header" style={{ 
                backgroundColor: '#ffffff', 
                padding: '20px', 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Publish Task #{taskSlug}</h3>
                <button 
                  className="publish_form_close" 
                  type="button"
                  onClick={closePublishPopup}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  </svg>
                </button>
              </div>
              
              <form className="publish_form" id={`publish_form_task_${taskSlug}`} style={{ backgroundColor: '#ffffff', padding: '20px' }}>
                <input type="hidden" name="csrfmiddlewaretoken" value="" />
                <input type="hidden" name="post_type" value="task" />
                <input type="hidden" name="task_id" value={taskSlug} />
                
                <div className="form_group" style={{ marginBottom: '20px' }}>
                  <label htmlFor={`publish_category_task_${taskSlug}`} style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Category</label>
                  <select 
                    id={`publish_category_task_${taskSlug}`} 
                    name="category" 
                    required
                    onChange={handleCategoryChange}
                    disabled={loadingCategories}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      color: '#333',
                      outline: 'none',
                      cursor: loadingCategories ? 'wait' : 'pointer'
                    }}
                  >
                    <option value="">{loadingCategories ? 'Loading...' : '-- Select category --'}</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form_group" style={{ marginBottom: '20px' }}>
                  <label htmlFor={`publish_service_task_${taskSlug}`} style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>Service</label>
                  <select 
                    id={`publish_service_task_${taskSlug}`} 
                    name="service" 
                    required
                    disabled={!selectedCategoryId || loadingServices}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      color: '#333',
                      outline: 'none',
                      cursor: (!selectedCategoryId || loadingServices) ? 'not-allowed' : 'pointer',
                      opacity: !selectedCategoryId ? 0.6 : 1
                    }}
                  >
                    <option value="">
                      {!selectedCategoryId 
                        ? '-- First select a category --' 
                        : loadingServices 
                        ? 'Loading...' 
                        : '-- Select service --'}
                    </option>
                    {filteredServices.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form_group" style={{ marginBottom: '20px' }}>
                  <label htmlFor={`publish_hashtags_task_${taskSlug}`} style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                    Hashtags: <a href="#" style={{ color: '#3b82f6', textDecoration: 'underline', marginLeft: '8px' }}>Don't find hashtag?</a>
                  </label>
                  <div 
                    id={`publish_hashtags_container_task_${taskSlug}`} 
                    className="publish_form_hashtag_container" 
                    tabIndex={0}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      padding: '8px',
                      minHeight: '42px'
                    }}
                  >
                    <input 
                      type="text" 
                      id={`publish_hashtags_input_task_${taskSlug}`} 
                      placeholder="Start typing tag..." 
                      autoComplete="off" 
                      className="publish_form_hashtags_input"
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '14px',
                        backgroundColor: 'transparent'
                      }}
                    />
                  </div>
                </div>
                
                <input type="hidden" name="hashtags" id={`publish_hashtags_hidden_task_${taskSlug}`} />
                
                <div className="form_section" style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>Payment Options</h4>
                  <div className="radio_group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label className="radio_label">
                      <input type="radio" name="payment_type" value="online" />
                      <span className="radio_mark"></span>
                      Online payments
                    </label>
                    <label className="radio_label">
                      <input type="radio" name="payment_type" value="cash" />
                      <span className="radio_mark"></span>
                      Cash payments
                    </label>
                    <label className="radio_label disabled">
                      <input type="radio" name="payment_type" value="crypto" disabled />
                      <span className="radio_mark"></span>
                      <span className="strikethrough">Crypto</span>
                    </label>
                    <label className="radio_label">
                      <input type="radio" name="payment_type" value="free" />
                      <span className="radio_mark"></span>
                      Free
                    </label>
                  </div>
                </div>
                
                <div className="form_section" style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>Payment Type Options</h4>
                  <div className="radio_group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label className="radio_label">
                      <input type="radio" name="task_type" value="subscription" />
                      <span className="radio_mark"></span>
                      Subscription
                    </label>
                    <label className="radio_label">
                      <input type="radio" name="task_type" value="contract" />
                      <span className="radio_mark"></span>
                      Contract
                    </label>
                    <label className="radio_label">
                      <input type="radio" name="task_type" value="project" />
                      <span className="radio_mark"></span>
                      Project
                    </label>
                    <label className="radio_label">
                      <input type="radio" name="task_type" value="one_time" />
                      <span className="radio_mark"></span>
                      One time task
                    </label>
                  </div>
                </div>
                
                <div className="form_section" style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>Type of services</h4>
                  <div className="toggle_switch online-selected" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <span className="toggle_text_left">Online (Remote)</span>
                    <input type="checkbox" id={`publish_service_type_task_${taskSlug}`} name="service_type" className="toggle_input" />
                    <label htmlFor={`publish_service_type_task_${taskSlug}`} className="toggle_label"></label>
                    <span className="toggle_text_right">Offline (Visiting)</span>
                  </div>
                </div>
                
                <div className="form_section" style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>Type of publishing</h4>
                  <div className="radio_group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label className="radio_label">
                      <input type="radio" name="publishing_type" value="business" defaultChecked />
                      <span className="radio_mark"></span>
                      Business services
                    </label>
                    <label className="radio_label">
                      <input type="radio" name="publishing_type" value="personal" />
                      <span className="radio_mark"></span>
                      Personal support
                    </label>
                  </div>
                </div>
                
                <div className="form_actions" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                  <button 
                    type="submit" 
                    className="btn_primary"
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: '#3b82f6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                  >
                    Publish
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
        
        {/* Task metadata */}
        {(startDate || dueDate) && (
          <div className="task_tracker_task_metadata">
            <div className="task_tracker_task_dates">
              {startDate && (
                <div className="task_tracker_task_date_item">
                  <span>Start date:</span>
                  <span className="task_tracker_task_date_value">{startDate}</span>
                </div>
              )}
              {dueDate && (
                <div className="task_tracker_task_date_item">
                  <span>Due date:</span>
                  <span className="task_tracker_task_date_value">{dueDate}</span>
                </div>
              )}
            </div>
          </div>
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
  )
}

export default Taskview
