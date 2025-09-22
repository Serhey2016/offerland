// @ts-nocheck
import React, { useState, useEffect } from 'react'

interface TaskDesignProps {
title: string
description?: string
timeRange?: string
category?: string
priority?: 'low' | 'medium' | 'high'
status?: 'pending' | 'in-progress' | 'completed'
dueDate?: string
assignedTo?: string
tags?: string[]
onEdit?: () => void
onDelete?: () => void
onStatusChange?: (status: string) => void
}

const TaskDesign: React.FC<TaskDesignProps> = ({
title,
description,
timeRange,
category,
priority = 'medium',
status = 'pending',
dueDate,
assignedTo,
tags = [],
onEdit,
onDelete,
onStatusChange
}) => {
const [isExpanded, setIsExpanded] = useState(false)
const [isEditing, setIsEditing] = useState(false)
const [editTitle, setEditTitle] = useState(title)
const [editDescription, setEditDescription] = useState(description || '')

useEffect(() => {
setEditTitle(title)
setEditDescription(description || '')
}, [title, description])

const handleEdit = () => {
setIsEditing(true)
onEdit?.()
}

const handleSave = () => {
setIsEditing(false)
// Here you would typically save the changes to your backend
console.log('Saving task:', { title: editTitle, description: editDescription })
}

const handleCancel = () => {
setIsEditing(false)
setEditTitle(title)
setEditDescription(description || '')
}

const handleStatusChange = (newStatus: string) => {
onStatusChange?.(newStatus)
}

const getPriorityColor = (priority: string) => {
switch (priority) {
case 'high':
return '#ff4757'
case 'medium':
return '#ffa502'
case 'low':
return '#2ed573'
default:
return '#747d8c'
}
}

const getStatusColor = (status: string) => {
switch (status) {
case 'completed':
return '#2ed573'
case 'in-progress':
return '#3742fa'
case 'pending':
return '#ffa502'
default:
return '#747d8c'
}
}

const getPriorityIcon = (priority: string) => {
switch (priority) {
case 'high':
return '🔴'
case 'medium':
return '🟡'
case 'low':
return '🟢'
default:
return '⚪'
}
}

const getStatusIcon = (status: string) => {
switch (status) {
case 'completed':
return '✅'
case 'in-progress':
return '🔄'
case 'pending':
return '⏳'
default:
return '❓'
}
}

return (
<div className="task-design-container">
<div className="task-header">
<div className="task-title-section">
{isEditing ? (
<input
type="text"
value={editTitle}
onChange={(e) => setEditTitle(e.target.value)}
className="task-title-input"
autoFocus
/>
) : (
<h3 className="task-title" onClick={() => setIsExpanded(!isExpanded)}>
{title}
</h3>
)}
<div className="task-meta">
{timeRange && <span className="task-time">{timeRange}</span>}
{category && <span className="task-category">{category}</span>}
</div>
</div>
<div className="task-actions">
<div className="task-status-priority">
<span
className="priority-badge"
style={{ backgroundColor: getPriorityColor(priority) }}
>
{getPriorityIcon(priority)} {priority.toUpperCase()}
</span>
<span
className="status-badge"
style={{ backgroundColor: getStatusColor(status) }}
>
{getStatusIcon(status)} {status.replace('-', ' ').toUpperCase()}
</span>
</div>
<div className="task-buttons">
{isEditing ? (
<>
<button className="btn-save" onClick={handleSave}>
💾
</button>
<button className="btn-cancel" onClick={handleCancel}>
❌
</button>
</>
) : (
<>
<button className="btn-edit" onClick={handleEdit}>
✏️
</button>
<button className="btn-delete" onClick={onDelete}>
🗑️
</button>
</>
)}
</div>
</div>
</div>

{isExpanded && (
<div className="task-details">
{isEditing ? (
<div className="task-edit-section">
<textarea
value={editDescription}
onChange={(e) => setEditDescription(e.target.value)}
className="task-description-input"
placeholder="Add description..."
rows={3}
/>
</div>
) : (
<div className="task-description">
{description && <p>{description}</p>}
</div>
)}

<div className="task-additional-info">
{dueDate && (
<div className="task-due-date">
<strong>Due:</strong> {dueDate}
</div>
)}
{assignedTo && (
<div className="task-assigned">
<strong>Assigned to:</strong> {assignedTo}
</div>
)}
{tags.length > 0 && (
<div className="task-tags">
<strong>Tags:</strong>
{tags.map((tag, index) => (
<span key={index} className="tag">
{tag}
</span>
))}
</div>
)}
</div>

<div className="task-status-actions">
<button
className={`status-btn ${status === 'pending' ? 'active' : ''}`}
onClick={() => handleStatusChange('pending')}
>
⏳ Pending
</button>
<button
className={`status-btn ${status === 'in-progress' ? 'active' : ''}`}
onClick={() => handleStatusChange('in-progress')}
>
🔄 In Progress
</button>
<button
className={`status-btn ${status === 'completed' ? 'active' : ''}`}
onClick={() => handleStatusChange('completed')}
>
✅ Completed
</button>
</div>
</div>
)}
</div>
)
}

export default TaskDesign