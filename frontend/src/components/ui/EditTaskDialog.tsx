import React, { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { DjangoTask, taskApi } from '../../api/taskApi'
import '../../styles/ParentTaskDropdown.css'

interface EditTaskDialogProps {
  visible: boolean
  task: DjangoTask | null
  onHide: () => void
  onSave: (taskData: EditTaskFormData) => Promise<void>
  mode?: 'create' | 'edit'
  defaultParentId?: number | null  // Pre-selected parent task ID for creating subtasks
}

export interface EditTaskFormData {
  id: number
  title: string
  description: string
  priority: 'iu' | 'inu' | 'niu' | 'ninu' | ''
  date_start: string
  date_end: string
  parent_id: number | null
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  visible,
  task,
  onHide,
  onSave,
  mode = 'edit',
  defaultParentId = null
}) => {
  const [formData, setFormData] = useState<EditTaskFormData>({
    id: 0,
    title: '',
    description: '',
    priority: '',
    date_start: '',
    date_end: '',
    parent_id: null
  })
  
  const [loading, setLoading] = useState(false)
  const [availableTasks, setAvailableTasks] = useState<DjangoTask[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)

  // Priority options
  const priorityOptions = [
    { label: 'Important & Urgent', value: 'iu' },
    { label: 'Important & Not Urgent', value: 'inu' },
    { label: 'Not Important & Urgent', value: 'niu' },
    { label: 'Not Important & Not Urgent', value: 'ninu' }
  ]

  // Load available tasks for parent selection
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoadingTasks(true)
        const tasks = await taskApi.getUserTasks()
        // Filter out the current task from available parents (can't be parent of itself)
        const filteredTasks = tasks.filter(t => mode === 'create' || t.id !== task?.id)
        setAvailableTasks(filteredTasks)
      } catch (error) {
        console.error('Error loading tasks:', error)
      } finally {
        setLoadingTasks(false)
      }
    }
    
    if (visible) {
      loadTasks()
    }
  }, [visible, task, mode])

  // Load task data when dialog opens or reset for create mode
  useEffect(() => {
    if (visible) {
      if (mode === 'create') {
        // Reset form for create mode, but use defaultParentId if provided
        console.log('[EditTaskDialog] Create mode - defaultParentId:', defaultParentId)
        setFormData({
          id: 0,
          title: '',
          description: '',
          priority: '',
          date_start: '',
          date_end: '',
          parent_id: defaultParentId
        })
        console.log('[EditTaskDialog] FormData set with parent_id:', defaultParentId)
      } else if (task) {
        // Load task data for edit mode
        setFormData({
          id: task.id,
          title: task.title || '',
          description: task.description || '',
          priority: task.priority || '',
          date_start: task.date_start || '',
          date_end: task.date_end || '',
          parent_id: (task as any).parent_id || null
        })
      }
    }
  }, [task, visible, mode, defaultParentId])

  // Convert date string (YYYY-MM-DD or DD.MM.YYYY) to Date object
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null
    
    // Check if format is YYYY-MM-DD
    if (dateStr.includes('-')) {
      const date = new Date(dateStr)
      return isNaN(date.getTime()) ? null : date
    }
    
    // Check if format is DD.MM.YYYY
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.')
      if (parts.length === 3) {
        const [day, month, year] = parts
        const date = new Date(`${year}-${month}-${day}`)
        return isNaN(date.getTime()) ? null : date
      }
    }
    
    return null
  }

  // Convert Date object to YYYY-MM-DD string
  const formatDateToAPI = (date: Date | null): string => {
    if (!date) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      console.log('[EditTaskDialog] Saving task with data:', formData)
      console.log('[EditTaskDialog] parent_id being saved:', formData.parent_id)
      await onSave(formData)
      onHide()
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (field: 'date_start' | 'date_end', value: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: formatDateToAPI(value)
    }))
  }

  const headerContent = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
        {mode === 'create' ? 'Create Task' : 'Edit Task'}
      </h2>
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={headerContent}
      style={{ width: '500px', maxWidth: '90vw' }}
      modal
      draggable={false}
      resizable={false}
      dismissableMask={false}
      className="edit-task-dialog"
    >
      <div className="edit-task-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="task-title" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Title
          </label>
          <InputText
            id="task-title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full"
            placeholder="Enter task title"
            required
          />
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="task-description" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Description
          </label>
          <InputTextarea
            id="task-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full"
            placeholder="Enter task description"
          />
        </div>

        {/* Priority Field */}
        <div className="form-group">
          <label htmlFor="task-priority" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Priority
          </label>
          <Dropdown
            id="task-priority"
            value={formData.priority}
            options={priorityOptions}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.value }))}
            placeholder="Select priority"
            className="w-full"
          />
        </div>

        {/* Start Date Field */}
        <div className="form-group">
          <label htmlFor="task-start-date" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Start Date
          </label>
          <Calendar
            id="task-start-date"
            value={parseDate(formData.date_start)}
            onChange={(e) => handleDateChange('date_start', e.value as Date | null)}
            dateFormat="dd.mm.yy"
            showIcon
            icon="pi pi-calendar"
            className="w-full"
            placeholder="Select start date"
          />
        </div>

        {/* Due Date Field */}
        <div className="form-group">
          <label htmlFor="task-due-date" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Due Date
          </label>
          <Calendar
            id="task-due-date"
            value={parseDate(formData.date_end)}
            onChange={(e) => handleDateChange('date_end', e.value as Date | null)}
            dateFormat="dd.mm.yy"
            showIcon
            icon="pi pi-calendar"
            className="w-full"
            placeholder="Select due date"
          />
        </div>

        {/* Parent Task Field */}
        <div className="form-group">
          <label htmlFor="task-parent" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Parent Task
          </label>
          <Dropdown
            id="task-parent"
            value={formData.parent_id}
            options={[
              { label: 'None', value: null },
              ...availableTasks.map(t => ({ 
                label: t.title, 
                value: t.id 
              }))
            ]}
            onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.value }))}
            placeholder="Select parent task"
            className="w-full parent-task-dropdown"
            disabled={loadingTasks}
            filter
            filterBy="label"
            showClear={formData.parent_id !== null}
            panelStyle={{ maxWidth: '500px' }}
            itemTemplate={(option) => (
              <div style={{ 
                whiteSpace: 'normal', 
                wordWrap: 'break-word', 
                wordBreak: 'break-word',
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
                {option.label}
              </div>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button
            label="Cancel"
            onClick={onHide}
            className="p-button-text"
            disabled={loading}
          />
          <Button
            label="Save"
            onClick={handleSave}
            loading={loading}
            disabled={!formData.title.trim()}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default EditTaskDialog

