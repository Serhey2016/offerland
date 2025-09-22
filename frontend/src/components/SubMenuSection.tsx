import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'primereact/button'
import { Menu } from 'primereact/menu'
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
  const addMenuRef = useRef<Menu>(null)

  // PrimeReact menu items
  const filterMenuItems = [
    {
      label: 'All Items',
      icon: 'pi pi-filter',
      command: () => handleFilterMenuClick('all')
    },
    {
      label: 'Active Only',
      icon: 'pi pi-check-circle',
      command: () => handleFilterMenuClick('active')
    },
    {
      label: 'Completed',
      icon: 'pi pi-check',
      command: () => handleFilterMenuClick('completed')
    },
    {
      label: 'Priority High',
      icon: 'pi pi-exclamation-triangle',
      command: () => handleFilterMenuClick('high-priority')
    }
  ]

  const addMenuItems = [
    {
      label: 'Add Task',
      icon: 'pi pi-plus',
      command: () => handleAddMenuClick('task')
    },
    {
      label: 'Add Project',
      icon: 'pi pi-briefcase',
      command: () => handleAddMenuClick('project')
    },
    {
      label: 'Add Contact',
      icon: 'pi pi-user',
      command: () => handleAddMenuClick('contact')
    },
    {
      label: 'Add Note',
      icon: 'pi pi-file-edit',
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

  // Handle add button click (toggle menu)
  const handleAddClick = (): void => {
    if (addMenuRef.current) {
      addMenuRef.current.toggle(event)
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

  // Update navigation items based on selected category
  useEffect(() => {
    // Define navigation items for different categories
    const categoryNavigationMap: Record<Category, NavigationItem[]> = {
      'Agenda': [
        { id: 'daily-tasks', label: 'Daily Tasks', active: true },
        { id: 'scheduled', label: 'Scheduled', active: false }
      ],
      'Touchpoint': [
        { id: 'contacts', label: 'Contacts', active: true },
        { id: 'relationships', label: 'Relationships', active: false }
      ],
      'Inbox': [
        { id: 'new-items', label: 'New Items', active: true },
        { id: 'reviewed', label: 'Reviewed', active: false }
      ],
      'Waiting': [
        { id: 'orders', label: 'Orders', active: true },
        { id: 'subscriptions', label: 'Subscriptions', active: false },
        { id: 'published', label: 'Published', active: false }
      ],
      'Someday': [
        { id: 'future-ideas', label: 'Future Ideas', active: true }
      ],
      'Projects': [
        { id: 'active-projects', label: 'Active Projects', active: true },
        { id: 'planning', label: 'Planning', active: false }
      ],
      'Lockbook (Done)': [
        { id: 'completed-projects', label: 'Completed Projects', active: true },
        { id: 'completed-tasks', label: 'Completed Tasks', active: false }
      ],
      'Archive': [
        { id: 'archived-projects', label: 'Archived Projects', active: true },
        { id: 'archived-tasks', label: 'Archived Tasks', active: false }
      ]
    }

    const newNavigationItems = categoryNavigationMap[selectedCategory] || [
      { id: 'business-support', label: 'Business support', active: true },
      { id: 'personal-support', label: 'Personal support', active: false }
    ]

    setNavigationItems(newNavigationItems)
    console.log('Navigation items updated for category:', selectedCategory)
  }, [selectedCategory])

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

      {/* Add Button with PrimeReact Menu */}
      <div className="task_tracker_sub_menu_add_container">
        <Button
          className="task_tracker_sub_menu_add_btn"
          onClick={handleAddClick}
          icon="pi pi-plus"
          text
          aria-label="Add new item"
        />
            <Menu
              model={addMenuItems}
              popup
              ref={addMenuRef}
              className="task_tracker_add_menu"
              hideOverlaysOnDocumentScrolling={false}
            />
      </div>
    </div>
  )
}

export default SubMenuSection
