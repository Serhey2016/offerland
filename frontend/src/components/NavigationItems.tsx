// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import React, { useState, useRef, useEffect } from 'react'
import { Category } from './shared/MenuHandlers'

interface NavigationItem {
  id: string
  label: string
  active?: boolean
}

interface NavigationItemsProps {
  selectedCategory: Category
  onNavigationItemClick?: (item: string) => void
}

const NavigationItems: React.FC<NavigationItemsProps> = ({
  selectedCategory,
  onNavigationItemClick
}) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    { id: 'business-support', label: 'Business support', active: false },
    { id: 'personal-support', label: 'Personal support', active: false }
  ])
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [scrollStart, setScrollStart] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Handle navigation item click with toggle functionality
  const handleNavigationClick = (itemId: string): void => {
    const item = navigationItems.find(i => i.id === itemId)
    if (!item) return
    
    // Toggle logic: if clicking the already active item, deactivate it
    const shouldActivate = !item.active
    
    setNavigationItems(prev => prev.map(navItem => ({
      ...navItem,
      active: navItem.id === itemId ? shouldActivate : false
    })))
    
    if (shouldActivate) {
      // Dispatch activation event
      const navigationEvent = {
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
    } else {
      // Dispatch deactivation event
      window.dispatchEvent(new CustomEvent('subMenuNavigationClear', {
        detail: { itemId: item.id }
      }))
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

  // Listen for category changes and deactivate navigation buttons
  useEffect(() => {
    const handleCategoryChange = () => {
      // Deactivate all navigation items when category changes
      setNavigationItems(prev => prev.map(item => ({
        ...item,
        active: false
      })))
    }

    // Listen to various category change events
    window.addEventListener('taskTrackerCategoryChange', handleCategoryChange)
    window.addEventListener('expandableMenuClick', handleCategoryChange)
    window.addEventListener('submenuItemClick', handleCategoryChange)
    window.addEventListener('navMenuCategoryChange', handleCategoryChange)

    return () => {
      window.removeEventListener('taskTrackerCategoryChange', handleCategoryChange)
      window.removeEventListener('expandableMenuClick', handleCategoryChange)
      window.removeEventListener('submenuItemClick', handleCategoryChange)
      window.removeEventListener('navMenuCategoryChange', handleCategoryChange)
    }
  }, [])

  return (
    <div className="task_tracker_sub_menu_scrollable_container task_tracker_navigation_items_mobile">
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
  )
}

export default NavigationItems
