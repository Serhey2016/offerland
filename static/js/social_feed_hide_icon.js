// Функция для инициализации обработчиков событий
function initializeHideIcons() {
    console.log('Initializing hide icons...');
    
    // Для всех иконок на странице
    const hideIcons = document.querySelectorAll('.social_feed_hide_icon');
    console.log('Found hide icons:', hideIcons.length);
    
    if (hideIcons.length === 0) {
        console.log('No hide icons found on page');
        return;
    }
    
    hideIcons.forEach(function(hideIcon, index) {
        // Проверяем, не инициализировали ли мы уже эту иконку
        if (hideIcon.dataset.initialized === 'true') {
            console.log('Icon already initialized:', hideIcon.id);
            return;
        }
        
        // Ищем svg внутри иконки
        const svg = hideIcon.querySelector('svg');
        
        // Получаем ID иконки и ищем соответствующий details
        const iconId = hideIcon.id;
        if (!iconId || !iconId.startsWith('socialFeedHideIcon_')) {
            console.log('Invalid icon ID:', iconId);
            return;
        }
        
        const taskId = iconId.replace('socialFeedHideIcon_', '');
        const details = document.getElementById(`socialFeedDetails_${taskId}`);
        
        console.log(`Processing icon ${index + 1}:`, iconId, 'taskId:', taskId, 'details found:', !!details);
        
        if (!hideIcon || !details || !svg) {
            console.log('Missing required elements for icon:', iconId);
            console.log('hideIcon:', !!hideIcon, 'details:', !!details, 'svg:', !!svg);
            return;
        }

        // Начальные стили для анимации
        details.style.transition = 'max-height 0.5s cubic-bezier(.4,2,.6,1), opacity 0.4s';
        details.style.overflow = 'hidden';
        details.style.maxHeight = '0px';
        details.style.opacity = '0';
        let expanded = false;
        let isTransitioning = false;

        // Обработчик клика для всей иконки и всех её дочерних элементов
        function handleIconClick(e) {
            console.log('Icon clicked:', iconId, 'target:', e.target.tagName, 'target id:', e.target.id);
            e.preventDefault();
            e.stopPropagation();
            
            if (isTransitioning) {
                console.log('Transition in progress, ignoring click');
                return;
            }
            expanded = !expanded;
            if (expanded) {
                console.log('Expanding details for task:', taskId);
                details.style.display = 'block';
                // Нужно для плавного раскрытия
                void details.offsetWidth;
                details.style.maxHeight = details.scrollHeight + 'px';
                details.style.opacity = '1';
                svg.style.transition = 'transform 0.4s cubic-bezier(.4,2,.6,1)';
                svg.style.transform = 'rotate(180deg)';
            } else {
                console.log('Collapsing details for task:', taskId);
                details.style.maxHeight = '0px';
                details.style.opacity = '0';
                svg.style.transition = 'transform 0.4s cubic-bezier(.4,2,.6,1)';
                svg.style.transform = 'rotate(0deg)';
                isTransitioning = true;
            }
        }

        // Добавляем обработчик на всю иконку
        hideIcon.addEventListener('click', handleIconClick);
        
        // Также добавляем обработчик на SVG и все его дочерние элементы
        svg.addEventListener('click', handleIconClick);
        
        // Добавляем обработчики на все дочерние элементы SVG
        const svgChildren = svg.querySelectorAll('*');
        svgChildren.forEach(function(child) {
            child.addEventListener('click', handleIconClick);
        });

        details.addEventListener('transitionend', function(e) {
            if (!expanded && (e.propertyName === 'max-height' || e.propertyName === 'opacity')) {
                details.style.display = 'none';
                isTransitioning = false;
                console.log('Transition ended, hiding details for task:', taskId);
            }
        });
        
        // Отмечаем иконку как инициализированную
        hideIcon.dataset.initialized = 'true';
        console.log('Icon initialized successfully:', iconId);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('social_feed_hide_icon.js loaded');
    console.log('Document ready, initializing...');
    initializeHideIcons();
    
    // Глобальное делегирование событий для динамически загруженных элементов
    document.addEventListener('click', function(e) {
        const hideIcon = e.target.closest('.social_feed_hide_icon');
        if (hideIcon) {
            console.log('Global click handler triggered for icon');
            const iconId = hideIcon.id;
            if (!iconId || !iconId.startsWith('socialFeedHideIcon_')) return;
            
            const taskId = iconId.replace('socialFeedHideIcon_', '');
            const details = document.getElementById(`socialFeedDetails_${taskId}`);
            const svg = hideIcon.querySelector('svg');
            
            if (!details || !svg) {
                console.log('Missing elements for global handler:', iconId);
                return;
            }
            
            // Проверяем текущее состояние
            const isExpanded = details.style.display !== 'none' && details.style.maxHeight !== '0px';
            console.log('Global handler - isExpanded:', isExpanded, 'for task:', taskId);
            
            if (isExpanded) {
                // Скрываем
                details.style.maxHeight = '0px';
                details.style.opacity = '0';
                svg.style.transition = 'transform 0.4s cubic-bezier(.4,2,.6,1)';
                svg.style.transform = 'rotate(0deg)';
            } else {
                // Показываем
                details.style.display = 'block';
                void details.offsetWidth;
                details.style.maxHeight = details.scrollHeight + 'px';
                details.style.opacity = '1';
                svg.style.transition = 'transform 0.4s cubic-bezier(.4,2,.6,1)';
                svg.style.transform = 'rotate(180deg)';
            }
        }
    });
    
    // Глобальная обработка transitionend для всех элементов
    document.addEventListener('transitionend', function(e) {
        if (e.target.classList.contains('social_feed_details')) {
            const details = e.target;
            const isExpanded = details.style.maxHeight !== '0px' && details.style.maxHeight !== '';
            
            if (!isExpanded && (e.propertyName === 'max-height' || e.propertyName === 'opacity')) {
                details.style.display = 'none';
                console.log('Global transitionend - hiding details');
            }
        }
    });
    
    // Наблюдатель за изменениями DOM для динамически загруженных элементов
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                const newIcons = document.querySelectorAll('.social_feed_hide_icon:not([data-initialized="true"])');
                if (newIcons.length > 0) {
                    console.log('New icons found, reinitializing...');
                    initializeHideIcons();
                }
            }
        });
    });
    
    // Начинаем наблюдение за изменениями в DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Экспортируем функцию для ручного вызова
window.initializeHideIcons = initializeHideIcons;

// Дополнительная проверка при загрузке window
window.addEventListener('load', function() {
    console.log('Window loaded, checking for icons again...');
    const icons = document.querySelectorAll('.social_feed_hide_icon');
    console.log('Icons found on window load:', icons.length);
    if (icons.length > 0) {
        initializeHideIcons();
    }
}); 