import React, { useState } from 'react'

interface MenuItem {
  id: string
  category: string
  text: string
  expandable: boolean
  submenu?: SubmenuItem[]
}

interface SubmenuItem {
  id: string
  subcategory: string
  text: string
}

interface TaskTrackerLeftMenuProps {
  onCategoryChange?: (category: string) => void
  onSubcategoryChange?: (category: string, subcategory: string) => void
  initialCategory?: string
  initialSubcategory?: string
}

const TaskTrackerLeftMenu: React.FC<TaskTrackerLeftMenuProps> = ({
  onCategoryChange,
  onSubcategoryChange,
  initialCategory = 'Agenda',
  initialSubcategory = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)
  const [activeSubcategory, setActiveSubcategory] = useState<string>(initialSubcategory)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['Agenda']))
  
  // Component rendering with initial state

  const menuItems: MenuItem[] = [
    {
      id: 'touchpoint',
      category: 'Touchpoint',
      text: 'Touchpoint',
      expandable: true,
      submenu: [
        { id: 'contacts', subcategory: 'Contacts', text: 'Contacts' }
      ]
    },
    {
      id: 'inbox',
      category: 'Inbox',
      text: 'Inbox',
      expandable: true,
      submenu: [
        { id: 'favorites', subcategory: 'Favorites', text: 'Favorites' }
      ]
    },
    {
      id: 'backlog',
      category: 'Backlog',
      text: 'Backlog',
      expandable: true,
      submenu: [
        { id: 'projects', subcategory: 'Projects', text: 'Projects' },
        { id: 'tasks', subcategory: 'Tasks', text: 'Tasks' }
      ]
    },
    {
      id: 'agenda',
      category: 'Agenda',
      text: 'Agenda',
      expandable: true,
      submenu: []
    },
    {
      id: 'waiting',
      category: 'Waiting',
      text: 'Waiting',
      expandable: true,
      submenu: [
        { id: 'orders', subcategory: 'Orders', text: 'Orders' },
        { id: 'subscriptions', subcategory: 'Subscriptions', text: 'Subscriptions' },
        { id: 'published', subcategory: 'Published', text: 'Published' }
      ]
    },
    {
      id: 'someday',
      category: 'Someday',
      text: 'Someday',
      expandable: false
    },
    {
      id: 'projects',
      category: 'Projects',
      text: 'Projects',
      expandable: false
    },
    {
      id: 'lockbook',
      category: 'Done',
      text: 'Done',
      expandable: true,
      submenu: [
        { id: 'lockbook_projects', subcategory: 'Lockbook_Projects', text: 'Projects' },
        { id: 'lockbook_tasks', subcategory: 'Lockbook_Tasks', text: 'Tasks' }
      ]
    },
    {
      id: 'archive',
      category: 'Archive',
      text: 'Archive',
      expandable: true,
      submenu: [
        { id: 'archive_projects', subcategory: 'Archive_projects', text: 'Projects' },
        { id: 'archive_tasks', subcategory: 'Archive_Tasks', text: 'Tasks' }
      ]
    }
  ]

  const handleMenuClick = (category: string, expandable: boolean, event?: React.MouseEvent) => {
    // Check if the click was on a submenu item - if so, don't handle this click
    if (event && (event.target as HTMLElement).closest('.task_tracker_submenu_item')) {
      return
    }
    
    setActiveCategory(category)
    onCategoryChange?.(category)
    
    if (expandable) {
      // Always open the menu when clicking on expandable category
      // Close other menus and open only the clicked one
      setExpandedMenus(new Set([category]))
      
      // Dispatch event for TaskTracker component to handle
      window.dispatchEvent(new CustomEvent('expandableMenuClick', {
        detail: { category: category }
      }))
    } else {
      // For non-expandable items, close all menus
      setExpandedMenus(new Set())
    }
  }

  const handleSubmenuClick = (category: string, subcategory: string) => {
    setActiveSubcategory(subcategory)
    onSubcategoryChange?.(category, subcategory)
    
    // Dispatch event for TaskTracker component to handle
    window.dispatchEvent(new CustomEvent('submenuItemClick', {
      detail: { category: category, subcategory: subcategory }
    }))
  }

  const ChevronIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )


  return (
    <div className="task_tracker_left_side_section">
      <div className="task_tracker_left_side_menu">
        {menuItems.map((item) => (
          <div key={item.id} className="task_tracker_menu_item_container">
            <button
              className={`task_tracker_menu_item ${item.expandable ? 'expandable' : ''} ${expandedMenus.has(item.category) ? 'expanded' : ''} ${activeCategory === item.category ? 'active' : ''}`}
              data-category={item.category}
              data-target={`${item.id}-submenu`}
              onClick={(e) => handleMenuClick(item.category, item.expandable, e)}
            >
              <span className="task_tracker_menu_item_text">{item.text}</span>
              <span className="task_tracker_menu_item_arrow">
                <ChevronIcon />
              </span>
            </button>
            
            {item.expandable && item.submenu && (
              <div 
                className={`task_tracker_submenu ${expandedMenus.has(item.category) ? 'show' : ''}`}
                id={`${item.id}-submenu`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  e.stopImmediatePropagation()
                }}
              >
                {item.submenu.map((subItem) => (
                  <div
                    key={subItem.id}
                    className={`task_tracker_submenu_item ${activeSubcategory === subItem.subcategory ? 'active' : ''}`}
                    data-subcategory={subItem.subcategory}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      e.stopImmediatePropagation()
                      handleSubmenuClick(item.category, subItem.subcategory)
                    }}
                  >
                    {subItem.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskTrackerLeftMenu
