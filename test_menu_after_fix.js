// Тест після виправлення MutationObserver
// 1. Клік по кнопці фільтра
const button = document.querySelector('.task_tracker_sub_menu_filter_btn')
if (button) {
  console.log('Button found, clicking...')
  button.click()
  
  // Перевірити через 500ms
  setTimeout(() => {
    const menu = document.querySelector('.task_tracker_filter_menu.p-menu-overlay')
    if (menu) {
      console.log('Menu found after click:', menu)
      console.log('Menu styles:', {
        position: menu.style.position,
        top: menu.style.top,
        right: menu.style.right,
        display: menu.style.display,
        visibility: menu.style.visibility,
        opacity: menu.style.opacity
      })
      console.log('Menu rect:', menu.getBoundingClientRect())
    } else {
      console.log('Menu not found after click')
    }
  }, 500)
} else {
  console.log('Button not found')
}
