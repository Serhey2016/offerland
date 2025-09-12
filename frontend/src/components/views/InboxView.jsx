import React from 'react'

const InboxView = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="inbox-container">
        <div className="inbox-header">
          <h3>Inbox</h3>
          <p>Capture new tasks and ideas</p>
        </div>
        <div className="inbox-content">
          <div className="inbox-list">
            <div className="inbox-item">
              <div className="task-priority high"></div>
              <div className="task-content">
                <h4>Review quarterly reports</h4>
                <p>Need to analyze Q3 performance data</p>
                <span className="task-date">Added: Today</span>
              </div>
              <div className="task-actions">
                <button className="btn btn-outline-primary btn-sm">Process</button>
              </div>
            </div>
            <div className="inbox-item">
              <div className="task-priority medium"></div>
              <div className="task-content">
                <h4>Call dentist office</h4>
                <p>Schedule annual checkup</p>
                <span className="task-date">Added: Yesterday</span>
              </div>
              <div className="task-actions">
                <button className="btn btn-outline-primary btn-sm">Process</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InboxView
