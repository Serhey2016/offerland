// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import React, { useState, useRef } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Menu } from 'primereact/menu'
import TaskDesign from '../TaskDesign'
import PriorityCascadeSelect from '../PriorityCascadeSelect'

const InboxView = () => {
  const [taskInput, setTaskInput] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('')
  const menuRef = useRef<Menu>(null)

  const handleConfirm = () => {
    if (taskInput.trim()) {
      console.log('Creating task:', taskInput, 'with priority:', selectedPriority)
      // TODO: Implement task creation logic
      setTaskInput('')
      setSelectedPriority('')
    }
  }

  const handlePrioritySelect = (priority: string) => {
    setSelectedPriority(priority)
    console.log('Priority selected:', priority)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  const dropdownMenuItems = [
    {
      id: 'start-date-option',
      label: 'Start date',
      command: () => console.log('Start date selected')
    },
    {
      id: 'due-date-option',
      label: 'Due date',
      command: () => console.log('Due date selected')
    },
    {
      id: 'scheduled-date-option',
      label: 'Scheduled date',
      command: () => console.log('Scheduled date selected')
    },
    {
      id: 'add-subtask-option',
      label: 'Add subtask',
      command: () => console.log('Add subtask selected')
    },
    {
      id: 'depends-on-option',
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
        <div id="task-creation-block" className="task_tracker_task_creation">
          <div id="task-creation-input-container" className="task_creation_input_container">
            <InputText
              id="task-input-field"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter task description..."
              className="task_creation_input"
            />
            <Button
              id="task-confirm-button"
              icon="pi pi-check"
              onClick={handleConfirm}
              className="task_creation_confirm_btn"
              text
            />
            <PriorityCascadeSelect onPrioritySelect={handlePrioritySelect} />
            <Button
              id="task-dropdown-button"
              icon="pi pi-ellipsis-v"
              onClick={toggleMenu}
              className="task_creation_dropdown_btn"
              text
            />
            <Menu
              id="task-dropdown-menu"
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