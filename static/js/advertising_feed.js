// advertising_feed.js - Основной функционал для ленты рекламы
//
// ПРИНЦИП РАБОТЫ:
// Весь JavaScript код работает ИСКЛЮЧИТЕЛЬНО с ID элементов, а не с CSS классами
// Это обеспечивает лучшую производительность и надежность
//
// ОБНОВЛЕННЫЕ ФУНКЦИИ:
// - Переименованы CSS классы с префиксом 'advertising_'
// - Добавлены уникальные ID для кнопок меню: menu_trigger_{postId}
// - Добавлены уникальные ID для dropdown меню: overflow_menu_{postId}
// - Добавлены утилиты для работы с ID: AdvertisingFeedUtils
//
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ:
// - AdvertisingFeedUtils.openDropdownById(123) - открыть dropdown для поста с ID 123
// - AdvertisingFeedUtils.closeDropdownById(123) - закрыть dropdown для поста с ID 123
// - AdvertisingFeedUtils.closeAllDropdowns() - закрыть все открытые dropdown
// - AdvertisingFeedUtils.getMenuTriggerById(123) - получить кнопку меню по ID
// - AdvertisingFeedUtils.getOverflowMenuById(123) - получить dropdown меню по ID
// - AdvertisingFeedUtils.getPostById(123) - получить пост по ID
// - AdvertisingFeedUtils.getAllPostIds() - получить все ID постов

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
            console.log('AdvertisingFeed.init called');
            if (isInitialized) {
                console.log('Already initialized, returning');
                return;
            }
            
            console.log('Initializing AdvertisingFeed...');
            this.initEventListeners();
            this.initGallery();
            this.initDropdownMenu();
            isInitialized = true;
            console.log('AdvertisingFeed initialized successfully');
        },
        
        // Инициализация обработчиков событий
        initEventListeners: function() {
            // Обработчик для кнопки чата
            document.addEventListener('click', function(e) {
                if (e.target.closest('.action_btn') && e.target.textContent === 'Chat') {
                    const post = e.target.closest('.social_feed');
                    const postId = post.dataset.postId;
                    handleChatClick(postId);
                }
            });
            
            // Обработчик для кнопки комментариев
            document.addEventListener('click', function(e) {
                if (e.target.closest('.action_btn') && e.target.textContent === 'Comments') {
                    const post = e.target.closest('.social_feed');
                    const postId = post.dataset.postId;
                    handleCommentsClick(postId);
                }
            });
            
            // Обработчик для кнопки "Заказать сейчас"
            document.addEventListener('click', function(e) {
                if (e.target.closest('.order_now')) {
                    const post = e.target.closest('.social_feed');
                    const postId = post.dataset.postId;
                    handleOrderNowClick(postId);
                }
            });
        },
        
        // Инициализация dropdown menu
        initDropdownMenu: function() {
            console.log('initDropdownMenu called');
            
            // Обработчик для открытия/закрытия dropdown menu
            document.addEventListener('click', function(e) {
                console.log('Click event detected:', e.target);
                
                const menuButton = e.target.closest('.social_feed .advertising_social_feed_menu_trigger');
                console.log('Menu button found:', menuButton);
                
                if (menuButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const post = menuButton.closest('.social_feed');
                    const postId = post.dataset.postId;
                    console.log('Post ID:', postId);
                    
                    // Используем ID для поиска dropdown
                    const dropdown = getOverflowMenuById(postId);
                    console.log('Dropdown found by ID:', dropdown);
                    
                    if (dropdown) {
                        console.log('Menu button clicked for post:', postId);
                        console.log('Dropdown found by ID:', dropdown);
                        console.log('Current dropdown classes:', dropdown.className);
                        
                        // Закрываем предыдущий открытый dropdown
                        if (activeDropdown && activeDropdown !== dropdown) {
                            activeDropdown.classList.remove('show');
                        }
                        
                        // Переключаем текущий dropdown
                        if (dropdown.classList.contains('show')) {
                            closeDropdownById(postId);
                            console.log('Dropdown closed for post:', postId);
                        } else {
                            openDropdownById(postId);
                            console.log('Dropdown opened for post:', postId);
                        }
                    } else {
                        console.error('Dropdown not found for post:', postId);
                        console.error('Looking for ID:', `overflow_menu_${postId}`);
                        console.error('All elements with overflow_menu_ prefix:', document.querySelectorAll('[id^="overflow_menu_"]'));
                    }
                }
            });
            
            // Обработчик для действий в dropdown menu
            document.addEventListener('click', function(e) {
                const menuItem = e.target.closest('.social_feed .advertising_social_feed_overflow_menu_item');
                if (menuItem) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const action = menuItem.dataset.action;
                    const postId = menuItem.dataset.id;
                    
                    handleDropdownAction(action, postId);
                    
                    // Закрываем dropdown после действия используя ID
                    closeDropdownById(postId);
                }
            });
            
            // Закрытие dropdown при клике вне его
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.social_feed .advertising_social_feed_menu_trigger') && !e.target.closest('.social_feed .advertising_social_feed_overflow_menu')) {
                    closeAllDropdowns();
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
    function handleDropdownAction(action, postId) {
        switch (action) {
            case 'edit':
                handleEditAction(postId);
                break;
            case 'archive':
                handleArchiveAction(postId);
                break;
            case 'share':
                handleShareAction(postId);
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }
    
    // Обработчик редактирования
    function handleEditAction(postId) {
        // Здесь можно добавить логику редактирования
        // Например, открыть модальное окно с формой редактирования
        if (typeof openEditForm === 'function') {
            openEditForm(postId);
        }
    }
    
    // Обработчик архивирования
    function handleArchiveAction(postId) {
        // Показываем подтверждение архивирования
        if (confirm('Are you sure you want to archive this post?')) {
            archivePost(postId);
        }
    }
    
    // Обработчик поделиться
    function handleShareAction(postId) {
        // Здесь можно добавить логику для поделиться
        // Например, скопировать ссылку в буфер обмена или открыть меню поделиться
        if (typeof sharePost === 'function') {
            sharePost(postId);
        } else {
            // Fallback: копируем ссылку в буфер обмена
            const currentUrl = window.location.href;
            const shareUrl = `${currentUrl}#post-${postId}`;
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    alert('Link copied to clipboard!');
                }).catch(() => {
                    // Fallback для старых браузеров
                    const textArea = document.createElement('textarea');
                    textArea.value = shareUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Link copied to clipboard!');
                });
            } else {
                // Fallback для очень старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Link copied to clipboard!');
            }
        }
    }
    
    // Функция архивирования поста
    function archivePost(postId) {
        // Получаем CSRF токен
        const csrfToken = getCookie('csrftoken');
        
        // Показываем спиннер на посте
        const post = getPostById(postId);
        if (post) {
            const originalContent = post.innerHTML;
            post.innerHTML = `
                <div class="loading" style="min-height: 200px;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #dee2e6; border-top: 4px solid #FBD551;"></div>
                    <span style="font-size: 16px;">Archiving post...</span>
                </div>
            `;
            
            // Отправляем запрос на архивирование
            fetch(`/services_and_projects/change_advertising_status/${postId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrfToken,
                },
                body: `status=archived`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Показываем сообщение об успехе
                    alert('Post archived successfully!');
                    
                    // Скрываем пост из ленты
                    post.style.display = 'none';
                    
                    // Закрываем dropdown
                    closeDropdownById(postId);
                } else {
                    // Восстанавливаем оригинальный контент и показываем ошибку
                    post.innerHTML = originalContent;
                    alert('Error archiving post: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Восстанавливаем оригинальный контент и показываем ошибку
                post.innerHTML = originalContent;
                alert('Error archiving post. Please try again.');
            });
        }
    }
    
    // Функция для получения CSRF токена
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    // Дополнительные функции для работы с ID
    function getMenuTriggerById(postId) {
        return document.getElementById(`menu_trigger_${postId}`);
    }
    
    function getOverflowMenuById(postId) {
        const id = `overflow_menu_${postId}`;
        console.log(`Looking for element with ID: ${id}`);
        const element = document.getElementById(id);
        console.log(`Element found:`, element);
        return element;
    }
    
    function getPostById(postId) {
        return document.querySelector(`.social_feed[data-post-id="${postId}"]`);
    }
    
    function getAllPostIds() {
        const posts = document.querySelectorAll('.social_feed[data-post-id]');
        return Array.from(posts).map(post => post.dataset.postId);
    }
    
    function openDropdownById(postId) {
        console.log(`openDropdownById called with postId: ${postId}`);
        const dropdown = getOverflowMenuById(postId);
        console.log(`getOverflowMenuById returned:`, dropdown);
        
        if (dropdown) {
            // Закрываем предыдущий открытый dropdown
            if (activeDropdown && activeDropdown !== dropdown) {
                activeDropdown.classList.remove('show');
            }
            
            dropdown.classList.add('show');
            activeDropdown = dropdown;
            console.log(`Dropdown opened for post ${postId}`);
            console.log(`Dropdown classes after adding show:`, dropdown.className);
            console.log(`Dropdown display style:`, window.getComputedStyle(dropdown).display);
        } else {
            console.error(`Dropdown not found for post ${postId}`);
        }
    }
    
    function closeDropdownById(postId) {
        const dropdown = getOverflowMenuById(postId);
        if (dropdown) {
            dropdown.classList.remove('show');
            if (activeDropdown === dropdown) {
                activeDropdown = null;
            }
            console.log(`Dropdown closed for post ${postId}`);
        }
    }
    
    function closeAllDropdowns() {
        // Получаем все ID постов и закрываем их dropdown
        const postIds = getAllPostIds();
        postIds.forEach(postId => {
            closeDropdownById(postId);
        });
        activeDropdown = null;
        console.log('All dropdowns closed');
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
        
        // Экспорт дополнительных функций
        window.AdvertisingFeedUtils = {
            getMenuTriggerById,
            getOverflowMenuById,
            getPostById,
            getAllPostIds,
            openDropdownById,
            closeDropdownById,
            closeAllDropdowns
        };
    }
}
