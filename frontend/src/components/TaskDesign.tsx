import React from 'react'

interface TaskDesignProps {
  title: string
  description?: string
  timeRange?: string
  category?: string
  priority?: 'low' | 'medium' | 'high'
  dateAdded?: string
  onNotesClick?: () => void
  onDropdownClick?: () => void
}

const TaskDesign: React.FC<TaskDesignProps> = ({
  title,
  description = '',
  timeRange = '',
  category = 'My task',
  priority = 'medium',
  dateAdded = 'Today',
  onNotesClick,
  onDropdownClick
}) => {
  return React.createElement('div', { className: 'task_tracker_task_design' },
    // Priority indicator
    React.createElement('div', { className: `task-priority ${priority}` }),
    
    // Main content
    React.createElement('div', { className: 'task-content' },
      // Header with folder icon and category
      React.createElement('h4', null,
        React.createElement('svg', { 
          className: 'task-folder-icon', 
          width: '20', 
          height: '20', 
          viewBox: '0 0 24 24', 
          fill: 'none', 
          xmlns: 'http://www.w3.org/2000/svg' 
        },
          React.createElement('path', {
            d: 'M10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z',
            fill: 'currentColor'
          })
        ),
        ' ',
        category
      ),
      
      // Task title
      React.createElement('h3', null, title),
      
      // Date added
      React.createElement('span', { className: 'task-date' }, `Added: ${dateAdded}`),
      
      // Hashtags container
      React.createElement('div', { className: 'task_tracker_hashtags_container' },
        timeRange && React.createElement('span', { className: 'task_tracker_hashtag' }, timeRange),
        React.createElement('span', { className: 'task_tracker_hashtag' }, category)
      )
    ),
    
    // Action buttons
    React.createElement('div', { className: 'task-actions' },
      // Notes button
      React.createElement('button', { 
        className: 'task_tracker_notes_btn',
        onClick: onNotesClick
      },
        React.createElement('svg', {
          className: 'task_tracker_notes_icon',
          width: '26.542',
          height: '17.695',
          viewBox: '0 0 26.542 17.695',
          xmlns: 'http://www.w3.org/2000/svg'
        },
          React.createElement('path', {
            d: 'M120-702.305v-2.949h17.695v2.949Zm0-7.373v-2.949h26.542v2.949Zm0-7.373V-720h26.542v2.949Z',
            transform: 'translate(-120 720)',
            fill: 'currentColor'
          })
        )
      ),
      
      // Dropdown button
      React.createElement('button', { 
        className: 'task_tracker_dropdown_btn',
        onClick: onDropdownClick
      },
        React.createElement('svg', {
          className: 'task_tracker_dots_icon',
          width: '20',
          height: '20',
          viewBox: '0 0 24 24',
          fill: 'none',
          xmlns: 'http://www.w3.org/2000/svg'
        },
          React.createElement('circle', { cx: '12', cy: '5', r: '2', fill: 'currentColor' }),
          React.createElement('circle', { cx: '12', cy: '12', r: '2', fill: 'currentColor' }),
          React.createElement('circle', { cx: '12', cy: '19', r: '2', fill: 'currentColor' })
        )
      )
    )
  )
}

export default TaskDesign
