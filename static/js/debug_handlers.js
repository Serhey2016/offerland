// Debug script for testing event handlers
console.log('🔧 Debug: Loading debug handlers script');

// Функция для тестирования кликов
function testMenuClick() {
    console.log('🧪 Debug: Testing menu click manually');
    
    const touchpointButton = document.querySelector('[data-category="Touchpoint"]');
    if (touchpointButton) {
        console.log('✅ Debug: Touchpoint button found', touchpointButton);
        
        // Симулируем клик
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        console.log('🎯 Debug: Dispatching click event');
        touchpointButton.dispatchEvent(event);
    } else {
        console.error('❌ Debug: Touchpoint button not found');
    }
}

// Функция для проверки всех обработчиков
function checkEventHandlers() {
    console.log('🔍 Debug: Checking event handlers');
    
    // Проверяем expandable кнопки
    const expandableButtons = document.querySelectorAll('.task_tracker_menu_item.expandable');
    console.log('📊 Debug: Found expandable buttons:', expandableButtons.length);
    
    expandableButtons.forEach((button, index) => {
        const category = button.getAttribute('data-category');
        console.log(`🔘 Debug: Button ${index}:`, category, button);
        
        // Проверяем, есть ли обработчики
        const hasListeners = button.onclick !== null;
        console.log(`📡 Debug: Button ${index} has onclick:`, hasListeners);
    });
    
    // Проверяем React mount point
    const reactMount = document.getElementById('react-task-tracker');
    console.log('⚛️ Debug: React mount point:', reactMount);
    
    // Проверяем, загружен ли React
    if (window.React) {
        console.log('✅ Debug: React is loaded');
    } else {
        console.log('❌ Debug: React is not loaded');
    }
}

// Добавляем функции в глобальную область видимости для тестирования
window.testMenuClick = testMenuClick;
window.checkEventHandlers = checkEventHandlers;

// Автоматически запускаем проверку через 2 секунды
setTimeout(() => {
    console.log('⏰ Debug: Running automatic checks...');
    checkEventHandlers();
}, 2000);

console.log('✅ Debug: Debug handlers script loaded');
console.log('💡 Debug: Use testMenuClick() and checkEventHandlers() in console');
