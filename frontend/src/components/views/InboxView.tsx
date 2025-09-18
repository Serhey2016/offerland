import React from 'react'
import TaskDesign from '../TaskDesign'

const InboxView: React.FC = () => {
  return (
    <div className="task_tracker_calendar_container">
      <div className="touchpoint-container">
        <div className="touchpoint-content">
          <TaskDesign
            title="Sample Task"
            description="This is a sample task in the inbox"
            timeRange="2 hours"
            category="Inbox"
            priority="high"
            dateAdded="Today"
            onNotesClick={() => console.log('Notes clicked')}
            onDropdownClick={() => console.log('Dropdown clicked')}
            onMenuAction={(action: string, subAction?: string) => {
              // Handle different menu actions here
              switch (action) {
                case 'start':
                  console.log('Starting task...')
                  break
                case 'edit':
                  console.log('Editing task...')
                  break
                case 'details':
                  console.log('Showing task details...')
                  break
                case 'delegate':
                  console.log('Delegating task...')
                  break
                case 'publish':
                  console.log('Publishing task...')
                  break
                case 'move':
                  if (subAction) {
                    console.log(`Moving task to: ${subAction}`)
                  }
                  break
                default:
                  console.log('Unknown action:', action)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default InboxView