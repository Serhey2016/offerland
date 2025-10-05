import React from 'react'
import { Toast } from 'primereact/toast'

interface ToastsProps {
  toastRef: React.RefObject<Toast>
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'
}

const Toasts: React.FC<ToastsProps> = ({ 
  toastRef, 
  position = 'top-right' 
}) => {
  return (
    <Toast 
      ref={toastRef} 
      position={position}
      className="custom-toast"
      style={{
        zIndex: 99999,
        fontSize: '16px'
      }}
    />
  )
}

export default Toasts
