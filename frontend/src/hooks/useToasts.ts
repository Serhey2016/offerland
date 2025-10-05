import { useRef, useCallback } from 'react'
import { Toast } from 'primereact/toast'

export interface ToastMessage {
  severity?: 'success' | 'info' | 'warn' | 'error'
  summary?: string
  detail?: string
  life?: number
}

export const useToasts = () => {
  const toast = useRef<Toast>(null)

  // Show success toast
  const showSuccess = useCallback((message: string, summary: string = 'Success', life: number = 4000) => {
    console.log('🎉 Showing success toast:', { message, summary, life })
    if (toast.current) {
      console.log('✅ Toast ref exists, showing toast')
      toast.current.show({
        severity: 'success',
        summary,
        detail: message,
        life,
        closable: true,
        sticky: false
      })
      console.log('🎯 Toast.show() called')
    } else {
      console.error('❌ Toast ref is null!')
    }
  }, [])

  // Show error toast
  const showError = useCallback((message: string, summary: string = 'Error', life: number = 3000) => {
    toast.current?.show({
      severity: 'error',
      summary,
      detail: message,
      life
    })
  }, [])

  // Show info toast
  const showInfo = useCallback((message: string, summary: string = 'Info', life: number = 3000) => {
    toast.current?.show({
      severity: 'info',
      summary,
      detail: message,
      life
    })
  }, [])

  // Show warning toast
  const showWarning = useCallback((message: string, summary: string = 'Warning', life: number = 3000) => {
    toast.current?.show({
      severity: 'warn',
      summary,
      detail: message,
      life
    })
  }, [])

  // Show custom toast
  const showToast = useCallback((toastMessage: ToastMessage) => {
    toast.current?.show(toastMessage)
  }, [])

  // Clear all toasts
  const clearToasts = useCallback(() => {
    toast.current?.clear()
  }, [])

  return {
    toast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showToast,
    clearToasts
  }
}

export default useToasts
