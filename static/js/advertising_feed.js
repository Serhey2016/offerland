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

// Защита от повторной загрузки
if (window.__AdvertisingFeedBootstrapped__) {
    // Advertising Feed already loaded, skipping...
} else {
    // Loading Advertising Feed...

console.log('=== ADVERTISING_FEED.JS LOADED ===');
// File loaded at:', new Date().toISOString());
// Window object:', typeof window);
// Document object:', typeof document);

// Проверяем доступность window и document
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Основные переменные
    let isInitialized = false;
    let currentPostId = null;
    let activeDropdown = null;
    
    // Настройка Alertify для уведомлений сверху справа
    if (typeof alertify !== 'undefined' && alertify && alertify.notifier && typeof alertify.notifier.set === 'function') {
        try {
            alertify.notifier.set('position', 'top-right');
            alertify.notifier.set('delay', 3);
        } catch (error) {
            console.log('Alertify configuration failed:', error);
        }
    } else {
        console.log('Alertify not available, using fallback notifications');
    }
    
    // Функции для работы с рекламой
    const AdvertisingFeed = {
        // Инициализация
        init: function() {
            // === AdvertisingFeed.init called ===
            // isInitialized:', isInitialized);
            if (isInitialized) {
                // Already initialized, returning
                return;
            }
            
            // Initializing AdvertisingFeed...
            // Document ready state:', document.readyState);
            // Document body:', document.body);
            
            this.initEventListeners();
            this.initGallery();
            this.initDropdownMenu();
            
            isInitialized = true;
            // === AdvertisingFeed initialized successfully ===
        },
        
        // Инициализация обработчиков событий
        initEventListeners: function() {
            // === initEventListeners called ===
            // Adding click event listeners...
            
            // Обработчик для кнопки чата
            document.addEventListener('click', function(e) {
                // Validate event target
                if (!e.target || typeof e.target.closest !== 'function') {
                    return;
                }
                
                if (e.target.closest('.action_btn') && e.target.textContent === 'Chat') {
                    const post = e.target.closest('.social_feed');
                    const postId = post.dataset.postId;
                    handleChatClick(postId);
                }
            });
            
            // Обработчик для кнопки комментариев
            document.addEventListener('click', function(e) {
                // Validate event target
                if (!e.target || typeof e.target.closest !== 'function') {
                    return;
                }
                
                if (e.target.closest('.action_btn') && e.target.textContent === 'Comments') {
                    const post = e.target.closest('.social_feed');
                    const postId = post.dataset.postId;
                    handleCommentsClick(postId);
                }
            });
            
            // Обработчик для кнопки "Заказать сейчас"
            document.addEventListener('click', function(e) {
                // Validate event target
                if (!e.target || typeof e.target.closest !== 'function') {
                    return;
                }
                
                if (e.target.closest('.order_now')) {
                    const post = e.target.closest('.social_feed');
                    const postId = post.dataset.postId;
                    handleOrderNowClick(postId);
                }
            });
            
            // Обработчики для dropdown menu
            document.addEventListener('click', function(e) {
                // Validate event target
                if (!e.target || typeof e.target.closest !== 'function') {
                    return;
                }
                
                const menuItem = e.target.closest('.advertising_social_feed_overflow_menu_item');
                if (menuItem) {
                    const action = menuItem.dataset.action;
                    const postId = menuItem.dataset.id;
                    
                    // Dropdown menu item clicked:', action, postId);
                    
                    if (action === 'edit') {
                        handleEditClick(postId);
                    } else if (action === 'publish') {
                        handlePublishClick(postId);
                    } else if (action === 'archive') {
                        handleArchiveClick(postId);
                    } else if (action === 'unarchive') {
                        handleUnarchiveClick(postId);
                    } else if (action === 'remove') {
                        handleRemoveClick(postId);
                    }
                    
                    // Закрываем dropdown после действия
                    closeDropdownById(postId);
                }
            });
            
            // === Event listeners added successfully ===
        },
        
        // Инициализация dropdown menu
        initDropdownMenu: function() {
            // === initDropdownMenu called ===
            // Document ready state:', document.readyState);
            // Active dropdown before:', activeDropdown);
            
            // Обработчик для открытия/закрытия dropdown menu
            document.addEventListener('click', function(e) {
                // Validate event target
                if (!e.target || typeof e.target.closest !== 'function') {
                    return;
                }
                
                // Click event detected:', e.target);
                // Click target classes:', e.target.className);
                // Click target tag:', e.target.tagName);
                
                const menuButton = e.target.closest('.advertising_social_feed_menu_trigger');
                // Menu button found:', menuButton);
                
                if (menuButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const post = menuButton.closest('.social_feed');
                    const postId = post.dataset.postId;
                    // Post ID:', postId);
                    // Post element:', post);
                    
                    // Используем ID для поиска dropdown
                    const dropdown = getOverflowMenuById(postId);
                    // Dropdown found by ID:', dropdown);
                    // Looking for ID:', `overflow_menu_${postId}`);
                    
                    if (dropdown) {
                        // Menu button clicked for post:', postId);
                        // Dropdown found by ID:', dropdown);
                        // Current dropdown classes:', dropdown.className);
                        // Current dropdown display style:', window.getComputedStyle(dropdown).display);
                        
                        // Закрываем предыдущий открытый dropdown
                        if (activeDropdown && activeDropdown !== dropdown) {
                            activeDropdown.classList.remove('show');
                        }
                        
                        // Переключаем текущий dropdown
                        if (dropdown.classList.contains('show')) {
                            closeDropdownById(postId);
                            // Dropdown closed for post:', postId);
                        } else {
                            openDropdownById(postId);
                            // Dropdown opened for post:', postId);
                        }
                    } else {
                        console.error('Dropdown not found for post:', postId);
                        console.error('Looking for ID:', `overflow_menu_${postId}`);
                        console.error('All elements with overflow_menu_ prefix:', document.querySelectorAll('[id^="overflow_menu_"]'));
                        console.error('All social_feed elements:', document.querySelectorAll('.social_feed'));
                        console.error('All menu trigger elements:', document.querySelectorAll('.advertising_social_feed_menu_trigger'));
                    }
                }
            });
            
            // === Dropdown click handler added ===
            
            // Закрытие dropdown при клике вне его
            document.addEventListener('click', function(e) {
                // Validate event target
                if (!e.target || typeof e.target.closest !== 'function') {
                    return;
                }
                
                if (!e.target.closest('.advertising_social_feed_menu_trigger') && !e.target.closest('.advertising_social_feed_overflow_menu')) {
                    closeAllDropdowns();
                }
            });
            
            // === initDropdownMenu completed ===
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
            case 'publish':
                handlePublishAction(postId);
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
        // Открываем форму редактирования для Advertising
        if (typeof openEditForm === 'function') {
            openEditForm('advertising', postId);
        } else {
            console.error('openEditForm function not found');
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Edit functionality not available');
            } else {
                alert('Edit functionality not available');
            }
        }
    }
    
    // Обработчик публикации
    function handlePublishAction(postId) {
        // Здесь можно добавить логику публикации
        // Например, показать подтверждение и опубликовать пост
        if (confirm('Are you sure you want to publish this post?')) {
            if (typeof window.alertify !== 'undefined') {
                window.alertify.success('Publish functionality coming soon...');
            } else {
                alert('Publish functionality coming soon...');
            }
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
    function handleArchiveClick(postId) {
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
                body: `adv_mode=archived`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Показываем красивое уведомление об успехе
                    if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                        alertify.notify('Post archived successfully!', 'success');
                    } else {
                        alert('Post archived successfully!');
                    }
                    
                    // Скрываем пост из ленты
                    post.style.display = 'none';
                    
                    // Закрываем dropdown
                    closeDropdownById(postId);
                } else {
                    // Восстанавливаем оригинальный контент и показываем ошибку
                    post.innerHTML = originalContent;
                    if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                        alertify.notify('Error archiving post: ' + data.error, 'error');
                    } else {
                        alert('Error archiving post: ' + data.error);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Восстанавливаем оригинальный контент и показываем ошибку
                post.innerHTML = originalContent;
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Error archiving post. Please try again.', 'error');
                } else {
                    alert('Error archiving post. Please try again.');
                }
            });
        }
    }
    
    // Функция разархивирования поста
    function handleUnarchiveClick(postId) {
        // Получаем CSRF токен
        const csrfToken = getCookie('csrftoken');
        
        // Показываем спиннер на посте
        const post = getPostById(postId);
        if (post) {
            const originalContent = post.innerHTML;
            post.innerHTML = `
                <div class="loading" style="min-height: 200px;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #dee2e6; border-top: 4px solid #FBD551;"></div>
                    <span style="font-size: 16px;">Unarchiving post...</span>
                </div>
            `;
            
            // Отправляем запрос на разархивирование (возвращаем в draft)
            fetch(`/services_and_projects/change_advertising_status/${postId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrfToken,
                },
                body: `adv_mode=draft`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Показываем красивое уведомление об успехе
                    if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                        alertify.notify('Post unarchived successfully!', 'success');
                    } else {
                        alert('Post unarchived successfully!');
                    }
                    
                    // Скрываем пост из ленты (он вернется в draft)
                    post.style.display = 'none';
                    
                    // Закрываем dropdown
                    closeDropdownById(postId);
                } else {
                    // Восстанавливаем оригинальный контент и показываем ошибку
                    post.innerHTML = originalContent;
                    if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                        alertify.notify('Error unarchiving post: ' + data.error, 'error');
                    } else {
                        alert('Error unarchiving post: ' + data.error);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Восстанавливаем оригинальный контент и показываем ошибку
                post.innerHTML = originalContent;
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Error unarchiving post. Please try again.', 'error');
                } else {
                    alert('Error unarchiving post. Please try again.');
                }
            });
        }
    }
    
    // Функция публикации поста
    function handlePublishClick(postId) {
        // Получаем CSRF токен
        const csrfToken = getCookie('csrftoken');
        
        // Показываем спиннер на посте
        const post = getPostById(postId);
        if (post) {
            const originalContent = post.innerHTML;
            post.innerHTML = `
                <div class="loading" style="min-height: 200px;">
                    <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #dee2e6; border-top: 4px solid #FBD551;"></div>
                    <span style="font-size: 16px;">Publishing post...</span>
                </div>
            `;
            
            // Отправляем запрос на публикацию
            fetch(`/services_and_projects/change_advertising_status/${postId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': csrfToken,
                },
                body: `adv_mode=published`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Показываем красивое уведомление об успехе
                    if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                        alertify.notify('Post published successfully!', 'success');
                    } else {
                        alert('Post published successfully!');
                    }
                    
                    // Скрываем пост из ленты (он перейдет в published)
                    post.style.display = 'none';
                    
                    // Закрываем dropdown
                    closeDropdownById(postId);
                } else {
                    // Восстанавливаем оригинальный контент и показываем ошибку
                    post.innerHTML = originalContent;
                    if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                        alertify.notify('Error publishing post: ' + data.error, 'error');
                    } else {
                        alert('Error publishing post: ' + data.error);
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Восстанавливаем оригинальный контент и показываем ошибку
                post.innerHTML = originalContent;
                alert('Error publishing post. Please try again.');
            });
        }
    }
    
    // Функция редактирования поста
    function handleEditClick(postId) {
        // Показываем красивое уведомление о том, что редактирование пока не реализовано
        if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
            alertify.notify('Edit functionality is not implemented yet.', 'warning');
        } else {
            alert('Edit functionality is not implemented yet.');
        }
    }
    
    // Функция удаления поста
    function handleRemoveClick(postId) {
        const confirmMessage = 'Are you sure you want to remove this post? This action cannot be undone.';
        
        if (typeof alertify !== 'undefined' && alertify && alertify.confirm) {
            // Используем красивый confirm диалог alertify
            alertify.confirm(confirmMessage, 
                function() {
                    // Пользователь подтвердил удаление
                    executeRemovePost(postId);
                },
                function() {
                    // Пользователь отменил удаление
                    if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                        alertify.notify('Post removal cancelled.', 'info');
                    }
                }
            ).set('title', 'Confirm Removal');
        } else {
            // Fallback на стандартный confirm
            if (confirm(confirmMessage)) {
                executeRemovePost(postId);
            }
        }
    }
    
    // Вспомогательная функция для выполнения удаления поста
    function executeRemovePost(postId) {
            // Получаем CSRF токен
            const csrfToken = getCookie('csrftoken');
            
            // Показываем спиннер на посте
            const post = getPostById(postId);
            if (post) {
                const originalContent = post.innerHTML;
                post.innerHTML = `
                    <div class="loading" style="min-height: 200px;">
                        <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #dee2e6; border-top: 4px solid #FBD551;"></div>
                        <span style="font-size: 16px;">Removing post...</span>
                    </div>
                `;
                
                // Отправляем запрос на удаление (переводим в archived)
                fetch(`/services_and_projects/change_advertising_status/${postId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-CSRFToken': csrfToken,
                    },
                    body: `adv_mode=archived`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Показываем красивое уведомление об успехе
                        if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                            alertify.notify('Post removed successfully!', 'success');
                        } else {
                            alert('Post removed successfully!');
                        }
                        
                        // Скрываем пост из ленты
                        post.style.display = 'none';
                        
                        // Закрываем dropdown
                        closeDropdownById(postId);
                    } else {
                        // Восстанавливаем оригинальный контент и показываем ошибку
                        post.innerHTML = originalContent;
                        if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                            alertify.notify('Error removing post: ' + data.error, 'error');
                        } else {
                            alert('Error removing post: ' + data.error);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Восстанавливаем оригинальный контент и показываем ошибку
                    post.innerHTML = originalContent;
                    if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                        alertify.notify('Error removing post. Please try again.', 'error');
                    } else {
                        alert('Error removing post. Please try again.');
                    }
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
        // Looking for element with ID:', id);
        const element = document.getElementById(id);
        // Element found:', element);
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
        // openDropdownById called with postId:', postId);
        const dropdown = getOverflowMenuById(postId);
        // getOverflowMenuById returned:', dropdown);
        
        if (dropdown) {
            // Закрываем предыдущий открытый dropdown
            if (activeDropdown && activeDropdown !== dropdown) {
                activeDropdown.classList.remove('show');
            }
            
            dropdown.classList.add('show');
            activeDropdown = dropdown;
            // Dropdown opened for post ${postId}`);
            // Dropdown classes after adding show:', dropdown.className);
            // Dropdown display style:', window.getComputedStyle(dropdown).display);
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
            // Dropdown closed for post ${postId}`);
        }
    }
    
    function closeAllDropdowns() {
        // Получаем все ID постов и закрываем их dropdown
        const postIds = getAllPostIds();
        postIds.forEach(postId => {
            closeDropdownById(postId);
        });
        activeDropdown = null;
        // All dropdowns closed');
    }
    
    // Инициализация при загрузке DOM
    function initOnDOMReady() {
        // === initOnDOMReady called ===
        // Document ready state:', document.readyState);
        // Document ready state === loading:', document.readyState === 'loading');
        
        if (document.readyState === 'loading') {
            // Adding DOMContentLoaded listener...');
            document.addEventListener('DOMContentLoaded', function() {
                // === DOMContentLoaded event fired ===
                AdvertisingFeed.init();
            });
        } else {
            // Document already loaded, calling init directly...');
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
            closeAllDropdowns,
            // Добавляем функцию для тестирования
            testDropdown: function(postId) {
                // === Testing dropdown for post ${postId} ===
                // Menu trigger:', getMenuTriggerById(postId));
                // Dropdown:', getOverflowMenuById(postId));
                // Post:', getPostById(postId));
                
                // Тестируем открытие
                // Opening dropdown...');
                openDropdownById(postId);
                
                // Проверяем состояние через 1 секунду
                setTimeout(() => {
                    const dropdown = getOverflowMenuById(postId);
                    if (dropdown) {
                        // Dropdown state after opening:');
                        // - Classes:', dropdown.className);
                        // - Display style:', window.getComputedStyle(dropdown).display);
                        // - Active dropdown:', activeDropdown);
                    }
                }, 1000);
            },
            // Добавляем функцию для диагностики
            diagnosePage: function() {
                console.log('=== PAGE DIAGNOSIS ===');
                console.log('All social_feed elements:', document.querySelectorAll('.social_feed'));
                console.log('All menu trigger elements:', document.querySelectorAll('.advertising_social_feed_menu_trigger'));
                console.log('All dropdown elements:', document.querySelectorAll('.advertising_social_feed_overflow_menu'));
                
                // Проверяем каждый пост
                const posts = document.querySelectorAll('.social_feed[data-post-id]');
                posts.forEach((post, index) => {
                    const postId = post.dataset.postId;
                    console.log(`\n--- Post ${index + 1} (ID: ${postId}) ---`);
                    console.log('Post element:', post);
                    console.log('Menu trigger:', getMenuTriggerById(postId));
                    console.log('Dropdown:', getOverflowMenuById(postId));
                    console.log('Post data attributes:', post.dataset);
                });
            }
        };
    }
}

// ===== EDIT FORM FUNCTIONALITY =====

// Функция для открытия формы редактирования
function openEditForm(formType, itemId) {
    console.log('Opening edit form for:', formType, 'ID:', itemId);
    
    // Определяем ID формы на основе типа
    let formId;
    let formTitle;
    
    switch(formType) {
        case 'my-list':
            formId = 'my-list-form';
            formTitle = 'Edit Task';
            break;
        case 'tender':
            formId = 'tender-form';
            formTitle = 'Edit Tender';
            break;
        case 'project':
            formId = 'project-form';
            formTitle = 'Edit Project';
            break;
        case 'advertising':
            formId = 'advertising-form';
            formTitle = 'Edit Advertising';
            break;
        case 'job-search':
            formId = 'job-search-form';
            formTitle = 'Edit Job Search';
            break;
        default:
            console.error('Unknown form type:', formType);
            return;
    }
    
    // Находим форму
    const form = document.getElementById(formId);
    if (!form) {
        console.error('Form not found:', formId);
        return;
    }
    
    // Загружаем данные для редактирования
    loadEditData(formType, itemId, form);
    
            // Показываем форму
        form.style.display = 'flex';
        
        // Добавляем класс для анимации
        setTimeout(() => {
            form.classList.add('show');
        }, 10);
    
    // Обновляем заголовок формы
    const titleElement = form.querySelector('h2, .modal-header-actions h2');
    if (titleElement) {
        titleElement.textContent = formTitle;
    }
    
    // Добавляем скрытое поле для ID редактируемого элемента
    let hiddenIdField = form.querySelector('input[name="edit_item_id"]');
    if (!hiddenIdField) {
        hiddenIdField = document.createElement('input');
        hiddenIdField.type = 'hidden';
        hiddenIdField.name = 'edit_item_id';
        form.querySelector('form').appendChild(hiddenIdField);
    }
    hiddenIdField.value = itemId;
    
    // Изменяем действие формы на update
    const formElement = form.querySelector('form');
    if (formElement) {
        formElement.action = formElement.action.replace('submit_form', 'update_form');
    }
}

// Функция для загрузки данных для редактирования
function loadEditData(formType, itemId, form) {
    console.log('Loading edit data for:', formType, 'ID:', itemId);
    
    // Получаем CSRF токен
    const csrftoken = getCookie('csrftoken');
    
    if (!csrftoken) {
        alert('CSRF token not found. Please refresh the page and try again.');
        return;
    }
    
    // Отправляем AJAX запрос для получения данных
    fetch(`/services_and_projects/get_edit_data/${formType}/${itemId}/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Заполняем форму данными
            populateEditForm(formType, form, data.data);
        } else {
            console.error('Error loading edit data:', data.error);
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Error loading data for editing: ' + data.error);
            } else {
                alert('Error loading data for editing: ' + data.error);
            }
        }
    })
    .catch(error => {
        console.error('Error loading edit data:', error);
        if (typeof window.alertify !== 'undefined') {
            window.alertify.error('Network error occurred while loading data');
        } else {
            alert('Network error occurred while loading data');
        }
    });
}

// Функция для заполнения формы данными
function populateEditForm(formType, form, data) {
    console.log('Populating form with data:', data);
    
    // Заполняем основные поля
    const titleField = form.querySelector(`#${formType}-title`);
    if (titleField && data.title) {
        titleField.value = data.title;
    }
    
    const descriptionField = form.querySelector(`#${formType}-description`);
    if (descriptionField && data.description) {
        descriptionField.value = data.description;
    }
    
    // Заполняем категорию
    const categoryField = form.querySelector(`#${formType}-category`);
    if (categoryField && data.category) {
        categoryField.value = data.category;
    }
    
    // Заполняем сервис
    const serviceField = form.querySelector(`#${formType}-service`);
    if (serviceField && data.service) {
        serviceField.value = data.service;
    }
    
    // Заполняем статус
    const statusField = form.querySelector(`#${formType}-status`);
    if (statusField && data.status) {
        statusField.value = data.status;
    }
    
    // Заполняем документы
    const documentsField = form.querySelector(`#${formType}-documents`);
    if (documentsField && data.documents) {
        documentsField.value = data.documents;
    }
    
    // Заполняем хештеги
    if (data.hashtags && data.hashtags.length > 0) {
        const hashtagsContainer = form.querySelector(`#${formType}-hashtags-container`);
        const hashtagsHidden = form.querySelector(`#${formType}-hashtags-hidden`);
        
        if (hashtagsContainer && hashtagsHidden) {
            // Очищаем существующие хештеги
            hashtagsContainer.innerHTML = '';
            
            // Добавляем input для новых хештегов
            const hashtagsInput = document.createElement('input');
            hashtagsInput.type = 'text';
            hashtagsInput.id = `${formType}-hashtags-input`;
            hashtagsInput.placeholder = 'Start typing tag...';
            hashtagsInput.autocomplete = 'off';
            hashtagsInput.className = 'hashtags-input-field';
            hashtagsContainer.appendChild(hashtagsInput);
            
            // Добавляем существующие хештеги как чипы
            data.hashtags.forEach(tag => {
                const tagChip = document.createElement('span');
                tagChip.className = 'hashtag-chip';
                tagChip.textContent = tag.tag;
                tagChip.dataset.tag = tag.tag;
                
                const removeBtn = document.createElement('span');
                removeBtn.className = 'hashtag-remove';
                removeBtn.innerHTML = '&times;';
                removeBtn.onclick = function() {
                    tagChip.remove();
                    updateHashtagsHidden(hashtagsContainer, hashtagsHidden);
                };
                
                tagChip.appendChild(removeBtn);
                hashtagsContainer.appendChild(tagChip);
            });
            
            // Обновляем скрытое поле
            updateHashtagsHidden(hashtagsContainer, hashtagsHidden);
        }
    }
    
    // Заполняем исполнителей
    if (data.performers && data.performers.length > 0) {
        const performersList = form.querySelector(`#${formType}-performers-list`);
        if (performersList) {
            performersList.innerHTML = '';
            data.performers.forEach(performer => {
                const performerItem = document.createElement('div');
                performerItem.className = 'performer-item';
                performerItem.textContent = performer.get_full_name || performer.username;
                performerItem.dataset.performerId = performer.id;
                
                const removeBtn = document.createElement('span');
                removeBtn.className = 'performer-remove';
                removeBtn.innerHTML = '&times;';
                removeBtn.onclick = function() {
                    performerItem.remove();
                };
                
                performerItem.appendChild(removeBtn);
                performersList.appendChild(performerItem);
            });
        }
    }
    
    // Заполняем включенный проект
    const projectIncludedField = form.querySelector(`#${formType}-project-included`);
    if (projectIncludedField && data.project_included) {
        projectIncludedField.value = data.project_included;
    }
    
    // Заполняем фото (для форм с фото)
    if (data.photos && data.photos.length > 0) {
        const photosField = form.querySelector(`#${formType}-photos`);
        if (photosField && photosField.type === 'text') {
            // Для текстового поля (ссылка на фото)
            photosField.value = data.photos[0] || '';
        }
        // Для файловых полей можно добавить предварительный просмотр
    }
}

// Вспомогательная функция для обновления скрытого поля хештегов
function updateHashtagsHidden(container, hiddenField) {
    const tags = Array.from(container.querySelectorAll('.hashtag-chip')).map(chip => chip.dataset.tag);
    hiddenField.value = JSON.stringify(tags);
}

// Вспомогательная функция для получения CSRF токена
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

// Закрывающая скобка для защиты от повторной загрузки
}
