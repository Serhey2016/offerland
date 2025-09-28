import React, { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import { TieredMenu } from 'primereact/tieredmenu'
import TaskDesign from '../TaskDesign'
import '../../styles/priority-matrix-submenu.css'

const InboxView = () => {
  const [taskInput, setTaskInput] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('')
  const menuRef = useRef<TieredMenu>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Функция для автоматического изменения высоты textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }

  // useEffect для настройки автоматического изменения высоты
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener('input', adjustTextareaHeight)
      
      // Очистка при размонтировании
      return () => {
        textarea.removeEventListener('input', adjustTextareaHeight)
      }
    }
  }, [])

  const handleConfirm = () => {
    if (taskInput.trim()) {
      console.log('Creating task:', taskInput, 'with priority:', selectedPriority)
      // TODO: Implement task creation logic
      setTaskInput('')
      setSelectedPriority('')
      // Сбрасываем высоту после очистки
      setTimeout(adjustTextareaHeight, 0)
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
    // Вызываем adjustTextareaHeight при любом изменении
    setTimeout(adjustTextareaHeight, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 120) {
      setTaskInput(value)
      setTimeout(adjustTextareaHeight, 0)
    }
  }

  const isMaxLength = taskInput.length >= 120


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
      id: 'add-subtask-option',
      label: 'Add subtask',
      command: () => console.log('Add subtask selected')
    },
    {
      id: 'priority-option',
      label: 'Priority',
      items: [
        {
          id: 'priority-matrix',
          template: () => (
            <div className="priority-matrix-grid">
              <div 
                className="quadrant quadrant-important-urgent"
                onClick={() => handlePrioritySelect('important-urgent')}
                title="Important & Urgent - Do First"
              ></div>
              <div 
                className="quadrant quadrant-important-not-urgent"
                onClick={() => handlePrioritySelect('important-not-urgent')}
                title="Important & Not Urgent - Schedule"
              ></div>
              <div 
                className="quadrant quadrant-not-important-urgent"
                onClick={() => handlePrioritySelect('not-important-urgent')}
                title="Not Important & Urgent - Delegate"
              ></div>
              <div 
                className="quadrant quadrant-not-important-not-urgent"
                onClick={() => handlePrioritySelect('not-important-not-urgent')}
                title="Not Important & Not Urgent - Eliminate"
              ></div>
            </div>
          )
        }
      ]
    },
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
            <textarea
              ref={textareaRef}
              id="task-input-field"
              value={taskInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter task..."
              className={`task_creation_input ${isMaxLength ? 'max-length-reached' : ''}`}
              rows={1}
              maxLength={120}
            />
            {isMaxLength && (
              <div className="task_creation_max_length_warning">
                Maximum length reached (120 characters)
              </div>
            )}
            <Button
              id="task-confirm-button"
              icon="pi pi-check"
              onClick={handleConfirm}
              className="task_creation_confirm_btn"
              text
            />
            <Button
              id="task-dropdown-button"
              icon="pi pi-ellipsis-v"
              onClick={toggleMenu}
              className="task_creation_dropdown_btn"
              text
            />
            <TieredMenu
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