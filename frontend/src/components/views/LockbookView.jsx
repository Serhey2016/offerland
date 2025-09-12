import React from 'react'

const LockbookView = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="lockbook-container">
        <div className="lockbook-header">
          <h3>Lockbook (Done)</h3>
          <p>Completed tasks and achievements</p>
        </div>
        <div className="lockbook-content">
          <div className="lockbook-list">
            <div className="lockbook-item completed">
              <div className="task-info">
                <h4>✅ Complete project proposal</h4>
                <p>Submitted to client for review</p>
                <span className="completion-date">Completed: Today</span>
              </div>
              <div className="task-actions">
                <button className="btn btn-outline-success btn-sm">Archive</button>
              </div>
            </div>
            <div className="lockbook-item completed">
              <div className="task-info">
                <h4>✅ Team meeting preparation</h4>
                <p>Agenda and materials ready</p>
                <span className="completion-date">Completed: Yesterday</span>
              </div>
              <div className="task-actions">
                <button className="btn btn-outline-success btn-sm">Archive</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LockbookView
