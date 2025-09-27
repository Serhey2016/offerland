import React, { useState, useEffect } from 'react'

// Inline styles for PriorityMatrix
const priorityMatrixStyles = `
.priority-matrix-wrapper {
  position: relative;
  display: inline-block;
}

.priority-matrix-container {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: 8px;
}

.priority-matrix {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 16px;
  min-width: 320px;
  max-width: 400px;
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.matrix-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.eisenhower-matrix {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  grid-template-rows: auto 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.matrix-corner {
  /* Empty corner for grid alignment */
}

.matrix-label-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.matrix-label-horizontal {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  padding: 8px 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.matrix-quadrant {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.matrix-quadrant:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(0, 0, 0, 0.2);
}

.matrix-quadrant.selected {
  box-shadow: 0 0 0 3px #3b82f6;
  border-color: #3b82f6;
}

.matrix-quadrant.hovered {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quadrant-important-urgent {
  background-color: #EF9A9A;
}

.quadrant-important-not-urgent {
  background-color: #90CAF9;
}

.quadrant-not-important-urgent {
  background-color: #FFCC80;
}

.quadrant-not-important-not-urgent {
  background-color: #E0E0E0;
}

.priority-tooltip {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.priority-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1f2937;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.tooltip-description {
  font-size: 11px;
  opacity: 0.8;
}

`

interface PriorityMatrixProps {
  onPrioritySelect: (priority: string) => void
  selectedPriority?: string
  onClose?: () => void
}

const PriorityMatrix: React.FC<PriorityMatrixProps> = ({
  onPrioritySelect,
  selectedPriority,
  onClose
}) => {
  const [hoveredPriority, setHoveredPriority] = useState<string | null>(null)

  // Inject styles
  useEffect(() => {
    const styleId = 'priority-matrix-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = priorityMatrixStyles
      document.head.appendChild(style)
    }
    
    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  const handlePriorityClick = (priorityId: string) => {
    onPrioritySelect(priorityId)
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="priority-matrix-container">
      <div className="priority-matrix">
        {/* Header */}
        <div className="matrix-header">
          <h4>Priority</h4>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>

        {/* Matrix Grid */}
        <div className="eisenhower-matrix">
          {/* Empty corner */}
          <div className="matrix-corner"></div>
          
          {/* Horizontal labels */}
          <div className="matrix-label-horizontal">Urgent</div>
          <div className="matrix-label-horizontal">Not urgent</div>
          
          {/* Vertical labels and quadrants */}
          <div className="matrix-label-vertical">Important</div>
          <div 
            className={`matrix-quadrant quadrant-important-urgent ${
              selectedPriority === 'important-urgent' ? 'selected' : ''
            } ${hoveredPriority === 'important-urgent' ? 'hovered' : ''}`}
            onClick={() => handlePriorityClick('important-urgent')}
            onMouseEnter={() => setHoveredPriority('important-urgent')}
            onMouseLeave={() => setHoveredPriority(null)}
            title="Important & Urgent - Do First"
          >
            {hoveredPriority === 'important-urgent' && (
              <div className="priority-tooltip">
                <div className="tooltip-title">Important & Urgent</div>
                <div className="tooltip-description">Do First</div>
              </div>
            )}
          </div>
          
          <div 
            className={`matrix-quadrant quadrant-important-not-urgent ${
              selectedPriority === 'important-not-urgent' ? 'selected' : ''
            } ${hoveredPriority === 'important-not-urgent' ? 'hovered' : ''}`}
            onClick={() => handlePriorityClick('important-not-urgent')}
            onMouseEnter={() => setHoveredPriority('important-not-urgent')}
            onMouseLeave={() => setHoveredPriority(null)}
            title="Important & Not Urgent - Schedule"
          >
            {hoveredPriority === 'important-not-urgent' && (
              <div className="priority-tooltip">
                <div className="tooltip-title">Important & Not Urgent</div>
                <div className="tooltip-description">Schedule</div>
              </div>
            )}
          </div>
          
          <div className="matrix-label-vertical">Not important</div>
          <div 
            className={`matrix-quadrant quadrant-not-important-urgent ${
              selectedPriority === 'not-important-urgent' ? 'selected' : ''
            } ${hoveredPriority === 'not-important-urgent' ? 'hovered' : ''}`}
            onClick={() => handlePriorityClick('not-important-urgent')}
            onMouseEnter={() => setHoveredPriority('not-important-urgent')}
            onMouseLeave={() => setHoveredPriority(null)}
            title="Not Important & Urgent - Delegate"
          >
            {hoveredPriority === 'not-important-urgent' && (
              <div className="priority-tooltip">
                <div className="tooltip-title">Not Important & Urgent</div>
                <div className="tooltip-description">Delegate</div>
              </div>
            )}
          </div>
          
          <div 
            className={`matrix-quadrant quadrant-not-important-not-urgent ${
              selectedPriority === 'not-important-not-urgent' ? 'selected' : ''
            } ${hoveredPriority === 'not-important-not-urgent' ? 'hovered' : ''}`}
            onClick={() => handlePriorityClick('not-important-not-urgent')}
            onMouseEnter={() => setHoveredPriority('not-important-not-urgent')}
            onMouseLeave={() => setHoveredPriority(null)}
            title="Not Important & Not Urgent - Eliminate"
          >
            {hoveredPriority === 'not-important-not-urgent' && (
              <div className="priority-tooltip">
                <div className="tooltip-title">Not Important & Not Urgent</div>
                <div className="tooltip-description">Eliminate</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriorityMatrix
