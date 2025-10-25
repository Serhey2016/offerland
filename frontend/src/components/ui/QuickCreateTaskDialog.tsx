import React, { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'

interface QuickCreateTaskDialogProps {
  visible: boolean
  onHide: () => void
  onCreate: (data: QuickCreateTaskData) => Promise<void>
  startTime?: Date
  endTime?: Date
}

export interface QuickCreateTaskData {
  title: string
  description?: string
}

const QuickCreateTaskDialog: React.FC<QuickCreateTaskDialogProps> = ({
  visible,
  onHide,
  onCreate,
  startTime,
  endTime
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (visible) {
      setTitle('')
      setDescription('')
    }
  }, [visible])

  const handleCreate = async () => {
    if (!title.trim()) return
    
    try {
      setLoading(true)
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined
      })
      onHide()
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && title.trim()) {
      e.preventDefault()
      handleCreate()
    }
  }

  // Format time range for display
  const formatTimeRange = () => {
    if (!startTime || !endTime) return ''
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    return `${formatDate(startTime)} ${formatTime(startTime)} - ${formatTime(endTime)}`
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Create Task"
      style={{ width: '450px', maxWidth: '90vw' }}
      modal
      draggable={false}
      resizable={false}
      dismissableMask={false}
      className="quick-create-task-dialog"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Time Range Display */}
        {startTime && endTime && (
          <div style={{ 
            fontSize: '14px', 
            color: '#666', 
            fontWeight: 500,
            padding: '8px 12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <i className="pi pi-clock" style={{ marginRight: '8px' }}></i>
            {formatTimeRange()}
          </div>
        )}

        {/* Task Title Input */}
        <div className="form-group">
          <label htmlFor="quick-task-title" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Title *
          </label>
          <InputText
            id="quick-task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add task title"
            autoFocus
            style={{ width: '100%' }}
          />
        </div>

        {/* Task Description Input */}
        <div className="form-group">
          <label htmlFor="quick-task-description" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Description
          </label>
          <InputTextarea
            id="quick-task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add task description (optional)"
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <Button
            label="Cancel"
            onClick={onHide}
            className="p-button-text"
            disabled={loading}
          />
          <Button
            label="Create Task"
            onClick={handleCreate}
            loading={loading}
            disabled={!title.trim()}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default QuickCreateTaskDialog

