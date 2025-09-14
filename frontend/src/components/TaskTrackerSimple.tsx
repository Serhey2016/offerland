import React from 'react'

const TaskTrackerSimple = () => {
  console.log('🚀 TaskTrackerSimple: Component rendered')
  
  // Создаем простой div без JSX
  const container = document.createElement('div')
  container.className = 'task_tracker_calendar_container'
  
  const touchpointContainer = document.createElement('div')
  touchpointContainer.className = 'touchpoint-container'
  
  const content = document.createElement('div')
  content.className = 'touchpoint-content'
  
  const title = document.createElement('h3')
  title.textContent = 'Agenda View (Loading...)'
  
  const description = document.createElement('p')
  description.textContent = 'Agenda functionality will be implemented here.'
  
  content.appendChild(title)
  content.appendChild(description)
  touchpointContainer.appendChild(content)
  container.appendChild(touchpointContainer)
  
  // Возвращаем React элемент
  return React.createElement('div', { className: 'task-tracker-simple' },
    React.createElement('div', { className: 'task_tracker_calendar_container' },
      React.createElement('div', { className: 'touchpoint-container' },
        React.createElement('div', { className: 'touchpoint-content' },
          React.createElement('h3', null, 'Agenda View (Loading...)'),
          React.createElement('p', null, 'Agenda functionality will be implemented here.')
        )
      )
    )
  )
}

export default TaskTrackerSimple
