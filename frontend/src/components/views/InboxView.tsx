import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from 'primereact/button'
import { TieredMenu } from 'primereact/tieredmenu'
// import { Chips } from 'primereact/chips' // Commented out - hashtag functionality disabled
import '../../styles/priority-matrix-submenu.css'
import '../../styles/tasktracker_task_design.css'
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
  const [mobileTapped, setMobileTapped] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [showSubmenu, setShowSubmenu] = useState(false)
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<TieredMenu>(null)
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)


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

  // Handle mobile tap for floating icons
  const handleTaskTap = () => {
    if (window.innerWidth <= 768) {
      setMobileTapped(!mobileTapped)
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
    console.log('Toggle menu clicked, menuRef:', menuRef.current)
    console.log('Dropdown menu items:', dropdownMenuItems)
    console.log('Menu element in DOM:', document.querySelector('#task-dropdown-menu'))
    
    if (menuRef.current) {
      menuRef.current.toggle(event)
    } else {
      console.error('Menu ref is null')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target) &&
          submenuRef.current && !submenuRef.current.contains(target)) {
        setShowDropdown(false)
        setShowSubmenu(false)
      }
    }

    if (showDropdown || showSubmenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown, showSubmenu])

  // Handle dropdown positioning based on available screen space
  const calculateDropdownPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    const dropdownWidth = 160
    const dropdownHeight = 200
    
    // Position dropdown to the right of the button
    let top = rect.bottom + 5
    let left = rect.right - dropdownWidth // Align right edge with button
    
    // If dropdown goes off the right edge, position it to the left of button
    if (left + dropdownWidth > viewportWidth - 10) {
      left = rect.left - dropdownWidth
    }
    
    // If dropdown goes off the left edge, position it below button centered
    if (left < 10) {
      left = rect.left + (rect.width / 2) - (dropdownWidth / 2)
      // Ensure it doesn't go off the right edge
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10
      }
    }
    
    // Check if dropdown would go off the bottom edge
    if (top + dropdownHeight > viewportHeight - 10) {
      top = rect.top - dropdownHeight - 5
    }
    
    // Ensure dropdown doesn't go off the top edge
    if (top < 10) {
      top = 10
    }
    
    return { top, left }
  }

  // Handle submenu positioning
  const calculateSubmenuPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    const submenuWidth = 160
    const submenuHeight = 200
    
    // Position submenu to the right of the dropdown item
    let top = rect.top
    let left = rect.right + 5
    
    // If submenu goes off the right edge, position it to the left
    if (left + submenuWidth > viewportWidth - 10) {
      left = rect.left - submenuWidth - 5
    }
    
    // Ensure submenu doesn't go off the left edge
    if (left < 10) {
      left = 10
    }
    
    // Check if submenu would go off the bottom edge
    if (top + submenuHeight > viewportHeight - 10) {
      top = viewportHeight - submenuHeight - 10
    }
    
    // Ensure submenu doesn't go off the top edge
    if (top < 10) {
      top = 10
    }
    
    return { top, left }
  }

  // Handle submenu item clicks
  const handleSubmenuItemClick = (action: string) => {
    setShowSubmenu(false)
    setShowDropdown(false)
    console.log(`Move to: ${action}`)
  }

  // Handle dropdown menu item clicks
  const handleDropdownItemClick = (action: string, event?: React.MouseEvent<HTMLDivElement>) => {
    if (action === 'move' && event) {
      // Show submenu for Move to...
      const position = calculateSubmenuPosition(event.currentTarget)
      setSubmenuPosition(position)
      setShowSubmenu(true)
      return
    }
    
    setShowDropdown(false)
    
    switch (action) {
      case 'start':
        console.log('Start clicked')
        break
      case 'edit':
        console.log('Edit clicked')
        break
      case 'details':
        console.log('Details clicked')
        break
      case 'delegate':
        console.log('Delegate clicked')
        break
      case 'publish':
        console.log('Publish clicked')
        break
      default:
        break
    }
  }

  // Handle icon button clicks
  const handleIconClick = (action: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (action === 'more' && event) {
      const position = calculateDropdownPosition(event.currentTarget)
      setDropdownPosition(position)
      setShowDropdown(!showDropdown)
      return
    }
    
    switch (action) {
      case 'create':
        console.log('Create task clicked')
        break
      case 'subtask':
        console.log('Sub task clicked')
        break
      case 'note':
        console.log('Note clicked')
        break
      default:
        break
    }
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
              hideOverlaysOnDocumentScrolling={false}
              onShow={() => console.log('Menu shown')}
              onHide={() => console.log('Menu hidden')}
            />
          </div>
        </div>

        <div className="touchpoint-content">
          <div className="task-design-container">
            <div 
              className={`task_tracker_task_container ${mobileTapped ? 'mobile-tap' : ''}`}
              onClick={handleTaskTap}
            >
              {/* Floating action icons */}
              <div className="task_tracker_floating_icons">
                <button 
                  className="task_tracker_icon_btn" 
                  title="Create task"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Create task clicked')
                  }}
                >
                  <i className="pi pi-check-circle"></i>
                </button>
                <button 
                  className="task_tracker_icon_btn" 
                  title="Sub Task"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Sub task clicked')
                  }}
                >
                  <i className="pi pi-reply"></i>
                </button>
                <button 
                  className="task_tracker_icon_btn" 
                  title="Note"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Note clicked')
                  }}
                >
                  <i className="pi pi-clipboard"></i>
                </button>
                <button 
                  className="task_tracker_icon_btn" 
                  title="More options"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleIconClick('more', e)
                  }}
                >
                  <i className="pi pi-ellipsis-v"></i>
                </button>
              </div>
              
              {/* Task metadata */}
              <div className="task_tracker_task_metadata">
                <div>
                  <span className="task_tracker_task_category">Agenda: </span>
                  <span className="task_tracker_task_times">6:00 am 7:00 am</span>
                </div>
                <div className="task_tracker_task_dates">
                  <div className="task_tracker_task_date_item">
                    <span>Start date:</span>
                    <span className="task_tracker_task_date_value">20.09.2025</span>
                  </div>
                  <div className="task_tracker_task_date_item">
                    <span>Due date:</span>
                    <span className="task_tracker_task_date_value">20.09.2025</span>
                  </div>
                </div>
              </div>
              
              {/* Task title */}
              <div className="task_tracker_task_title">
                Making new changes
              </div>
              
              {/* Task hashtags */}
              <div className="task_tracker_task_hashtags">
                <svg className="task_tracker_task_hashtag_icon" viewBox="0 0 24 24">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <span className="task_tracker_task_hashtag_text">hashtag1, hashtag2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && createPortal(
        <div 
          ref={dropdownRef}
          className="task_tracker_task_dropdown_menu"
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            zIndex: 9999,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '160px',
            padding: '4px 0'
          }}
        >
          <div 
            className="task_tracker_task_dropdown_item"
            onClick={() => handleDropdownItemClick('start')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Start
          </div>
          <div 
            className="task_tracker_task_dropdown_item"
            onClick={() => handleDropdownItemClick('edit')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Edit
          </div>
          <div 
            className="task_tracker_task_dropdown_item"
            onClick={() => handleDropdownItemClick('details')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Details
          </div>
          <div 
            className="task_tracker_task_dropdown_item"
            onClick={() => handleDropdownItemClick('delegate')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Delegate
          </div>
          <div 
            className="task_tracker_task_dropdown_item"
            onClick={() => handleDropdownItemClick('publish')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Publish
          </div>
          <div 
            className="task_tracker_task_dropdown_item task_tracker_task_dropdown_item_with_submenu"
            onClick={(e) => handleDropdownItemClick('move', e)}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>Move to...</span>
            <i className="pi pi-chevron-right" style={{ fontSize: '12px', opacity: 0.7 }}></i>
          </div>
        </div>,
        document.body
      )}
      
      {/* Submenu for Move to... */}
      {showSubmenu && createPortal(
        <div 
          ref={submenuRef}
          className="task_tracker_task_submenu"
          style={{
            position: 'fixed',
            top: submenuPosition.top,
            left: submenuPosition.left,
            zIndex: 10000,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '160px',
            padding: '4px 0'
          }}
        >
          <div 
            className="task_tracker_task_submenu_item"
            onClick={() => handleSubmenuItemClick('agenda')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Agenda
          </div>
          <div 
            className="task_tracker_task_submenu_item"
            onClick={() => handleSubmenuItemClick('backlog')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Backlog
          </div>
          <div 
            className="task_tracker_task_submenu_item"
            onClick={() => handleSubmenuItemClick('waiting')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Waiting
          </div>
          <div 
            className="task_tracker_task_submenu_item"
            onClick={() => handleSubmenuItemClick('someday')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Someday
          </div>
          <div 
            className="task_tracker_task_submenu_item"
            onClick={() => handleSubmenuItemClick('convert_to_project')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Convert to project
          </div>
          <div 
            className="task_tracker_task_submenu_item"
            onClick={() => handleSubmenuItemClick('done')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0'
            }}
          >
            Done
          </div>
          <div 
            className="task_tracker_task_submenu_item"
            onClick={() => handleSubmenuItemClick('archive')}
            style={{
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Archive
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default InboxView