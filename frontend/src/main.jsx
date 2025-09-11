import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskTracker from './components/TaskTracker.jsx'

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, looking for React mount point...')
  const mountPoint = document.getElementById('react-task-tracker')
  if (!mountPoint) {
    console.error('React mount point not found!')
    console.log('Available elements:', document.querySelectorAll('[id]'))
    console.log('Document body:', document.body.innerHTML.substring(0, 500))
    return
  }
  console.log('React mount point found, initializing...')
  console.log('Mount point element:', mountPoint)

  try {
    const root = createRoot(mountPoint)
    console.log('React root created, rendering TaskTracker...')
    root.render(<TaskTracker />)
    console.log('React TaskTracker rendered successfully!')
  } catch (error) {
    console.error('Error rendering React TaskTracker:', error)
  }
})


