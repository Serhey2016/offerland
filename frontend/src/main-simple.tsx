import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskTrackerSimple from './components/TaskTrackerSimple'

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
        <TaskTrackerSimple />
      </React.StrictMode>
    )
    
    console.log('✅ Main: React TaskTracker mounted successfully!')
  } catch (error) {
    console.error('❌ Main: Error rendering React TaskTracker:', error)
    console.error('❌ Main: Error stack:', error.stack)
  }
}

// Initialize immediately if DOM is already ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReact)
} else {
  initializeReact()
}
