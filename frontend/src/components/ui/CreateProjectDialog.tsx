import React, { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { DjangoTask, taskApi } from '../../api/taskApi'
import '../../styles/ParentTaskDropdown.css'

interface CreateProjectDialogProps {
  visible: boolean
  onHide: () => void
  onSave: (projectData: ProjectFormData) => Promise<void>
}

export interface ProjectFormData {
  title: string
  description: string
  priority: 'iu' | 'inu' | 'niu' | 'ninu' | ''
  date_start: string
  date_end: string
  parent_id: number | null
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  visible,
  onHide,
  onSave
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
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
        setAvailableTasks(tasks)
      } catch (error) {
        console.error('Error loading tasks:', error)
      } finally {
        setLoadingTasks(false)
      }
    }
    
    if (visible) {
      loadTasks()
    }
  }, [visible])

  // Reset form when dialog opens
  useEffect(() => {
    if (visible) {
      setFormData({
        title: '',
        description: '',
        priority: '',
        date_start: '',
        date_end: '',
        parent_id: null
      })
    }
  }, [visible])

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
      await onSave(formData)
      onHide()
    } catch (error) {
      console.error('Error saving project:', error)
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
      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Create Project</h2>
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
          <label htmlFor="project-title" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Title
          </label>
          <InputText
            id="project-title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full"
            placeholder="Enter project title"
            required
          />
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="project-description" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Description
          </label>
          <InputTextarea
            id="project-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full"
            placeholder="Enter project description"
          />
        </div>

        {/* Priority Field */}
        <div className="form-group">
          <label htmlFor="project-priority" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Priority
          </label>
          <Dropdown
            id="project-priority"
            value={formData.priority}
            options={priorityOptions}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.value }))}
            placeholder="Select priority"
            className="w-full"
          />
        </div>

        {/* Start Date Field */}
        <div className="form-group">
          <label htmlFor="project-start-date" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Start Date
          </label>
          <Calendar
            id="project-start-date"
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
          <label htmlFor="project-due-date" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Due Date
          </label>
          <Calendar
            id="project-due-date"
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
          <label htmlFor="project-parent" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Parent Task
          </label>
          <Dropdown
            id="project-parent"
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

export default CreateProjectDialog

