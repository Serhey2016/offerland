console.log('🚀 Main: Script loaded')

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Main: DOM loaded, initializing Task Tracker')
  
  // Проверяем, что JavaScript обработчики уже инициализированы
  setTimeout(() => {
    console.log('⏰ Main: Checking if JS handlers are ready...')
    
    const mountPoint = document.getElementById('react-task-tracker')
    if (!mountPoint) {
      console.error('❌ Main: React mount point not found!')
      return
    }

    console.log('✅ Main: Mount point found', mountPoint)

    try {
      console.log('🎯 Main: Creating Task Tracker content')
      
      // Simple Task Tracker without React
      let selectedCategory = 'Agenda'
      
      const updateContent = () => {
        console.log('🎨 Main: Updating content for category:', selectedCategory)
        
        const content = selectedCategory === 'Agenda' ? `
          <div>
            <h3>Agenda View</h3>
            <p>This is the Agenda view with sample tasks:</p>
            <ul>
              <li>Sample Task 1 (04:00 - 07:00)</li>
              <li>Sample Task 2 (10:00 - 12:00)</li>
              <li>Sample Task 3 (14:00 - 16:00)</li>
            </ul>
          </div>
        ` : `
          <div>
            <h3>${selectedCategory} View</h3>
            <p>This view is not implemented yet.</p>
          </div>
        `
        
        mountPoint.innerHTML = `
          <div style="margin-bottom: 10px; padding: 10px; background-color: #f0f0f0;">
            <h2>Task Tracker</h2>
            <p>Current category: ${selectedCategory}</p>
            
            <div style="margin-top: 10px;">
              <button onclick="window.setCategory('Agenda')" style="padding: 8px 16px; background-color: ${selectedCategory === 'Agenda' ? '#3B82F6' : '#e5e7eb'}; color: ${selectedCategory === 'Agenda' ? 'white' : 'black'}; border: none; border-radius: 4px; margin-right: 10px; cursor: pointer;">
                Agenda
              </button>
              
              <button onclick="window.setCategory('Touchpoint')" style="padding: 8px 16px; background-color: ${selectedCategory === 'Touchpoint' ? '#3B82F6' : '#e5e7eb'}; color: ${selectedCategory === 'Touchpoint' ? 'white' : 'black'}; border: none; border-radius: 4px; margin-right: 10px; cursor: pointer;">
                Touchpoint
              </button>
              
              <button onclick="window.setCategory('Waiting')" style="padding: 8px 16px; background-color: ${selectedCategory === 'Waiting' ? '#3B82F6' : '#e5e7eb'}; color: ${selectedCategory === 'Waiting' ? 'white' : 'black'}; border: none; border-radius: 4px; cursor: pointer;">
                Waiting
              </button>
            </div>
          </div>
          
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background-color: white;">
            ${content}
          </div>
        `
      }
      
      // Global function to set category
      window.setCategory = (category) => {
        console.log('🎯 Main: Category changed to:', category)
        selectedCategory = category
        updateContent()
        
        // Update menu states
        updateMenuStates(category)
      }
      
      // Function to update menu states
      const updateMenuStates = (category) => {
        // Update main menu items
        document.querySelectorAll('.task_tracker_menu_item').forEach(item => {
          item.classList.remove('active')
          const menuText = item.querySelector('.task_tracker_menu_item_text')
          if (menuText && menuText.textContent.trim() === category) {
            item.classList.add('active')
          }
        })
        
        // Update submenu visibility
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
          'Done': 'lockbook-submenu',
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
      
      // Add event listeners to existing menu items
      const addMenuEventListeners = () => {
        console.log('🎯 Main: Adding event listeners to menu items')
        
        // Add listeners to expandable menu items
        document.querySelectorAll('.task_tracker_menu_item.expandable').forEach(button => {
          const category = button.getAttribute('data-category')
          if (category) {
            button.addEventListener('click', (e) => {
              e.preventDefault()
              console.log('🎯 Main: Expandable menu clicked:', category)
              window.setCategory(category)
            })
            console.log('✅ Main: Added listener to expandable button:', category)
          }
        })
        
        // Add listeners to non-expandable menu items
        document.querySelectorAll('.task_tracker_menu_item:not(.expandable)').forEach(button => {
          const category = button.getAttribute('data-category')
          if (category) {
            button.addEventListener('click', (e) => {
              e.preventDefault()
              console.log('🎯 Main: Non-expandable menu clicked:', category)
              window.setCategory(category)
            })
            console.log('✅ Main: Added listener to non-expandable button:', category)
          }
        })
        
        // Add listeners to submenu items
        document.querySelectorAll('.task_tracker_submenu_item').forEach(item => {
          const subcategory = item.getAttribute('data-subcategory')
          if (subcategory) {
            item.addEventListener('click', (e) => {
              e.preventDefault()
              console.log('🎯 Main: Submenu item clicked:', subcategory)
              // For now, just log the subcategory click
              // Later we can implement subcategory functionality
            })
            console.log('✅ Main: Added listener to submenu item:', subcategory)
          }
        })
      }
      
      // Wait a bit for DOM to be fully ready, then add listeners
      setTimeout(() => {
        addMenuEventListeners()
      }, 500)
      
      // Initial render
      updateContent()
      updateMenuStates(selectedCategory) // Set initial menu state
      console.log('✅ Main: Task Tracker rendered successfully')
      
      // Test if content is working
      setTimeout(() => {
        const testButton = document.querySelector('button')
        if (testButton) {
          console.log('✅ Main: Test button found, Task Tracker is working!')
        } else {
          console.error('❌ Main: Test button not found, Task Tracker might not be working')
        }
      }, 1000)
    } catch (error) {
      console.error('❌ Main: Error rendering Task Tracker:', error)
    }
  }, 100) // Небольшая задержка, чтобы JS обработчики успели инициализироваться
})