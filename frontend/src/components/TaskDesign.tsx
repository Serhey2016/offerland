// @ts-nocheck
import React, { useState, useEffect } from 'react'
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

interface TaskDesignProps {
title: string
description?: string
timeRange?: string
category?: string
priority?: 'low' | 'medium' | 'high'
dateAdded?: string
onNotesClick?: () => void
onDropdownClick?: () => void
onMenuAction?: (action: string, subAction?: string) => void
}

interface MenuOption {
label: string
value: string
icon?: string
items?: MenuOption[]
}

const TaskDesign: React.FC<TaskDesignProps> = ({
  title,
  description = '',
  timeRange = '',
  category = 'My task',
  priority = 'medium',
  dateAdded = 'Today',
  onNotesClick,
  onDropdownClick,
  onMenuAction
  }: TaskDesignProps) => {
  const [selectedMenuOption, setSelectedMenuOption] = useState<MenuOption | null>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [hoveredSubmenuIndex, setHoveredSubmenuIndex] = useState<number | null>(null)
    const [dropdownPosition, setDropdownPosition] = useState<'right' | 'left'>('left')
    
    // MOBILE-FRIENDLY SUBMENU: Touch-friendly state for mobile devices
    // TO REMOVE: Delete these 2 lines and all MOBILE-FRIENDLY SUBMENU comments below
    const [isMobile, setIsMobile] = useState(false)
    const [tappedSubmenuIndex, setTappedSubmenuIndex] = useState<number | null>(null)
    const [submenuPositions, setSubmenuPositions] = useState<{[key: number]: 'left' | 'right'}>({})

    // Mobile detection
    useEffect(() => {
      const checkMobile = () => {
        const isMobileDevice = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        setIsMobile(isMobileDevice)
      }
      
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Function to calculate submenu position based on available space
    const calculateSubmenuPosition = (dropdownItem: HTMLElement, submenuIndex: number): 'left' | 'right' => {
      const itemRect = dropdownItem.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const submenuWidth = 180 // min-width from CSS
      
      // Check available space on both sides
      const spaceOnRight = viewportWidth - itemRect.right
      const spaceOnLeft = itemRect.left
      
      // If dropdown is positioned left, submenu should go left (towards button)
      // If dropdown is positioned right, submenu should go right (away from button)
      if (dropdownPosition === 'left') {
        // Dropdown is right-aligned to button, submenu should go left
        return spaceOnLeft > submenuWidth ? 'left' : 'right'
      } else {
        // Dropdown is left-aligned to button, submenu should go right
        return spaceOnRight > submenuWidth ? 'right' : 'left'
      }
    }

    // Dropdown menu options structure
    const menuOptions: MenuOption[] = [
    {
    label: 'Start',
    value: 'start',
    icon: 'pi pi-play'
    },
    {
    label: 'Edit',
    value: 'edit',
    icon: 'pi pi-pencil'
    },
    {
    label: 'Details',
    value: 'details',
    icon: 'pi pi-info-circle'
    },
    {
    label: 'Delegate',
    value: 'delegate',
    icon: 'pi pi-users'
    },
    {
    label: 'Publish',
    value: 'publish',
    icon: 'pi pi-send'
    },
    {
    label: 'Move to...',
    value: 'move',
    items: [
    {
    label: 'Agenda',
    value: 'agenda',
    icon: 'pi pi-calendar'
    },
    {
    label: 'Waiting',
    value: 'waiting',
    icon: 'pi pi-clock'
    },
    {
    label: 'Someday',
    value: 'someday',
    icon: 'pi pi-calendar-plus'
    },
    {
    label: 'Convert to project',
    value: 'project',
    icon: 'pi pi-briefcase'
    },
    {
    label: 'Done',
    value: 'done',
    icon: 'pi pi-check'
    },
    {
    label: 'Archive',
    value: 'archive',
    icon: 'pi pi-archive'
    }
    ]
    }
    ]

    // MOBILE-FRIENDLY SUBMENU: Handle tap on items with submenus
    const handleMenuChange = (option: MenuOption, index: number): void => {
    setSelectedMenuOption(option)

    if (onMenuAction) {
    if (option.items) {
      // MOBILE-FRIENDLY SUBMENU: On mobile, toggle submenu on tap
      if (isMobile) {
        setTappedSubmenuIndex(tappedSubmenuIndex === index ? null : index)
        return
      } else {
        // Desktop behavior - don't close dropdown
        return
      }
    } else {
      // This is a direct action
      onMenuAction(option.value)
      closeDropdown()
      setTappedSubmenuIndex(null) // MOBILE-FRIENDLY SUBMENU: Reset mobile state
    }
    }

    // Reset selection after action
    setTimeout(() => {
    setSelectedMenuOption(null)
    }, 100)
    }

    const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault()
      e.stopPropagation()

      if (!isDropdownOpen) {
        // Calculate available space when opening dropdown
        const button = e.currentTarget as HTMLElement
        const buttonRect = button.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const dropdownWidth = 200 // min-width from CSS
        
        // Check if there's enough space on both sides
        const spaceOnRight = viewportWidth - buttonRect.right
        const spaceOnLeft = buttonRect.left
        
        // Default: dropdown opens to the left (right-aligned to button)
        // Switch to right positioning if dropdown would go off-screen to the left
        if (buttonRect.right - dropdownWidth < 0) {
          setDropdownPosition('right') // left-aligned to button
        } else {
          setDropdownPosition('left') // right-aligned to button (default)
        }
      }

      setIsDropdownOpen(!isDropdownOpen)
      }

      const closeDropdown = (): void => {
      setIsDropdownOpen(false)
      setTappedSubmenuIndex(null) // MOBILE-FRIENDLY SUBMENU: Reset mobile state
      setSubmenuPositions({}) // Reset submenu positions
      }

      // Handle click outside to close dropdown
      useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.task_tracker_dropdown_menu')
      const button = document.querySelector('.task_tracker_dropdown_btn')

      if (dropdown && button &&
      !button.contains(event.target as Node) &&
      !dropdown.contains(event.target as Node)) {
      // Use setTimeout to prevent immediate closing
      setTimeout(() => {
      closeDropdown()
      }, 10)
      }
      }

      if (isDropdownOpen) {
      // Add slight delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
      }
      }
      }, [isDropdownOpen])

      // Render icon based on option type
      const renderIcon = (option: MenuOption): React.ReactElement | null => {
      const iconProps = {
      width: '14',
      height: '14',
      viewBox: '0 0 24 24',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
      style: { color: '#6b7280' }
      }

      switch (option.value) {
      case 'start':
      return
      <polygon points="5,3 19,12 5,21" fill="currentColor" />
      case 'edit':
      return (
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )
      case 'details':
      return (
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      )
      case 'delegate':
      return (
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      )
      case 'publish':
      return (
      <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )
      case 'move':
      return (
      <polyline points="9,18 15,12 9,6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" />
      )
      default:
      return null
      }
      }

      return (
      <div className="task_tracker_task_design">
        {/* Priority indicator */}
        <div className={`task-priority ${priority}`} />

        {/* Main content */}
        <div className="task-content">
          {/* Header with folder icon and category */}
          <h4>
            <svg className="task-folder-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z"
                fill="currentColor" />
            </svg>
            {' '}
            {category}
          </h4>

          {/* Task title */}
          <h3>{title}</h3>

          {/* Date added */}
          <span className="task-date">Added: {dateAdded}</span>

          {/* Hashtags container */}
          <div className="task_tracker_hashtags_container">
            {timeRange && <span className="task_tracker_hashtag">{timeRange}</span>}
            <span className="task_tracker_hashtag">{category}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="task-actions">
          {/* Notes button */}
          <button className="task_tracker_notes_btn" onClick={onNotesClick}>
            <svg className="task_tracker_notes_icon" width="26.542" height="17.695" viewBox="0 0 26.542 17.695"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M120-702.305v-2.949h17.695v2.949Zm0-7.373v-2.949h26.542v2.949Zm0-7.373V-720h26.542v2.949Z"
                transform="translate(-120 720)" fill="currentColor" />
            </svg>
          </button>

          {/* Dropdown menu */}
          <div className="task_tracker_dropdown_container">
            <button className="task_tracker_dropdown_btn" onClick={toggleDropdown}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="5" r="2" fill="currentColor" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="19" r="2" fill="currentColor" />
              </svg>
            </button>

            {/* Dropdown menu */}
            <div className={`task_tracker_dropdown_menu ${isDropdownOpen ? 'show' : ''} ${dropdownPosition === 'left' ? 'position-left' : 'position-right'}`}>
              {menuOptions.map((option, index) => (
              <div key={index} className="task_tracker_dropdown_item" 
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.preventDefault()
                e.stopPropagation()

                // MOBILE-FRIENDLY SUBMENU: Handle click with mobile logic
                setTimeout(() => {
                handleMenuChange(option, index)
                if (!option.items || !isMobile) {
                  closeDropdown()
                }
                }, 50)
                }}
                onMouseEnter={(e) => {
                  // MOBILE-FRIENDLY SUBMENU: Only use hover on desktop
                  if (!isMobile && option.items) {
                    setHoveredSubmenuIndex(index)
                    // Calculate submenu position based on available space
                    const submenuPosition = calculateSubmenuPosition(e.currentTarget, index)
                    setSubmenuPositions(prev => ({ ...prev, [index]: submenuPosition }))
                  }
                }}
                onMouseLeave={() => {
                  // MOBILE-FRIENDLY SUBMENU: Only use hover on desktop
                  if (!isMobile) {
                    setHoveredSubmenuIndex(null)
                  }
                }}
                >
                {option.icon && (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg" className="task_tracker_dropdown_icon">
                  {renderIcon(option)} </svg>
                )}
                <span>{option.label}</span>
                {option.items && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                  className="task_tracker_dropdown_arrow">
                  <polyline points="9,18 15,12 9,6" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                )}
                
                {/* Submenu */}
                {option.items && ((!isMobile && hoveredSubmenuIndex === index) || (isMobile && tappedSubmenuIndex === index)) && (
                  <div className={`task_tracker_submenu ${!isMobile && submenuPositions[index] ? `submenu-${submenuPositions[index]}` : ''}`} 
                    onMouseEnter={() => {
                      // MOBILE-FRIENDLY SUBMENU: Only use hover on desktop
                      if (!isMobile) {
                        setHoveredSubmenuIndex(index)
                      }
                    }}
                    onMouseLeave={() => {
                      // MOBILE-FRIENDLY SUBMENU: Only use hover on desktop
                      if (!isMobile) {
                        setHoveredSubmenuIndex(null)
                      }
                    }}>
                    {option.items.map((subItem, subIndex) => (
                      <div key={subIndex} 
                        className="task_tracker_submenu_item"
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (onMenuAction) {
                            onMenuAction(subItem.value)
                            closeDropdown()
                            // MOBILE-FRIENDLY SUBMENU: Reset both desktop and mobile states
                            setHoveredSubmenuIndex(null)
                            setTappedSubmenuIndex(null)
                            setSubmenuPositions({})
                          }
                        }}>
                        {subItem.icon && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg" className="task_tracker_submenu_icon">
                            {renderIcon(subItem)}
                          </svg>
                        )}
                        <span>{subItem.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )
      }

      export default TaskDesign