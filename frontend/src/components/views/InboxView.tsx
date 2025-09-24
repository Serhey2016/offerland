// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import React, { useState, useRef } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Menu } from 'primereact/menu'
import TaskDesign from '../TaskDesign'

const InboxView = () => {
  const [taskInput, setTaskInput] = useState('')
  const menuRef = useRef<Menu>(null)

  const handleConfirm = () => {
    if (taskInput.trim()) {
      console.log('Creating task:', taskInput)
      // TODO: Implement task creation logic
      setTaskInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  const dropdownMenuItems = [
    {
      label: 'Start date',
      command: () => console.log('Start date selected')
    },
    {
      label: 'Due date',
      command: () => console.log('Due date selected')
    },
    {
      label: 'Scheduled date',
      command: () => console.log('Scheduled date selected')
    },
    {
      label: 'Add subtask',
      command: () => console.log('Add subtask selected')
    },
    {
      label: 'Priority',
      command: () => console.log('Priority selected')
    },
    {
      label: 'Depends on',
      command: () => console.log('Depends on selected')
    }
  ]

  const toggleMenu = (event: React.MouseEvent) => {
    menuRef.current?.toggle(event)
  }

  return (
    <div className="task_tracker_calendar_container">
      <div className="touchpoint-container">
        {/* Task Creation Block */}
        <div className="task_tracker_task_creation">
          <div className="task_creation_input_container">
            <InputText
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter task description..."
              className="task_creation_input"
            />
            <Button
              label="Confirm"
              onClick={handleConfirm}
              className="task_creation_confirm_btn"
            />
            <Button
              icon="pi pi-ellipsis-v"
              onClick={toggleMenu}
              className="task_creation_dropdown_btn"
              text
            />
            <Menu
              ref={menuRef}
              model={dropdownMenuItems}
              popup
              className="task_creation_dropdown_menu"
              popupAlignment="right"
            />
          </div>
        </div>

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