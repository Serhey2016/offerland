import { useEffect, useRef } from 'react'

export const useResizePreview = () => {
  const observerRef = useRef<MutationObserver | null>(null)
  const isAttachedRef = useRef(false)
  const isApplyingStylesRef = useRef(false)
  const isResizingActiveRef = useRef(false)

  useEffect(() => {
    const applyResizeStyles = (element: HTMLElement) => {
      // Prevent re-entry to avoid infinite loop
      if (isApplyingStylesRef.current) return
      
      // 🎯 ONLY apply styles during RESIZE, not DRAG
      const isResizing = document.querySelector('.rbc-addons-dnd-resizing')
      if (!isResizing) {
        isResizingActiveRef.current = false
        return
      }
      
      isResizingActiveRef.current = true
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

    // Handle both mouse and touch events for continuous updates
    const handleMove = () => {
      const dragPreviewElements = document.querySelectorAll('.rbc-addons-dnd-drag-preview')
      if (dragPreviewElements.length > 0) {
        dragPreviewElements.forEach(el => applyResizeStyles(el as HTMLElement))
      }
    }

    // Prevent scroll during resize on touch devices
    const preventScrollDuringResize = (e: TouchEvent) => {
      if (isResizingActiveRef.current || document.querySelector('.rbc-addons-dnd-resizing')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Attach touch listeners to resize handles specifically
    const attachTouchListenersToHandles = () => {
      const resizeHandles = document.querySelectorAll('.rbc-addons-dnd-resize-ns-anchor')
      
      resizeHandles.forEach(handle => {
        // Remove old listeners if any
        handle.removeEventListener('touchstart', preventScrollDuringResize as any)
        handle.removeEventListener('touchmove', preventScrollDuringResize as any)
        
        // Add new listeners WITHOUT passive to allow preventDefault
        handle.addEventListener('touchstart', preventScrollDuringResize as any, { passive: false })
        handle.addEventListener('touchmove', preventScrollDuringResize as any, { passive: false })
      })
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

          // Reattach touch listeners when DOM changes (new events rendered)
          attachTouchListenersToHandles()
        })

        observerRef.current.observe(calendarContainer, {
          attributes: true,
          subtree: true,
          childList: true,
          attributeFilter: ['class']  // Only watch 'class', not 'style' to avoid loop
        })
        
        isAttachedRef.current = true
        
        // Initial attach of touch listeners
        attachTouchListenersToHandles()
      } else {
        // Retry after a short delay
        setTimeout(attachObserver, 100)
      }
    }

    // Wait for calendar to be mounted
    setTimeout(attachObserver, 0)
    
    // Listen to BOTH mouse AND touch events
    document.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('touchmove', handleMove, { passive: true })
    document.addEventListener('touchstart', handleMove, { passive: true })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchstart', handleMove)
      
      // Clean up touch listeners from handles
      const resizeHandles = document.querySelectorAll('.rbc-addons-dnd-resize-ns-anchor')
      resizeHandles.forEach(handle => {
        handle.removeEventListener('touchstart', preventScrollDuringResize as any)
        handle.removeEventListener('touchmove', preventScrollDuringResize as any)
      })
      
      isAttachedRef.current = false
      isResizingActiveRef.current = false
    }
  }, [])
}

