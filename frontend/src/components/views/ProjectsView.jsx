import React from 'react'

const ProjectsView = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="projects-container">
        <div className="projects-header">
          <h3>Projects</h3>
          <p>Active projects and their progress</p>
        </div>
        <div className="projects-content">
          <div className="projects-list">
            <div className="project-item">
              <div className="project-info">
                <h4>Website Redesign</h4>
                <p>Complete overhaul of company website</p>
                <div className="project-progress">
                  <div className="progress">
                    <div className="progress-bar" style={{width: '65%'}}></div>
                  </div>
                  <span className="progress-text">65% Complete</span>
                </div>
              </div>
              <div className="project-actions">
                <button className="btn btn-primary btn-sm">View Details</button>
              </div>
            </div>
            <div className="project-item">
              <div className="project-info">
                <h4>Mobile App Development</h4>
                <p>iOS and Android app for customer portal</p>
                <div className="project-progress">
                  <div className="progress">
                    <div className="progress-bar" style={{width: '30%'}}></div>
                  </div>
                  <span className="progress-text">30% Complete</span>
                </div>
              </div>
              <div className="project-actions">
                <button className="btn btn-primary btn-sm">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsView
