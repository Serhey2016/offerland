import React from 'react'

const ContactsView = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="touchpoint-container">
        <div className="touchpoint-content">
          <div className="touchpoint-list">
            <div className="touchpoint-item">
              <div className="contact-info">
                <h4>John Doe</h4>
                <p>john@example.com</p>
                <span className="last-contact">Last contact: 2 days ago</span>
              </div>
              <div className="contact-actions">
                <button className="btn btn-primary btn-sm">Call</button>
                <button className="btn btn-outline-secondary btn-sm">Email</button>
              </div>
            </div>
            <div className="touchpoint-item">
              <div className="contact-info">
                <h4>Jane Smith</h4>
                <p>jane@example.com</p>
                <span className="last-contact">Last contact: 1 week ago</span>
              </div>
              <div className="contact-actions">
                <button className="btn btn-primary btn-sm">Call</button>
                <button className="btn btn-outline-secondary btn-sm">Email</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactsView