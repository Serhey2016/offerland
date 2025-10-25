import api from './client'

export interface ServiceCategory {
  id: number
  name: string
}

export interface Service {
  id: number
  name: string
  category_id: number
  category_name: string
}

export interface ServicesCategoriesResponse {
  success: boolean
  categories: ServiceCategory[]
}

export interface ServicesResponse {
  success: boolean
  services: Service[]
}

export const servicesApi = {
  // Get all services categories
  getServicesCategories: async (): Promise<ServiceCategory[]> => {
    const response = await api.get<ServicesCategoriesResponse>('/services_and_projects/api/services-categories/')
    return response.data.categories
  },

  // Get all services or filter by category
  getServices: async (categoryId?: number): Promise<Service[]> => {
    const params = categoryId ? { category_id: categoryId } : {}
    const response = await api.get<ServicesResponse>('/services_and_projects/api/services/', { params })
    return response.data.services
  }
}

export default servicesApi

