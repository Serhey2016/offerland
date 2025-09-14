// Category types
export type Category = 
  | 'Agenda'
  | 'Touchpoint'
  | 'Inbox'
  | 'Waiting'
  | 'Someday'
  | 'Projects'
  | 'Lockbook (Done)'
  | 'Archive'

export type Subcategory = 
  | 'Contacts'
  | 'Favorites'
  | 'Orders'
  | 'Subscriptions'
  | 'Published'
  | 'Lockbook_Projects'
  | 'Lockbook_Tasks'
  | 'Archive_projects'
  | 'Archive_Tasks'
  | ''

// Header configuration type
export interface HeaderConfig {
  title: string
  subtitle: string
}

// Event detail types
export interface CategoryChangeEventDetail {
  category: Category
}

export interface SubmenuItemClickEventDetail {
  category: Category
  subcategory: Subcategory
}

// Custom event types
export interface CustomEventMap {
  expandableMenuClick: CustomEvent<CategoryChangeEventDetail>
  submenuItemClick: CustomEvent<SubmenuItemClickEventDetail>
  navMenuCategoryChange: CustomEvent<CategoryChangeEventDetail>
  taskTrackerCategoryChange: CustomEvent<CategoryChangeEventDetail>
}

// Extend Window interface for custom events
declare global {
  interface WindowEventMap extends CustomEventMap {}
}
