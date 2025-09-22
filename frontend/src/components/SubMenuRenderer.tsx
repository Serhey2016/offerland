import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import SubMenuSection from './SubMenuSection'
import { Category, Subcategory, CATEGORIES } from './shared/MenuHandlers'

// Component to render SubMenuSection in the HTML template
const SubMenuRenderer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES.AGENDA)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory>('')

  useEffect(() => {
    // Listen for category changes from the main TaskTracker
    const handleCategoryChange = (event: CustomEvent): void => {
      const { category } = event.detail
      setSelectedCategory(category)
      setSelectedSubcategory('') // Reset subcategory when category changes
    }

    // Listen for subcategory changes
    const handleSubcategoryChange = (event: CustomEvent): void => {
      const { subcategory } = event.detail
      setSelectedSubcategory(subcategory)
    }

    // Listen for taskTracker category changes
    window.addEventListener('taskTrackerCategoryChange', handleCategoryChange as EventListener)
    window.addEventListener('submenuItemClick', handleSubcategoryChange as EventListener)

    return () => {
      window.removeEventListener('taskTrackerCategoryChange', handleCategoryChange as EventListener)
      window.removeEventListener('submenuItemClick', handleSubcategoryChange as EventListener)
    }
  }, [])

  return React.createElement(SubMenuSection, {
    selectedCategory,
    selectedSubcategory,
    onFilterClick: () => console.log('SubMenu Filter clicked'),
    onAddClick: () => console.log('SubMenu Add clicked'),
    onNavigationItemClick: (item) => console.log('SubMenu Navigation clicked:', item)
  })
}

// Function to initialize the SubMenu renderer
export const initializeSubMenuRenderer = (): void => {
  const container = document.getElementById('react-submenu-section')
  if (container) {
    const root = createRoot(container)
    root.render(React.createElement(SubMenuRenderer))
  }
}

export default SubMenuRenderer
