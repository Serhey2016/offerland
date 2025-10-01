import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Базовий API клієнт для Django
const api: AxiosInstance = axios.create({
  baseURL: 'http://192.168.0.146:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// Interceptor для додавання CSRF токену
api.interceptors.request.use(
  (config) => {
    // Отримуємо CSRF токен з cookies
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1]
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor для обробки відповідей
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message)
    
    // Обробка різних типів помилок
    if (error.response?.status === 401) {
      console.error('Unauthorized - redirect to login')
      // Тут можна додати логіку перенаправлення на сторінку входу
    } else if (error.response?.status === 403) {
      console.error('Forbidden - insufficient permissions')
    } else if (error.response?.status === 404) {
      console.error('Not Found - resource does not exist')
    } else if (error.response?.status >= 500) {
      console.error('Server Error - please try again later')
    }
    
    return Promise.reject(error)
  }
)

export default api
