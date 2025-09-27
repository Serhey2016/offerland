import React, { useState, useRef } from 'react'
import { CascadeSelect } from 'primereact/cascadeselect'
import '../../styles/priority-cascade.css'

interface PriorityOption {
  label: string
  value: string
  color: string
  children?: PriorityOption[]
}

const PriorityCascadeSelect: React.FC<{
  onPrioritySelect: (priority: string) => void
}> = ({ onPrioritySelect }) => {
  const [selectedPriority, setSelectedPriority] = useState<string>('')
  const cascadeRef = useRef<CascadeSelect>(null)

  const priorityOptions: PriorityOption[] = [
    {
      label: 'Priority Matrix',
      value: 'matrix',
      color: '#6b7280',
      children: [
        {
          label: 'Important & Urgent',
          value: 'important-urgent',
          color: '#EF9A9A'
        },
        {
          label: 'Important & Not Urgent',
          value: 'important-not-urgent',
          color: '#90CAF9'
        },
        {
          label: 'Not Important & Urgent',
          value: 'not-important-urgent',
          color: '#FFCC80'
        },
        {
          label: 'Not Important & Not Urgent',
          value: 'not-important-not-urgent',
          color: '#E0E0E0'
        }
      ]
    }
  ]

  const handleSelectionChange = (e: any) => {
    if (e.value && e.value.value && e.value.value !== 'matrix') {
      setSelectedPriority(e.value.value)
      onPrioritySelect(e.value.value)
      // Close the cascade after selection
      if (cascadeRef.current) {
        cascadeRef.current.hide()
      }
    }
  }

  const itemTemplate = (option: PriorityOption) => {
    if (option.value === 'matrix') {
      return (
        <div className="matrix-container">
          <div className="eisenhower-matrix">
            {/* Empty corner */}
            <div></div>
            {/* Column headers */}
            <div className="matrix-label-horizontal">Urgent</div>
            <div className="matrix-label-horizontal">Not urgent</div>
            
            {/* Row labels and quadrants */}
            <div className="matrix-label-vertical">important</div>
            <div 
              className="matrix-quadrant quadrant-important-urgent"
              onClick={() => handleQuadrantClick('important-urgent')}
              title="Important & Urgent"
            />
            <div 
              className="matrix-quadrant quadrant-important-not-urgent"
              onClick={() => handleQuadrantClick('important-not-urgent')}
              title="Important & Not Urgent"
            />
            
            <div className="matrix-label-vertical">not important</div>
            <div 
              className="matrix-quadrant quadrant-not-important-urgent"
              onClick={() => handleQuadrantClick('not-important-urgent')}
              title="Not Important & Urgent"
            />
            <div 
              className="matrix-quadrant quadrant-not-important-not-urgent"
              onClick={() => handleQuadrantClick('not-important-not-urgent')}
              title="Not Important & Not Urgent"
            />
          </div>
        </div>
      )
    }

    return (
      <div className="priority-option">
        <div 
          className="priority-color-indicator"
          style={{ backgroundColor: option.color }}
        />
        <span>{option.label}</span>
      </div>
    )
  }

  const handleQuadrantClick = (priority: string) => {
    setSelectedPriority(priority)
    onPrioritySelect(priority)
    // Close the cascade after selection
    if (cascadeRef.current) {
      cascadeRef.current.hide()
    }
  }

  return (
    <CascadeSelect
      ref={cascadeRef}
      value={null}
      options={priorityOptions}
      onChange={handleSelectionChange}
      placeholder="Priority"
      itemTemplate={itemTemplate}
      className="priority-cascade-select"
      panelClassName="priority-cascade-panel"
    />
  )
}

export default PriorityCascadeSelect
