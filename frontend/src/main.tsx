import React from 'react'
import { createRoot } from 'react-dom/client'
import TaskTracker from './components/TaskTracker'
import { initializeSubMenuRenderer } from './components/SubMenuRenderer'

// PrimeReact стилі (глобально)
import 'primereact/resources/themes/lara-light-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// PrimeReact провайдер для глобальних налаштувань
import { PrimeReactProvider } from 'primereact/api'

// Wait for DOM to be ready
function initializeReact() {
  console.log('🔧 Main: Initializing React...')
  console.log('🔧 Main: Document ready state:', document.readyState)
  console.log('🔧 Main: Window location:', window.location.href)
  
  const mountPoint = document.getElementById('react-task-tracker')
  if (!mountPoint) {
    console.error('❌ Main: React mount point not found!')
    console.log('🔧 Main: Available elements with id:', Array.from(document.querySelectorAll('[id]')).map(el => el.id))
    return
  }

  console.log('✅ Main: Mount point found:', mountPoint)
  console.log('🔧 Main: Mount point content:', mountPoint.innerHTML)

  try {
    console.log('🔧 Main: Creating React root...')
    const root = createRoot(mountPoint)
    
    console.log('🔧 Main: Rendering TaskTracker...')
    root.render(
      <React.StrictMode>
        <PrimeReactProvider>
          <TaskTracker />
        </PrimeReactProvider>
      </React.StrictMode>
    )
    
    console.log('✅ Main: TaskTracker rendered successfully')
    
    // Initialize SubMenu renderer
    setTimeout(() => {
      console.log('🔧 Main: Initializing SubMenu renderer...')
      initializeSubMenuRenderer()
    }, 100)
  } catch (error) {
    console.error('❌ Main: Error rendering React TaskTracker:', error)
    console.error('❌ Main: Error stack:', error.stack)
  }
}

// Initialize immediately if DOM is already ready, otherwise wait for DOMContentLoaded
console.log('🔧 Main: Document ready state:', document.readyState)

if (document.readyState === 'loading') {
  console.log('🔧 Main: DOM still loading, waiting for DOMContentLoaded...')
  document.addEventListener('DOMContentLoaded', initializeReact)
} else {
  console.log('🔧 Main: DOM already ready, initializing immediately...')
  initializeReact()
}