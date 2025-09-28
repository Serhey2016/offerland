import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from 'primereact/button'
import { TieredMenu } from 'primereact/tieredmenu'
import { Chips } from 'primereact/chips'
import TaskDesign from '../TaskDesign'
import '../../styles/priority-matrix-submenu.css'

const BacklogView = () => {
  const [taskInput, setTaskInput] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('')
  const [hasText, setHasText] = useState(false)

  const menuRef = useRef<TieredMenu>(null)
  const contentEditableRef = useRef<HTMLDivElement>(null)

  // Функция для автоматического изменения высоты contenteditable
  const adjustContentHeight = () => {
    const element = contentEditableRef.current
    if (element) {
      // Auto-resize not needed for contenteditable, it grows naturally
    }
  }

  // useEffect для настройки contenteditable
  useEffect(() => {
    const element = contentEditableRef.current
    if (element) {
      // Set initial content if needed
      if (taskInput && element.textContent !== taskInput) {
        element.textContent = taskInput
      }
    }
  }, [])

  const handleConfirm = () => {
    if (taskInput.trim()) {
      console.log('Creating backlog task:', taskInput, 'with priority:', selectedPriority)
      // TODO: Implement task creation logic
      setTaskInput('')
      setSelectedPriority('')
      setHasText(false)
      // Очищаем contenteditable
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = ''
      }
    }
  }

  const handlePrioritySelect = (priority: string) => {
    setSelectedPriority(priority)
    console.log('Priority selected:', priority)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleConfirm()
    }
  }

  const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || ''
    
    if (text.length <= 120) {
      setTaskInput(text)
      setHasText(text.length > 0) // Убираем debounce для тестирования
    } else {
      // Prevent further input if max length reached
      e.currentTarget.textContent = text.substring(0, 120)
      setTaskInput(text.substring(0, 120))
      setHasText(true)
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
      <div className="backlog-container">
        <div className="backlog-content">
          <TaskDesign
            title="Sample Backlog Task"
            description="This is a sample task in the backlog"
            timeRange="4 hours"
            category="Backlog"
            priority="medium"
            dateAdded="Tomorrow"
            onNotesClick={() => console.log('Notes clicked')}
            onDropdownClick={() => console.log('Dropdown clicked')}
            onMenuAction={(action: string, subAction?: string) => {
              // Handle different menu actions here
              switch (action) {
                case 'start':
                  console.log('Starting backlog task...')
                  break
                case 'edit':
                  console.log('Editing backlog task...')
                  break
                case 'details':
                  console.log('Showing backlog task details...')
                  break
                case 'delegate':
                  console.log('Delegating backlog task...')
                  break
                case 'publish':
                  console.log('Publishing backlog task...')
                  break
                case 'move':
                  if (subAction) {
                    console.log(`Moving backlog task to: ${subAction}`)
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

export default BacklogView
