import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskTracker from './components/TaskTracker.jsx'

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  const mountPoint = document.getElementById('react-task-tracker')
  if (!mountPoint) {
    console.error('React mount point not found!')
    return
  }

  try {
    const root = createRoot(mountPoint)
    root.render(<TaskTracker />)
  } catch (error) {
    console.error('Error rendering React TaskTracker:', error)
  }
})


