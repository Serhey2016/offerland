// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import React from 'react'

const EmptyStateView: React.FC = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="touchpoint-content">
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          <p>No tasks found. Create your first task above!</p>
        </div>
      </div>
    </div>
  )
}

export default EmptyStateView

