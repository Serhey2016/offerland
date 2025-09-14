import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskTracker from './components/TaskTracker'

console.log('🚀 Main: Script loaded')

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Main: DOM loaded, initializing React TaskTracker')
  
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
                console.log('🎯 Main: Creating React root and rendering TaskTracker')
                const root = createRoot(mountPoint)
                root.render(React.createElement(TaskTracker))
                console.log('✅ Main: TaskTracker rendered successfully')
    } catch (error) {
      console.error('❌ Main: Error rendering React TaskTracker:', error)
    }
  }, 100) // Небольшая задержка, чтобы JS обработчики успели инициализироваться
})


