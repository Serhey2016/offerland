import React from 'react'

interface SubcategoryDisplayProps {
  selectedCategory: string
  selectedSubcategory: string
  onSubcategoryChange: (subcategory: string) => void
}

const SubcategoryDisplay: React.FC<SubcategoryDisplayProps> = ({
  selectedCategory,
  selectedSubcategory,
  onSubcategoryChange
}) => {
  // Get subcategories based on selected category
  const getSubcategories = (category: string) => {
    switch (category) {
      case 'Done':
        return [
          { id: 'Lockbook_Projects', text: 'Projects' },
          { id: 'Lockbook_Tasks', text: 'Tasks' }
        ]
      case 'Touchpoint':
        return [
          { id: 'Contacts', text: 'Contacts' }
        ]
      case 'Inbox':
        return [
          { id: 'Favorites', text: 'Favorites' }
        ]
      case 'Waiting':
        return [
          { id: 'Orders', text: 'Orders' },
          { id: 'Subscriptions', text: 'Subscriptions' },
          { id: 'Published', text: 'Published' }
        ]
      case 'Archive':
        return [
          { id: 'Archive_projects', text: 'Projects' },
          { id: 'Archive_Tasks', text: 'Tasks' }
        ]
      default:
        return []
    }
  }

  const subcategories = getSubcategories(selectedCategory)

  // Don't render if no subcategories
  if (subcategories.length === 0) {
    return null
  }

  return (
    <div className="task_tracker_subcategory_display">
      <div className="task_tracker_subcategory_items">
        {subcategories.map((subcategory) => (
          <div
            key={subcategory.id}
            className={`task_tracker_subcategory_item ${selectedSubcategory === subcategory.id ? 'active' : ''}`}
            onClick={() => onSubcategoryChange(subcategory.id)}
          >
            {subcategory.text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubcategoryDisplay
