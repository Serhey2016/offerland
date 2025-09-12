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

const TaskTracker = () => {
  console.log('TaskTracker component rendering...')
  const [selectedCategory, setSelectedCategory] = useState('Agenda')
  const [selectedSubcategory, setSelectedSubcategory] = useState('Favorites')

  // Handle menu item clicks and synchronization
  useEffect(() => {
    const handleMenuClick = (event) => {
      const menuItem = event.target.closest('.task_tracker_menu_item')
      if (menuItem) {
        const menuText = menuItem.querySelector('.task_tracker_menu_item_text')
        if (menuText) {
          const category = menuText.textContent.trim()
          console.log('Task tracker menu clicked:', category)
          setSelectedCategory(category)
          
          // Update active states in task tracker menu
          document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
            item.classList.remove('active')
          })
          menuItem.classList.add('active')
          
          // Handle submenu toggle for Agenda
          if (category === 'Agenda') {
            const submenu = document.getElementById('agenda-submenu')
            if (submenu) {
              submenu.classList.add('show')
            }
      } else {
            // Hide all submenus when other categories are selected
            document.querySelectorAll('.task_tracker_submenu').forEach(submenu => {
              submenu.classList.remove('show')
            })
          }
          
          // Dispatch event to sync with nav menu
          const event = new CustomEvent('taskTrackerCategoryChange', {
            detail: { category: category }
          })
          window.dispatchEvent(event)
        }
      }
    }

    // Handle submenu item clicks
    const handleSubmenuClick = (event) => {
      const submenuItem = event.target.closest('.task_tracker_submenu_item')
      if (submenuItem) {
        const subcategory = submenuItem.getAttribute('data-subcategory')
        if (subcategory) {
          console.log('Submenu item clicked:', subcategory)
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
      console.log('Nav menu changed to:', category)
      setSelectedCategory(category)
      
      // Update active states in task tracker menu
      document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
        item.classList.remove('active')
        const menuText = item.querySelector('.task_tracker_menu_item_text')
        if (menuText && menuText.textContent.trim() === category) {
          item.classList.add('active')
        }
      })
      
      // Handle submenu toggle for Agenda
      if (category === 'Agenda') {
        const submenu = document.getElementById('agenda-submenu')
        if (submenu) {
          submenu.classList.add('show')
        }
      } else {
        // Hide all submenus when other categories are selected
        document.querySelectorAll('.task_tracker_submenu').forEach(submenu => {
          submenu.classList.remove('show')
        })
      }
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
    if (submenu) {
      submenu.classList.add('show')
    }
    
    // Set first submenu item as active by default
    const firstSubmenuItem = document.querySelector('.task_tracker_submenu_item[data-subcategory="Favorites"]')
    if (firstSubmenuItem) {
      firstSubmenuItem.classList.add('active')
    }
  }, [])

  const renderCalendarContent = () => {
    switch(selectedCategory) {
      case 'Agenda':
        return <AgendaView />
      case 'Touchpoint':
        return <TouchpointView />
      case 'Inbox':
        return <InboxView />
      case 'Waiting':
        return <WaitingView />
      case 'Someday':
        return <SomedayView />
      case 'Projects':
        return <ProjectsView />
      case 'Lockbook (Done)':
        return <LockbookView />
      case 'Archive':
        return <ArchiveView />
      default:
        return <AgendaView />
    }
  }

  return (
    <>
      {/* This will be rendered inside the existing HTML structure */}
      {renderCalendarContent()}
    </>
  )
}

export default TaskTracker
