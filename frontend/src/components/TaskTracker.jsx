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

  // Header configuration for different categories
  const headerConfig = {
    'Touchpoint': {
      title: 'Touchpoint',
      subtitle: 'Manage your contacts and meetings'
    },
    'Inbox': {
      title: 'Inbox',
      subtitle: 'Capture new tasks and ideas'
    },
    'Waiting': {
      title: 'Waiting',
      subtitle: 'Tasks waiting for others or external factors'
    },
    'Someday': {
      title: 'Someday',
      subtitle: 'Ideas and tasks for future consideration'
    },
    'Projects': {
      title: 'Projects',
      subtitle: 'Active projects and their progress'
    },
    'Lockbook (Done)': {
      title: 'Lockbook (Done)',
      subtitle: 'Completed tasks and achievements'
    },
    'Archive': {
      title: 'Archive',
      subtitle: 'Historical tasks and completed projects'
    }
  }

  // Get current greeting based on time
  const getGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    if (hour < 12) {
      return 'Good Morning.'
    } else if (hour < 17) {
      return 'Good Afternoon.'
    } else {
      return 'Good Evening.'
    }
  }

  // Update greeting section based on selected category
  useEffect(() => {
    const updateGreetingSection = () => {
      console.log('🔄 Updating greeting section for category:', selectedCategory)
      const greetingSection = document.querySelector('.filter_search_container_content_left_side .task_tracker_greeting_section')
      if (greetingSection) {
        console.log('✅ Greeting section found, updating content...')
        if (selectedCategory === 'Agenda') {
          // Show greeting section for Agenda
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
          // Show category header for other categories
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
      } else {
        console.log('❌ Greeting section not found in DOM')
      }
    }

    // Update immediately when category changes
    updateGreetingSection()
    
    // Also update when DOM is ready (in case component loads before DOM)
    const timer = setTimeout(updateGreetingSection, 100)
    
    return () => clearTimeout(timer)
  }, [selectedCategory])

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

          // Force update greeting section when menu item is clicked
          setTimeout(() => {
            console.log('🔄 Menu click - updating greeting section for:', category)
            const greetingSection = document.querySelector('.filter_search_container_content_left_side .task_tracker_greeting_section')
            if (greetingSection) {
              console.log('✅ Greeting section found in menu click handler')
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

      // Force update greeting section when nav menu changes
      setTimeout(() => {
        console.log('🔄 Nav menu change - updating greeting section for:', category)
        const greetingSection = document.querySelector('.filter_search_container_content_left_side .task_tracker_greeting_section')
        if (greetingSection) {
          console.log('✅ Greeting section found in nav menu handler')
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
