import React, { useState, useEffect } from 'react'
import TaskDesign from './TaskDesign'
import AgendaView from './views/AgendaView'

// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

// Types defined inline to avoid import issues
type Category = 'Agenda' | 'Touchpoint' | 'Inbox' | 'Waiting' | 'Someday' | 'Projects' | 'Lockbook (Done)' | 'Archive'
type Subcategory = 'Contacts' | 'Favorites' | 'Orders' | 'Subscriptions' | 'Published' | 'Lockbook_Projects' | 'Lockbook_Tasks' | 'Archive_projects' | 'Archive_Tasks'

interface CategoryChangeEventDetail {
  category: Category
}

interface SubmenuItemClickEventDetail {
  category: Category
  subcategory: Subcategory
}

interface HeaderConfig {
  title: string
  subtitle?: string
  showBackButton?: boolean
}

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
  // Simple JSX to help Vite plugin detect React - must be at the top
  if (false) return <div>Loading...</div>
  
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES.AGENDA)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory>('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Debug logging
  // console.log('🔄 TaskTracker: Component rendered', {
  //   selectedCategory,
  //   selectedSubcategory,
  //   isUpdating
  // })

  // Helper function to update menu states
  const updateMenuStates = (category: Category, subcategory: Subcategory): void => {
    // Update main menu items
    updateActiveMenuItems(category)

    // Update submenu items in left sidebar
    document.querySelectorAll('.task_tracker_submenu_item').forEach(item => {
      const isActive = item.getAttribute('data-subcategory') === subcategory
      item.classList.toggle('active', isActive)
    })

    // Update subcategory items in center display
    const subcategoryDisplay = document.getElementById('subcategory-display')
    subcategoryDisplay?.querySelectorAll('.task_tracker_subcategory_item').forEach(item => {
      const isActive = item.getAttribute('data-subcategory') === subcategory
      item.classList.toggle('active', isActive)
    })
  }

  // Helper function to toggle submenus
  const toggleSubmenus = (category: Category): void => {
    const submenuMap: Record<Category, string> = {
      'Agenda': 'agenda-submenu',
      'Touchpoint': 'touchpoint-submenu',
      'Inbox': 'inbox-submenu',
      'Waiting': 'waiting-submenu',
      'Someday': '',
      'Projects': '',
      'Lockbook (Done)': 'lockbook-submenu',
      'Archive': 'archive-submenu'
    }
    
    // Hide all submenus and remove expanded state
    document.querySelectorAll('.task_tracker_submenu').forEach(submenu => submenu.classList.remove('show'))
    document.querySelectorAll('.task_tracker_menu_item.expandable').forEach(button => button.classList.remove('expanded'))
    
    // Show submenu for selected category if it exists
    const submenuId = submenuMap[category]
    if (submenuId) {
      const submenu = document.getElementById(submenuId)
      const button = document.querySelector(`[data-category="${category}"]`)
      submenu?.classList.add('show')
      button?.classList.add('expanded')
    }
  }

  // Helper function to update active menu items
  const updateActiveMenuItems = (category: Category): void => {
    document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
      const menuText = item.querySelector('.task_tracker_menu_item_text')
      const isActive = menuText?.textContent?.trim() === category
      item.classList.toggle('active', isActive)
    })
  }

  // Helper function to update subcategory display in center
  const updateSubcategoryDisplay = (category: Category): void => {
    const subcategoryDisplay = document.getElementById('subcategory-display')
    if (!subcategoryDisplay) return

    const submenuMap: Record<Category, string> = {
      'Agenda': 'agenda-submenu',
      'Touchpoint': 'touchpoint-submenu',
      'Inbox': 'inbox-submenu',
      'Waiting': 'waiting-submenu',
      'Someday': '',
      'Projects': '',
      'Lockbook (Done)': 'lockbook-submenu',
      'Archive': 'archive-submenu'
    }

    const submenu = submenuMap[category] ? document.getElementById(submenuMap[category]) : null
    const submenuItems = submenu?.querySelectorAll('.task_tracker_submenu_item')
    
    if (!submenuItems || submenuItems.length === 0) {
      subcategoryDisplay.classList.remove('show')
      subcategoryDisplay.innerHTML = ''
      return
    }

    // Generate HTML for subcategory items
    const itemsHTML = Array.from(submenuItems).map(item => {
      const subcategory = item.getAttribute('data-subcategory') || ''
      const text = item.textContent || ''
      return `<div class="task_tracker_subcategory_item" data-subcategory="${subcategory}">${text}</div>`
    }).join('')

    subcategoryDisplay.classList.add('show')
    subcategoryDisplay.innerHTML = `<div class="task_tracker_subcategory_items">${itemsHTML}</div>`

    // Add click handlers for subcategory items
    const handleSubcategoryClick = (e: Event) => {
      const target = e.target as HTMLElement
      const subcategory = target.getAttribute('data-subcategory') as Subcategory
      
      // Update active states in both displays
      subcategoryDisplay.querySelectorAll('.task_tracker_subcategory_item').forEach(el => 
        el.classList.toggle('active', el === target))
      submenu?.querySelectorAll('.task_tracker_submenu_item').forEach(el => 
        el.classList.toggle('active', el.getAttribute('data-subcategory') === subcategory))
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('submenuItemClick', {
        detail: { category, subcategory }
      }))
    }

    subcategoryDisplay.querySelectorAll('.task_tracker_subcategory_item').forEach(item => {
      item.addEventListener('click', handleSubcategoryClick)
    })
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
    console.log('📡 TaskTracker: Event received:', event)
    
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
      updateSubcategoryDisplay(category)
      
      console.log('✅ TaskTracker: State updated successfully')
      
      // Dispatch event to sync with nav menu
      const customEvent = new CustomEvent('taskTrackerCategoryChange', {
        detail: { category: category }
      })
      window.dispatchEvent(customEvent)

      // Update greeting section
      updateGreetingSection(category)
      
      setTimeout(() => {
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
        updateSubcategoryDisplay(category)
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
      updateMenuStates(category, '' as Subcategory)
      
      // Handle submenu toggle for expandable categories
      toggleSubmenus(category)
      updateSubcategoryDisplay(category)

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
            updateSubcategoryDisplay(category)
            
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
    console.log('🔍 TaskTracker: Current state:', { selectedCategory, selectedSubcategory, isUpdating })
    
    // Add all event listeners
    window.addEventListener('expandableMenuClick', handleExpandableMenuClick as EventListener)
    window.addEventListener('submenuItemClick', handleSubmenuItemClick as EventListener)
    window.addEventListener('navMenuCategoryChange', handleNavMenuChange as EventListener)
    document.addEventListener('click', handleDirectMenuClick)
    
    console.log('✅ TaskTracker: Event listeners added')
    
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

    // Initialize subcategory display for default category
    updateSubcategoryDisplay(selectedCategory)

    return () => {
      // Cleanup all event listeners
      window.removeEventListener('expandableMenuClick', handleExpandableMenuClick as EventListener)
      window.removeEventListener('submenuItemClick', handleSubmenuItemClick as EventListener)
      window.removeEventListener('navMenuCategoryChange', handleNavMenuChange as EventListener)
      document.removeEventListener('click', handleDirectMenuClick)
    }
  }, [])

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
      [CATEGORIES.AGENDA]: React.createElement(AgendaView),
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
            React.createElement('h3', null, 'Inbox View'),
            React.createElement(TaskDesign, {
              title: 'Sample Task',
              description: 'This is a sample task in the inbox',
              timeRange: '2 hours',
              category: 'Inbox',
              priority: 'high',
              dateAdded: 'Today',
              onNotesClick: () => console.log('Notes clicked'),
              onDropdownClick: () => console.log('Dropdown clicked')
            })
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

  return React.createElement('div', { 
    className: 'react-task-tracker',
    key: `${selectedCategory}-${selectedSubcategory}`
  },
    renderCalendarContent()
  )
}

export default TaskTracker
