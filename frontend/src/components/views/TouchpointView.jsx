import React from 'react'

const TouchpointView = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="touchpoint-container">
        <div className="touchpoint-content">
          <div className="touchpoint-list">
            <div className="touchpoint-item">
              <div className="contact-info">
                <h4>
                  <svg className="task-folder-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" fill="currentColor"/>
                  </svg>
                  Client Meeting
                </h4>
                <p>Quarterly business review with ABC Corp</p>
                <span className="last-contact">Scheduled: Tomorrow 2:00 PM</span>
              </div>
              <div className="contact-actions">
                <button className="task_tracker_notes_btn">
                  <svg className="task_tracker_notes_icon" width="26.542" height="17.695" viewBox="0 0 26.542 17.695" xmlns="http://www.w3.org/2000/svg">
                    <path d="M120-702.305v-2.949h17.695v2.949Zm0-7.373v-2.949h26.542v2.949Zm0-7.373V-720h26.542v2.949Z" transform="translate(-120 720)" fill="currentColor"/>
                  </svg>
                </button>
                <button className="task_tracker_dropdown_btn">
                  <svg className="task_tracker_dots_icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="5" r="2" fill="currentColor"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    <circle cx="12" cy="19" r="2" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="touchpoint-item">
              <div className="contact-info">
                <h4>
                  <svg className="task-folder-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" fill="currentColor"/>
                  </svg>
                  Team Standup
                </h4>
                <p>Daily standup meeting with development team</p>
                <span className="last-contact">Today 9:00 AM - 9:30 AM</span>
              </div>
              <div className="contact-actions">
                <button className="task_tracker_notes_btn">
                  <svg className="task_tracker_notes_icon" width="26.542" height="17.695" viewBox="0 0 26.542 17.695" xmlns="http://www.w3.org/2000/svg">
                    <path d="M120-702.305v-2.949h17.695v2.949Zm0-7.373v-2.949h26.542v2.949Zm0-7.373V-720h26.542v2.949Z" transform="translate(-120 720)" fill="currentColor"/>
                  </svg>
                </button>
                <button className="task_tracker_dropdown_btn">
                  <svg className="task_tracker_dots_icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="5" r="2" fill="currentColor"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    <circle cx="12" cy="19" r="2" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="touchpoint-item">
              <div className="contact-info">
                <h4>
                  <svg className="task-folder-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z" fill="currentColor"/>
                  </svg>
                  Product Demo
                </h4>
                <p>Demo of new features for stakeholders</p>
                <span className="last-contact">Next Monday 3:00 PM - 4:00 PM</span>
              </div>
              <div className="contact-actions">
                <button className="task_tracker_notes_btn">
                  <svg className="task_tracker_notes_icon" width="26.542" height="17.695" viewBox="0 0 26.542 17.695" xmlns="http://www.w3.org/2000/svg">
                    <path d="M120-702.305v-2.949h17.695v2.949Zm0-7.373v-2.949h26.542v2.949Zm0-7.373V-720h26.542v2.949Z" transform="translate(-120 720)" fill="currentColor"/>
                  </svg>
                </button>
                <button className="task_tracker_dropdown_btn">
                  <svg className="task_tracker_dots_icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="5" r="2" fill="currentColor"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    <circle cx="12" cy="19" r="2" fill="currentColor"/>
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

export default TouchpointView
