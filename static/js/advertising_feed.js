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

// Основные переменные
let isInitialized = false;
let currentPostId = null;
let activeDropdown = null;

// Определяем глобальные функции сразу
window.handleDropdownAction = function(action, postId) {
    switch (action) {
        case 'edit':
            if (typeof window.handleEditAction === 'function') {
                window.handleEditAction(postId);
            } else {
                if (typeof window.openAdvertisingEditForm === 'function') {
                    window.openAdvertisingEditForm('advertising', postId);
                }
            }
            break;
        case 'publish':
            if (typeof window.handlePublishAction === 'function') {
                window.handlePublishAction(postId);
            }
            break;
        case 'archive':
            if (typeof window.handleArchiveAction === 'function') {
                window.handleArchiveAction(postId);
            }
            break;
        case 'share':
            if (typeof window.handleShareAction === 'function') {
                window.handleShareAction(postId);
            }
            break;
        default:
            break;
    }
};

window.handleEditAction = function(postId) {
    if (typeof window.openAdvertisingEditForm === 'function') {
        try {
            window.openAdvertisingEditForm('advertising', postId);
        } catch (error) {
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Edit functionality not available');
            } else {
                alert('Edit functionality not available');
            }
        }
    } else {
        if (typeof window.alertify !== 'undefined') {
            window.alertify.error('Edit functionality not available');
        } else {
            alert('Edit functionality not available');
        }
    }
};

// Настройка Alertify для уведомлений сверху справа
if (typeof alertify !== 'undefined' && alertify && alertify.notifier && typeof alertify.notifier.set === 'function') {
    try {
        alertify.notifier.set('position', 'top-right');
        alertify.notifier.set('delay', 3);
    } catch (error) {
        // Alertify configuration failed
    }
}

// Инициализация сердечек для избранного
function initHeartIcons() {
    const heartIcons = document.querySelectorAll('.sftsts1_favorites_icon');
            // Initializing heart icons for advertising
    
    heartIcons.forEach(icon => {
        // Устанавливаем начальное состояние
        if (!icon.dataset.favorite) {
            icon.dataset.favorite = 'false';
        }
        
        // Убираем все старые обработчики
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
        
        // Добавляем обработчик клика
        newIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isFavorite = newIcon.dataset.favorite === 'true';
            // Heart clicked in advertising
            
            if (isFavorite) {
                // Убираем из избранного
                newIcon.classList.remove('favorite-checked');
                newIcon.classList.add('favorite-unchecked');
                newIcon.dataset.favorite = 'false';
                // Removed from favorites
            } else {
                // Добавляем в избранное
                newIcon.classList.remove('favorite-unchecked');
                newIcon.classList.add('favorite-checked');
                newIcon.dataset.favorite = 'true';
                // Added to favorites
            }
        });
        
                    // Heart icon initialized for advertising
    });
}

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
        initHeartIcons();
        
        isInitialized = true;
    },
    
    // Инициализация обработчиков событий
    initEventListeners: function() {
        // Обработчик для кнопки чата
        document.addEventListener('click', function(e) {
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            if (e.target.closest('.action_btn') && e.target.textContent === 'Chat') {
                const post = e.target.closest('.social_feed');
                if (!post) {
                    // Parent .social_feed element not found for chat button
                    return;
                }
                const postId = post.dataset.postId;
                if (postId) {
                    handleChatClick(postId);
                }
            }
        });
        
        // Обработчик для кнопки комментариев
        document.addEventListener('click', function(e) {
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            if (e.target.closest('.action_btn') && e.target.textContent === 'Comments') {
                const post = e.target.closest('.social_feed');
                if (!post) {
                    // Parent .social_feed element not found for comments button
                    return;
                }
                const postId = post.dataset.postId;
                if (postId) {
                    handleCommentsClick(postId);
                }
            }
        });
        
        // Обработчик для кнопки "Заказать сейчас"
        document.addEventListener('click', function(e) {
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            if (e.target.closest('.order_now')) {
                const post = e.target.closest('.social_feed');
                if (!post) {
                    // Parent .social_feed element not found for order now button
                    return;
                }
                const postId = post.dataset.postId;
                if (postId) {
                    handleOrderNowClick(postId);
                }
            }
        });
    },
    
    // Инициализация dropdown menu
    initDropdownMenu: function() {
        // Обработчик для открытия/закрытия dropdown menu
        document.addEventListener('click', function(e) {
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            const menuButton = e.target.closest('.advertising_social_feed_menu_trigger');
            
            if (menuButton) {
                e.preventDefault();
                e.stopPropagation();
                
                const post = menuButton.closest('.social_feed');
                if (!post) {
                    // Parent .social_feed element not found for menu button
                    return;
                }
                
                const postId = post.dataset.postId;
                if (!postId) {
                    // Post ID not found in dataset for element
                    return;
                }
                
                const dropdown = getOverflowMenuById(postId);
                
                if (dropdown) {
                    // Закрываем предыдущий открытый dropdown
                    if (activeDropdown && activeDropdown !== dropdown) {
                        activeDropdown.classList.remove('show');
                    }
                    
                    // Переключаем текущий dropdown
                    if (dropdown.classList.contains('show')) {
                        closeDropdownById(postId);
                    } else {
                        openDropdownById(postId);
                    }
                } else {
                    // Dropdown not found for post ID
                }
            }
        });
        
        // Обработчик для кликов по элементам dropdown menu
        document.addEventListener('click', function(e) {
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            const menuItem = e.target.closest('.advertising_social_feed_overflow_menu_item');
            if (menuItem) {
                e.preventDefault();
                e.stopPropagation();
                
                const action = menuItem.dataset.action;
                const postId = menuItem.dataset.id;
                
                if (action && postId) {
                    // Закрываем dropdown
                    closeAllDropdowns();
                    
                    // Вызываем соответствующую функцию
                    if (typeof window.handleDropdownAction === 'function') {
                        window.handleDropdownAction(action, postId);
                    } else {
                        // Fallback: прямая обработка
                        if (action === 'edit' && typeof window.openAdvertisingEditForm === 'function') {
                            window.openAdvertisingEditForm('advertising', postId);
                        }
                    }
                }
            }
        });
        
        // Закрытие dropdown при клике вне его
        document.addEventListener('click', function(e) {
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            if (!e.target.closest('.advertising_social_feed_menu_trigger') && !e.target.closest('.advertising_social_feed_overflow_menu')) {
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
    if (typeof openChat === 'function') {
        openChat(postId);
    }
}

function handleCommentsClick(postId) {
    if (typeof openComments === 'function') {
        openComments(postId);
    }
}

function handleOrderNowClick(postId) {
    if (typeof openOrderForm === 'function') {
        openOrderForm(postId);
    }
}

// Обработчик публикации
function handlePublishAction(postId) {
    // Открываем форму публикации напрямую
    if (window.publishFormManager) {
        window.publishFormManager.openPublishForm(postId);
    } else {
        // Fallback если publishFormManager не загружен
        if (typeof window.alertify !== 'undefined') {
            window.alertify.error('Publish form not loaded. Please refresh the page.');
        } else {
            alert('Publish form not loaded. Please refresh the page.');
        }
    }
}

// Обработчик архивирования
function handleArchiveAction(postId) {
    if (confirm('Are you sure you want to archive this post?')) {
        archivePost(postId);
    }
}

// Обработчик поделиться
function handleShareAction(postId) {
    if (typeof sharePost === 'function') {
        sharePost(postId);
    } else {
        const currentUrl = window.location.href;
        const shareUrl = `${currentUrl}#post-${postId}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Link copied to clipboard!');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Link copied to clipboard!');
            });
        } else {
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
    const csrfToken = getCookie('csrftoken');
    
    const post = getPostById(postId);
    if (post) {
        const originalContent = post.innerHTML;
        post.innerHTML = `
            <div class="loading" style="min-height: 200px;">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #dee2e6; border-top: 4px solid #FBD551;"></div>
                <span style="font-size: 16px;">Archiving post...</span>
            </div>
        `;
        
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
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Post archived successfully!', 'success');
                } else {
                    alert('Post archived successfully!');
                }
                
                post.style.display = 'none';
                closeDropdownById(postId);
            } else {
                post.innerHTML = originalContent;
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Error archiving post: ' + data.error, 'error');
                } else {
                    alert('Error archiving post: ' + data.error);
                }
            }
        })
        .catch(error => {
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
    const csrfToken = getCookie('csrftoken');
    
    const post = getPostById(postId);
    if (post) {
        const originalContent = post.innerHTML;
        post.innerHTML = `
            <div class="loading" style="min-height: 200px;">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #dee2e6; border-top: 4px solid #FBD551;"></div>
                <span style="font-size: 16px;">Unarchiving post...</span>
            </div>
        `;
        
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
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Post unarchived successfully!', 'success');
                } else {
                    alert('Post unarchived successfully!');
                }
                
                post.style.display = 'none';
                closeDropdownById(postId);
            } else {
                post.innerHTML = originalContent;
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Error unarchiving post: ' + data.error, 'error');
                } else {
                    alert('Error unarchiving post: ' + data.error);
                }
            }
        })
        .catch(error => {
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
    const csrfToken = getCookie('csrftoken');
    
    const post = getPostById(postId);
    if (post) {
        const originalContent = post.innerHTML;
        post.innerHTML = `
            <div class="loading" style="min-height: 200px;">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #dee2e6; border-top: 4px solid #FBD551;"></div>
                <span style="font-size: 16px;">Publishing post...</span>
            </div>
        `;
        
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
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Post published successfully!', 'success');
                } else {
                    alert('Post published successfully!');
                }
                
                post.style.display = 'none';
                closeDropdownById(postId);
            } else {
                post.innerHTML = originalContent;
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Error publishing post: ' + data.error, 'error');
                } else {
                    alert('Error publishing post: ' + data.error);
                }
            }
        })
        .catch(error => {
            post.innerHTML = originalContent;
            alert('Error publishing post. Please try again.');
        });
    }
}

// Функция редактирования поста
function handleEditClick(postId) {
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
        alertify.confirm(confirmMessage, 
            function() {
                executeRemovePost(postId);
            },
            function() {
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Post removal cancelled.', 'info');
                }
            }
        ).set('title', 'Confirm Removal');
    } else {
        if (confirm(confirmMessage)) {
            executeRemovePost(postId);
        }
    }
}

// Вспомогательная функция для выполнения удаления поста
function executeRemovePost(postId) {
    const csrfToken = getCookie('csrftoken');
    
    const post = getPostById(postId);
    if (post) {
        const originalContent = post.innerHTML;
        post.innerHTML = `
            <div class="loading" style="min-height: 200px;">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 4px solid #dee2e6; border-top: 4px solid #FBD551;"></div>
                <span style="font-size: 16px;">Removing post...</span>
            </div>
        `;
        
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
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Post removed successfully!', 'success');
                } else {
                    alert('Post removed successfully!');
                }
                
                post.style.display = 'none';
                closeDropdownById(postId);
            } else {
                post.innerHTML = originalContent;
                if (typeof alertify !== 'undefined' && alertify && alertify.notify) {
                    alertify.notify('Error removing post: ' + data.error, 'error');
                } else {
                    alert('Error removing post: ' + data.error);
                }
            }
        })
        .catch(error => {
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
    const element = document.getElementById(id);
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
    const dropdown = getOverflowMenuById(postId);
    
    if (dropdown) {
        if (activeDropdown && activeDropdown !== dropdown) {
            activeDropdown.classList.remove('show');
        }
        
        dropdown.classList.add('show');
        activeDropdown = dropdown;
    }
}

function closeDropdownById(postId) {
    const dropdown = getOverflowMenuById(postId);
    if (dropdown) {
        dropdown.classList.remove('show');
        if (activeDropdown === dropdown) {
            activeDropdown = null;
        }
    }
}

function closeAllDropdowns() {
    const postIds = getAllPostIds();
    postIds.forEach(postId => {
        closeDropdownById(postId);
    });
    activeDropdown = null;
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

// ===== EDIT FORM FUNCTIONALITY =====

// Функция для открытия формы редактирования
window.openAdvertisingEditForm = function(formType, itemId) {
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
            formId = 'advertising-edit-form';
            formTitle = 'Edit Advertising';
            break;
        case 'job-search':
            formId = 'job-search-form';
            formTitle = 'Edit Job Search';
            break;
        default:
            return;
    }
    
    const form = document.getElementById(formId);
    if (!form) {
        return;
    }
    
    if (typeof window.loadAdvertisingEditData === 'function') {
        window.loadAdvertisingEditData(formType, itemId, form);
    } else {
        return;
    }
    
    form.style.display = 'flex';
    
    setTimeout(() => {
        form.classList.add('show');
    }, 10);

    const titleElement = form.querySelector('h2, .modal-header-actions h2');
    if (titleElement) {
        titleElement.textContent = formTitle;
    }
    
    let hiddenIdField = form.querySelector('input[name="edit_item_id"]');
    if (!hiddenIdField) {
        hiddenIdField = document.createElement('input');
        hiddenIdField.type = 'hidden';
        hiddenIdField.name = 'edit_item_id';
        form.querySelector('form').appendChild(hiddenIdField);
    }
    hiddenIdField.value = itemId;
    
    const formElement = form.querySelector('form');
    if (formElement) {
        formElement.action = formElement.action.replace('submit_form', 'update_form');
    }
}

// Функция для загрузки данных для редактирования
window.loadAdvertisingEditData = function(formType, itemId, form) {
    const csrftoken = getCookie('csrftoken');
    
    if (!csrftoken) {
        alert('CSRF token not found. Please refresh the page and try again.');
        return;
    }
    
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
            populateAdvertisingEditForm(formType, form, data.data);
        } else {
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Error loading data for editing: ' + data.error);
            } else {
                alert('Error loading data for editing: ' + data.error);
            }
        }
    })
    .catch(error => {
        if (typeof window.alertify !== 'undefined') {
            window.alertify.error('Network error occurred while loading data');
        } else {
            alert('Network error occurred while loading data');
        }
    });
}

// Функция для заполнения формы данными
window.populateAdvertisingEditForm = function(formType, form, data) {
    const titleField = form.querySelector(`#${formType}-edit-title`);
    if (titleField && data.title) {
        titleField.value = data.title;
    }
    
    const descriptionField = form.querySelector(`#${formType}-edit-description`);
    if (descriptionField && data.description) {
        descriptionField.value = data.description;
    }
    
    const categoryField = form.querySelector(`#${formType}-edit-category`);
    if (categoryField && data.category) {
        categoryField.value = data.category;
    }
    
    const serviceField = form.querySelector(`#${formType}-edit-service`);
    if (serviceField && data.service) {
        serviceField.value = data.service;
    }
    
    const statusField = form.querySelector(`#${formType}-status`);
    if (statusField && data.status) {
        statusField.value = data.status;
    }
    
    const documentsField = form.querySelector(`#${formType}-documents`);
    if (documentsField && data.documents) {
        documentsField.value = data.documents;
    }
    
    if (data.hashtags && data.hashtags.length > 0) {
        const hashtagsContainer = form.querySelector(`#${formType}-edit-hashtags-container`);
        const hashtagsHidden = form.querySelector(`#${formType}-edit-hashtags-hidden`);
        
        if (hashtagsContainer && hashtagsHidden) {
            hashtagsContainer.innerHTML = '';
            
            const hashtagsInput = document.createElement('input');
            hashtagsInput.type = 'text';
            hashtagsInput.id = `${formType}-edit-hashtags-input`;
            hashtagsInput.placeholder = 'Start typing tag...';
            hashtagsInput.autocomplete = 'off';
            hashtagsInput.className = 'hashtags-input-field';
            hashtagsContainer.appendChild(hashtagsInput);
            
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
            
            updateHashtagsHidden(hashtagsContainer, hashtagsHidden);
        }
    }
    
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
    
    const projectIncludedField = form.querySelector(`#${formType}-project-included`);
    if (projectIncludedField && data.project_included) {
        projectIncludedField.value = data.project_included;
    }
    
    if (data.photos && data.photos.length > 0) {
        const photosField = form.querySelector(`#${formType}-edit-photos`);
        const existingPhotosContainer = form.querySelector(`#${formType}-edit-existing-photos`);
        
        if (existingPhotosContainer) {
            existingPhotosContainer.innerHTML = '';
            data.photos.forEach((photoData, index) => {
                if (!photoData || !photoData.url) return;
                
                const photoDiv = document.createElement('div');
                photoDiv.className = 'existing-photo';
                photoDiv.style.cssText = 'display: inline-block; margin: 5px; position: relative;';
                photoDiv.dataset.photoId = photoData.id;
                photoDiv.dataset.photoUrl = photoData.url;
                
                const img = document.createElement('img');
                img.src = photoData.url;
                img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;';
                img.alt = `Photo ${index + 1}`;
                img.onerror = function() {
                    this.style.display = 'none';
                };
                
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.innerHTML = '×';
                removeBtn.className = 'photo-remove-btn';
                removeBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);';
                removeBtn.title = 'Remove photo';
                removeBtn.onclick = function() {
                    removePhotoFromServer(photoData.id, photoDiv);
                };
                
                photoDiv.appendChild(img);
                photoDiv.appendChild(removeBtn);
                existingPhotosContainer.appendChild(photoDiv);
            });
        }
        
        if (photosField && photosField.type === 'text') {
            photosField.value = data.photos[0] || '';
        }
    } else {
        const existingPhotosContainer = form.querySelector(`#${formType}-edit-existing-photos`);
        if (existingPhotosContainer) {
            existingPhotosContainer.innerHTML = '';
        }
    }
}

// Вспомогательная функция для обновления скрытого поля хештегов
window.updateHashtagsHidden = function(container, hiddenField) {
    const tags = Array.from(container.querySelectorAll('.hashtag-chip')).map(chip => chip.dataset.tag);
    hiddenField.value = JSON.stringify(tags);
}

// Вспомогательная функция для получения CSRF токена
window.getCookie = function(name) {
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

// Функция для удаления фотографии с сервера
window.removePhotoFromServer = function(photoId, photoElement) {
    const form = document.getElementById('advertising-edit-form');
    const editItemIdField = form.querySelector('input[name="edit_item_id"]');
    const advertisingId = editItemIdField ? editItemIdField.value : null;
    
    if (!advertisingId) {
        return;
    }
    
    const csrftoken = getCookie('csrftoken');
    if (!csrftoken) {
        return;
    }
    
    fetch(`/services_and_projects/remove_advertising_photo/${advertisingId}/${photoId}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
        }
        
        return response.json();
    })
    .then(data => {
        if (data.success) {
            photoElement.remove();
            
            if (typeof window.alertify !== 'undefined') {
                window.alertify.success('Photo removed successfully');
            } else {
                alert('Photo removed successfully');
            }
        } else {
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Error removing photo: ' + data.error);
            } else {
                alert('Error removing photo: ' + data.error);
            }
        }
    })
    .catch(error => {
        let errorMessage = 'Network error occurred while removing photo';
        if (error.message.includes('HTTP error')) {
            errorMessage = `Server error: ${error.message}`;
        } else if (error.message.includes('not JSON')) {
            errorMessage = 'Server returned invalid response format';
        }
        
        if (typeof window.alertify !== 'undefined') {
            window.alertify.error(errorMessage);
        } else {
            alert(errorMessage);
        }
    });
};

// Функция для закрытия формы редактирования
window.closeEditForm = function() {
    const form = document.getElementById('advertising-edit-form');
    if (form) {
        form.style.display = 'none';
        form.classList.remove('show');
    }
};

// Обработчик для кнопки Update в форме редактирования
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('advertising-edit-form');
    if (editForm) {
        editForm.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditForm();
            }
        });
    }
    
    const updateBtn = document.querySelector('#advertising-edit-form .save-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            const modalOverlay = document.getElementById('advertising-edit-form');
            const form = modalOverlay.querySelector('form');
            
            if (!form) {
                return;
            }
            
            const formData = new FormData(form);
            
            const photoInput = form.querySelector('input[name="photos"]');
            if (photoInput && photoInput.files) {
                for (let i = 0; i < photoInput.files.length; i++) {
                    const file = photoInput.files[i];
                }
            }
            
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Response is not JSON');
                }
                
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    if (typeof window.alertify !== 'undefined') {
                        window.alertify.success('Advertising updated successfully!');
                    } else {
                        alert('Advertising updated successfully!');
                    }
                    
                    form.style.display = 'none';
                    form.classList.remove('show');
                    
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    if (typeof window.alertify !== 'undefined') {
                        window.alertify.error('Error updating advertising: ' + data.error);
                    } else {
                        alert('Error updating advertising: ' + data.error);
                    }
                }
            })
            .catch(error => {
                let errorMessage = 'Network error occurred while updating';
                if (error.message.includes('HTTP error')) {
                    errorMessage = `Server error: ${error.message}`;
                } else if (error.message.includes('not JSON')) {
                    errorMessage = 'Server returned invalid response format';
                }
                
                if (typeof window.alertify !== 'undefined') {
                    window.alertify.error(errorMessage);
                } else {
                    alert(errorMessage);
                }
            });
        });
    }
});

// Закрывающая скобка для защиты от повторной загрузки
}
