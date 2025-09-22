import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskTracker from './components/TaskTracker'
import { initializeSubMenuRenderer } from './components/SubMenuRenderer'

// Wait for DOM to be ready
function initializeReact() {
  const mountPoint = document.getElementById('react-task-tracker')
  if (!mountPoint) {
    console.error('❌ Main: React mount point not found!')
    return
  }

  try {
    const root = createRoot(mountPoint)
    root.render(
      <React.StrictMode>
        <TaskTracker />
      </React.StrictMode>
    )
    
    // Initialize SubMenu renderer
    initializeSubMenuRenderer()
  } catch (error) {
    console.error('❌ Main: Error rendering React TaskTracker:', error)
  }
}

// Initialize immediately if DOM is already ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReact)
} else {
  initializeReact()
}


