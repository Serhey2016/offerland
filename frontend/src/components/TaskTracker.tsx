import React, { useState, useEffect, useCallback } from 'react'
import TaskTrackerLeftMenu from './views/task_tracker_left_menu'
import SubMenuSection from './SubMenuSection'
import NavigationItems from './NavigationItems'
import SubcategoryDisplay from './SubcategoryDisplay'
import AgendaView from './views/AgendaView'
import TouchpointView from './views/TouchpointView'
import InboxView from './views/InboxView'
import BacklogView from './views/BacklogView'
import WaitingView from './views/WaitingView'
import SomedayView from './views/SomedayView'
import ProjectsView from './views/ProjectsView'
import LockbookView from './views/LockbookView'
import ArchiveView from './views/ArchiveView'
import ContactsView from './views/subcategories/ContactsView'
import FavoritesView from './views/subcategories/FavoritesView'
import {
  Category,
  Subcategory,
  CategoryChangeEventDetail,
  SubmenuItemClickEventDetail,
  CATEGORIES,
  updateActiveMenuItems,
  toggleSubmenus,
  updateMenuStates,
  updateGreetingSection
} from './shared/MenuHandlers'

// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

const TaskTracker = () => {
  // console.log('🚀 TaskTracker: Component rendering') // Disabled to reduce console spam
  
  // Simple JSX to help Vite plugin detect React - must be at the top
  if (false) return <div>Loading...</div>
  
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES.AGENDA)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [renderKey, setRenderKey] = useState(0)


  // Helper function to update subcategory display in center

  // Helper function to update subcategory display in center
  const updateSubcategoryDisplay = (category: Category): void => {
    const subcategoryDisplay = document.getElementById('subcategory-display')
    if (!subcategoryDisplay) return

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


  // Handle expandable menu clicks
  const handleExpandableMenuClick = (event: CustomEvent<CategoryChangeEventDetail>): void => {
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
      updateSubcategoryDisplay(category)
      
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
    
    if (menuItem) {
      const menuText = menuItem.querySelector('.task_tracker_menu_item_text')
      if (menuText) {
        const category = menuText.textContent?.trim() as Category
        
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

  // Handle submenu filter events
  const handleSubMenuFilter = (event: CustomEvent): void => {
    const { category, filters } = event.detail
    console.log('SubMenu Filter:', { category, filters })
    // TODO: Implement filter logic based on selected filters
  }

  // Handle submenu add events
  const handleSubMenuAdd = (event: CustomEvent): void => {
    const { category, itemType } = event.detail
    console.log('SubMenu Add:', { category, itemType })
    // TODO: Implement add logic based on item type
  }

  // Handle submenu navigation events
  const handleSubMenuNavigation = (event: CustomEvent): void => {
    const { category, item, itemId } = event.detail
    console.log('SubMenu Navigation:', { category, item, itemId })
    // TODO: Implement navigation logic
  }

  // Initialize and manage all event listeners
  useEffect(() => {
    // Add all event listeners
    window.addEventListener('expandableMenuClick', handleExpandableMenuClick as EventListener)
    window.addEventListener('submenuItemClick', handleSubmenuItemClick as EventListener)
    window.addEventListener('navMenuCategoryChange', handleNavMenuChange as EventListener)
    window.addEventListener('subMenuFilter', handleSubMenuFilter as EventListener)
    window.addEventListener('subMenuAdd', handleSubMenuAdd as EventListener)
    window.addEventListener('subMenuNavigation', handleSubMenuNavigation as EventListener)
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

    // Initialize subcategory display for default category
    updateSubcategoryDisplay(selectedCategory)

    return () => {
      // Cleanup all event listeners
      window.removeEventListener('expandableMenuClick', handleExpandableMenuClick as EventListener)
      window.removeEventListener('submenuItemClick', handleSubmenuItemClick as EventListener)
      window.removeEventListener('navMenuCategoryChange', handleNavMenuChange as EventListener)
      window.removeEventListener('subMenuFilter', handleSubMenuFilter as EventListener)
      window.removeEventListener('subMenuAdd', handleSubMenuAdd as EventListener)
      window.removeEventListener('subMenuNavigation', handleSubMenuNavigation as EventListener)
      document.removeEventListener('click', handleDirectMenuClick)
    }
  }, [])

  // Track state changes for menu updates
  useEffect(() => {
    if (selectedCategory) {
      updateMenuStates(selectedCategory, selectedSubcategory)
      setRenderKey(prev => prev + 1) // Update render key to prevent duplicate keys
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

  const renderSubcategoryContent = (): React.ReactElement | null => {
    if (!selectedSubcategory || !selectedCategory) return null

    // Touchpoint subcategories
    if (selectedCategory === CATEGORIES.TOUCHPOINT && selectedSubcategory === 'Contacts') {
      return <ContactsView />
    }
    
    // Inbox subcategories
    if (selectedCategory === CATEGORIES.INBOX && selectedSubcategory === 'Favorites') {
      return <FavoritesView />
    }
    
    // TODO: Add more subcategory views as needed
    return null
  }

  const renderMainContent = (): React.ReactElement => {
    const viewComponents = {
      [CATEGORIES.AGENDA]: <AgendaView />,
      [CATEGORIES.TOUCHPOINT]: <TouchpointView />,
      [CATEGORIES.INBOX]: <InboxView />,
      [CATEGORIES.BACKLOG]: <BacklogView />,
      [CATEGORIES.WAITING]: <WaitingView />,
      [CATEGORIES.SOMEDAY]: <SomedayView />,
      [CATEGORIES.PROJECTS]: <ProjectsView />,
      [CATEGORIES.LOCKBOOK]: <LockbookView />,
      [CATEGORIES.ARCHIVE]: <ArchiveView />
    }
    
    return viewComponents[selectedCategory] || <AgendaView />
  }

  // Memoized callback functions to prevent infinite re-rendering
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category as Category)
    setSelectedSubcategory('')
  }, [])

  const handleSubcategoryChange = useCallback((category: string, subcategory: string) => {
    setSelectedCategory(category as Category)
    setSelectedSubcategory(subcategory as Subcategory)
  }, [])

  const handleSubcategoryDisplayChange = useCallback((subcategory: string) => {
    setSelectedSubcategory(subcategory as Subcategory)
  }, [])

  return React.createElement('div', { 
    className: 'react-task-tracker',
    key: `task-tracker-${renderKey}`
  },
    React.createElement('section', { className: 'container task_tracker_sides_separator' },
      React.createElement(TaskTrackerLeftMenu, {
        onCategoryChange: handleCategoryChange,
        onSubcategoryChange: handleSubcategoryChange,
        initialCategory: selectedCategory,
        initialSubcategory: selectedSubcategory
      }),
      React.createElement('div', { className: 'task_tracker_right_side_section' },
        React.createElement(SubMenuSection, {
          onNavigationItemClick: (item) => console.log('SubMenu Navigation clicked:', item),
          selectedCategory: selectedCategory,
          selectedSubcategory: selectedSubcategory,
          onFilterClick: () => console.log('SubMenu Filter clicked'),
          onAddClick: () => console.log('SubMenu Add clicked'),
        }),
        React.createElement(NavigationItems, {
          selectedCategory: selectedCategory,
          onNavigationItemClick: (item) => console.log('Navigation clicked:', item)
        }),
        React.createElement(SubcategoryDisplay, {
          selectedCategory: selectedCategory,
          selectedSubcategory: selectedSubcategory,
          onSubcategoryChange: handleSubcategoryDisplayChange
        }),
        React.createElement('div', { className: 'list_of_tasks_task_tracker task_tracker_tasks_sides_separator' },
          renderSubcategoryContent() || renderMainContent()
        )
      )
    )
  )
}

export default TaskTracker
