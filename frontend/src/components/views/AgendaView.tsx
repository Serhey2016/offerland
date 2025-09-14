import React from 'react'
// CSS styles moved to task_tracker.css

const AgendaView: React.FC = () => {
  const sampleEvents = [
    {
      id: 'event1',
      title: 'Sample Task 1',
      time: '04:00 - 07:00',
      backgroundColor: '#3B82F6',
    },
    {
      id: 'event2', 
      title: 'Sample Task 2',
      time: '10:00 - 12:00',
      backgroundColor: '#10B981',
    },
    {
      id: 'event3',
      title: 'Sample Task 3', 
      time: '14:00 - 16:00',
      backgroundColor: '#F59E0B',
    }
  ]

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return `${hour}:00`
  })

  return React.createElement('div', { className: 'agenda-view-container' },
    React.createElement('div', { className: 'agenda-header' },
      React.createElement('h2', null, 'Agenda View'),
      React.createElement('p', null, 'Task list with time slots')
    ),
    
    React.createElement('div', { className: 'time-schedule' },
      timeSlots.map((time, index) => {
        const event = sampleEvents.find(e => e.time.startsWith(time.split(':')[0]))
        
        return React.createElement('div', { 
          key: index,
          className: 'time-slot',
          style: { 
            borderBottom: '1px solid #e5e7eb',
            padding: '10px',
            display: 'flex',
            alignItems: 'center'
          }
        },
          React.createElement('div', { 
            style: { 
              minWidth: '60px',
              fontWeight: 'bold',
              color: '#6b7280'
            }
          }, time),
          
          event ? React.createElement('div', {
            className: 'task-event',
            style: {
              backgroundColor: event.backgroundColor,
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              marginLeft: '10px',
              flex: 1
            }
          },
            React.createElement('div', { style: { fontWeight: 'bold' } }, event.title),
            React.createElement('div', { style: { fontSize: '0.875rem', opacity: 0.9 } }, event.time)
          ) : React.createElement('div', { 
            style: { 
              marginLeft: '10px',
              color: '#9ca3af',
              fontStyle: 'italic'
            }
          }, 'No tasks scheduled')
        )
      })
    )
  )
}

export default AgendaView