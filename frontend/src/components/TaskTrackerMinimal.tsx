import React from 'react'
import SubMenuSection from './SubMenuSection'
import NavigationItems from './NavigationItems'
import SubcategoryDisplay from './SubcategoryDisplay'

const TaskTrackerMinimal: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('Inbox' as any)
  const [selectedSubcategory, setSelectedSubcategory] = React.useState('' as any)

  const handleSubcategoryDisplayChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory)
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>TaskTracker Minimal Test</h1>
      <p>Testing SubMenuSection with NavigationItems</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' }}>
        <h3>SubMenuSection</h3>
        <SubMenuSection
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onFilterClick={() => console.log('Filter clicked')}
          onAddClick={() => console.log('Add clicked')}
          onNavigationItemClick={(item) => console.log('Navigation clicked:', item)}
        />
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' }}>
        <h3>NavigationItems (Mobile)</h3>
        <NavigationItems
          selectedCategory={selectedCategory}
          onNavigationItemClick={(item) => console.log('Mobile Navigation clicked:', item)}
        />
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' }}>
        <h3>SubcategoryDisplay</h3>
        <SubcategoryDisplay
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSubcategoryChange={handleSubcategoryDisplayChange}
        />
      </div>
    </div>
  )
}

export default TaskTrackerMinimal
