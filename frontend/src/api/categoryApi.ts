import api from './client'

// Типи для Category API
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: number
  name: string
  slug: string
  category: number
  description?: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCategoryData {
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  order?: number
  is_active?: boolean
}

export interface CreateSubcategoryData {
  name: string
  slug: string
  category: number
  description?: string
  order?: number
  is_active?: boolean
}

// Category API функції
export const categoryApi = {
  // Отримати всі категорії
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/categories/')
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  // Отримати категорію за ID
  getCategory: async (id: number): Promise<Category> => {
    try {
      const response = await api.get(`/categories/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error)
      throw error
    }
  },

  // Створити нову категорію
  createCategory: async (categoryData: CreateCategoryData): Promise<Category> => {
    try {
      const response = await api.post('/categories/', categoryData)
      return response.data
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  },

  // Оновити категорію
  updateCategory: async (id: number, categoryData: Partial<CreateCategoryData>): Promise<Category> => {
    try {
      const response = await api.put(`/categories/${id}/`, categoryData)
      return response.data
    } catch (error) {
      console.error(`Error updating category ${id}:`, error)
      throw error
    }
  },

  // Видалити категорію
  deleteCategory: async (id: number): Promise<void> => {
    try {
      await api.delete(`/categories/${id}/`)
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error)
      throw error
    }
  },

  // Отримати підкатегорії для категорії
  getSubcategories: async (categoryId?: number): Promise<Subcategory[]> => {
    try {
      const params = categoryId ? { category: categoryId } : {}
      const response = await api.get('/subcategories/', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      throw error
    }
  },

  // Створити нову підкатегорію
  createSubcategory: async (subcategoryData: CreateSubcategoryData): Promise<Subcategory> => {
    try {
      const response = await api.post('/subcategories/', subcategoryData)
      return response.data
    } catch (error) {
      console.error('Error creating subcategory:', error)
      throw error
    }
  },

  // Оновити підкатегорію
  updateSubcategory: async (id: number, subcategoryData: Partial<CreateSubcategoryData>): Promise<Subcategory> => {
    try {
      const response = await api.put(`/subcategories/${id}/`, subcategoryData)
      return response.data
    } catch (error) {
      console.error(`Error updating subcategory ${id}:`, error)
      throw error
    }
  },

  // Видалити підкатегорію
  deleteSubcategory: async (id: number): Promise<void> => {
    try {
      await api.delete(`/subcategories/${id}/`)
    } catch (error) {
      console.error(`Error deleting subcategory ${id}:`, error)
      throw error
    }
  }
}

export default categoryApi
