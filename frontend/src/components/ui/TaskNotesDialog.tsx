import React, { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'

interface TaskNotesDialogProps {
  visible: boolean
  taskId: string | null
  taskTitle?: string
  initialNotes?: string
  onHide: () => void
  onSave: (taskId: string, notes: string) => Promise<void>
}

const TaskNotesDialog: React.FC<TaskNotesDialogProps> = ({
  visible,
  taskId,
  taskTitle,
  initialNotes = '',
  onHide,
  onSave
}) => {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Load notes when dialog opens
  useEffect(() => {
    if (visible && taskId) {
      setNotes(initialNotes)
    }
  }, [visible, taskId, initialNotes])

  const handleSave = async () => {
    if (!taskId) return
    
    try {
      setLoading(true)
      await onSave(taskId, notes)
      onHide()
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setNotes(initialNotes) // Reset to initial value
    onHide()
  }

  const headerContent = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
        Note {taskId ? `#${taskId}` : ''}
      </h2>
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header={headerContent}
      style={{ width: '600px', maxWidth: '90vw' }}
      modal
      draggable={false}
      resizable={false}
      dismissableMask={false}
      className="edit-task-dialog"
    >
      <div className="task-notes-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Notes Field */}
        <div className="form-group">
          <label htmlFor="task-notes" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Notes:
          </label>
          <InputTextarea
            id="task-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            className="w-full"
            placeholder="Enter your notes here..."
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button
            label="Cancel"
            onClick={handleCancel}
            className="p-button-text"
            disabled={loading}
          />
          <Button
            label="Save"
            onClick={handleSave}
            loading={loading}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default TaskNotesDialog

