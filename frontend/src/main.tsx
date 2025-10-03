import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskTracker from './components/TaskTracker'

// PrimeReact стилі (глобально)
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// PrimeReact провайдер для глобальних налаштувань
import { PrimeReactProvider } from 'primereact/api'

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
        <PrimeReactProvider>
          <TaskTracker />
        </PrimeReactProvider>
      </React.StrictMode>
    )
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