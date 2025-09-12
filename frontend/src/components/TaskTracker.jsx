import React, { useState, useEffect } from 'react'

// Import all view components
import AgendaView from './views/AgendaView'
import TouchpointView from './views/TouchpointView'
import InboxView from './views/InboxView'
import WaitingView from './views/WaitingView'
import SomedayView from './views/SomedayView'
import ProjectsView from './views/ProjectsView'
import LockbookView from './views/LockbookView'
import ArchiveView from './views/ArchiveView'

// Constants
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

const SUBCATEGORIES = {
  [CATEGORIES.AGENDA]: ['Favorites'],
  [CATEGORIES.WAITING]: ['Orders', 'Subscriptions', 'Published'],
  [CATEGORIES.TOUCHPOINT]: ['Contacts'],
  [CATEGORIES.LOCKBOOK]: ['Projects', 'Tasks'],
  [CATEGORIES.ARCHIVE]: ['Projects', 'Tasks'],
  [CATEGORIES.INBOX]: ['All', 'Today', 'This Week', 'Later'],
  [CATEGORIES.SOMEDAY]: ['All', 'Today', 'This Week', 'Later'],
  [CATEGORIES.PROJECTS]: ['All', 'Today', 'This Week', 'Later']
}

const EXPANDABLE_CATEGORIES = [
  CATEGORIES.AGENDA,
  CATEGORIES.TOUCHPOINT,
  CATEGORIES.WAITING,
  CATEGORIES.LOCKBOOK,
  CATEGORIES.ARCHIVE
]

// Utility functions
const getGreetingMessage = () => {
  const now = new Date()
  const hour = now.getHours()
  if (hour < 12) return 'Good Morning.'
  if (hour < 17) return 'Good Afternoon.'
  return 'Good Evening.'
}

const getSubmenuId = (category) => {
  const submenuMap = {
    [CATEGORIES.AGENDA]: 'agenda-submenu',
    [CATEGORIES.TOUCHPOINT]: 'touchpoint-submenu',
    [CATEGORIES.WAITING]: 'waiting-submenu',
    [CATEGORIES.LOCKBOOK]: 'lockbook-submenu',
    [CATEGORIES.ARCHIVE]: 'archive-submenu'
  }
  return submenuMap[category]
}

const updateActiveMenuItems = (activeCategory) => {
  document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
    item.classList.remove('active')
  })
  
  const activeItem = document.querySelector(`[data-category="${activeCategory}"]`)
  if (activeItem) {
    activeItem.classList.add('active')
  }
}

const toggleSubmenus = (activeCategory) => {
  // Hide all submenus
  document.querySelectorAll('.task_tracker_submenu').forEach(submenu => {
    submenu.classList.remove('show')
  })
  
  // Remove expanded class from all expandable buttons
  document.querySelectorAll('.task_tracker_menu_item.expandable').forEach(button => {
    button.classList.remove('expanded')
  })
  
  // Show submenu for active category if it's expandable
  if (EXPANDABLE_CATEGORIES.includes(activeCategory)) {
    const submenuId = getSubmenuId(activeCategory)
    const submenu = document.getElementById(submenuId)
    const button = document.querySelector(`[data-category="${activeCategory}"]`)
    
    if (submenu && button) {
      submenu.classList.add('show')
      button.classList.add('expanded')
    }
  }
}

const TaskTracker = () => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES.AGENDA)
  const [selectedSubcategory, setSelectedSubcategory] = useState('Favorites')

  // Update subcategories in right panel
  const updateSubcategories = () => {
    const subCatMenu = document.getElementById('sub-cat-menu')
    if (subCatMenu) {
      const subcategories = SUBCATEGORIES[selectedCategory] || []
      subCatMenu.innerHTML = subcategories.map(subcat => 
        `<div class="task_tracker_sub_cat_menu_item">${subcat}</div>`
      ).join('')
    }
  }

  // Header configuration for different categories
  const headerConfig = {
    [CATEGORIES.TOUCHPOINT]: {
      title: 'Touchpoint',
      subtitle: 'Manage your contacts and meetings'
    },
    [CATEGORIES.INBOX]: {
      title: 'Inbox',
      subtitle: 'Capture new tasks and ideas'
    },
    [CATEGORIES.WAITING]: {
      title: 'Waiting',
      subtitle: 'Tasks waiting for others or external factors'
    },
    [CATEGORIES.SOMEDAY]: {
      title: 'Someday',
      subtitle: 'Ideas and tasks for future consideration'
    },
    [CATEGORIES.PROJECTS]: {
      title: 'Projects',
      subtitle: 'Active projects and their progress'
    },
    [CATEGORIES.LOCKBOOK]: {
      title: 'Lockbook (Done)',
      subtitle: 'Completed tasks and achievements'
    },
    [CATEGORIES.ARCHIVE]: {
      title: 'Archive',
      subtitle: 'Historical tasks and completed projects'
    }
  }

  // Update greeting section and subcategories based on selected category
  useEffect(() => {
    const updateGreetingSection = () => {
      const greetingSection = document.querySelector('.filter_search_container_content_left_side .task_tracker_greeting_section')
      if (greetingSection) {
        if (selectedCategory === CATEGORIES.AGENDA) {
          const greeting = getGreetingMessage()
          greetingSection.innerHTML = `
            <h1 class="task_tracker_greeting_main">
              <span class="task_tracker_greeting_time">${greeting}</span>
              <span class="task_tracker_greeting_name">Guest</span>
            </h1>
            <p class="task_tracker_greeting_subtitle">Hope you're having a productive day!</p>
          `
        } else {
          const header = headerConfig[selectedCategory]
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
    }

    // Update immediately when category changes
    updateGreetingSection()
    
    
    updateSubcategories()
    
    // Also update when DOM is ready (in case component loads before DOM)
    const timer = setTimeout(() => {
      updateGreetingSection()
      updateSubcategories()
    }, 100)
    
    // Force update greeting section after subcategories update
    setTimeout(() => {
      updateGreetingSection()
    }, 150)
    
    return () => clearTimeout(timer)
  }, [selectedCategory])

  // Handle expandable menu clicks
  useEffect(() => {
    const handleExpandableMenuClick = (event) => {
      const category = event.detail.category
      
      // Update React state
      setSelectedCategory(category)
      
      // Update UI
      updateActiveMenuItems(category)
      toggleSubmenus(category)
      
      // Dispatch event to sync with nav menu
      const customEvent = new CustomEvent('taskTrackerCategoryChange', {
        detail: { category: category }
      })
      window.dispatchEvent(customEvent)

      // Update greeting section and subcategories
      setTimeout(() => {
        updateGreetingSection()
        updateSubcategories()
      }, 100)
    }

    // Add event listener for expandable menu clicks
    window.addEventListener('expandableMenuClick', handleExpandableMenuClick)

    return () => {
      window.removeEventListener('expandableMenuClick', handleExpandableMenuClick)
    }
  }, [])

  // Handle menu item clicks and synchronization
  useEffect(() => {
    const handleMenuClick = (event) => {
      const menuItem = event.target.closest('.task_tracker_menu_item')
      if (menuItem) {
        const menuText = menuItem.querySelector('.task_tracker_menu_item_text')
        if (menuText) {
          const category = menuText.textContent.trim()
          
          // Always prevent default for expandable categories
          if (menuItem.classList.contains('expandable')) {
            event.preventDefault()
            event.stopPropagation()
          }
          
          // Update React state
          setSelectedCategory(category)
          
          // Update UI
          updateActiveMenuItems(category)
          toggleSubmenus(category)
          
          // Dispatch event to sync with nav menu
          const customEvent = new CustomEvent('taskTrackerCategoryChange', {
            detail: { category: category }
          })
          window.dispatchEvent(customEvent)

          // Update greeting section and subcategories
          setTimeout(() => {
            updateGreetingSection()
            updateSubcategories()
          }, 50)
        }
      }
    }

    // Handle submenu item clicks
    const handleSubmenuClick = (event) => {
      const submenuItem = event.target.closest('.task_tracker_submenu_item')
      if (submenuItem) {
        const subcategory = submenuItem.getAttribute('data-subcategory')
        if (subcategory) {
          setSelectedSubcategory(subcategory)
          
          // Update active states in submenu
          document.querySelectorAll('.task_tracker_submenu_item').forEach(item => {
            item.classList.remove('active')
          })
          submenuItem.classList.add('active')
        }
      }
    }

    // Listen for changes from nav menu
    const handleNavMenuChange = (event) => {
      const { category } = event.detail
      setSelectedCategory(category)
      
      // Update active states in task tracker menu
      document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
        item.classList.remove('active')
        const menuText = item.querySelector('.task_tracker_menu_item_text')
        if (menuText && menuText.textContent.trim() === category) {
          item.classList.add('active')
        }
      })
      
      // Handle submenu toggle for expandable categories
      // First, hide all submenus
      document.querySelectorAll('.task_tracker_submenu').forEach(submenu => {
        submenu.classList.remove('show')
      })
      
      // Remove expanded class from all expandable buttons
      document.querySelectorAll('.task_tracker_menu_item.expandable').forEach(button => {
        button.classList.remove('expanded')
      })
      
      // Show submenu for selected category if it's expandable
      if (category === 'Agenda') {
        const submenu = document.getElementById('agenda-submenu')
        const button = document.querySelector('[data-category="Agenda"]')
        if (submenu && button) {
          submenu.classList.add('show')
          button.classList.add('expanded')
        }
      } else if (category === 'Touchpoint') {
        const submenu = document.getElementById('touchpoint-submenu')
        const button = document.querySelector('[data-category="Touchpoint"]')
        if (submenu && button) {
          submenu.classList.add('show')
          button.classList.add('expanded')
        }
      } else if (category === 'Waiting') {
        const submenu = document.getElementById('waiting-submenu')
        const button = document.querySelector('[data-category="Waiting"]')
        if (submenu && button) {
          submenu.classList.add('show')
          button.classList.add('expanded')
        }
      } else if (category === 'Lockbook (Done)') {
        const submenu = document.getElementById('lockbook-submenu')
        const button = document.querySelector('[data-category="Lockbook (Done)"]')
        if (submenu && button) {
          submenu.classList.add('show')
          button.classList.add('expanded')
        }
      } else if (category === 'Archive') {
        const submenu = document.getElementById('archive-submenu')
        const button = document.querySelector('[data-category="Archive"]')
        if (submenu && button) {
          submenu.classList.add('show')
          button.classList.add('expanded')
        }
      }

      // Force update greeting section when nav menu changes
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

    document.addEventListener('click', handleMenuClick)
    document.addEventListener('click', handleSubmenuClick)
    window.addEventListener('navMenuCategoryChange', handleNavMenuChange)
    
    return () => {
      document.removeEventListener('click', handleMenuClick)
      document.removeEventListener('click', handleSubmenuClick)
      window.removeEventListener('navMenuCategoryChange', handleNavMenuChange)
    }
  }, [])

  // Initialize submenu on component mount
  useEffect(() => {
    // Show Agenda submenu by default since Agenda is selected
    const submenu = document.getElementById('agenda-submenu')
    const agendaButton = document.querySelector('[data-category="Agenda"]')
    if (submenu && agendaButton) {
      submenu.classList.add('show')
      agendaButton.classList.add('expanded')
    }
    
    // Set first submenu item as active by default
    const firstSubmenuItem = document.querySelector('.task_tracker_submenu_item[data-subcategory="Favorites"]')
    if (firstSubmenuItem) {
      firstSubmenuItem.classList.add('active')
    }
  }, [])

  const renderCalendarContent = () => {
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
      <div key={selectedCategory}>
        {renderCalendarContent()}
      </div>
    </>
  )
}

export default TaskTracker
