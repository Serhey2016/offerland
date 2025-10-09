import React, { useState, useEffect, useRef } from 'react'
import '../styles/NavigationMenu.css'

interface Category {
  name: string
  subcategories: string[]
}

const categories: Category[] = [
  {
    name: 'Touchpoint',
    subcategories: ['All', 'Contacts']
  },
  {
    name: 'Inbox',
    subcategories: ['All', 'Favorites', 'Projects', 'Tasks', 'Time slots']
  },
  {
    name: 'Backlog',
    subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
  },
  {
    name: 'Agenda',
    subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
  },
  {
    name: 'Waiting',
    subcategories: ['All', 'Published', 'Projects', 'Tasks', 'Time slots']
  },
  {
    name: 'Someday',
    subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
  },
  {
    name: 'Projects',
    subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
  },
  {
    name: 'Done',
    subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
  },
  {
    name: 'Archive',
    subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
  }
]

interface NavigationMenuProps {
  onCategoryChange?: (category: string) => void
  initialCategory?: string
}

type LineDirection = 'up' | 'down' | null

const NavigationMenu: React.FC<NavigationMenuProps> = ({ 
  onCategoryChange,
  initialCategory = 'Agenda'
}) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(
    categories.findIndex(cat => cat.name === initialCategory) !== -1
      ? categories.findIndex(cat => cat.name === initialCategory)
      : 3 // Default to Agenda
  )
  const [lineDirection, setLineDirection] = useState<LineDirection>('up')
  const menuRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)

  // Update category when it changes
  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(categories[currentCategoryIndex].name)
    }

    // Dispatch event to sync with other components
    const event = new CustomEvent('navMenuCategoryChange', {
      detail: { category: categories[currentCategoryIndex].name }
    })
    window.dispatchEvent(event)
  }, [currentCategoryIndex, onCategoryChange])

  // Listen for category changes from task tracker
  useEffect(() => {
    const handleTaskTrackerChange = (event: any) => {
      const { category } = event.detail
      const categoryIndex = categories.findIndex(cat => cat.name === category)
      
      if (categoryIndex !== -1 && categoryIndex !== currentCategoryIndex) {
        setCurrentCategoryIndex(categoryIndex)
      }
    }

    window.addEventListener('taskTrackerCategoryChange', handleTaskTrackerChange)
    
    return () => {
      window.removeEventListener('taskTrackerCategoryChange', handleTaskTrackerChange)
    }
  }, [currentCategoryIndex])

  const navigateUp = () => {
    setCurrentCategoryIndex(prev => 
      prev === 0 ? categories.length - 1 : prev - 1
    )
    setLineDirection('up')
  }

  const navigateDown = () => {
    setCurrentCategoryIndex(prev => 
      prev === categories.length - 1 ? 0 : prev + 1
    )
    setLineDirection('down')
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const touchEndY = e.changedTouches[0].clientY
      const dy = touchEndY - touchStartY.current

      if (Math.abs(dy) > 30) {
        if (dy > 30) {
          // Swipe down
          navigateUp()
        } else if (dy < -30) {
          // Swipe up
          navigateDown()
        }
      }
    }
  }

  const containerClassName = `task_tracker_nav_menu_container ${
    lineDirection === 'up' ? 'task_tracker_nav-up-active' : 
    lineDirection === 'down' ? 'task_tracker_nav-down-active' : 
    'task_tracker_nav-up-active'
  }`

  return (
    <div className={containerClassName}>
      {/* Top decorative lines */}
      <div className="task_tracker_nav_decorative_lines task_tracker_nav_decorative_lines_top">
        <div className="task_tracker_nav_line task_tracker_nav_line_top_1"></div>
        <div className="task_tracker_nav_line task_tracker_nav_line_top_2"></div>
      </div>
      
      <div 
        ref={menuRef}
        className="task_tracker_nav_menu"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button 
          className="task_tracker_nav-arrow task_tracker_nav-arrow-up"
          onClick={navigateUp}
          aria-label="Navigate up"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="37.062" height="21.82" viewBox="0 0 37.062 21.82">
            <path 
              d="M18.531-842.938,0-861.469,18.531-880l3.289,3.289L6.579-861.469,21.82-846.227Z"
              transform="translate(-842.938) rotate(90)" 
              fill="#333a49"
            />
          </svg>
        </button>
        
        <button 
          className="task_tracker_nav-arrow task_tracker_nav-arrow-down"
          onClick={navigateDown}
          aria-label="Navigate down"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="37.062" height="21.82" viewBox="0 0 37.062 21.82">
            <path 
              d="M18.531-842.938,0-861.469,18.531-880l3.289,3.289L6.579-861.469,21.82-846.227Z"
              transform="translate(880 21.82) rotate(-90)" 
              fill="#333a49"
            />
          </svg>
        </button>

        <div className="task_tracker_nav_menu_content">
          <div className="task_tracker_nav_menu_sub_category_name">
            <div className="task_tracker_nav_menu_category_name">
              {categories[currentCategoryIndex].name}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom decorative lines */}
      <div className="task_tracker_nav_decorative_lines task_tracker_nav_decorative_lines_bottom">
        <div className="task_tracker_nav_line task_tracker_nav_line_bottom_1"></div>
        <div className="task_tracker_nav_line task_tracker_nav_line_bottom_2"></div>
      </div>
    </div>
  )
}

export default NavigationMenu

