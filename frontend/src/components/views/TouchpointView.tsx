// @refresh reset
// JSX preamble for Vite plugin detection
const JSX_PREAMBLE = <div></div>

import React, { useState, useRef } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Menu } from 'primereact/menu'

const TouchpointView = () => {
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
      icon: 'pi pi-calendar',
      command: () => console.log('Start date selected')
    },
    {
      label: 'Due date',
      icon: 'pi pi-calendar-plus',
      command: () => console.log('Due date selected')
    },
    {
      label: 'Scheduled date',
      icon: 'pi pi-clock',
      command: () => console.log('Scheduled date selected')
    },
    {
      label: 'Add subtask',
      icon: 'pi pi-plus',
      command: () => console.log('Add subtask selected')
    },
    {
      label: 'Priority',
      icon: 'pi pi-exclamation-triangle',
      command: () => console.log('Priority selected')
    },
    {
      label: 'Depends on',
      icon: 'pi pi-link',
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
            />
          </div>
        </div>

        <div className="touchpoint-content">
          <h3>Touchpoint View (Loading...)</h3>
          <p>Touchpoint functionality will be implemented here.</p>
        </div>
      </div>
    </div>
  )
}

export default TouchpointView