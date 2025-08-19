// advertising_feed.js - Основной функционал для ленты рекламы

// Проверяем доступность window и document
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Основные переменные
    let isInitialized = false;
    let currentPostId = null;
    let activeDropdown = null;
    
    // Функции для работы с рекламой
    const AdvertisingFeed = {
        // Инициализация
        init: function() {
            if (isInitialized) {
                return;
            }
            
            this.initEventListeners();
            this.initGallery();
            this.initDropdownMenu();
            isInitialized = true;
        },
        
        // Инициализация обработчиков событий
        initEventListeners: function() {
            // Обработчик для кнопки чата
            document.addEventListener('click', function(e) {
                if (e.target.closest('.action_btn') && e.target.textContent === 'Chat') {
                    const postId = e.target.closest('.social_feed').dataset.postId;
                    handleChatClick(postId);
                }
            });
            
            // Обработчик для кнопки комментариев
            document.addEventListener('click', function(e) {
                if (e.target.closest('.action_btn') && e.target.textContent === 'Comments') {
                    const postId = e.target.closest('.social_feed').dataset.postId;
                    handleCommentsClick(postId);
                }
            });
            
            // Обработчик для кнопки "Заказать сейчас"
            document.addEventListener('click', function(e) {
                if (e.target.closest('.order_now')) {
                    const postId = e.target.closest('.social_feed').dataset.postId;
                    handleOrderNowClick(postId);
                }
            });
        },
        
        // Инициализация dropdown menu
        initDropdownMenu: function() {
            // Проверяем, что элементы найдены
            const menuElements = document.querySelectorAll('.social_feed .social_feed_menu');
            const dropdownElements = document.querySelectorAll('.social_feed .social_feed_overflow_menu');
            
            // Обработчик для открытия/закрытия dropdown menu
            document.addEventListener('click', function(e) {
                const menuButton = e.target.closest('.social_feed .social_feed_menu');
                if (menuButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const post = menuButton.closest('.social_feed');
                    const postId = post.dataset.postId;
                    const dropdown = post.querySelector('.social_feed_overflow_menu');
                    
                    // Закрываем предыдущий открытый dropdown
                    if (activeDropdown && activeDropdown !== dropdown) {
                        activeDropdown.classList.remove('show');
                    }
                    
                    // Переключаем текущий dropdown
                    if (dropdown.classList.contains('show')) {
                        dropdown.classList.remove('show');
                        activeDropdown = null;
                    } else {
                        dropdown.classList.add('show');
                        activeDropdown = dropdown;
                    }
                }
            });
            
            // Обработчик для действий в dropdown menu
            document.addEventListener('click', function(e) {
                const menuItem = e.target.closest('.social_feed .social_feed_overflow_menu_item');
                if (menuItem) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const action = menuItem.dataset.action;
                    const postId = menuItem.dataset.id;
                    const post = menuItem.closest('.social_feed');
                    
                    handleDropdownAction(action, postId, post);
                    
                    // Закрываем dropdown после действия
                    const dropdown = post.querySelector('.social_feed_overflow_menu');
                    dropdown.classList.remove('show');
                    activeDropdown = null;
                }
            });
            
            // Закрытие dropdown при клике вне его
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.social_feed .social_feed_menu') && !e.target.closest('.social_feed .social_feed_overflow_menu')) {
                    if (activeDropdown) {
                        activeDropdown.classList.remove('show');
                        activeDropdown = null;
                    }
                }
            });
            

        },
        
        // Инициализация галереи
        initGallery: function() {
            const gallery = document.querySelector('.advertising-feed-image-gallery-1');
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
    
    // Обработчик действий dropdown menu
    function handleDropdownAction(action, postId, post) {
        switch (action) {
            case 'edit':
                handleEditAction(postId, post);
                break;
            case 'remove':
                handleRemoveAction(postId, post);
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }
    
    // Обработчик редактирования
    function handleEditAction(postId, post) {
        // Здесь можно добавить логику редактирования
        // Например, открыть модальное окно с формой редактирования
        if (typeof openEditForm === 'function') {
            openEditForm(postId);
        }
    }
    
    // Обработчик удаления
    function handleRemoveAction(postId, post) {
        // Здесь можно добавить логику удаления
        // Например, показать подтверждение и удалить пост
        if (confirm('Are you sure you want to remove this post?')) {
            if (typeof removePost === 'function') {
                removePost(postId, post);
            }
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
    
    // Запуск инициализации с защитой от повторной загрузки
    if (!window.__AdvertisingFeedBootstrapped__) {
        window.__AdvertisingFeedBootstrapped__ = true;
        initOnDOMReady();
        
        // Экспорт в глобальную область
        window.AdvertisingFeed = AdvertisingFeed;
    }
}
