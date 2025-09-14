import React from 'react'

const ProjectsView = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="projects-container">
        <div className="projects-content">
          <div className="projects-list">
            <div className="project-item">
              <div className="project-info">
                <h4>
                  <svg className="task-folder-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" fill="currentColor"/>
                  </svg>
                  Website Redesign
                </h4>
                <p>Complete overhaul of company website</p>
                <div className="project-progress">
                  <div className="progress">
                    <div className="progress-bar" style={{width: '65%'}}></div>
                  </div>
                  <span className="progress-text">65% Complete</span>
                </div>
              </div>
              <div className="project-actions">
                <button className="task_tracker_dropdown_btn">
                  <svg className="task_tracker_dots_icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="5" r="2" fill="currentColor"></circle>
                    <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
                    <circle cx="12" cy="19" r="2" fill="currentColor"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <div className="project-item">
              <div className="project-info">
                <h4>
                  <svg className="task-folder-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" fill="currentColor"/>
                  </svg>
                  Mobile App Development
                </h4>
                <p>iOS and Android app for customer portal</p>
                <div className="project-progress">
                  <div className="progress">
                    <div className="progress-bar" style={{width: '30%'}}></div>
                  </div>
                  <span className="progress-text">30% Complete</span>
                </div>
              </div>
              <div className="project-actions">
                <button className="task_tracker_dropdown_btn">
                  <svg className="task_tracker_dots_icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="5" r="2" fill="currentColor"></circle>
                    <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
                    <circle cx="12" cy="19" r="2" fill="currentColor"></circle>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsView
