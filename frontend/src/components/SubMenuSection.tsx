// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'primereact/button'
import { Menu } from 'primereact/menu'
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

export interface SubMenuNavigationEvent {
  type: 'navigation'
  category: Category
  item: string
  itemId: string
}

// TypeScript interfaces for submenu functionality
interface SubMenuSectionProps {
  selectedCategory: Category
  selectedSubcategory: Subcategory
  onFilterClick?: () => void
  onAddClick?: () => void
  onNavigationItemClick?: (item: string) => void
}

interface NavigationItem {
  id: string
  label: string
  active?: boolean
}

const SubMenuSection: React.FC<SubMenuSectionProps> = ({
  selectedCategory,
  selectedSubcategory,
  onFilterClick,
  onAddClick,
  onNavigationItemClick
}) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    { id: 'business-support', label: 'Business support', active: true },
    { id: 'personal-support', label: 'Personal support', active: false }
  ])
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [scrollStart, setScrollStart] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const filterMenuRef = useRef<Menu>(null)

  // PrimeReact menu items
  const filterMenuItems = [
    {
      label: 'All Items',
      icon: 'pi pi-filter',
      command: () => handleFilterMenuClick('all')
    },
    {
      label: 'Tasks',
      icon: 'pi pi-check-circle',
      command: () => handleFilterMenuClick('active')
    },
    {
      label: 'Projects',
      icon: 'pi pi-briefcase',
      command: () => handleFilterMenuClick('completed')
    },
    {
      label: 'Announcements',
      icon: 'pi pi-megaphone',
      command: () => handleFilterMenuClick('high-priority')
    },
    {
      label: 'Time Slots',
      icon: 'pi pi-calendar-clock',
      command: () => handleFilterMenuClick('high-priority')
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

  // Handle navigation item click
  const handleNavigationClick = (itemId: string): void => {
    const item = navigationItems.find(i => i.id === itemId)
    if (!item) return
    
    setNavigationItems(prev => prev.map(navItem => ({
      ...navItem,
      active: navItem.id === itemId
    })))
    
    // Dispatch custom event for navigation functionality
    const navigationEvent: SubMenuNavigationEvent = {
      type: 'navigation',
      category: selectedCategory,
      item: item.label,
      itemId: item.id
    }
    
    window.dispatchEvent(new CustomEvent('subMenuNavigation', {
      detail: navigationEvent
    }))
    
    if (onNavigationItemClick) {
      onNavigationItemClick(item.label)
    }
  }

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

  // Handle filter button click (toggle menu)
  const handleFilterClick = (): void => {
    if (filterMenuRef.current) {
      filterMenuRef.current.toggle(event)
    }
  }


  // Mouse drag functionality for scrollable container
  const handleMouseDown = (e: React.MouseEvent): void => {
    if (!scrollContainerRef.current) return
    
    setIsDragging(true)
    setDragStart(e.clientX)
    setScrollStart(scrollContainerRef.current.scrollLeft)
    
    // Prevent text selection during drag
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (!isDragging || !scrollContainerRef.current) return
    
    const deltaX = e.clientX - dragStart
    scrollContainerRef.current.scrollLeft = scrollStart - deltaX
  }

  const handleMouseUp = (): void => {
    setIsDragging(false)
  }

  const handleMouseLeave = (): void => {
    setIsDragging(false)
  }

  // Touch events for mobile support
  const handleTouchStart = (e: React.TouchEvent): void => {
    if (!scrollContainerRef.current) return
    
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
    setScrollStart(scrollContainerRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent): void => {
    if (!isDragging || !scrollContainerRef.current) return
    
    const deltaX = e.touches[0].clientX - dragStart
    scrollContainerRef.current.scrollLeft = scrollStart - deltaX
  }

  const handleTouchEnd = (): void => {
    setIsDragging(false)
  }

  // Navigation items are now static and independent of selected category
  // They always show "Business support" and "Personal support"
  // No useEffect needed as the initial state is already correct

  return (
    <div className="task_tracker_sub_menu_section">
      {/* Filter Button with PrimeReact Menu */}
      <div className="task_tracker_sub_menu_filter_container">
        <Button
          className="task_tracker_sub_menu_filter_btn"
          onClick={handleFilterClick}
          icon="pi pi-filter"
          text
          aria-label="Filter options"
        />
            <Menu
              model={filterMenuItems}
              popup
              ref={filterMenuRef}
              className="task_tracker_filter_menu"
              hideOverlaysOnDocumentScrolling={false}
            />
      </div>

      {/* Scrollable Navigation Container */}
      <div className="task_tracker_sub_menu_scrollable_container">
        <div 
          ref={scrollContainerRef}
          className={`task_tracker_sub_menu_navigation_items ${isDragging ? 'dragging' : ''}`}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`task_tracker_sub_menu_nav_btn ${item.active ? 'active' : ''}`}
              onClick={() => handleNavigationClick(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Button with PrimeReact SpeedDial */}
      <div className="task_tracker_sub_menu_add_container">
        <SpeedDial
          model={speedDialItems}
          direction="left"
          style={{ 
            position: 'relative',
            right: 0,
            top: 'calc(50% - 2rem)',
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
