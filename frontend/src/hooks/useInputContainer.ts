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
  itemType?: string
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
  activeLabel: 'project' | 'jobsearch'
  showCreateTaskDialog: boolean
  showCreateProjectDialog: boolean
  showCreateJobSearchDialog: boolean
  
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
  setActiveLabel: (label: 'project' | 'jobsearch') => void
  handleOpenCreateTaskDialog: () => void
  handleCloseCreateTaskDialog: () => void
  handleSaveCreateTask: (taskData: any) => Promise<void>
  handleOpenCreateProjectDialog: () => void
  handleCloseCreateProjectDialog: () => void
  handleSaveCreateProject: (projectData: any) => Promise<void>
  handleOpenCreateJobSearchDialog: () => void
  handleCloseCreateJobSearchDialog: () => void
  handleSaveCreateJobSearch: (jobSearchData: any) => Promise<void>
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
  toastRef,
  itemType
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
  
  // Active label state (Project or Job search)
  const [activeLabel, setActiveLabel] = useState<'project' | 'jobsearch'>('project')
  
  // Create task dialog state
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false)
  
  // Create project dialog state
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false)
  
  // Create job search dialog state
  const [showCreateJobSearchDialog, setShowCreateJobSearchDialog] = useState(false)
  
  // Refs
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<TieredMenu>(null)
  
  // Computed state
  const isMaxLength = taskInput.length >= MAX_LENGTH

  // Reset activeLabel when itemType changes
  useEffect(() => {
    if (itemType !== 'contact') {
      setActiveLabel('project')
    }
  }, [itemType])

  // Initialize hasText to true when task creation block is shown
  // This ensures the left button and label are visible immediately when a speed dial item is clicked
  useEffect(() => {
    if (itemType) {
      setHasText(true)
    }
  }, [itemType])

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
    // Check if description already exists
    const existingDescription = chips.find(chip => chip.type === 'description')
    
    if (existingDescription) {
      showWarning('Description already added. Remove description or click on it to edit.')
      return
    }
    
    setIsDescriptionMode(true)
    setTaskInput('')
    
    // Clear and focus input
    if (contentEditableRef.current) {
      contentEditableRef.current.textContent = ''
      contentEditableRef.current.focus()
    }
    
    menuRef.current?.hide()
  }, [chips, showWarning])

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

  // Edit chip (convert back to input) - for title and description chips
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
    } else if (chip.type === 'description') {
      removeChip(chip.id)
      setTaskInput(chip.value)
      setIsDescriptionMode(true)
      
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
    // Check if we have any input to save
    if (!taskInput.trim() && chips.length === 0 && parentTaskChips.length === 0) {
      showWarning('Please enter a title before saving.')
      return
    }
    
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
      
      // Get title from chip OR directly from input (without converting to chip)
      const title = titleChip?.value || taskInput.trim()
      
      // Validate title
      if (!title) {
        showWarning('Please enter a title before saving.')
        return
      }
      
      const startDate = extractDateStart(dateChips)
      const endDate = extractDateEnd(dateChips)
      const description = descriptionChip?.value
      const priority = priorityChip?.value as 'iu' | 'inu' | 'niu' | 'ninu' | undefined
      
      // Check itemType and route to appropriate save method
      if (itemType === 'project') {
        // For megaphone icon - create Advertising/Announcement
        const advertisingData: InboxTaskData = {
          title,
        }
        
        if (priority) {
          advertisingData.priority = priority
        }
        
        if (description) {
          advertisingData.description = description
        }
        
        if (startDate) {
          advertisingData.date_start = startDate
        }
        
        if (endDate) {
          advertisingData.date_end = endDate
        }
        
        // Create advertising first
        const parentResponse = await taskApi.createAdvertising(advertisingData)
        const parentTaskId = parentResponse?.advertising?.id || parentResponse?.id
        
        console.log('Advertising created with ID:', parentTaskId)
        
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
            
            await taskApi.createAdvertising(subtaskData)
            console.log('Advertising subtask created:', subtaskData.title)
          }
          
          showSuccess(`Announcement and ${subtasks.length} subtask(s) created successfully!`, 'Announcements Saved', 4000)
        } else {
          showSuccess('Announcement created successfully!', 'Announcement Saved', 4000)
        }
      } else if (itemType === 'contact') {
        // For briefcase icon - create Project or Job Search based on activeLabel
        if (activeLabel === 'jobsearch') {
          // Create Job Search entry
          const parentResponse = await taskApi.createJobSearch(
            title,
            startDate,
            description // using description as notes
          )
          
          console.log('Job Search created:', parentResponse)
          showSuccess('Job Search created successfully!', 'Job Search Saved', 4000)
        } else {
          // Create Project (Task with card_template='project')
        const parentTaskData: InboxTaskData = {
          title,
        }
        
        if (priority) {
          parentTaskData.priority = priority
        }
        
        if (description) {
          parentTaskData.description = description
        }
        
        if (startDate) {
          parentTaskData.date_start = startDate
        }
        
        if (endDate) {
          parentTaskData.date_end = endDate
        }
        
        // Create parent project first
        const parentResponse = await taskApi.createProject(parentTaskData)
        const parentTaskId = parentResponse?.task?.id || parentResponse?.id
        
        console.log('Parent project created with ID:', parentTaskId)
        
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
            
            await taskApi.createProject(subtaskData)
            console.log('Subtask created:', subtaskData.title)
          }
          
          showSuccess(`Project and ${subtasks.length} subtask(s) created successfully!`, 'Projects Saved', 4000)
          } else {
            showSuccess('Project created successfully!', 'Project Saved', 4000)
          }
        }
      } else {
        // For all other item types (Task, etc.) - use onSubmit callback
        const parentTaskData: InboxTaskData = {
          title,
        }
        
        if (priority) {
          parentTaskData.priority = priority
        }
        
        if (description) {
          parentTaskData.description = description
        }
        
        if (startDate) {
          parentTaskData.date_start = startDate
        }
        
        if (endDate) {
          parentTaskData.date_end = endDate
        }
        
        // Create parent task first using provided onSubmit
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
      const errorType = itemType === 'contact' 
        ? (activeLabel === 'jobsearch' ? 'job search' : 'project') 
        : 'task'
      showError(`Error creating ${errorType}. Please try again.`)
    }
  }, [taskInput, chips, parentTaskChips, isSubtaskMode, subtasks, activeLabel, itemType, showError, showSuccess, showWarning, onTaskCreated, onSubmit, addSubtaskToQueue, extractDateStart, extractDateEnd])

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
        // Keep hasText true to maintain button visibility
        setHasText(true)
      }
      // Empty Enter does nothing - save only via confirm button or 'mem' abbreviation
    }
  }, [processInput, chips])

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
        // Keep hasText true to maintain button visibility
        setHasText(true)
        return
      }
    }
    
    // In description mode, allow up to 5000 characters
    const maxLen = isDescriptionMode ? 5000 : MAX_LENGTH
    
    if (text.length <= maxLen) {
      setTaskInput(text)
      // Always keep hasText true when in active task creation mode (itemType is set)
      // This ensures the left button and label remain visible even when text is deleted
      setHasText(true)
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
      // Keep hasText true to maintain button visibility
      setHasText(true)
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
    if (menuRef.current) {
      menuRef.current.toggle(event)
    } else {
      console.error('Menu ref is null')
    }
  }, [])

  // Create task dialog handlers
  const handleOpenCreateTaskDialog = useCallback(() => {
    setShowCreateTaskDialog(true)
  }, [])

  const handleCloseCreateTaskDialog = useCallback(() => {
    setShowCreateTaskDialog(false)
  }, [])

  const handleSaveCreateTask = useCallback(async (taskData: any) => {
    try {
      // Create FormData for the request
      const formData = new FormData()
      formData.append('card_template', 'task')
      formData.append('title', taskData.title || '')
      formData.append('description', taskData.description || '')
      formData.append('priority', taskData.priority || '')
      formData.append('date_start', taskData.date_start || '')
      formData.append('date_end', taskData.date_end || '')
      formData.append('category', 'inbox')

      // Call the correct endpoint
      const response = await taskApi.createTaskWithFormData(formData)

      if (response.success) {
        showSuccess('Task created successfully')
        setShowCreateTaskDialog(false)
        
        // Call onTaskCreated callback if provided
        if (onTaskCreated) {
          onTaskCreated()
        }
      } else {
        showError('Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      showError('Error creating task')
    }
  }, [showSuccess, showError, onTaskCreated])

  // Create project dialog handlers
  const handleOpenCreateProjectDialog = useCallback(() => {
    setShowCreateProjectDialog(true)
  }, [])

  const handleCloseCreateProjectDialog = useCallback(() => {
    setShowCreateProjectDialog(false)
  }, [])

  const handleSaveCreateProject = useCallback(async (projectData: any) => {
    try {
      // Create FormData for the request
      const formData = new FormData()
      formData.append('card_template', 'project')
      formData.append('title', projectData.title || '')
      formData.append('description', projectData.description || '')
      formData.append('priority', projectData.priority || '')
      formData.append('date_start', projectData.date_start || '')
      formData.append('date_end', projectData.date_end || '')
      formData.append('category', 'inbox')

      // Call the correct endpoint
      const response = await taskApi.createTaskWithFormData(formData)

      if (response.success) {
        showSuccess('Project created successfully')
        setShowCreateProjectDialog(false)
        
        // Call onTaskCreated callback if provided
        if (onTaskCreated) {
          onTaskCreated()
        }
      } else {
        showError('Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
      showError('Error creating project')
    }
  }, [showSuccess, showError, onTaskCreated])

  // Create job search dialog handlers
  const handleOpenCreateJobSearchDialog = useCallback(() => {
    setShowCreateJobSearchDialog(true)
  }, [])

  const handleCloseCreateJobSearchDialog = useCallback(() => {
    setShowCreateJobSearchDialog(false)
  }, [])

  const handleSaveCreateJobSearch = useCallback(async (jobSearchData: any) => {
    try {
      // Create FormData for the request
      const formData = new FormData()
      formData.append('title', jobSearchData.title || '')

      // Call the correct endpoint for job search
      const response = await taskApi.createJobSearch(formData)

      if (response.success) {
        showSuccess('Job search created successfully')
        setShowCreateJobSearchDialog(false)
        
        // Call onTaskCreated callback if provided
        if (onTaskCreated) {
          onTaskCreated()
        }
      } else {
        showError('Failed to create job search')
      }
    } catch (error) {
      console.error('Error creating job search:', error)
      showError('Error creating job search')
    }
  }, [showSuccess, showError, onTaskCreated])

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
    activeLabel,
    showCreateTaskDialog,
    showCreateProjectDialog,
    showCreateJobSearchDialog,
    
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
    dropdownMenuItems,
    setActiveLabel,
    handleOpenCreateTaskDialog,
    handleCloseCreateTaskDialog,
    handleSaveCreateTask,
    handleOpenCreateProjectDialog,
    handleCloseCreateProjectDialog,
    handleSaveCreateProject,
    handleOpenCreateJobSearchDialog,
    handleCloseCreateJobSearchDialog,
    handleSaveCreateJobSearch
  }
}

