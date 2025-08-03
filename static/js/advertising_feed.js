console.log('advertising_feed.js loaded');

// Проверка загрузки файла
if (typeof window !== 'undefined') {
    console.log('advertising_feed.js: Window object available');
    console.log('advertising_feed.js: Document ready state:', document.readyState);
}

// === READ MORE FUNCTIONALITY ===
/**
 * Инициализирует функциональность "Read more..." для постов
 */
function initReadMore() {
    // Удаляем старые обработчики событий
    const existingReadMoreElements = document.querySelectorAll('.read_more');
    existingReadMoreElements.forEach(function(element) {
        element.removeEventListener('click', handleReadMoreClick);
    });
    
    // Находим все элементы "Read more..."
    const readMoreElements = document.querySelectorAll('.read_more');
    
    readMoreElements.forEach(function(readMoreElement) {
        readMoreElement.addEventListener('click', handleReadMoreClick);
    });
}

/**
 * Обработчик клика по "Read more..."
 */
function handleReadMoreClick() {
    // Находим родительский контейнер текста
    const textContainer = this.closest('.social_feed_text');
    if (!textContainer) return;
    
    // Находим параграф с текстом
    const textParagraph = textContainer.querySelector('p');
    if (!textParagraph) return;
    
    // Проверяем, развернут ли уже текст
    const isExpanded = textParagraph.classList.contains('expanded');
    
    if (!isExpanded) {
        // Получаем полный текст из data-атрибута
        const fullText = textParagraph.getAttribute('data-full-text');
        if (fullText) {
            // Показываем полный текст
            textParagraph.textContent = fullText;
            textParagraph.classList.add('expanded');
            
            // Меняем текст кнопки на "Show less"
            this.textContent = 'Show less';
            this.classList.add('expanded');
        }
    } else {
        // Возвращаем к сокращенному тексту
        const fullText = textParagraph.getAttribute('data-full-text');
        if (fullText) {
            textParagraph.textContent = fullText.substring(0, 238) + '...';
            textParagraph.classList.remove('expanded');
            
            // Возвращаем текст кнопки на "Read more..."
            this.textContent = 'Read more...';
            this.classList.remove('expanded');
        }
    }
}

// === ACTION BUTTONS FUNCTIONALITY ===
/**
 * Инициализирует обработчики для кнопок действий в advertising feed
 */
function initActionButtons() {
    // Обработчик для кнопки "Chat"
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('action_btn') && e.target.textContent === 'Chat') {
            handleChatButtonClick(e);
        }
    });
    
    // Обработчик для кнопки "Comments"
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('action_btn') && e.target.textContent === 'Comments') {
            handleCommentsButtonClick(e);
        }
    });
    
    // Обработчик для кнопки "Order now"
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('order_now')) {
            handleOrderNowButtonClick(e);
        }
    });
}

/**
 * Обработчик клика по кнопке "Chat"
 */
function handleChatButtonClick(e) {
    e.preventDefault();
    const advertisingContainer = e.target.closest('.social_feed');
    const postId = advertisingContainer.querySelector('.post_id').textContent;
    
    console.log('Chat button clicked for advertising:', postId);
    // Здесь можно добавить логику для открытия чата
    // Например, открыть модальное окно или перенаправить на страницу чата
}

/**
 * Обработчик клика по кнопке "Comments"
 */
function handleCommentsButtonClick(e) {
    e.preventDefault();
    const advertisingContainer = e.target.closest('.social_feed');
    const postId = advertisingContainer.querySelector('.post_id').textContent;
    
    console.log('Comments button clicked for advertising:', postId);
    // Здесь можно добавить логику для отображения комментариев
    // Например, загрузить комментарии через AJAX или открыть модальное окно
}

/**
 * Обработчик клика по кнопке "Order now"
 */
function handleOrderNowButtonClick(e) {
    e.preventDefault();
    const advertisingContainer = e.target.closest('.social_feed');
    const postId = advertisingContainer.querySelector('.post_id').textContent;
    
    console.log('Order now button clicked for advertising:', postId);
    // Здесь можно добавить логику для создания заказа
    // Например, открыть форму заказа или перенаправить на страницу создания заказа
}

// === IMAGE GALLERY FUNCTIONALITY ===
/**
 * Инициализирует галерею изображений для advertising feed
 * Примечание: PhotoSwipe обрабатывается в photoswipe_force_show.js
 */
function initImageGallery() {
    // PhotoSwipe обрабатывается в photoswipe_force_show.js
    // Проверяем, что галерея существует
    const gallery = document.querySelector('.social_feed_image_gallery_1');
    if (gallery) {
        console.log('Advertising feed gallery found, PhotoSwipe handled by photoswipe_force_show.js');
    } else {
        console.log('No advertising feed gallery found');
    }
}

// === INITIALIZATION ===
/**
 * Основная функция инициализации advertising feed
 */
function initAdvertisingFeed() {
    console.log('Initializing advertising feed functionality');
    
    // Инициализируем read more функциональность
    initReadMore();
    
    // Инициализируем кнопки действий
    initActionButtons();
    
    // Инициализируем галерею изображений
    initImageGallery();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - initializing advertising feed');
    initAdvertisingFeed();
});

// Дополнительная инициализация для случаев, когда DOM уже загружен
if (document.readyState === 'loading') {
    // DOM еще загружается
    console.log('DOM still loading, waiting for DOMContentLoaded');
} else {
    // DOM уже загружен
    console.log('DOM already loaded, initializing advertising feed immediately');
    initAdvertisingFeed();
}

// Экспортируем функции для возможного использования в других модулях
window.AdvertisingFeed = {
    initReadMore,
    handleReadMoreClick,
    initActionButtons,
    handleChatButtonClick,
    handleCommentsButtonClick,
    handleOrderNowButtonClick,
    initImageGallery,
    initAdvertisingFeed
};

// Функция для тестирования подключения
function testAdvertisingFeedConnection() {
    console.log('=== Advertising Feed Connection Test ===');
    console.log('1. File loaded:', typeof window !== 'undefined');
    console.log('2. Functions available:', {
        initReadMore: typeof initReadMore === 'function',
        handleReadMoreClick: typeof handleReadMoreClick === 'function',
        initActionButtons: typeof initActionButtons === 'function',
        initImageGallery: typeof initImageGallery === 'function',
        initAdvertisingFeed: typeof initAdvertisingFeed === 'function'
    });
    console.log('3. Window.AdvertisingFeed available:', typeof window.AdvertisingFeed === 'object');
    console.log('4. Read more elements found:', document.querySelectorAll('.read_more').length);
    console.log('5. Social feed elements found:', document.querySelectorAll('.social_feed').length);
    console.log('6. PhotoSwipe handled by photoswipe_force_show.js');
    console.log('=== End Test ===');
}

// Запускаем тест через небольшую задержку
setTimeout(testAdvertisingFeedConnection, 1000);
