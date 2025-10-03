import React from 'react'

const CategorySelector = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'Touchpoint', name: 'Touchpoint', icon: '👥' },
    { id: 'Inbox', name: 'Inbox', icon: '📥' },
    { id: 'Agenda', name: 'Agenda', icon: '📅' },
    { id: 'Waiting', name: 'Waiting', icon: '⏳' },
    { id: 'Someday', name: 'Someday', icon: '💭' },
    { id: 'Projects', name: 'Projects', icon: '📋' },
    { id: 'Lockbook', name: 'Done', icon: '✅' },
    { id: 'Archive', name: 'Archive', icon: '📦' }
  ]

  return (
    <div className="category-selector">
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategorySelector
