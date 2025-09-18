import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskTracker from './components/TaskTracker'

console.log('🚀 Main: Script loaded')
console.log('🔍 Main: React imported:', React)
console.log('🔍 Main: createRoot imported:', createRoot)
console.log('🔍 Main: TaskTracker imported:', TaskTracker)

// Wait for DOM to be ready
function initializeReact() {
  console.log('🚀 Main: DOM loaded, initializing React TaskTracker')
  console.log('🔍 Main: Checking React availability:', { React, createRoot })
  
  const mountPoint = document.getElementById('react-task-tracker')
  if (!mountPoint) {
    console.error('❌ Main: React mount point not found!')
    return
  }

  console.log('✅ Main: Mount point found', mountPoint)

  try {
    console.log('🎯 Main: Creating React root and rendering TaskTracker with Strict Mode')
    const root = createRoot(mountPoint)
    root.render(
      <React.StrictMode>
        <TaskTracker />
      </React.StrictMode>
    )
    console.log('✅ Main: TaskTracker rendered successfully with Strict Mode')
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


