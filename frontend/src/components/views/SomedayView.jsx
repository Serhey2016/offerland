import React from 'react'

const SomedayView = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="someday-container">
        <div className="someday-header">
          <h3>Someday</h3>
          <p>Ideas and tasks for future consideration</p>
        </div>
        <div className="someday-content">
          <div className="someday-list">
            <div className="someday-item">
              <div className="someday-info">
                <h4>Learn Spanish</h4>
                <p>Personal development goal</p>
                <span className="someday-category">Personal</span>
              </div>
              <div className="someday-actions">
                <button className="btn btn-outline-info btn-sm">Move to Projects</button>
              </div>
            </div>
            <div className="someday-item">
              <div className="someday-info">
                <h4>Write a book</h4>
                <p>Creative writing project</p>
                <span className="someday-category">Creative</span>
              </div>
              <div className="someday-actions">
                <button className="btn btn-outline-info btn-sm">Move to Projects</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SomedayView
