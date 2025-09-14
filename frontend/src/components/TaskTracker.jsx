import React, { useState, useEffect } from 'react'

// Import all view components
import AgendaView from './views/AgendaView'
import TouchpointView from './views/TouchpointView'
import ContactsView from './views/ContactsView'
import FavoritesView from './views/FavoritesView'
import OrdersView from './views/OrdersView'
import SubscriptionsView from './views/SubscriptionsView'
import PublishedView from './views/PublishedView'
import InboxView from './views/InboxView'
import WaitingView from './views/WaitingView'
import SomedayView from './views/SomedayView'
import ProjectsView from './views/ProjectsView'
import LockbookView from './views/LockbookView'
import LockbookProjectsView from './views/LockbookProjectsView'
import LockbookTasksView from './views/LockbookTasksView'
import ArchiveView from './views/ArchiveView'
import ArchiveProjectsView from './views/ArchiveProjectsView'
import ArchiveTasksView from './views/ArchiveTasksView'

// Category constants
const CATEGORIES = {
  AGENDA: 'Agenda',
  TOUCHPOINT: 'Touchpoint',
  INBOX: 'Inbox',
  WAITING: 'Waiting',
  SOMEDAY: 'Someday',
  PROJECTS: 'Projects',
  LOCKBOOK: 'Lockbook (Done)',
  ARCHIVE: 'Archive'
}

// Header configuration for different categories
const headerConfig = {
  'Inbox': {
    title: 'Inbox',
    subtitle: 'All your tasks in one place'
  },
  'Waiting': {
    title: 'Waiting',
    subtitle: 'Tasks waiting for others'
  },
  'Someday': {
    title: 'Someday',
    subtitle: 'Tasks for future consideration'
  },
  'Projects': {
    title: 'Projects',
    subtitle: 'Your active projects'
  },
  'Lockbook (Done)': {
    title: 'Lockbook (Done)',
    subtitle: 'Completed tasks'
  },
  'Archive': {
    title: 'Archive',
    subtitle: 'Archived tasks and projects'
  }
}

const TaskTracker = () => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.AGENDA)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Helper function to update menu states
  const updateMenuStates = (category, subcategory) => {
    // Update main menu items
    document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
      item.classList.remove('active')
      const menuText = item.querySelector('.task_tracker_menu_item_text')
      if (menuText && menuText.textContent.trim() === category) {
        item.classList.add('active')
      }
    })

    // Update submenu items
    document.querySelectorAll('.task_tracker_submenu_item').forEach(item => {
      item.classList.remove('active')
      if (item.getAttribute('data-subcategory') === subcategory) {
        item.classList.add('active')
      }
    })
  }

  // Helper function to toggle submenus
  const toggleSubmenus = (category) => {
    // Hide all submenus
    document.querySelectorAll('.task_tracker_submenu').forEach(submenu => {
      submenu.classList.remove('show')
    })
    
    // Remove expanded class from all expandable buttons
    document.querySelectorAll('.task_tracker_menu_item.expandable').forEach(button => {
      button.classList.remove('expanded')
    })
    
    // Show submenu for selected category if it's expandable
    const submenuMap = {
      'Agenda': 'agenda-submenu',
      'Touchpoint': 'touchpoint-submenu',
      'Waiting': 'waiting-submenu',
      'Lockbook (Done)': 'lockbook-submenu',
      'Archive': 'archive-submenu'
    }
    
    const submenuId = submenuMap[category]
    if (submenuId) {
      const submenu = document.getElementById(submenuId)
      const button = document.querySelector(`[data-category="${category}"]`)
      
      if (submenu && button) {
        submenu.classList.add('show')
        button.classList.add('expanded')
      }
    }
  }

  // Helper function to update active menu items
  const updateActiveMenuItems = (category) => {
      document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
        item.classList.remove('active')
        const menuText = item.querySelector('.task_tracker_menu_item_text')
        if (menuText && menuText.textContent.trim() === category) {
          item.classList.add('active')
        }
      })
  }

  // Helper function to update subcategories
  const updateSubcategories = () => {
    // This function can be expanded if needed for subcategory updates
  }

  // Update greeting section based on category
  const updateGreetingSection = (category) => {
      setTimeout(() => {
        const greetingSection = document.querySelector('.filter_search_container_content_left_side .task_tracker_greeting_section')
        if (greetingSection) {
          if (category === 'Agenda') {
            const now = new Date()
            const hour = now.getHours()
            let greeting = ''
            if (hour < 12) {
              greeting = 'Good Morning.'
            } else if (hour < 17) {
              greeting = 'Good Afternoon.'
            } else {
              greeting = 'Good Evening.'
            }
            
            greetingSection.innerHTML = `
              <h1 class="task_tracker_greeting_main">
                <span class="task_tracker_greeting_time">${greeting}</span>
                <span class="task_tracker_greeting_name">Guest</span>
              </h1>
              <p class="task_tracker_greeting_subtitle">Hope you're having a productive day!</p>
            `
          } else {
            const header = headerConfig[category]
            if (header) {
              greetingSection.innerHTML = `
                <h1 class="task_tracker_greeting_main">
                  <span class="task_tracker_greeting_time">${header.title}</span>
                </h1>
                <p class="task_tracker_greeting_subtitle">${header.subtitle}</p>
              `
            }
          }
        }
      }, 50)
    }

  // Handle expandable menu clicks
  const handleExpandableMenuClick = (event) => {
    const category = event.detail.category
    
    // Prevent multiple simultaneous updates
    if (isUpdating) {
      return
    }
    
    setIsUpdating(true)
    
    try {
      // Update React state
      setSelectedCategory(category)
      setSelectedSubcategory('')
      
      // Update UI
      updateActiveMenuItems(category)
      toggleSubmenus(category)
      
      // Dispatch event to sync with nav menu
      const customEvent = new CustomEvent('taskTrackerCategoryChange', {
        detail: { category: category }
      })
      window.dispatchEvent(customEvent)

      // Update subcategories
      setTimeout(() => {
        updateSubcategories()
        setIsUpdating(false)
      }, 100)
      
    } catch (error) {
      console.error('Error in expandable menu click:', error)
      setIsUpdating(false)
    }
  }

  // Handle submenu item clicks from external events
  const handleSubmenuItemClick = (event) => {
    const { category, subcategory } = event.detail
    
    // Prevent multiple simultaneous updates
    if (isUpdating) {
      return
    }
    
    setIsUpdating(true)
    
    // Update state with a small delay to ensure proper update
    setTimeout(() => {
      try {
        setSelectedCategory(category)
        setSelectedSubcategory(subcategory)
        setIsUpdating(false)
      } catch (error) {
        console.error('Error in submenu item click:', error)
        setIsUpdating(false)
      }
    }, 10)
  }

  // Handle nav menu changes
  const handleNavMenuChange = (event) => {
    const { category } = event.detail
    
    // Prevent multiple simultaneous updates
    if (isUpdating) {
      return
    }
    
    setIsUpdating(true)
    
    try {
      setSelectedCategory(category)
      setSelectedSubcategory('')
      
      // Update active states in task tracker menu
      updateMenuStates(category, '')
      
      // Handle submenu toggle for expandable categories
      toggleSubmenus(category)

      // Update greeting section
      updateGreetingSection(category)
      
      setTimeout(() => {
        setIsUpdating(false)
      }, 50)
      
    } catch (error) {
      console.error('Error in nav menu change:', error)
      setIsUpdating(false)
    }
  }

  // Track state changes for menu updates
  useEffect(() => {
    if (selectedCategory) {
      updateMenuStates(selectedCategory, selectedSubcategory)
    }
  }, [selectedCategory, selectedSubcategory])

  // Safety timeout to reset updating state
  useEffect(() => {
    if (isUpdating) {
      const timeout = setTimeout(() => {
        setIsUpdating(false)
      }, 2000) // 2 second safety timeout
      
      return () => clearTimeout(timeout)
    }
  }, [isUpdating])

  // Handle direct menu clicks (for non-expandable categories)
  const handleDirectMenuClick = (event) => {
    const menuItem = event.target.closest('.task_tracker_menu_item')
    if (menuItem) {
      const menuText = menuItem.querySelector('.task_tracker_menu_item_text')
      if (menuText) {
        const category = menuText.textContent.trim()
        
        // Only handle non-expandable categories
        const nonExpandableCategories = ['Inbox', 'Someday', 'Projects']
        if (nonExpandableCategories.includes(category)) {
          event.preventDefault()
          event.stopPropagation()
          
          // Prevent multiple simultaneous updates
          if (isUpdating) {
            return
          }
          
          setIsUpdating(true)
          
          try {
            setSelectedCategory(category)
            setSelectedSubcategory('')
            
            // Update UI
            updateActiveMenuItems(category)
            toggleSubmenus(category)
            
            // Dispatch event to sync with nav menu
            const customEvent = new CustomEvent('taskTrackerCategoryChange', {
              detail: { category: category }
            })
            window.dispatchEvent(customEvent)
            
            setTimeout(() => {
              setIsUpdating(false)
            }, 50)
            
          } catch (error) {
            console.error('Error in direct menu click:', error)
            setIsUpdating(false)
          }
        }
      }
    }
  }

  // Initialize and manage all event listeners
  useEffect(() => {
    // Add all event listeners
    window.addEventListener('expandableMenuClick', handleExpandableMenuClick)
    window.addEventListener('submenuItemClick', handleSubmenuItemClick)
    window.addEventListener('navMenuCategoryChange', handleNavMenuChange)
    document.addEventListener('click', handleDirectMenuClick)
    
    // Initialize task tracker menu
    const taskTrackerMenuItems = document.querySelectorAll('.task_tracker_menu_item')
    taskTrackerMenuItems.forEach(item => {
      item.classList.remove('active')
    })
    
    // Set the first menu item as active by default
    if (taskTrackerMenuItems.length > 0) {
      taskTrackerMenuItems[0].classList.add('active')
    }

    // Show Agenda submenu by default
    const submenu = document.getElementById('agenda-submenu')
    const agendaButton = document.querySelector('[data-category="Agenda"]')
    if (submenu && agendaButton) {
      submenu.classList.add('show')
      agendaButton.classList.add('expanded')
    }

    return () => {
      // Cleanup all event listeners
      window.removeEventListener('expandableMenuClick', handleExpandableMenuClick)
      window.removeEventListener('submenuItemClick', handleSubmenuItemClick)
      window.removeEventListener('navMenuCategoryChange', handleNavMenuChange)
      document.removeEventListener('click', handleDirectMenuClick)
    }
  }, [])

  const renderCalendarContent = () => {
    // Handle subcategory views first
    if (selectedSubcategory && selectedCategory) {
      // Touchpoint subcategories
      if (selectedCategory === CATEGORIES.TOUCHPOINT) {
        if (selectedSubcategory === 'Contacts') return <ContactsView />
        if (selectedSubcategory === 'Favorites') return <FavoritesView />
        if (selectedSubcategory === 'Orders') return <OrdersView />
        if (selectedSubcategory === 'Subscriptions') return <SubscriptionsView />
        if (selectedSubcategory === 'Published') return <PublishedView />
      }
      
      // Waiting subcategories
      if (selectedCategory === CATEGORIES.WAITING) {
        if (selectedSubcategory === 'Orders') return <OrdersView />
        if (selectedSubcategory === 'Subscriptions') return <SubscriptionsView />
      }
      
      // Lockbook subcategories
      if (selectedCategory === CATEGORIES.LOCKBOOK) {
        if (selectedSubcategory === 'Lockbook_Projects') return <LockbookProjectsView />
        if (selectedSubcategory === 'Lockbook_Tasks') return <LockbookTasksView />
      }
      
      // Archive subcategories
      if (selectedCategory === CATEGORIES.ARCHIVE) {
        if (selectedSubcategory === 'Archive_projects') return <ArchiveProjectsView />
        if (selectedSubcategory === 'Archive_Tasks') return <ArchiveTasksView />
      }
    }
    
    const viewComponents = {
      [CATEGORIES.AGENDA]: <AgendaView />,
      [CATEGORIES.TOUCHPOINT]: <TouchpointView />,
      [CATEGORIES.INBOX]: <InboxView />,
      [CATEGORIES.WAITING]: <WaitingView />,
      [CATEGORIES.SOMEDAY]: <SomedayView />,
      [CATEGORIES.PROJECTS]: <ProjectsView />,
      [CATEGORIES.LOCKBOOK]: <LockbookView />,
      [CATEGORIES.ARCHIVE]: <ArchiveView />
    }
    
    return viewComponents[selectedCategory] || <AgendaView />
  }

  return (
    <>
      {/* This will be rendered inside the existing HTML structure */}
      <div key={`${selectedCategory}-${selectedSubcategory}`}>
        {renderCalendarContent()}
      </div>
    </>
  )
}

export default TaskTracker