// Перевірити React DevTools
// 1. Відкрийте React DevTools
// 2. Знайдіть SubMenuSection компонент
// 3. Перевірте props та state

// Перевірити DOM структуру
document.querySelector('.task_tracker_sub_menu_section')
document.querySelector('.task_tracker_sub_menu_filter_container')
document.querySelector('.task_tracker_sub_menu_filter_btn')

// Перевірити всі PrimeReact компоненти
document.querySelectorAll('[class*="p-"]')

// Перевірити всі меню в DOM
document.querySelectorAll('.p-menu')
document.querySelectorAll('[class*="menu"]')

// Перевірити клік по кнопці
const button = document.querySelector('.task_tracker_sub_menu_filter_btn')
if (button) {
  console.log('Button found:', button)
  console.log('Button classes:', button.className)
  console.log('Button onclick:', button.onclick)
  console.log('Button event listeners:', getEventListeners(button))
}
