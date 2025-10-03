// Types for TaskTracker component

export type Category = 
  | 'Touchpoint'
  | 'Agenda'
  | 'Waiting'
  | 'Done'
  | 'Archive'
  | 'Inbox'
  | 'Someday'
  | 'Projects'

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

export interface CategoryChangeEventDetail {
  category: Category
}

export interface SubmenuItemClickEventDetail {
  category: Category
  subcategory: Subcategory
}

export interface HeaderConfig {
  title: string
  subtitle?: string
  showBackButton?: boolean
}
