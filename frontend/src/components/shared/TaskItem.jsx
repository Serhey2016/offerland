import React from 'react'

const TaskItem = ({ task, onEdit, onDelete, onComplete, onMove }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-medium'
    }
  }

  return (
    <div className={`task-item ${getPriorityClass(task.priority)}`}>
      <div className="task-content">
        <div className="task-header">
          <h4 className="task-title">{task.title}</h4>
          <span className="task-priority-indicator"></span>
        </div>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
        <div className="task-meta">
          {task.dueDate && (
            <span className="task-due-date">Due: {task.dueDate}</span>
          )}
          {task.category && (
            <span className="task-category">{task.category}</span>
          )}
        </div>
      </div>
      <div className="task-actions">
        {onEdit && (
          <button className="btn btn-outline-primary btn-sm" onClick={() => onEdit(task)}>
            Edit
          </button>
        )}
        {onComplete && (
          <button className="btn btn-outline-success btn-sm" onClick={() => onComplete(task)}>
            Complete
          </button>
        )}
        {onMove && (
          <button className="btn btn-outline-info btn-sm" onClick={() => onMove(task)}>
            Move
          </button>
        )}
        {onDelete && (
          <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(task)}>
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

export default TaskItem
