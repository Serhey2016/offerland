import React, { useState, useEffect, useCallback } from 'react'
import TaskTrackerLeftMenu from './views/task_tracker_left_menu'
import SubMenuSection from './SubMenuSection'
import NavigationItems from './NavigationItems'
import SubcategoryDisplay from './SubcategoryDisplay'
import NavigationMenu from './NavigationMenu'
import AgendaView from './views/AgendaView'
import TouchpointView from './views/TouchpointView'
import GenericView from './views/GenericView'
import ContactsView from './views/subcategories/ContactsView'
import EmptyStateView from './views/EmptyStateView'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
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
  const [selectedNavigationItem, setSelectedNavigationItem] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const [showTeamDialog, setShowTeamDialog] = useState(false)


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
      setSelectedNavigationItem(null)
      
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
        setSelectedNavigationItem(null)
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
      setSelectedNavigationItem(null)
      
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
            setSelectedNavigationItem(null)
            
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
    // TODO: Implement filter logic based on selected filters
  }

  // Handle submenu add events
  const handleSubMenuAdd = (event: CustomEvent): void => {
    const { category, itemType } = event.detail
    // TODO: Implement add logic based on item type
  }

  // Handle submenu navigation events
  const handleSubMenuNavigation = (event: CustomEvent): void => {
    const { itemId } = event.detail
    
    // Set navigation item as active
    setSelectedNavigationItem(itemId)
    setSelectedSubcategory('')
    
    // Deactivate all left menu items
    document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
      item.classList.remove('active', 'expanded')
    })
    
    // Hide all submenus
    document.querySelectorAll('.task_tracker_submenu').forEach(submenu => {
      submenu.classList.remove('show')
    })
  }

  // Handle submenu navigation clear events
  const handleSubMenuNavigationClear = (event: CustomEvent): void => {
    setSelectedNavigationItem(null)
    
    // Restore previous category state
    updateActiveMenuItems(selectedCategory)
    toggleSubmenus(selectedCategory)
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
    window.addEventListener('subMenuNavigationClear', handleSubMenuNavigationClear as EventListener)
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
      window.removeEventListener('subMenuNavigationClear', handleSubMenuNavigationClear as EventListener)
      document.removeEventListener('click', handleDirectMenuClick)
    }
  }, [])

  // Listen for team dialog event from navigation button
  useEffect(() => {
    const handleShowTeamDialog = () => {
      setShowTeamDialog(true)
    }

    window.addEventListener('showTeamDialog', handleShowTeamDialog)

    return () => {
      window.removeEventListener('showTeamDialog', handleShowTeamDialog)
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
    // Don't render subcategory content if navigation item is selected
    if (selectedNavigationItem) return null
    
    if (!selectedSubcategory || !selectedCategory) return null

    // Touchpoint subcategories
    if (selectedCategory === CATEGORIES.TOUCHPOINT && selectedSubcategory === 'Contacts') {
      return <ContactsView />
    }
    
    // Inbox subcategories
    if (selectedCategory === CATEGORIES.INBOX && selectedSubcategory === 'Favorites') {
      return <GenericView category="Inbox" subcategory="Favorites" displayName="Favorites" />
    }
    
    // Waiting subcategories
    if (selectedCategory === CATEGORIES.WAITING) {
      if (selectedSubcategory === 'Orders') {
        return <GenericView category="Waiting" subcategory="Orders" displayName="Orders" />
      }
      if (selectedSubcategory === 'Subscriptions') {
        return <GenericView category="Waiting" subcategory="Subscriptions" displayName="Subscriptions" />
      }
      if (selectedSubcategory === 'Published') {
        return <GenericView category="Waiting" subcategory="Published" displayName="Published" />
      }
    }
    
    // Done (Lockbook) subcategories
    if (selectedCategory === CATEGORIES.LOCKBOOK) {
      if (selectedSubcategory === 'Lockbook_Projects') {
        return <GenericView category="Done" subcategory="Lockbook_Projects" displayName="Projects" />
      }
      if (selectedSubcategory === 'Lockbook_Tasks') {
        return <GenericView category="Done" subcategory="Lockbook_Tasks" displayName="Tasks" />
      }
    }
    
    // Archive subcategories
    if (selectedCategory === CATEGORIES.ARCHIVE) {
      if (selectedSubcategory === 'Archive_projects') {
        return <GenericView category="Archive" subcategory="Archive_projects" displayName="Projects" />
      }
      if (selectedSubcategory === 'Archive_Tasks') {
        return <GenericView category="Archive" subcategory="Archive_Tasks" displayName="Tasks" />
      }
    }
    
    return null
  }

  const renderMainContent = (): React.ReactElement => {
    // If navigation item is selected (Business support or Personal support), show empty state
    if (selectedNavigationItem) {
      return <EmptyStateView />
    }
    
    const viewComponents = {
      [CATEGORIES.AGENDA]: <AgendaView />,
      [CATEGORIES.TOUCHPOINT]: <TouchpointView />,
      [CATEGORIES.INBOX]: <GenericView category="Inbox" displayName="Inbox" />,
      [CATEGORIES.BACKLOG]: <GenericView category="Backlog" displayName="Backlog" />,
      [CATEGORIES.WAITING]: <GenericView category="Waiting" displayName="Waiting" />,
      [CATEGORIES.SOMEDAY]: <GenericView category="Someday" displayName="Someday" />,
      [CATEGORIES.PROJECTS]: <GenericView category="Projects" displayName="Projects" />,
      [CATEGORIES.LOCKBOOK]: <GenericView category="Done" displayName="Done" />,
      [CATEGORIES.ARCHIVE]: <GenericView category="Archive" displayName="Archive" />
    }
    
    return viewComponents[selectedCategory] || <AgendaView />
  }

  // Memoized callback functions to prevent infinite re-rendering
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category as Category)
    setSelectedSubcategory('')
    setSelectedNavigationItem(null)
  }, [])

  const handleSubcategoryChange = useCallback((category: string, subcategory: string) => {
    setSelectedCategory(category as Category)
    setSelectedSubcategory(subcategory as Subcategory)
    setSelectedNavigationItem(null)
  }, [])

  const handleSubcategoryDisplayChange = useCallback((subcategory: string) => {
    setSelectedSubcategory(subcategory as Subcategory)
    setSelectedNavigationItem(null)
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
          onNavigationItemClick: (item) => {},
          selectedCategory: selectedCategory,
          selectedSubcategory: selectedSubcategory,
          onFilterClick: () => {},
          onAddClick: () => {},
        }),
        React.createElement(NavigationItems, {
          selectedCategory: selectedCategory,
          onNavigationItemClick: (item) => {}
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
    ),
    React.createElement(NavigationMenu, {
      onCategoryChange: handleCategoryChange,
      initialCategory: selectedCategory
    }),
    React.createElement(Dialog, {
      header: 'Team Component',
      visible: showTeamDialog,
      style: { width: '400px' },
      onHide: () => setShowTeamDialog(false),
      modal: true,
      dismissableMask: false
    },
      React.createElement('div', { style: { textAlign: 'center', padding: '20px' } },
        React.createElement('p', { style: { marginBottom: '20px', fontSize: '16px' } },
          'Component is currently under development'
        ),
        React.createElement(Button, {
          label: 'OK',
          onClick: () => setShowTeamDialog(false),
          style: { minWidth: '100px' }
        })
      )
    )
  )
}

export default TaskTracker
