import React from 'react'

const WaitingView = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="waiting-container">
        <div className="waiting-header">
          <h3>Waiting</h3>
          <p>Tasks waiting for others or external factors</p>
        </div>
        <div className="waiting-content">
          <div className="waiting-list">
            <div className="waiting-item">
              <div className="waiting-info">
                <h4>Client approval for design</h4>
                <p>Waiting for: Sarah Johnson</p>
                <span className="waiting-since">Since: 3 days ago</span>
              </div>
              <div className="waiting-actions">
                <button className="btn btn-outline-warning btn-sm">Follow up</button>
              </div>
            </div>
            <div className="waiting-item">
              <div className="waiting-info">
                <h4>Server maintenance completion</h4>
                <p>Waiting for: IT Department</p>
                <span className="waiting-since">Since: 1 week ago</span>
              </div>
              <div className="waiting-actions">
                <button className="btn btn-outline-warning btn-sm">Follow up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitingView
