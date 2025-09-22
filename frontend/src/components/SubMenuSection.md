# SubMenuSection Component

## Overview
React component that replaces the static HTML submenu section with PrimeReact integration and full functionality.

## Features
- **PrimeReact Integration**: Uses PrimeReact Button and Menu components
- **Dynamic Navigation**: Navigation items change based on selected category
- **Event System**: Integrates with existing TaskTracker event system
- **Touch Support**: Mobile-friendly drag scrolling
- **TypeScript**: Full TypeScript support with proper interfaces

## Usage

### Basic Usage
```tsx
import SubMenuSection from './SubMenuSection'

<SubMenuSection
  selectedCategory="Agenda"
  selectedSubcategory=""
  onFilterClick={() => console.log('Filter clicked')}
  onAddClick={() => console.log('Add clicked')}
  onNavigationItemClick={(item) => console.log('Navigation:', item)}
/>
```

### Props
- `selectedCategory`: Current selected category (Category)
- `selectedSubcategory`: Current selected subcategory (Subcategory)
- `onFilterClick`: Callback for filter button click
- `onAddClick`: Callback for add button click
- `onNavigationItemClick`: Callback for navigation item click

### Events
The component dispatches custom events:
- `subMenuFilter`: When filter options are selected
- `subMenuAdd`: When add options are selected
- `subMenuNavigation`: When navigation items are clicked

### Category Navigation Mapping
Each category has specific navigation items:
- **Agenda**: Daily Tasks, Scheduled
- **Touchpoint**: Contacts, Relationships
- **Inbox**: New Items, Reviewed
- **Waiting**: Orders, Subscriptions, Published
- **Someday**: Future Ideas
- **Projects**: Active Projects, Planning
- **Lockbook (Done)**: Completed Projects, Completed Tasks
- **Archive**: Archived Projects, Archived Tasks

## Integration
The component is automatically rendered in the HTML template via `SubMenuRenderer` and initialized in `main.tsx`.

## Styling
Uses custom CSS classes that integrate with existing design system while overriding PrimeReact defaults.
