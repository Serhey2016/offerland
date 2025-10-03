import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskTrackerMinimal from './components/TaskTrackerMinimal'

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
        <TaskTrackerMinimal />
      </React.StrictMode>
    )
    
    console.log('✅ Main: React TaskTracker Minimal mounted successfully!')
  } catch (error) {
    console.error('❌ Main: Error rendering React TaskTracker Minimal:', error)
    console.error('❌ Main: Error stack:', error.stack)
  }
}

// Initialize immediately if DOM is already ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReact)
} else {
  initializeReact()
}
