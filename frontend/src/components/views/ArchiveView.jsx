import React from 'react'

const ArchiveView = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="archive-container">
        <div className="archive-content">
          <div className="archive-list">
            <div className="archive-item">
              <div className="archive-info">
                <h4>Q3 Marketing Campaign</h4>
                <p>Completed marketing campaign for summer products</p>
                <span className="archive-date">Archived: 2 weeks ago</span>
              </div>
              <div className="archive-actions">
                <button className="btn btn-outline-secondary btn-sm">Restore</button>
                <button className="btn btn-outline-danger btn-sm">Delete</button>
              </div>
            </div>
            <div className="archive-item">
              <div className="archive-info">
                <h4>Office Renovation</h4>
                <p>Complete office space redesign project</p>
                <span className="archive-date">Archived: 1 month ago</span>
              </div>
              <div className="archive-actions">
                <button className="btn btn-outline-secondary btn-sm">Restore</button>
                <button className="btn btn-outline-danger btn-sm">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArchiveView
