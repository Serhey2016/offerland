// advertising_feed.js - Основной функционал для ленты рекламы

// Проверяем доступность window и document
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Основные переменные
    let isInitialized = false;
    let currentPostId = null;
    
    // Функции для работы с рекламой
    const AdvertisingFeed = {
        // Инициализация
        init: function() {
            if (isInitialized) {
                return;
            }
            
            this.initEventListeners();
            this.initGallery();
            isInitialized = true;
        },
        
        // Инициализация обработчиков событий
        initEventListeners: function() {
            // Обработчик для кнопки чата
            document.addEventListener('click', function(e) {
                if (e.target.closest('.chat-btn')) {
                    const postId = e.target.closest('.social_feed').dataset.postId;
                    handleChatClick(postId);
                }
            });
            
            // Обработчик для кнопки комментариев
            document.addEventListener('click', function(e) {
                if (e.target.closest('.comments-btn')) {
                    const postId = e.target.closest('.social_feed').dataset.postId;
                    handleCommentsClick(postId);
                }
            });
            
            // Обработчик для кнопки "Заказать сейчас"
            document.addEventListener('click', function(e) {
                if (e.target.closest('.order-now-btn')) {
                    const postId = e.target.closest('.social_feed').dataset.postId;
                    handleOrderNowClick(postId);
                }
            });
        },
        
        // Инициализация галереи
        initGallery: function() {
            const gallery = document.querySelector('.advertising-feed-gallery');
            if (gallery) {
                // PhotoSwipe обрабатывается отдельным файлом
            }
        }
    };
    
    // Обработчики событий
    function handleChatClick(postId) {
        // Логика для открытия чата
        if (typeof openChat === 'function') {
            openChat(postId);
        }
    }
    
    function handleCommentsClick(postId) {
        // Логика для открытия комментариев
        if (typeof openComments === 'function') {
            openComments(postId);
        }
    }
    
    function handleOrderNowClick(postId) {
        // Логика для заказа
        if (typeof openOrderForm === 'function') {
            openOrderForm(postId);
        }
    }
    
    // Инициализация при загрузке DOM
    function initOnDOMReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                AdvertisingFeed.init();
            });
        } else {
            AdvertisingFeed.init();
        }
    }
    
    // Запуск инициализации
    initOnDOMReady();
    
    // Экспорт в глобальную область
    window.AdvertisingFeed = AdvertisingFeed;
}
