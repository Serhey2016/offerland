// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import React, { useState, useEffect, useRef } from 'react'
import NavigationItems from './NavigationItems'
import { Button } from 'primereact/button'
import { SpeedDial } from 'primereact/speeddial'
import { Category, Subcategory } from './shared/MenuHandlers'
import '../styles/submenu-primereact.css'

// Additional event interfaces for submenu integration
export interface SubMenuFilterEvent {
  type: 'filter'
  category: Category
  filters?: string[]
}

export interface SubMenuAddEvent {
  type: 'add'
  category: Category
  itemType?: string
}


// TypeScript interfaces for submenu functionality
interface SubMenuSectionProps {
  selectedCategory: Category
  selectedSubcategory: Subcategory
  onFilterClick?: () => void
  onAddClick?: () => void
  onNavigationItemClick?: (item: string) => void
}


const SubMenuSection: React.FC<SubMenuSectionProps> = ({
  selectedCategory,
  selectedSubcategory,
  onFilterClick,
  onAddClick,
  onNavigationItemClick,
}) => {
  
  const [showFilterPopup, setShowFilterPopup] = useState(false)
  const [filterPopupPosition, setFilterPopupPosition] = useState({ top: 0, left: 0 })
  const filterPopupRef = useRef<HTMLDivElement>(null)
  const filterItems = [
    {
      label: 'All Items',
      icon: 'pi pi-filter',
      action: () => {
        handleFilterMenuClick('all')
        setShowFilterPopup(false)
      }
    },
    {
      label: 'Tasks',
      icon: 'pi pi-check-circle',
      action: () => {
        handleFilterMenuClick('active')
        setShowFilterPopup(false)
      }
    },
    {
      label: 'Projects',
      icon: 'pi pi-briefcase',
      action: () => {
        handleFilterMenuClick('completed')
        setShowFilterPopup(false)
      }
    },
    {
      label: 'Announcements',
      icon: 'pi pi-megaphone',
      action: () => {
        handleFilterMenuClick('high-priority')
        setShowFilterPopup(false)
      }
    },
    {
      label: 'Time Slots',
      icon: 'pi pi-calendar-clock',
      action: () => {
        handleFilterMenuClick('high-priority')
        setShowFilterPopup(false)
      }
    }
  ]

  const speedDialItems = [
    {
      label: 'Add Task',
      icon: 'pi pi-calendar-clock',
      command: () => handleAddMenuClick('task')
    },
    {
      label: 'Add Project',
      icon: 'pi pi-megaphone',
      command: () => handleAddMenuClick('project')
    },
    {
      label: 'Add Contact',
      icon: 'pi pi-briefcase',
      command: () => handleAddMenuClick('contact')
    },
    {
      label: 'Add Note',
      icon: 'pi pi-check-circle',
      command: () => handleAddMenuClick('note')
    }
  ]


  // Handle filter menu item click
  const handleFilterMenuClick = (filterType: string): void => {
    const filterEvent: SubMenuFilterEvent = {
      type: 'filter',
      category: selectedCategory,
      filters: [filterType]
    }
    
    window.dispatchEvent(new CustomEvent('subMenuFilter', {
      detail: filterEvent
    }))
    
    if (onFilterClick) {
      onFilterClick()
    }
  }

  // Handle add menu item click
  const handleAddMenuClick = (itemType: string): void => {
    const addEvent: SubMenuAddEvent = {
      type: 'add',
      category: selectedCategory,
      itemType: itemType
    }
    
    window.dispatchEvent(new CustomEvent('subMenuAdd', {
      detail: addEvent
    }))
    
    if (onAddClick) {
      onAddClick()
    }
  }

  // Handle filter button click (toggle popup)
  const handleFilterClick = (event: React.MouseEvent): void => {
    const button = event.currentTarget as HTMLElement
    const rect = button.getBoundingClientRect()
    
    const top = rect.bottom + 4
    const right = window.innerWidth - rect.right
    
    setFilterPopupPosition({ top, left: right })
    setShowFilterPopup(!showFilterPopup)
  }

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (filterPopupRef.current && !filterPopupRef.current.contains(target)) {
        setShowFilterPopup(false)
      }
    }

    if (showFilterPopup) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterPopup])



  // Navigation items are now static and independent of selected category
  // They always show "Business support" and "Personal support"
  // No useEffect needed as the initial state is already correct


  return (
    <div className="task_tracker_sub_menu_section">
      {/* Filter Button with Custom Popup */}
      <div className="task_tracker_sub_menu_filter_container">
        <Button
          className="task_tracker_sub_menu_filter_btn"
          onClick={handleFilterClick}
          icon="pi pi-filter"
          text
          aria-label="Filter options"
        />
        
        {/* Custom Filter Popup */}
        {showFilterPopup && (
          <div
            ref={filterPopupRef}
            className="task_tracker_filter_popup"
            style={{
              position: 'fixed',
              top: filterPopupPosition.top,
              right: filterPopupPosition.left,
              zIndex: 1000,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              minWidth: '160px',
              padding: '4px 0'
            }}
          >
            {filterItems.map((item, index) => (
              <div
                key={index}
                className="task_tracker_filter_popup_item"
                onClick={item.action}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: index < filterItems.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <i className={item.icon} style={{ fontSize: '14px', opacity: 0.7 }}></i>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <NavigationItems
        selectedCategory={selectedCategory}
        onNavigationItemClick={onNavigationItemClick}
      />


      {/* Add Button with PrimeReact SpeedDial */}
      <div className="task_tracker_sub_menu_add_container">
        <SpeedDial
          model={speedDialItems}
          direction="left"
          style={{
            position: 'relative',
            right: 0,
            top: 0,
            justifyContent: 'center',
            flexDirection: 'row-reverse'
          }}
          buttonClassName="task_tracker_sub_menu_add_btn"
          showIcon="pi pi-plus"
          hideIcon="pi pi-times"
        />
      </div>
    </div>
  )
}

export default SubMenuSection
