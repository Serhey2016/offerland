import React from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'

interface TaskTypeSelectionDialogProps {
  visible: boolean
  onHide: () => void
  onSelectCreateTask: () => void
  onSelectRecurrentTask: () => void
  startTime?: Date
  endTime?: Date
}

const TaskTypeSelectionDialog: React.FC<TaskTypeSelectionDialogProps> = ({
  visible,
  onHide,
  onSelectCreateTask,
  onSelectRecurrentTask,
  startTime,
  endTime
}) => {
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
      header="Select Task Type"
      style={{ width: '400px', maxWidth: '90vw' }}
      modal
      draggable={false}
      resizable={false}
      dismissableMask={false}
      className="task-type-selection-dialog"
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
            borderRadius: '4px',
            marginBottom: '8px'
          }}>
            <i className="pi pi-clock" style={{ marginRight: '8px' }}></i>
            {formatTimeRange()}
          </div>
        )}

        {/* Create Task Button */}
        <Button
          label="Create task"
          icon="pi pi-plus"
          onClick={onSelectCreateTask}
          className="p-button-outlined"
          style={{ 
            width: '100%',
            justifyContent: 'flex-start',
            padding: '12px 16px',
            fontSize: '16px'
          }}
        />

        {/* Recurrent Task Button */}
        <Button
          label="Recurrent task"
          icon="pi pi-replay"
          onClick={onSelectRecurrentTask}
          className="p-button-outlined"
          style={{ 
            width: '100%',
            justifyContent: 'flex-start',
            padding: '12px 16px',
            fontSize: '16px'
          }}
        />
      </div>
    </Dialog>
  )
}

export default TaskTypeSelectionDialog

