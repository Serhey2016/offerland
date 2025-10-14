import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useToasts } from './useToasts'
import { TieredMenu } from 'primereact/tieredmenu'
import { taskApi, InboxTaskData } from '../api/taskApi'

// Types for chip data
export interface ChipData {
  id: string
  type: 'title' | 'priority' | 'hashtag' | 'date' | 'description'
  value: string
  displayValue: string
}

interface UseInputContainerProps {
  onSubmit: (taskData: InboxTaskData) => Promise<void>
  onTaskCreated?: () => void
  toastRef?: React.RefObject<any>
}

interface UseInputContainerReturn {
  // States
  taskInput: string
  hasText: boolean
  chips: ChipData[]
  isMaxLength: boolean
  isSubtaskMode: boolean
  isDescriptionMode: boolean
  parentTaskChips: ChipData[]
  subtasks: Array<{chips: ChipData[]}>
  
  // Refs
  contentEditableRef: React.RefObject<HTMLDivElement>
  menuRef: React.RefObject<TieredMenu>
  
  // Functions
  handleInputChange: (e: React.FormEvent<HTMLDivElement>) => void
  handleKeyPress: (e: React.KeyboardEvent<HTMLDivElement>) => void
  handleConfirm: () => Promise<void>
  handlePrioritySelect: (priority: string) => void
  removeChip: (chipId: string) => void
  editChip: (chip: ChipData) => void
  insertTextIntoInput: (text: string) => void
  toggleMenu: (event: React.MouseEvent) => void
  dropdownMenuItems: any[]
}

// Constants
const MAX_LENGTH = 120

const priorityMap = {
  'iu': { full: 'Important & Urgent', color: '#EF9A9A' },
  'inu': { full: 'Important & Not Urgent', color: '#90CAF9' },
  'niu': { full: 'Not Important & Urgent', color: '#FFCC80' },
  'ninu': { full: 'Not Important & Not Urgent', color: '#E0E0E0' }
}

export const useInputContainer = ({ 
  onSubmit, 
  onTaskCreated,
  toastRef
}: UseInputContainerProps): UseInputContainerReturn => {
  // Use toasts hook (fallback if no external toastRef provided)
  const { toast: fallbackToast, showError: fallbackShowError, showSuccess: fallbackShowSuccess, showWarning: fallbackShowWarning } = useToasts()
  const toast = toastRef || fallbackToast
  
  // Use external toastRef if provided, otherwise use fallback functions
  const showError = useCallback((message: string, summary?: string, life?: number) => {
    if (toastRef?.current) {
      toastRef.current.show({
        severity: 'error',
        summary: summary || 'Error',
        detail: message,
        life: life || 3000
      })
    } else {
      fallbackShowError(message, summary, life)
    }
  }, [toastRef, fallbackShowError])
  
  const showSuccess = useCallback((message: string, summary?: string, life?: number) => {
    if (toastRef?.current) {
      toastRef.current.show({
        severity: 'success',
        summary: summary || 'Success',
        detail: message,
        life: life || 4000,
        closable: true,
        sticky: false
      })
    } else {
      fallbackShowSuccess(message, summary, life)
    }
  }, [toastRef, fallbackShowSuccess])
  
  const showWarning = useCallback((message: string, summary?: string, life?: number) => {
    if (toastRef?.current) {
      toastRef.current.show({
        severity: 'warn',
        summary: summary || 'Warning',
        detail: message,
        life: life || 3000
      })
    } else {
      fallbackShowWarning(message, summary, life)
    }
  }, [toastRef, fallbackShowWarning])
  // States
  const [taskInput, setTaskInput] = useState('')
  const [hasText, setHasText] = useState(false)
  const [chips, setChips] = useState<ChipData[]>([])
  
  // Subtask states
  const [isSubtaskMode, setIsSubtaskMode] = useState(false)
  const [subtasks, setSubtasks] = useState<Array<{chips: ChipData[]}>>([])
  const [parentTaskChips, setParentTaskChips] = useState<ChipData[]>([])
  
  // Description mode state
  const [isDescriptionMode, setIsDescriptionMode] = useState(false)
  
  // Refs
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<TieredMenu>(null)
  
  // Computed state
  const isMaxLength = taskInput.length >= MAX_LENGTH

  // Helper function to format date from dd.mm.yyyy to yyyy-mm-dd
  const formatDateForBackend = (dateString: string): string => {
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

  // Check if text is a subtask abbreviation
  const isSubtaskAbbreviation = (text: string): boolean => {
    return text.toLowerCase() === 'subt'
  }

  // Check if text is a mem abbreviation
  const isMemAbbreviation = (text: string): boolean => {
    return text.toLowerCase() === 'mem'
  }

  // Check if text is a description abbreviation
  const isDescriptionAbbreviation = (text: string): boolean => {
    return text.toLowerCase() === 'descr'
  }

  // Add subtask to queue
  const addSubtaskToQueue = useCallback(() => {
    if (chips.length > 0) {
      setSubtasks(prev => [...prev, { chips: [...chips] }])
      setChips([])
      setTaskInput('')
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = ''
      }
    }
  }, [chips])

  // Enter description mode
  const enterDescriptionMode = useCallback(() => {
    setIsDescriptionMode(true)
    setTaskInput('')
    
    // Clear and focus input
    if (contentEditableRef.current) {
      contentEditableRef.current.textContent = ''
      contentEditableRef.current.focus()
    }
    
    menuRef.current?.hide()
  }, [])

  // Enter subtask mode
  const enterSubtaskMode = useCallback(() => {
    // If already in subtask mode, queue current subtask and prepare for next one
    if (isSubtaskMode) {
      const titleChip = chips.find(chip => chip.type === 'title')
      if (titleChip) {
        // Add current subtask to queue
        addSubtaskToQueue()
      }
      // Clear input for next subtask but keep parent chips and stay in subtask mode
      setChips([])
      setTaskInput('')
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = ''
        contentEditableRef.current.focus()
      }
      menuRef.current?.hide()
      return
    }
    
    // First time entering subtask mode
    const titleChip = chips.find(chip => chip.type === 'title')
    
    if (!titleChip) {
      showWarning('Please add a task title before creating subtasks.')
      return
    }
    
    // Store current chips as parent task chips
    setParentTaskChips([...chips])
    setIsSubtaskMode(true)
    setChips([])
    setTaskInput('')
    setHasText(true)  // Keep has-text class active
    
    // Clear and focus input
    if (contentEditableRef.current) {
      contentEditableRef.current.textContent = ''
      contentEditableRef.current.focus()
    }
    
    menuRef.current?.hide()
  }, [chips, showWarning, isSubtaskMode, addSubtaskToQueue])

  // Process input and create chips
  const processInput = useCallback((input: string) => {
    if (!input.trim()) return

    const trimmedInput = input.trim()
    
    // If in description mode, create description chip
    if (isDescriptionMode) {
      const existingDescription = chips.find(chip => chip.type === 'description')
      
      if (existingDescription) {
        showWarning('Description already set. Remove existing description to set a new one.')
        return
      }
      
      // Create description chip with truncated display value
      const displayValue = trimmedInput.length > 25 
        ? `${trimmedInput.substring(0, 25)}...` 
        : trimmedInput
      
      const newChip: ChipData = {
        id: `description-${Date.now()}`,
        type: 'description',
        value: trimmedInput, // Store full text
        displayValue: displayValue // Display truncated text
      }
      
      setChips(prev => [...prev, newChip])
      setIsDescriptionMode(false) // Exit description mode after creating chip
      return
    }
    
    // Check for mem abbreviation (save/memorize)
    if (isMemAbbreviation(trimmedInput)) {
      // Clear the input first
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = ''
      }
      setTaskInput('')
      // Trigger save
      handleConfirm()
      return
    }
    
    // Check for description abbreviation
    if (isDescriptionAbbreviation(trimmedInput)) {
      enterDescriptionMode()
      return
    }
    
    // Check for subtask abbreviation
    if (isSubtaskAbbreviation(trimmedInput)) {
      enterSubtaskMode()
      return
    }
    
    // Check for priority
    if (isPriorityAbbreviation(trimmedInput)) {
      const priority = priorityMap[trimmedInput.toLowerCase() as keyof typeof priorityMap]
      const existingPriority = chips.find(chip => chip.type === 'priority')
      
      if (existingPriority) {
        showWarning('Priority already set. Remove existing priority to set a new one.')
        return
      }
      
      const newChip: ChipData = {
        id: `priority-${Date.now()}`,
        type: 'priority',
        value: trimmedInput.toLowerCase(),
        displayValue: priority.full
      }
      
      setChips(prev => [...prev, newChip])
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
          showError(`Invalid date format for ${dateType.toLowerCase()}. Please use format: ${prefix}dd.mm.yyyy (e.g., ${prefix}24.09.2025)`)
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
          showError(`Invalid date for ${dateType.toLowerCase()}. Please check day, month, and year values.`)
          return
        }
        
        console.log('Date validation passed, creating chip')
        
        const newChip: ChipData = {
          id: `date-${Date.now()}`,
          type: 'date',
          value: trimmedInput,
          displayValue: `${dateType}: ${date.trim()}`
        }
        
        setChips(prev => [...prev, newChip])
        return
      }
    }

    // Check for title (if no existing title and text doesn't match any pattern)
    const existingTitle = chips.find(chip => chip.type === 'title')
    
    if (!existingTitle && trimmedInput.length <= MAX_LENGTH) {
      const newChip: ChipData = {
        id: `title-${Date.now()}`,
        type: 'title',
        value: trimmedInput,
        displayValue: `title: ${trimmedInput}`
      }
      
      setChips(prev => [...prev, newChip])
      return
    } else if (existingTitle && !isSubtaskMode) {
      // Only show duplicate title warning if NOT in subtask mode
      console.log('Title already exists')
      showWarning('Task title already set. Remove existing title to set a new one.')
      return
    }
    
    console.log('No pattern matched for input:', trimmedInput)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chips, showError, showWarning, isSubtaskMode, isDescriptionMode, enterSubtaskMode, enterDescriptionMode])

  // Remove chip
  const removeChip = useCallback((chipId: string) => {
    setChips(prev => prev.filter(chip => chip.id !== chipId))
  }, [])

  // Edit chip (convert back to input) - for title chips only
  const editChip = useCallback((chip: ChipData) => {
    if (chip.type === 'title') {
      removeChip(chip.id)
      setTaskInput(chip.value)
      
      setTimeout(() => {
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = chip.value
          contentEditableRef.current.focus()
          
          const range = document.createRange()
          const selection = window.getSelection()
          if (contentEditableRef.current.firstChild) {
            range.selectNodeContents(contentEditableRef.current)
            range.collapse(false)
            selection?.removeAllRanges()
            selection?.addRange(range)
          }
        }
      }, 0)
    }
  }, [removeChip])

  // Sync contenteditable with taskInput
  useEffect(() => {
    const element = contentEditableRef.current
    if (element) {
      if (taskInput === '' && element.textContent !== '') {
        element.textContent = ''
      }
    }
  }, [taskInput])

  // Exit subtask mode and reset state
  const exitSubtaskMode = useCallback(() => {
    setIsSubtaskMode(false)
    setSubtasks([])
    setParentTaskChips([])
    setChips([])
    setTaskInput('')
    setHasText(false)
    setIsDescriptionMode(false)
    if (contentEditableRef.current) {
      contentEditableRef.current.textContent = ''
    }
  }, [])

  // Handle confirm - create task
  const handleConfirm = useCallback(async () => {
    if (taskInput.trim() || chips.length > 0 || parentTaskChips.length > 0) {
      
      try {
        // If in subtask mode with current chips, add to queue
        if (isSubtaskMode && chips.length > 0) {
          const titleChip = chips.find(chip => chip.type === 'title')
          if (titleChip) {
            addSubtaskToQueue()
          }
        }
        
        // Determine which chips to use for parent task
        const parentChips = isSubtaskMode ? parentTaskChips : chips
        const titleChip = parentChips.find(chip => chip.type === 'title')
        const priorityChip = parentChips.find(chip => chip.type === 'priority')
        const dateChips = parentChips.filter(chip => chip.type === 'date')
        const descriptionChip = parentChips.find(chip => chip.type === 'description')
        
        // Create parent task data
        const parentTaskData: InboxTaskData = {
          title: titleChip?.value || taskInput.trim(),
        }
        
        if (priorityChip) {
          parentTaskData.priority = priorityChip.value as 'iu' | 'inu' | 'niu' | 'ninu'
        }
        
        if (descriptionChip) {
          parentTaskData.description = descriptionChip.value
        }
        
        const startDate = extractDateStart(dateChips)
        if (startDate) {
          parentTaskData.date_start = startDate
        }
        
        const endDate = extractDateEnd(dateChips)
        if (endDate) {
          parentTaskData.date_end = endDate
        }
        
        // Create parent task first
        const parentResponse = await onSubmit(parentTaskData)
        const parentTaskId = parentResponse?.task?.id || parentResponse?.id
        
        console.log('Parent task created with ID:', parentTaskId)
        
        // If we have subtasks, create them sequentially
        if (isSubtaskMode && subtasks.length > 0 && parentTaskId) {
          for (const subtask of subtasks) {
            const subtaskTitleChip = subtask.chips.find(chip => chip.type === 'title')
            const subtaskPriorityChip = subtask.chips.find(chip => chip.type === 'priority')
            const subtaskDateChips = subtask.chips.filter(chip => chip.type === 'date')
            const subtaskDescriptionChip = subtask.chips.find(chip => chip.type === 'description')
            
            if (!subtaskTitleChip) continue // Skip subtasks without title
            
            const subtaskData: InboxTaskData = {
              title: subtaskTitleChip.value,
              parent_id: parentTaskId
            }
            
            if (subtaskPriorityChip) {
              subtaskData.priority = subtaskPriorityChip.value as 'iu' | 'inu' | 'niu' | 'ninu'
            }
            
            if (subtaskDescriptionChip) {
              subtaskData.description = subtaskDescriptionChip.value
            }
            
            const subtaskStartDate = extractDateStart(subtaskDateChips)
            if (subtaskStartDate) {
              subtaskData.date_start = subtaskStartDate
            }
            
            const subtaskEndDate = extractDateEnd(subtaskDateChips)
            if (subtaskEndDate) {
              subtaskData.date_end = subtaskEndDate
            }
            
            await onSubmit(subtaskData)
            console.log('Subtask created:', subtaskData.title)
          }
          
          showSuccess(`Task and ${subtasks.length} subtask(s) created successfully!`, 'Tasks Saved', 4000)
        } else {
          showSuccess('Task created successfully!', 'Task Saved', 4000)
        }
        
        // Clear all state after successful submission
        setTaskInput('')
        setHasText(false)
        setChips([])
        setIsSubtaskMode(false)
        setSubtasks([])
        setParentTaskChips([])
        setIsDescriptionMode(false)
        
        // Clear the contenteditable element
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = ''
          contentEditableRef.current.focus()
        }
        
        // Call optional callback
        onTaskCreated?.()
        
      } catch (error) {
        console.error('Error creating task:', error)
        showError('Error creating task. Please try again.')
      }
    }
  }, [taskInput, chips, parentTaskChips, isSubtaskMode, subtasks, onSubmit, showError, showSuccess, onTaskCreated, addSubtaskToQueue, extractDateStart, extractDateEnd])

  // Handle priority select
  const handlePrioritySelect = useCallback((priority: string) => {
    
    const priorityMapping: { [key: string]: string } = {
      'important-urgent': 'iu',
      'important-not-urgent': 'inu',
      'not-important-urgent': 'niu',
      'not-important-not-urgent': 'ninu'
    }
    
    const abbr = priorityMapping[priority]
    
    if (abbr) {
      processInput(abbr)
      
      if (contentEditableRef.current) {
        contentEditableRef.current.textContent = ''
      }
      setTaskInput('')
      
      menuRef.current?.hide()
    }
  }, [processInput])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      
      const element = e.currentTarget
      const text = element.textContent || ''
      
      if (text.trim()) {
        processInput(text.trim())
        element.textContent = ''
        setTaskInput('')
        setHasText(chips.length > 0)
      } else {
        handleConfirm()
      }
    }
  }, [processInput, chips, handleConfirm])

  // Functions for cursor management
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

  // Handle input change
  const handleInputChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const text = element.textContent || ''
    const caretPosition = saveCaretPosition(element)
    
    // Check for comma separator at the end (but NOT in description mode)
    if (text.endsWith(',') && !isDescriptionMode) {
      const textWithoutComma = text.slice(0, -1).trim()
      
      if (textWithoutComma) {
        processInput(textWithoutComma)
        element.textContent = ''
        setTaskInput('')
        setHasText(chips.length > 0)
        return
      }
    }
    
    // In description mode, allow up to 5000 characters
    const maxLen = isDescriptionMode ? 5000 : MAX_LENGTH
    
    if (text.length <= maxLen) {
      setTaskInput(text)
      setHasText(text.length > 0 || chips.length > 0)
    } else {
      const truncatedText = text.substring(0, maxLen)
      element.textContent = truncatedText
      setTaskInput(truncatedText)
      setHasText(true)
      
      setTimeout(() => {
        restoreCaretPosition(element, Math.min(caretPosition, maxLen))
      }, 0)
    }
  }, [processInput, chips, isDescriptionMode])

  // Helper function to insert text into input field
  const insertTextIntoInput = useCallback((text: string) => {
    const element = contentEditableRef.current
    if (element) {
      element.textContent = text
      setTaskInput(text)
      setHasText(text.length > 0 || chips.length > 0)
      element.focus()
      
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
      
      menuRef.current?.hide()
    }
  }, [chips])

  // Dropdown menu items
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
      id: 'add-description-option',
      label: 'Add description',
      command: () => enterDescriptionMode()
    },
    {
      id: 'add-subtask-option',
      label: 'Add subtask',
      command: () => enterSubtaskMode()
    },
    {
      id: 'priority-option',
      label: 'Priority',
      items: [
        {
          id: 'priority-matrix'
          // template will be added in component
        }
      ]
    },
  ]

  // Toggle menu
  const toggleMenu = useCallback((event: React.MouseEvent) => {
    console.log('Toggle menu clicked, menuRef:', menuRef.current)
    
    if (menuRef.current) {
      menuRef.current.toggle(event)
    } else {
      console.error('Menu ref is null')
    }
  }, [])

  return {
    // States
    taskInput,
    hasText,
    chips,
    isMaxLength,
    isSubtaskMode,
    isDescriptionMode,
    parentTaskChips,
    subtasks,
    
    // Refs
    contentEditableRef,
    menuRef,
    
    // Functions
    handleInputChange,
    handleKeyPress,
    handleConfirm,
    handlePrioritySelect,
    removeChip,
    editChip,
    insertTextIntoInput,
    toggleMenu,
    dropdownMenuItems
  }
}

