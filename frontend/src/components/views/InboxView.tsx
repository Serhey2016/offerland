import React, { useState, useRef, useEffect } from 'react'
import { Button } from 'primereact/button'
import { TieredMenu } from 'primereact/tieredmenu'
// import { Chips } from 'primereact/chips' // Commented out - hashtag functionality disabled
import TaskDesign from '../TaskDesign'
import '../../styles/priority-matrix-submenu.css'
import { taskApi, InboxTaskData } from '../../api/taskApi'

// Types for chip data
interface ChipData {
  id: string
  type: 'title' | 'priority' | 'hashtag' | 'date'
  value: string
  displayValue: string
  backgroundColor: string
}

const InboxView = () => {
  const [taskInput, setTaskInput] = useState('')
  // const [selectedPriority, setSelectedPriority] = useState<string>('') // Commented out - not used
  const [hasText, setHasText] = useState(false)
  const [chips, setChips] = useState<ChipData[]>([])
  // const [currentInput, setCurrentInput] = useState('') // Commented out - not used
  const [showMessage, setShowMessage] = useState('')
  const menuRef = useRef<TieredMenu>(null)
  const contentEditableRef = useRef<HTMLDivElement>(null)

  // Priority mappings
  const priorityMap = {
    'iu': { full: 'Important & Urgent', color: '#EF9A9A' },
    'inu': { full: 'Important & Not Urgent', color: '#90CAF9' },
    'niu': { full: 'Not Important & Urgent', color: '#FFCC80' },
    'ninu': { full: 'Not Important & Not Urgent', color: '#E0E0E0' }
  }

  // Helper function to format date from dd.mm.yyyy to yyyy-mm-dd
  const formatDateForBackend = (dateString: string): string => {
    // Input format: dd.mm.yyyy
    // Output format: yyyy-mm-dd
    const parts = dateString.trim().split('.')
    if (parts.length === 3) {
      const [day, month, year] = parts
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    return dateString
  }

  // Helper function to extract start date from chips
  const extractDateStart = (dateChips: ChipData[]): string | undefined => {
    const startDateChip = dateChips.find(chip => 
      chip.value.toLowerCase().startsWith('sd')
    )
    if (startDateChip) {
      // Extract date part after 'sd'
      const dateMatch = startDateChip.value.match(/^sd(.+)$/i)
      if (dateMatch && dateMatch[1]) {
        return formatDateForBackend(dateMatch[1].trim())
      }
    }
    return undefined
  }

  // Helper function to extract end date from chips
  const extractDateEnd = (dateChips: ChipData[]): string | undefined => {
    const endDateChip = dateChips.find(chip => 
      chip.value.toLowerCase().startsWith('dd')
    )
    if (endDateChip) {
      // Extract date part after 'dd'
      const dateMatch = endDateChip.value.match(/^dd(.+)$/i)
      if (dateMatch && dateMatch[1]) {
        return formatDateForBackend(dateMatch[1].trim())
      }
    }
    return undefined
  }

  // Check if text is a priority abbreviation
  const isPriorityAbbreviation = (text: string): boolean => {
    return Object.keys(priorityMap).includes(text.toLowerCase())
  }

  // Check if text is a date abbreviation
  const isDateAbbreviation = (text: string): boolean => {
    return text.toLowerCase().startsWith('sd') || text.toLowerCase().startsWith('dd')
  }

  // Check if text is a hashtag
  // const isHashtag = (text: string): boolean => {
  //   return text.startsWith('#')
  // }

  // Process input and create chips
  const processInput = (input: string) => {
    console.log('Processing input:', input)
    if (!input.trim()) return

    const trimmedInput = input.trim()
    console.log('Trimmed input:', trimmedInput)
    
    // Check for priority
    if (isPriorityAbbreviation(trimmedInput)) {
      console.log('Priority detected:', trimmedInput)
      const priority = priorityMap[trimmedInput.toLowerCase() as keyof typeof priorityMap]
      const existingPriority = chips.find(chip => chip.type === 'priority')
      
      if (existingPriority) {
        setShowMessage('Priority already set. Remove existing priority to set a new one.')
        setTimeout(() => setShowMessage(''), 3000)
        return
      }
      
      const newChip: ChipData = {
        id: `priority-${Date.now()}`,
        type: 'priority',
        value: trimmedInput.toLowerCase(),
        displayValue: priority.full,
        backgroundColor: priority.color
      }
      
      setChips(prev => [...prev, newChip])
      // setCurrentInput('') // Commented out - hashtag functionality disabled
      return
    }

    // Check for date
    if (isDateAbbreviation(trimmedInput)) {
      console.log('Date abbreviation detected:', trimmedInput)
      const dateMatch = trimmedInput.match(/^(sd|dd)(.+)$/i)
      if (dateMatch) {
        const [, prefix, date] = dateMatch
        const dateType = prefix.toLowerCase() === 'sd' ? 'Start date' : 'Due date'
        console.log('Date parts:', { prefix, date, dateType })
        
        // Validate date format (dd.mm.yyyy)
        const dateRegex = /^\d{1,2}\.\d{1,2}\.\d{4}$/
        if (!dateRegex.test(date.trim())) {
          console.log('Invalid date format:', date.trim())
          setShowMessage(`Invalid date format for ${dateType.toLowerCase()}. Please use format: ${prefix}dd.mm.yyyy (e.g., ${prefix}24.09.2025)`)
          setTimeout(() => setShowMessage(''), 5000)
          return
        }
        
        // Additional validation for actual date
        const dateParts = date.trim().split('.')
        const day = parseInt(dateParts[0])
        const month = parseInt(dateParts[1])
        const year = parseInt(dateParts[2])
        
        // Check if date is valid
        const dateObj = new Date(year, month - 1, day)
        console.log('Date validation:', { day, month, year, dateObj: dateObj.toISOString() })
        if (dateObj.getDate() !== day || dateObj.getMonth() !== month - 1 || dateObj.getFullYear() !== year) {
          console.log('Invalid date values')
          setShowMessage(`Invalid date for ${dateType.toLowerCase()}. Please check day, month, and year values.`)
          setTimeout(() => setShowMessage(''), 5000)
          return
        }
        
        console.log('Date validation passed, creating chip')
        
        const newChip: ChipData = {
          id: `date-${Date.now()}`,
          type: 'date',
          value: trimmedInput,
          displayValue: `${dateType}: ${date.trim()}`,
          backgroundColor: '#B3C3D4'
        }
        
        setChips(prev => [...prev, newChip])
        // setCurrentInput('') // Commented out - hashtag functionality disabled
        return
      }
    }

    // Check for hashtag
    // if (isHashtag(trimmedInput)) {
    //   console.log('Hashtag detected:', trimmedInput)
    //   
    //   // Remove the # symbol for processing
    //   const hashtagText = trimmedInput.substring(1).trim()
    //   
    //   if (!hashtagText) {
    //     setShowMessage('Hashtag cannot be empty. Please enter text after # symbol.')
    //     setTimeout(() => setShowMessage(''), 3000)
    //     return
    //   }
    //   
    //   // Check for duplicate hashtags
    //   const existingHashtag = chips.find(chip => 
    //     chip.type === 'hashtag' && chip.value.toLowerCase() === trimmedInput.toLowerCase()
    //   )
    //   
    //   if (existingHashtag) {
    //     setShowMessage('This hashtag already exists.')
    //     setTimeout(() => setShowMessage(''), 3000)
    //     return
    //   }
    //   
    //   const newChip: ChipData = {
    //     id: `hashtag-${Date.now()}`,
    //     type: 'hashtag',
    //     value: trimmedInput,
    //     displayValue: trimmedInput,
    //     backgroundColor: '#B3C3D4'
    //   }
    //   
    //   setChips(prev => [...prev, newChip])
    //   setCurrentInput('')
    //   return
    // }

    // Check for title (if no existing title and text doesn't match any pattern)
    const existingTitle = chips.find(chip => chip.type === 'title')
    console.log('Existing title:', existingTitle)
    console.log('Input length:', trimmedInput.length)
    
    if (!existingTitle && trimmedInput.length <= 120) {
      console.log('Creating title chip for:', trimmedInput)
      const newChip: ChipData = {
        id: `title-${Date.now()}`,
        type: 'title',
        value: trimmedInput,
        displayValue: `title: ${trimmedInput}`,
        backgroundColor: '#AAC7E3'
      }
      
      setChips(prev => [...prev, newChip])
      // setCurrentInput('') // Commented out - hashtag functionality disabled
      return
    } else if (existingTitle) {
      console.log('Title already exists')
      setShowMessage('Task title already set. Remove existing title to set a new one.')
      setTimeout(() => setShowMessage(''), 3000)
      return
    }
    
    console.log('No pattern matched for input:', trimmedInput)
  }

  // Remove chip
  const removeChip = (chipId: string) => {
    setChips(prev => prev.filter(chip => chip.id !== chipId))
  }

  // Edit chip (convert back to input) - for title chips only (hashtag functionality commented out)
  const editChip = (chip: ChipData) => {
    if (chip.type === 'title') {
      // Remove the chip first
      removeChip(chip.id)
      
      // Set the text back to input field
      // setCurrentInput(chip.value) // Commented out - hashtag functionality disabled
      setTaskInput(chip.value)
      
      // Focus the input field and set cursor to end
      setTimeout(() => {
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = chip.value
          contentEditableRef.current.focus()
          
          // Set cursor to end of text
          const range = document.createRange()
          const selection = window.getSelection()
          if (contentEditableRef.current.firstChild) {
            range.selectNodeContents(contentEditableRef.current)
            range.collapse(false) // false means collapse to end
            selection?.removeAllRanges()
            selection?.addRange(range)
          }
        }
      }, 0)
    }
    // Hashtag editing functionality commented out
    // if (chip.type === 'hashtag') {
    //   // Remove the chip first
    //   removeChip(chip.id)
    //   
    //   // Set the text back to input field
    //   setCurrentInput(chip.value)
    //   setTaskInput(chip.value)
    //   
    //   // Focus the input field and set cursor to end
    //   setTimeout(() => {
    //     if (contentEditableRef.current) {
    //       contentEditableRef.current.textContent = chip.value
    //       contentEditableRef.current.focus()
    //       
    //       // Set cursor to end of text
    //       const range = document.createRange()
    //       const selection = window.getSelection()
    //       if (contentEditableRef.current.firstChild) {
    //         range.selectNodeContents(contentEditableRef.current)
    //         range.collapse(false) // false means collapse to end
    //         selection?.removeAllRanges()
    //         selection?.addRange(range)
    //       }
    //     }
    //   }, 0)
    // }
  }

  // Функция для автоматического изменения высоты contenteditable
  // const adjustContentHeight = () => {
  //   const element = contentEditableRef.current
  //   if (element) {
  //     // Auto-resize not needed for contenteditable, it grows naturally
  //   }
  // }

  // useEffect для настройки contenteditable
  useEffect(() => {
    const element = contentEditableRef.current
    if (element) {
      // Синхронизируем содержимое только при очистке
      if (taskInput === '' && element.textContent !== '') {
        element.textContent = ''
      }
    }
  }, [taskInput])

  const handleConfirm = async () => {
    if (taskInput.trim() || chips.length > 0) {
      console.log('Creating task with chips:', chips, 'and input:', taskInput)
      
      try {
        // Prepare task data
        const titleChip = chips.find(chip => chip.type === 'title')
        const priorityChip = chips.find(chip => chip.type === 'priority')
        const dateChips = chips.filter(chip => chip.type === 'date')
        
        const taskData: InboxTaskData = {
          title: titleChip?.value || taskInput.trim(),
        }
        
        // Add optional fields if they exist
        if (priorityChip) {
          taskData.priority = priorityChip.value as 'iu' | 'inu' | 'niu' | 'ninu'
        }
        
        const startDate = extractDateStart(dateChips)
        if (startDate) {
          taskData.date_start = startDate
        }
        
        const endDate = extractDateEnd(dateChips)
        if (endDate) {
          taskData.date_end = endDate
        }
        
        console.log('Sending task data to API:', taskData)
        
        // Call API to create task
        const response = await taskApi.createInboxTask(taskData)
        
        console.log('Task created successfully:', response)
        
        // Show success message
        setShowMessage('Task created successfully!')
        setTimeout(() => setShowMessage(''), 3000)
        
        // Clear form
        setTaskInput('')
        setHasText(false)
        setChips([])
        
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = ''
        }
        
      } catch (error) {
        console.error('Error creating task:', error)
        setShowMessage('Error creating task. Please try again.')
        setTimeout(() => setShowMessage(''), 5000)
      }
    }
  }

  const handlePrioritySelect = (priority: string) => {
    // setSelectedPriority(priority) // Commented out - not used
    console.log('Priority selected:', priority)
    
    // Mapping from priority button names to abbreviations
    const priorityMapping: { [key: string]: string } = {
      'important-urgent': 'iu',
      'important-not-urgent': 'inu',
      'not-important-urgent': 'niu',
      'not-important-not-urgent': 'ninu'
    }
    
    // Get abbreviation
    const abbr = priorityMapping[priority]
    
    if (abbr) {
      // Use existing processInput logic to create chip
      processInput(abbr)
      
      // Clear input field after processing
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = ''
      }
      setTaskInput('')
      
      // Close menu
      menuRef.current?.hide()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      
      // If there's text in the input, try to process it as a chip first
      const element = e.currentTarget
      const text = element.textContent || ''
      
      if (text.trim()) {
        processInput(text.trim())
        element.textContent = ''
        // setCurrentInput('') // Commented out - hashtag functionality disabled
        setTaskInput('')
        setHasText(chips.length > 0)
      } else {
        // If no text, confirm the task
        handleConfirm()
      }
    }
  }

  // Функции для работы с курсором
  const saveCaretPosition = (element: HTMLElement) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      if (element.contains(range.startContainer)) {
        return range.startOffset
      }
    }
    return 0
  }

  const restoreCaretPosition = (element: HTMLElement, position: number) => {
    const range = document.createRange()
    const selection = window.getSelection()
    
    if (element.firstChild) {
      const textNode = element.firstChild
      const maxPosition = textNode.textContent?.length || 0
      const safePosition = Math.min(position, maxPosition)
      
      range.setStart(textNode, safePosition)
      range.setEnd(textNode, safePosition)
      
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }

  const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const text = element.textContent || ''
    const caretPosition = saveCaretPosition(element)
    
    // Check for comma separator at the end
    if (text.endsWith(',')) {
      const textWithoutComma = text.slice(0, -1).trim()
      
      if (textWithoutComma) {
        processInput(textWithoutComma)
        // Clear the input after processing
        element.textContent = ''
        // setCurrentInput('') // Commented out - hashtag functionality disabled
        setTaskInput('')
        setHasText(chips.length > 0)
        return
      }
    }
    
    // setCurrentInput(text) // Commented out - hashtag functionality disabled
    
    if (text.length <= 120) {
      setTaskInput(text)
      setHasText(text.length > 0 || chips.length > 0)
    } else {
      // Prevent further input if max length reached
      const truncatedText = text.substring(0, 120)
      element.textContent = truncatedText
      setTaskInput(truncatedText)
      // setCurrentInput(truncatedText) // Commented out - hashtag functionality disabled
      setHasText(true)
      
      // Восстанавливаем позицию курсора
      setTimeout(() => {
        restoreCaretPosition(element, Math.min(caretPosition, 120))
      }, 0)
    }
  }

  const isMaxLength = taskInput.length >= 120

  // Helper function to insert text into input field
  const insertTextIntoInput = (text: string) => {
    const element = contentEditableRef.current
    if (element) {
      element.textContent = text
      setTaskInput(text)
      setHasText(text.length > 0 || chips.length > 0)
      element.focus()
      
      // Set cursor to end of text
      setTimeout(() => {
        const range = document.createRange()
        const selection = window.getSelection()
        if (element.firstChild) {
          range.selectNodeContents(element)
          range.collapse(false)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      }, 0)
      
      // Close menu after insertion
      menuRef.current?.hide()
    }
  }

  const dropdownMenuItems = [
    {
      id: 'start-date-option',
      label: 'Start date',
      command: () => insertTextIntoInput('sd')
    },
    {
      id: 'due-date-option',
      label: 'Due date',
      command: () => insertTextIntoInput('dd')
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
          <div id="task-creation-input-container" className={`task_creation_input_container ${hasText ? 'has-text' : ''}`}>
            {/* Chips Display */}
            {chips.length > 0 && (
              <div className="task_creation_chips_container">
                {chips.map((chip) => (
                  <div
                    key={chip.id}
                    className="task_creation_chip"
                    style={{ backgroundColor: chip.backgroundColor }}
                    onClick={() => chip.type === 'title' ? editChip(chip) : undefined}
                    title={chip.type === 'title' ? 'Remove' : ''}
                  >
                    <span className="chip_text">{chip.displayValue}</span>
                    <button
                      className="chip_remove_btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeChip(chip.id)
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Message Display */}
            {showMessage && (
              <div className="task_creation_message">
                {showMessage}
              </div>
            )}
            
            <div
              ref={contentEditableRef}
              id="task-input-field"
              contentEditable
              onInput={handleInputChange}
              onKeyDown={handleKeyPress}
              className={`task_creation_input ${isMaxLength ? 'max-length-reached' : ''}`}
              data-placeholder={chips.length > 0 ? "Add more details..." : "Enter task..."}
              suppressContentEditableWarning={true}
            ></div>
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