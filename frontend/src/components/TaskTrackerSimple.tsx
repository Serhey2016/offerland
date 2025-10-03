import React from 'react'

const TaskTrackerSimple: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>TaskTracker Simple Test</h1>
      <p>If you see this, TaskTracker is working correctly.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' }}>
        <h3>SubMenuSection Test</h3>
        <p>This would contain the SubMenuSection component.</p>
      </div>
    </div>
  )
}

export default TaskTrackerSimple
