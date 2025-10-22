import { useEffect, useRef } from 'react'

export const useResizePreview = () => {
  const observerRef = useRef<MutationObserver | null>(null)
  const isAttachedRef = useRef(false)
  const isApplyingStylesRef = useRef(false)

  useEffect(() => {
    const applyResizeStyles = (element: HTMLElement) => {
      // Prevent re-entry to avoid infinite loop
      if (isApplyingStylesRef.current) return
      
      // 🎯 ONLY apply styles during RESIZE, not DRAG
      const isResizing = document.querySelector('.rbc-addons-dnd-resizing')
      if (!isResizing) {
        return
      }
      
      isApplyingStylesRef.current = true
      
      // Temporarily disconnect observer to prevent triggering on our own style changes
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      
      // Detect priority for color
      const priorityHigh = element.querySelector('.agenda-event-priority-high')
      const priorityMedium = element.querySelector('.agenda-event-priority-medium')
      const priorityLow = element.querySelector('.agenda-event-priority-low')
      
      let borderColor = '#4285f4' // Blue default
      if (priorityHigh) borderColor = '#f56565' // Red
      else if (priorityMedium) borderColor = '#ed8936' // Orange
      else if (priorityLow) borderColor = '#48bb78' // Green
      
      // Apply styles directly to DOM (ONLY during resize)
      element.style.cssText += `
        opacity: 0.7 !important;
        transform: scale(1.05) !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
        border: 3px solid ${borderColor} !important;
        transition: none !important;
        z-index: 9999 !important;
      `
      
      // Reconnect observer after applying styles
      setTimeout(() => {
        if (observerRef.current && isAttachedRef.current) {
          const calendarContainer = document.querySelector('.rbc-calendar')
          if (calendarContainer) {
            observerRef.current.observe(calendarContainer, {
              attributes: true,
              subtree: true,
              childList: true,
              attributeFilter: ['class']  // Only watch 'class', not 'style' to avoid loop
            })
          }
        }
        isApplyingStylesRef.current = false
      }, 0)
    }

    // Also listen to mousemove for continuous updates
    const handleMouseMove = () => {
      const dragPreviewElements = document.querySelectorAll('.rbc-addons-dnd-drag-preview')
      if (dragPreviewElements.length > 0) {
        dragPreviewElements.forEach(el => applyResizeStyles(el as HTMLElement))
      }
    }

    const attachObserver = () => {
      if (isAttachedRef.current) return

      const calendarContainer = document.querySelector('.rbc-calendar')
      if (calendarContainer) {
        // MutationObserver to watch for class changes
        observerRef.current = new MutationObserver((mutations) => {
          // Check for drag-preview (used for both drag AND resize)
          // applyResizeStyles will check if it's actually a resize operation
          const dragPreview = document.querySelector('.rbc-addons-dnd-drag-preview')
          
          if (dragPreview) {
            applyResizeStyles(dragPreview as HTMLElement)
          }
        })

        observerRef.current.observe(calendarContainer, {
          attributes: true,
          subtree: true,
          childList: true,
          attributeFilter: ['class']  // Only watch 'class', not 'style' to avoid loop
        })
        
        isAttachedRef.current = true
      } else {
        // Retry after a short delay
        setTimeout(attachObserver, 100)
      }
    }

    // Wait for calendar to be mounted
    setTimeout(attachObserver, 0)
    
    document.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      document.removeEventListener('mousemove', handleMouseMove)
      isAttachedRef.current = false
    }
  }, [])
}

