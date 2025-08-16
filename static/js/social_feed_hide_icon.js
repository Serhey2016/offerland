// social_feed_hide_icon.js - Функциональность для скрытия/показа деталей постов

// Глобальные переменные
let initializedIcons = new Set();
let transitionInProgress = false;

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHideIcons);
} else {
    initHideIcons();
}

// Основная функция инициализации
function initHideIcons() {
    const hideIcons = document.querySelectorAll('[id^="socialFeedHideIcon_"]');
    
    if (hideIcons.length === 0) {
        return;
    }
    
    hideIcons.forEach((hideIcon, index) => {
        const iconId = hideIcon.id;
        
        if (initializedIcons.has(iconId)) {
            return;
        }
        
        const taskId = iconId.replace('socialFeedHideIcon_', '');
        const details = document.querySelector(`[id^="socialFeedDetails_${taskId}"]`);
        const svg = hideIcon.querySelector('svg');
        
        if (!hideIcon || !details || !svg) {
            return;
        }
        
        // Инициализация иконки
        initIcon(hideIcon, details, svg, taskId);
        initializedIcons.add(iconId);
    });
    
    // Глобальные обработчики событий
    initGlobalEventHandlers();
}

// Инициализация отдельной иконки
function initIcon(hideIcon, details, svg, taskId) {
    let isExpanded = false;
    
    // Обработчик клика
    hideIcon.addEventListener('click', function(e) {
        if (transitionInProgress) {
            return;
        }
        
        if (isExpanded) {
            collapseDetails(details, svg, taskId);
        } else {
            expandDetails(details, svg, taskId);
        }
        isExpanded = !isExpanded;
    });
    
    // Обработчик окончания анимации
    details.addEventListener('transitionend', function() {
        if (!isExpanded) {
            details.style.display = 'none';
        }
        transitionInProgress = false;
    });
}

// Развертывание деталей
function expandDetails(details, svg, taskId) {
    transitionInProgress = true;
    details.style.display = 'block';
    
    // Анимация развертывания
    requestAnimationFrame(() => {
        details.style.maxHeight = details.scrollHeight + 'px';
        details.style.opacity = '1';
        
        // Поворот иконки
        svg.style.transform = 'rotate(180deg)';
    });
}

// Сворачивание деталей
function collapseDetails(details, svg, taskId) {
    transitionInProgress = true;
    
    // Анимация сворачивания
    details.style.maxHeight = '0';
    details.style.opacity = '0';
    
    // Поворот иконки
    svg.style.transform = 'rotate(0deg)';
}

// Глобальные обработчики событий
function initGlobalEventHandlers() {
    if (window.globalHideIconHandlersInitialized) {
        return;
    }
    
    // Глобальный обработчик для динамически добавленных иконок
    document.addEventListener('click', function(e) {
        const hideIcon = e.target.closest('[id^="socialFeedHideIcon_"]');
        if (!hideIcon) {
            return;
        }
        
        const iconId = hideIcon.id;
        const taskId = iconId.replace('socialFeedHideIcon_', '');
        const details = document.querySelector(`[id^="socialFeedDetails_${taskId}"]`);
        const svg = hideIcon.querySelector('svg');
        
        if (!details || !svg) {
            return;
        }
        
        // Проверяем состояние
        const isExpanded = details.style.display !== 'none' && details.style.maxHeight !== '0px';
        
        if (isExpanded) {
            collapseDetails(details, svg, taskId);
        } else {
            expandDetails(details, svg, taskId);
        }
    });
    
    // Глобальный обработчик окончания анимации
    document.addEventListener('transitionend', function(e) {
        if (e.target.matches('[id^="socialFeedDetails_"]')) {
            const details = e.target;
            const isExpanded = details.style.maxHeight !== '0px';
            
            if (!isExpanded) {
                details.style.display = 'none';
            }
            transitionInProgress = false;
        }
    });
    
    window.globalHideIconHandlersInitialized = true;
}

// Дополнительная инициализация при полной загрузке страницы
window.addEventListener('load', function() {
    const icons = document.querySelectorAll('[id^="socialFeedHideIcon_"]');
    if (icons.length > initializedIcons.size) {
        initHideIcons();
    }
});

// Экспорт функций
window.HideIconManager = {
    init: initHideIcons,
    expand: expandDetails,
    collapse: collapseDetails
}; 