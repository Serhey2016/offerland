import React, { useState, useEffect } from 'react'
import { Category, Subcategory, CategoryChangeEventDetail, SubmenuItemClickEventDetail, HeaderConfig } from '../types'

// Import all view components - TEMPORARILY DISABLED due to Vite TSX errors
// import AgendaView from './views/AgendaView'
// import TouchpointView from './views/TouchpointView'
// import ContactsView from './views/ContactsView'
// import FavoritesView from './views/FavoritesView'
// import OrdersView from './views/OrdersView'
// import SubscriptionsView from './views/SubscriptionsView'
// import PublishedView from './views/PublishedView'
// import InboxView from './views/InboxView'
// import WaitingView from './views/WaitingView'
// import SomedayView from './views/SomedayView'
// import ProjectsView from './views/ProjectsView'
// import LockbookView from './views/LockbookView'
// import LockbookProjectsView from './views/LockbookProjectsView'
// import LockbookTasksView from './views/LockbookTasksView'
// import ArchiveView from './views/ArchiveView'
// import ArchiveProjectsView from './views/ArchiveProjectsView'
// import ArchiveTasksView from './views/ArchiveTasksView'

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
const headerConfig: Partial<Record<Category, HeaderConfig>> = {
  'Agenda': {
    title: 'Agenda',
    subtitle: 'Your daily agenda and schedule'
  },
  'Touchpoint': {
    title: 'Touchpoint',
    subtitle: 'Manage your contacts and relationships'
  },
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
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES.AGENDA)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory>('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Debug logging
  console.log('🔄 TaskTracker: Component rendered', {
    selectedCategory,
    selectedSubcategory,
    isUpdating
  })

  // Helper function to update menu states
  const updateMenuStates = (category: Category, subcategory: Subcategory): void => {
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
  const toggleSubmenus = (category: Category): void => {
    // Hide all submenus
    document.querySelectorAll('.task_tracker_submenu').forEach(submenu => {
      submenu.classList.remove('show')
    })
    
    // Remove expanded class from all expandable buttons
    document.querySelectorAll('.task_tracker_menu_item.expandable').forEach(button => {
      button.classList.remove('expanded')
    })
    
    // Show submenu for selected category if it's expandable
    const submenuMap: Record<Category, string> = {
      'Agenda': 'agenda-submenu',
      'Touchpoint': 'touchpoint-submenu',
      'Inbox': 'inbox-submenu',
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
  const updateActiveMenuItems = (category: Category): void => {
      document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
        item.classList.remove('active')
        const menuText = item.querySelector('.task_tracker_menu_item_text')
        if (menuText && menuText.textContent.trim() === category) {
          item.classList.add('active')
        }
      })
  }

  // Helper function to update subcategories
  const updateSubcategories = (): void => {
    // This function can be expanded if needed for subcategory updates
  }

  // Update greeting section based on category
  const updateGreetingSection = (category: Category): void => {
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
            } else {
              // Fallback for categories without specific header config
              greetingSection.innerHTML = `
                <h1 class="task_tracker_greeting_main">
                  <span class="task_tracker_greeting_time">${category}</span>
                </h1>
                <p class="task_tracker_greeting_subtitle">Manage your tasks and projects</p>
              `
            }
          }
        }
      }, 50)
    }

  // Handle expandable menu clicks
  const handleExpandableMenuClick = (event: CustomEvent<CategoryChangeEventDetail>): void => {
    const category = event.detail.category
    console.log('🎯 TaskTracker: Expandable menu clicked', { category, isUpdating })
    
    // Prevent multiple simultaneous updates
    if (isUpdating) {
      console.log('⏸️ TaskTracker: Update blocked - already updating')
      return
    }
    
    setIsUpdating(true)
    
    try {
      console.log('✅ TaskTracker: Starting state update', { category })
      
      // Update React state
      setSelectedCategory(category)
      setSelectedSubcategory('')
      
      // Update UI
      updateActiveMenuItems(category)
      toggleSubmenus(category)
      
      console.log('✅ TaskTracker: State updated successfully')
      
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
  const handleSubmenuItemClick = (event: CustomEvent<SubmenuItemClickEventDetail>): void => {
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
  const handleNavMenuChange = (event: CustomEvent<CategoryChangeEventDetail>): void => {
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
  const handleDirectMenuClick = (event: Event): void => {
    const target = event.target as Element
    const menuItem = target.closest('.task_tracker_menu_item')
    console.log('🖱️ TaskTracker: Direct menu click detected', { target, menuItem })
    
    if (menuItem) {
      const menuText = menuItem.querySelector('.task_tracker_menu_item_text')
      if (menuText) {
        const category = menuText.textContent?.trim() as Category
        console.log('📝 TaskTracker: Menu text found', { category })
        
        // Only handle non-expandable categories
        const nonExpandableCategories: Category[] = ['Someday', 'Projects']
        if (category && nonExpandableCategories.includes(category)) {
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
    console.log('🚀 TaskTracker: Initializing event listeners')
    
    // Проверяем, что DOM элементы существуют
    const expandableButtons = document.querySelectorAll('.task_tracker_menu_item.expandable')
    console.log('🔍 TaskTracker: Found expandable buttons in React', expandableButtons.length)
    
    // Add all event listeners
    window.addEventListener('expandableMenuClick', handleExpandableMenuClick)
    window.addEventListener('submenuItemClick', handleSubmenuItemClick)
    window.addEventListener('navMenuCategoryChange', handleNavMenuChange)
    document.addEventListener('click', handleDirectMenuClick)
    
    console.log('✅ TaskTracker: Event listeners added')
    
    // Тестируем отправку события
    setTimeout(() => {
      console.log('🧪 TaskTracker: Testing event system...')
      const testEvent = new CustomEvent('expandableMenuClick', {
        detail: { category: 'Touchpoint' }
      })
      console.log('📡 TaskTracker: Dispatching test event', testEvent)
      window.dispatchEvent(testEvent)
    }, 500)
    
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

  const renderCalendarContent = (): React.ReactElement => {
    // Handle subcategory views first
    if (selectedSubcategory && selectedCategory) {
      // Touchpoint subcategories
      if (selectedCategory === CATEGORIES.TOUCHPOINT) {
        if (selectedSubcategory === 'Contacts') return React.createElement('div', { className: 'task_tracker_calendar_container' },
          React.createElement('div', { className: 'touchpoint-container' },
            React.createElement('div', { className: 'touchpoint-content' },
              React.createElement('h3', null, 'Contacts View (Loading...)'),
              React.createElement('p', null, 'Contacts functionality will be implemented here.')
            )
          )
        )
      }
      
      // Waiting subcategories
      if (selectedCategory === CATEGORIES.WAITING) {
        if (selectedSubcategory === 'Orders') return React.createElement('div', { className: 'task_tracker_calendar_container' },
          React.createElement('div', { className: 'touchpoint-container' },
            React.createElement('div', { className: 'touchpoint-content' },
              React.createElement('h3', null, 'Orders View (Loading...)'),
              React.createElement('p', null, 'Orders functionality will be implemented here.')
            )
          )
        )
        if (selectedSubcategory === 'Subscriptions') return React.createElement('div', { className: 'task_tracker_calendar_container' },
          React.createElement('div', { className: 'touchpoint-container' },
            React.createElement('div', { className: 'touchpoint-content' },
              React.createElement('h3', null, 'Subscriptions View (Loading...)'),
              React.createElement('p', null, 'Subscriptions functionality will be implemented here.')
            )
          )
        )
        if (selectedSubcategory === 'Published') return React.createElement('div', { className: 'task_tracker_calendar_container' },
          React.createElement('div', { className: 'touchpoint-container' },
            React.createElement('div', { className: 'touchpoint-content' },
              React.createElement('h3', null, 'Published View (Loading...)'),
              React.createElement('p', null, 'Published functionality will be implemented here.')
            )
          )
        )
      }
      
      // Inbox subcategories
      if (selectedCategory === CATEGORIES.INBOX) {
        if (selectedSubcategory === 'Favorites') return React.createElement('div', { className: 'task_tracker_calendar_container' },
          React.createElement('div', { className: 'touchpoint-container' },
            React.createElement('div', { className: 'touchpoint-content' },
              React.createElement('h3', null, 'Favorites View (Loading...)'),
              React.createElement('p', null, 'Favorites functionality will be implemented here.')
            )
          )
        )
      }
      
      // Lockbook subcategories
      if (selectedCategory === CATEGORIES.LOCKBOOK) {
        if (selectedSubcategory === 'Lockbook_Projects') return React.createElement('div', { className: 'task_tracker_calendar_container' },
          React.createElement('div', { className: 'touchpoint-container' },
            React.createElement('div', { className: 'touchpoint-content' },
              React.createElement('h3', null, 'Lockbook Projects View (Loading...)'),
              React.createElement('p', null, 'Lockbook Projects functionality will be implemented here.')
            )
          )
        )
        if (selectedSubcategory === 'Lockbook_Tasks') return React.createElement('div', { className: 'task_tracker_calendar_container' },
          React.createElement('div', { className: 'touchpoint-container' },
            React.createElement('div', { className: 'touchpoint-content' },
              React.createElement('h3', null, 'Lockbook Tasks View (Loading...)'),
              React.createElement('p', null, 'Lockbook Tasks functionality will be implemented here.')
            )
          )
        )
      }
      
      // Archive subcategories
      if (selectedCategory === CATEGORIES.ARCHIVE) {
        if (selectedSubcategory === 'Archive_projects') return React.createElement('div', { className: 'task_tracker_calendar_container' },
          React.createElement('div', { className: 'touchpoint-container' },
            React.createElement('div', { className: 'touchpoint-content' },
              React.createElement('h3', null, 'Archive Projects View (Loading...)'),
              React.createElement('p', null, 'Archive Projects functionality will be implemented here.')
            )
          )
        )
        if (selectedSubcategory === 'Archive_Tasks') return React.createElement('div', { className: 'task_tracker_calendar_container' },
          React.createElement('div', { className: 'touchpoint-container' },
            React.createElement('div', { className: 'touchpoint-content' },
              React.createElement('h3', null, 'Archive Tasks View (Loading...)'),
              React.createElement('p', null, 'Archive Tasks functionality will be implemented here.')
            )
          )
        )
      }
    }
    
    const viewComponents = {
      [CATEGORIES.AGENDA]: React.createElement('div', { className: 'task_tracker_calendar_container' },
        React.createElement('div', { className: 'touchpoint-container' },
          React.createElement('div', { className: 'touchpoint-content' },
            React.createElement('h3', null, 'Agenda View (Loading...)'),
            React.createElement('p', null, 'Agenda functionality will be implemented here.')
          )
        )
      ),
      [CATEGORIES.TOUCHPOINT]: React.createElement('div', { className: 'task_tracker_calendar_container' },
        React.createElement('div', { className: 'touchpoint-container' },
          React.createElement('div', { className: 'touchpoint-content' },
            React.createElement('h3', null, 'Touchpoint View (Loading...)'),
            React.createElement('p', null, 'Touchpoint functionality will be implemented here.')
          )
        )
      ),
      [CATEGORIES.INBOX]: React.createElement('div', { className: 'task_tracker_calendar_container' },
        React.createElement('div', { className: 'touchpoint-container' },
          React.createElement('div', { className: 'touchpoint-content' },
            React.createElement('h3', null, 'Inbox View (Loading...)'),
            React.createElement('p', null, 'Inbox functionality will be implemented here.')
          )
        )
      ),
      [CATEGORIES.WAITING]: React.createElement('div', { className: 'task_tracker_calendar_container' },
        React.createElement('div', { className: 'touchpoint-container' },
          React.createElement('div', { className: 'touchpoint-content' },
            React.createElement('h3', null, 'Waiting View (Loading...)'),
            React.createElement('p', null, 'Waiting functionality will be implemented here.')
          )
        )
      ),
      [CATEGORIES.SOMEDAY]: React.createElement('div', { className: 'task_tracker_calendar_container' },
        React.createElement('div', { className: 'touchpoint-container' },
          React.createElement('div', { className: 'touchpoint-content' },
            React.createElement('h3', null, 'Someday View (Loading...)'),
            React.createElement('p', null, 'Someday functionality will be implemented here.')
          )
        )
      ),
      [CATEGORIES.PROJECTS]: React.createElement('div', { className: 'task_tracker_calendar_container' },
        React.createElement('div', { className: 'touchpoint-container' },
          React.createElement('div', { className: 'touchpoint-content' },
            React.createElement('h3', null, 'Projects View (Loading...)'),
            React.createElement('p', null, 'Projects functionality will be implemented here.')
          )
        )
      ),
      [CATEGORIES.LOCKBOOK]: React.createElement('div', { className: 'task_tracker_calendar_container' },
        React.createElement('div', { className: 'touchpoint-container' },
          React.createElement('div', { className: 'touchpoint-content' },
            React.createElement('h3', null, 'Lockbook View (Loading...)'),
            React.createElement('p', null, 'Lockbook functionality will be implemented here.')
          )
        )
      ),
      [CATEGORIES.ARCHIVE]: React.createElement('div', { className: 'task_tracker_calendar_container' },
        React.createElement('div', { className: 'touchpoint-container' },
          React.createElement('div', { className: 'touchpoint-content' },
            React.createElement('h3', null, 'Archive View (Loading...)'),
            React.createElement('p', null, 'Archive functionality will be implemented here.')
          )
        )
      )
    }
    
    return viewComponents[selectedCategory] || viewComponents[CATEGORIES.AGENDA]
  }

  return React.createElement(React.Fragment, null,
    React.createElement('div', { key: `${selectedCategory}-${selectedSubcategory}` },
      renderCalendarContent()
    )
  )
}

export default TaskTracker