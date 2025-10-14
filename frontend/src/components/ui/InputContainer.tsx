import React from 'react'
import { Button } from 'primereact/button'
import { TieredMenu } from 'primereact/tieredmenu'
import { ChipData } from '../../hooks/useInputContainer'

interface InputContainerProps {
  // States
  taskInput: string
  hasText: boolean
  chips: ChipData[]
  isMaxLength: boolean
  isSubtaskMode: boolean
  isDescriptionMode?: boolean
  parentTaskChips: ChipData[]
  subtasks: Array<{chips: ChipData[]}>
  label?: string
  icon?: string
  itemType?: string
  
  // Refs
  contentEditableRef: React.RefObject<HTMLDivElement>
  menuRef: React.RefObject<TieredMenu>
  
  // Functions
  handleInputChange: (e: React.FormEvent<HTMLDivElement>) => void
  handleKeyPress: (e: React.KeyboardEvent<HTMLDivElement>) => void
  handleConfirm: () => void
  removeChip: (chipId: string) => void
  editChip: (chip: ChipData) => void
  toggleMenu: (event: React.MouseEvent) => void
  dropdownMenuItems: any[]
  handlePrioritySelect: (priority: string) => void
}

const InputContainer: React.FC<InputContainerProps> = ({
  taskInput,
  hasText,
  chips,
  isMaxLength,
  isSubtaskMode,
  isDescriptionMode = false,
  parentTaskChips,
  subtasks,
  label = 'Task',
  icon = 'pi pi-check-circle',
  itemType = 'note',
  contentEditableRef,
  menuRef,
  handleInputChange,
  handleKeyPress,
  handleConfirm,
  removeChip,
  editChip,
  toggleMenu,
  dropdownMenuItems,
  handlePrioritySelect
}) => {
  // State to track active label (Project or Job search)
  const [activeLabel, setActiveLabel] = React.useState<'project' | 'jobsearch'>('project')
  
  // Show Job search only for 'contact' itemType
  const showJobSearch = itemType === 'contact'

  // Helper function to get chip CSS class based on type
  const getChipClassName = (chip: ChipData): string => {
    const baseClass = 'task_creation_chip'
    switch (chip.type) {
      case 'title':
        return `${baseClass} chip_type_title`
      case 'priority':
        return `${baseClass} chip_type_priority_${chip.value}`
      case 'date':
        return `${baseClass} chip_type_date`
      case 'hashtag':
        return `${baseClass} chip_type_hashtag`
      case 'description':
        return `${baseClass} chip_type_description`
      default:
        return baseClass
    }
  }

  // Priority matrix template - moved from hook
  const priorityMatrixTemplate = () => (
    <div className="priority-matrix-grid">
      <div 
        className="quadrant quadrant-important-urgent"
        onClick={() => handlePrioritySelect('important-urgent')}
        title="Important & Urgent - Do First"
      ></div>
      <div 
        className="quadrant quadrant-important-not-urgent"
        onClick={() => handlePrioritySelect('important-not-urgent')}
        title="Important & Not Urgent - Schedule"
      ></div>
      <div 
        className="quadrant quadrant-not-important-urgent"
        onClick={() => handlePrioritySelect('not-important-urgent')}
        title="Not Important & Urgent - Delegate"
      ></div>
      <div 
        className="quadrant quadrant-not-important-not-urgent"
        onClick={() => handlePrioritySelect('not-important-not-urgent')}
        title="Not Important & Not Urgent - Eliminate"
      ></div>
    </div>
  )

  // Enhanced dropdown menu items with template
  const enhancedDropdownMenuItems = dropdownMenuItems.map(item => {
    if (item.id === 'priority-option') {
      return {
        ...item,
        items: item.items?.map(subItem => {
          if (subItem.id === 'priority-matrix') {
            return {
              ...subItem,
              template: priorityMatrixTemplate
            }
          }
          return subItem
        })
      }
    }
    return item
  })
  return (
    <div id="task-creation-block" className="task_tracker_task_creation">
      <div 
        id="task-creation-input-container" 
        className={`task_creation_input_container ${hasText ? 'has-text' : ''} ${isSubtaskMode ? 'subtask-mode' : ''}`}
      >
        {/* Chips Display - Different rendering for subtask mode */}
        {isSubtaskMode ? (
          <>
            {/* Parent Task Chips */}
            {parentTaskChips.length > 0 && (
              <div className="task_creation_parent_chips">
                {parentTaskChips.map((chip) => (
                  <div
                    key={chip.id}
                    className={getChipClassName(chip)}
                    title={chip.type === 'title' ? 'Parent task' : ''}
                  >
                    <span className="chip_text">{chip.displayValue}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Separator Line after parent */}
            <div className="task_creation_subtask_separator"></div>
            
            {/* Display all queued subtasks with separator lines */}
            {subtasks.length > 0 && subtasks.map((subtask, index) => (
              <React.Fragment key={`queued-subtask-${index}`}>
                <div className="task_creation_subtask_chips">
                  {subtask.chips.map((chip) => (
                    <div
                      key={chip.id}
                      className={getChipClassName(chip)}
                      title="Queued subtask"
                    >
                      <span className="chip_text">{chip.displayValue}</span>
                    </div>
                  ))}
                </div>
                {/* Separator line after each queued subtask */}
                <div className="task_creation_subtask_separator"></div>
              </React.Fragment>
            ))}
            
            {/* Current Subtask Chips being edited */}
            {chips.length > 0 && (
              <div className="task_creation_subtask_chips">
                {chips.map((chip) => (
                  <div
                    key={chip.id}
                    className={getChipClassName(chip)}
                    onClick={() => chip.type === 'title' ? editChip(chip) : undefined}
                    title={chip.type === 'title' ? 'Click to edit' : ''}
                  >
                    <span className="chip_text">{chip.displayValue}</span>
                    <button
                      className="chip_remove_btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeChip(chip.id)
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Normal mode - Single chips container */
          chips.length > 0 && (
            <div className="task_creation_chips_container">
              {chips.map((chip) => (
                <div
                  key={chip.id}
                  className={getChipClassName(chip)}
                  onClick={() => chip.type === 'title' ? editChip(chip) : undefined}
                  title={chip.type === 'title' ? 'Click to edit' : (chip.type === 'description' ? chip.value : '')}
                >
                  <span className="chip_text">{chip.displayValue}</span>
                  <button
                    className="chip_remove_btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeChip(chip.id)
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )
        )}
        
        {/* Description Mode Indicator */}
        {isDescriptionMode && (
          <div className="task_creation_description_indicator">
            Description
          </div>
        )}
        
        
        {/* Left Button */}
        <Button
          id="task-left-button"
          icon={icon}
          onClick={() => {}}
          className="task_creation_left_btn"
          text
        />
        <span 
          className={`task_creation_left_btn_label ${!showJobSearch || activeLabel === 'project' ? 'active' : ''}`}
          onClick={() => showJobSearch && setActiveLabel('project')}
        >
          {label}
        </span>
        {showJobSearch && (
          <span 
            className={`task_creation_left_btn_label job_search_label ${activeLabel === 'jobsearch' ? 'active' : ''}`}
            onClick={() => setActiveLabel('jobsearch')}
          >
            Job search
          </span>
        )}
        
        {/* Input Field */}
        <div
          ref={contentEditableRef}
          id="task-input-field"
          contentEditable
          onInput={handleInputChange}
          onKeyDown={handleKeyPress}
          className={`task_creation_input ${isMaxLength ? 'max-length-reached' : ''} ${isSubtaskMode ? 'subtask-mode' : ''} ${isDescriptionMode ? 'description-mode' : ''}`}
          data-placeholder={isDescriptionMode ? "Enter description..." : (isSubtaskMode ? "Enter subtask..." : (chips.length > 0 ? "Add more details..." : "Enter task..."))}
          suppressContentEditableWarning={true}
        ></div>
        
        {/* Max Length Warning */}
        {isMaxLength && !isDescriptionMode && (
          <div className="task_creation_max_length_warning">
            Maximum length reached (120 characters)
          </div>
        )}
        
        {/* Confirm Button */}
        <Button
          id="task-confirm-button"
          icon="pi pi-check"
          onClick={async () => {
            try {
              await handleConfirm()
            } catch (error) {
              console.error('❌ Error in handleConfirm:', error)
              // Error handling is done in the hook, but we catch it here to prevent unhandled promise rejection
            }
          }}
          className="task_creation_confirm_btn"
          text
        />
        
        {/* Dropdown Button */}
        <Button
          id="task-dropdown-button"
          icon="pi pi-ellipsis-v"
          onClick={toggleMenu}
          className="task_creation_dropdown_btn"
          text
        />
        
        {/* TieredMenu */}
        <TieredMenu
          id="task-dropdown-menu"
          ref={menuRef}
          model={enhancedDropdownMenuItems}
          popup
          className="task_creation_dropdown_menu"
          popupAlignment="right"
          hideOverlaysOnDocumentScrolling={false}
          onShow={() => console.log('Menu shown')}
          onHide={() => console.log('Menu hidden')}
        />
      </div>
    </div>
  )
}

export default InputContainer

