import React from 'react'
import { createRoot } from 'react-dom/client'

function SimpleTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>React Test Successful!</h1>
      <p>If you see this, React is working correctly.</p>
    </div>
  )
}

function initializeTest() {
  const mountPoint = document.getElementById('react-task-tracker')
  if (!mountPoint) {
    console.error('❌ Test: React mount point not found!')
    return
  }

  try {
    const root = createRoot(mountPoint)
    root.render(<SimpleTest />)
    console.log('✅ Test: React mounted successfully!')
  } catch (error) {
    console.error('❌ Test: Error rendering React:', error)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTest)
} else {
  initializeTest()
}
