// Menu event handlers - extracted from TaskTracker.tsx
export type Category = 'Agenda' | 'Touchpoint' | 'Inbox' | 'Backlog' | 'Waiting' | 'Someday' | 'Projects' | 'Done' | 'Archive'
export type Subcategory = 'Contacts' | 'Favorites' | 'Orders' | 'Subscriptions' | 'Published' | 'Lockbook_Projects' | 'Lockbook_Tasks' | 'Archive_projects' | 'Archive_Tasks' | 'Projects' | 'Tasks'

export interface CategoryChangeEventDetail {
  category: Category
}

export interface SubmenuItemClickEventDetail {
  category: Category
  subcategory: Subcategory
}

export interface HeaderConfig {
  title: string
  subtitle?: string
  showBackButton?: boolean
}

// Category constants
export const CATEGORIES = {
  AGENDA: 'Agenda',
  TOUCHPOINT: 'Touchpoint',
  INBOX: 'Inbox',
  BACKLOG: 'Backlog',
  WAITING: 'Waiting',
  SOMEDAY: 'Someday',
  PROJECTS: 'Projects',
  LOCKBOOK: 'Done',
  ARCHIVE: 'Archive'
} as const

// Header configuration for different categories
export const headerConfig: Partial<Record<Category, HeaderConfig>> = {
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
  'Backlog': {
    title: 'Backlog',
    subtitle: 'Tasks planned for future execution'
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
  'Done': {
    title: 'Done',
    subtitle: 'Completed tasks'
  },
  'Archive': {
    title: 'Archive',
    subtitle: 'Archived tasks and projects'
  }
}

// Menu state management utilities
export const updateActiveMenuItems = (category: Category): void => {
  document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
    const menuText = item.querySelector('.task_tracker_menu_item_text')
    const isActive = menuText?.textContent?.trim() === category
    item.classList.toggle('active', isActive)
  })
}

export const toggleSubmenus = (category: Category): void => {
  const submenuMap: Record<Category, string> = {
    'Agenda': 'agenda-submenu',
    'Touchpoint': 'touchpoint-submenu',
    'Inbox': 'inbox-submenu',
    'Backlog': 'backlog-submenu',
    'Waiting': 'waiting-submenu',
    'Someday': '',
    'Projects': '',
    'Done': 'lockbook-submenu',
    'Archive': 'archive-submenu'
  }
  
  // Hide all submenus and remove expanded state
  document.querySelectorAll('.task_tracker_submenu').forEach(submenu => submenu.classList.remove('show'))
  document.querySelectorAll('.task_tracker_menu_item.expandable').forEach(button => button.classList.remove('expanded'))
  
  // Show submenu for selected category if it exists
  const submenuId = submenuMap[category]
  if (submenuId) {
    // Add a small delay to ensure React has updated the DOM
    setTimeout(() => {
      const submenu = document.getElementById(submenuId)
      const button = document.querySelector(`[data-category="${category}"]`)
      
      if (submenu) {
        submenu.classList.add('show')
      }
      
      if (button) {
        button.classList.add('expanded')
      }
    }, 10)
  }
}

export const updateMenuStates = (category: Category, subcategory: Subcategory): void => {
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

export const updateGreetingSection = (category: Category): void => {
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
