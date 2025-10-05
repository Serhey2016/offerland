import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useToasts } from './useToasts'
import { TieredMenu } from 'primereact/tieredmenu'
import { taskApi, InboxTaskData } from '../api/taskApi'

// Types for chip data
export interface ChipData {
  id: string
  type: 'title' | 'priority' | 'hashtag' | 'date'
  value: string
  displayValue: string
  backgroundColor: string
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
  const { toast: fallbackToast, showError, showSuccess, showWarning } = useToasts()
  const toast = toastRef || fallbackToast
  
  // Debug toast ref
  console.log('🔍 useInputContainer toast ref:', { toastRef, fallbackToast, finalToast: toast })
  // States
  const [taskInput, setTaskInput] = useState('')
  const [hasText, setHasText] = useState(false)
  const [chips, setChips] = useState<ChipData[]>([])
  
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

  // Process input and create chips
  const processInput = useCallback((input: string) => {
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
        showWarning('Priority already set. Remove existing priority to set a new one.')
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
          displayValue: `${dateType}: ${date.trim()}`,
          backgroundColor: '#B3C3D4'
        }
        
        setChips(prev => [...prev, newChip])
        return
      }
    }

    // Check for title (if no existing title and text doesn't match any pattern)
    const existingTitle = chips.find(chip => chip.type === 'title')
    console.log('Existing title:', existingTitle)
    console.log('Input length:', trimmedInput.length)
    
    if (!existingTitle && trimmedInput.length <= MAX_LENGTH) {
      console.log('Creating title chip for:', trimmedInput)
      const newChip: ChipData = {
        id: `title-${Date.now()}`,
        type: 'title',
        value: trimmedInput,
        displayValue: `title: ${trimmedInput}`,
        backgroundColor: '#AAC7E3'
      }
      
      setChips(prev => [...prev, newChip])
      return
    } else if (existingTitle) {
      console.log('Title already exists')
      showWarning('Task title already set. Remove existing title to set a new one.')
      return
    }
    
    console.log('No pattern matched for input:', trimmedInput)
  }, [chips, showError, showWarning])

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

  // Handle confirm - create task
  const handleConfirm = useCallback(async () => {
    if (taskInput.trim() || chips.length > 0) {
      console.log('Creating task with chips:', chips, 'and input:', taskInput)
      
      try {
        const titleChip = chips.find(chip => chip.type === 'title')
        const priorityChip = chips.find(chip => chip.type === 'priority')
        const dateChips = chips.filter(chip => chip.type === 'date')
        
        const taskData: InboxTaskData = {
          title: titleChip?.value || taskInput.trim(),
        }
        
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
        
        console.log('📤 Calling onSubmit with taskData:', taskData)
        await onSubmit(taskData)
        console.log('✅ onSubmit completed successfully')
        
        // Show success message
        console.log('🎉 About to show success message')
        showSuccess('Task created successfully!', 'Task Saved', 4000)
        console.log('🎯 Success message function called')
        
        // Clear form - do this immediately after successful submission
        setTaskInput('')
        setHasText(false)
        setChips([])
        
        // Clear the contenteditable element
        if (contentEditableRef.current) {
          contentEditableRef.current.textContent = ''
          contentEditableRef.current.focus()
        }
        
        console.log('Form cleared after task creation')
        
        // Call optional callback
        onTaskCreated?.()
        
      } catch (error) {
        console.error('Error creating task:', error)
        showError('Error creating task. Please try again.')
      }
    }
  }, [taskInput, chips, onSubmit, showError, showSuccess, onTaskCreated])

  // Handle priority select
  const handlePrioritySelect = useCallback((priority: string) => {
    console.log('Priority selected:', priority)
    
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
    
    // Check for comma separator at the end
    if (text.endsWith(',')) {
      const textWithoutComma = text.slice(0, -1).trim()
      
      if (textWithoutComma) {
        processInput(textWithoutComma)
        element.textContent = ''
        setTaskInput('')
        setHasText(chips.length > 0)
        return
      }
    }
    
    if (text.length <= MAX_LENGTH) {
      setTaskInput(text)
      setHasText(text.length > 0 || chips.length > 0)
    } else {
      const truncatedText = text.substring(0, MAX_LENGTH)
      element.textContent = truncatedText
      setTaskInput(truncatedText)
      setHasText(true)
      
      setTimeout(() => {
        restoreCaretPosition(element, Math.min(caretPosition, MAX_LENGTH))
      }, 0)
    }
  }, [processInput, chips])

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
      id: 'add-subtask-option',
      label: 'Add subtask',
      command: () => console.log('Add subtask selected')
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

