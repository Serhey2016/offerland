const categories = [
    {
        name: 'Touchpoint',
        subcategories: ['All', 'Contacts' ]
    },
    {
        name: 'Inbox',
        subcategories: ['All', 'Favorites', 'Projects', 'Tasks', 'Time slots']
    },
    {
        name: 'Backlog',
        subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
    },
    {
        name: 'Agenda',
        subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
    },
    {
        name: 'Waiting',
        subcategories: ['All', 'Published', 'Projects', 'Tasks', 'Time slots']
    },
    {
        name: 'Someday',
        subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
    },
    {
        name: 'Projects',
        subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
    },
    {
        name: 'Done',
        subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
    },
    {
        name: 'Archive',
        subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
    }
];

let currentCategoryIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Навигационные стрелки
    const upArrow = document.querySelector('.nav-arrow-up');
    const downArrow = document.querySelector('.nav-arrow-down');

    // DOM-элементы для названия категории и подкатегории
    const categoryNameElement = document.querySelector('.nav_menu_category_name');
    const navMenuContainer = document.querySelector('.nav_menu_container');
    let currentCategoryIndex = 0;





    function updateCategoryName(index) {
        categoryNameElement.textContent = categories[index].name;
        
        // Dispatch event to sync with task tracker
        const event = new CustomEvent('navMenuCategoryChange', {
            detail: { category: categories[index].name }
        });
        window.dispatchEvent(event);
    }

    function updateLineColors(direction) {
        // Убираем все активные классы
        navMenuContainer.classList.remove('nav-up-active', 'nav-down-active');
        
        // Добавляем соответствующий класс
        if (direction === 'up') {
            navMenuContainer.classList.add('nav-up-active');
        } else if (direction === 'down') {
            navMenuContainer.classList.add('nav-down-active');
        }
    }


    // Функция для обновления страницы с фильтрами
    function updatePageWithFilters(categoryIndex, subCategoryIndex) {
        const category = categories[categoryIndex];
        const subCategory = category.subcategories[subCategoryIndex];
        
        // Определяем параметры фильтра на основе категории и подкатегории
        let statusFilter = 'all';
        let categoryFilter = 'all';
        
        if (category.name === 'Touchpoint') {
            if (subCategory === 'All') {
                statusFilter = 'all';
            } else if (subCategory === 'Published') {
                statusFilter = 'published';
            } else if (subCategory === 'Archive') {
                statusFilter = 'archived';
            }
            // Для других подкатегорий пока оставляем 'all'
        }
        
        // Строим URL с параметрами фильтра
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('status', statusFilter);
        currentUrl.searchParams.set('category', categoryFilter);
        
        // Обновляем URL без перезагрузки страницы
        window.history.pushState({}, '', currentUrl.toString());
        
        // Загружаем контент через AJAX
        loadContentWithFilters(statusFilter, categoryFilter);
    }
    
    // Функция для загрузки контента через AJAX
    function loadContentWithFilters(statusFilter, categoryFilter) {
        const socialFeedsSection = document.querySelector('.social_feeds');
        if (!socialFeedsSection) return;
        
        // Запоминаем время начала загрузки
        const startTime = Date.now();
        const minLoadingTime = 1000; // Минимальное время показа спиннера (1 секунда)
        
        // Добавляем класс loading для установки минимальной высоты
        socialFeedsSection.classList.add('loading');
        
        // Показываем индикатор загрузки
        socialFeedsSection.innerHTML = `
            <div class="loading" style="min-height: 800px; padding: 200px 120px;">
                <div class="loading-spinner"></div>
                <span style="font-size: 48px; font-weight: 600;">Loading content...</span>
            </div>
        `;
        
        // Строим URL для AJAX запроса
        const filterUrl = new URL(window.location);
        filterUrl.searchParams.set('status', statusFilter);
        filterUrl.searchParams.set('category', categoryFilter);
        
        // Загружаем контент
        fetch(filterUrl.toString())
            .then(response => response.text())
            .then(html => {
                // Парсим HTML и извлекаем только секцию с постами
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newSocialFeeds = doc.querySelector('.social_feeds');
                
                // Функция для обновления контента с учетом минимального времени загрузки
                const updateContent = () => {
                    if (newSocialFeeds) {
                        // Проверяем, есть ли посты в новом контенте
                        const posts = newSocialFeeds.querySelectorAll('.social_feed, .social_feed2');
                        
                        if (posts.length > 0) {
                            // Есть посты - обновляем контент
                            socialFeedsSection.innerHTML = newSocialFeeds.innerHTML;
                            socialFeedsSection.classList.remove('loading', 'empty');
                            
                            // Переинициализируем JavaScript для новых постов
                            if (typeof AdvertisingFeed !== 'undefined' && AdvertisingFeed.init) {
                                AdvertisingFeed.init();
                            }
                        } else {
                            // Нет постов - показываем заполнение
                            showEmptyState(socialFeedsSection, statusFilter);
                        }
                    } else {
                        // Ошибка парсинга - показываем заполнение
                        showEmptyState(socialFeedsSection, statusFilter);
                    }
                };
                
                // Вычисляем, сколько времени нужно подождать
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
                
                if (remainingTime > 0) {
                    // Ждем оставшееся время
                    setTimeout(updateContent, remainingTime);
                } else {
                    // Обновляем контент сразу
                    updateContent();
                }
            })
            .catch(error => {
                // Error loading content
                
                // Показываем ошибку с минимальным временем
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
                
                setTimeout(() => {
                    socialFeedsSection.innerHTML = `
                        <div class="error">
                            <div class="error-icon">⚠️</div>
                            <div class="error-title">Error loading content</div>
                            <div class="error-description">Please try again or refresh the page.</div>
                        </div>
                    `;
                    socialFeedsSection.classList.remove('loading');
                    socialFeedsSection.classList.add('empty');
                }, remainingTime);
            });
    }
    
    // Функция для показа заполнения при отсутствии постов
    function showEmptyState(container, statusFilter) {
        let icon, title, description;
        
        // Определяем текст в зависимости от статуса
        switch (statusFilter) {
            case 'published':
                icon = '📰';
                title = 'No Published Posts';
                description = 'There are no published posts in this category yet.';
                break;
            case 'archived':
                icon = '📦';
                title = 'No Archived Posts';
                description = 'There are no archived posts in this category yet.';
                break;
            case 'draft':
                icon = '📝';
                title = 'No Draft Posts';
                description = 'There are no draft posts in this category yet.';
                break;
            default:
                icon = '📭';
                title = 'No Posts Found';
                description = 'There are no posts in this category yet.';
        }
        
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <div class="empty-state-title">${title}</div>
                <div class="empty-state-description">${description}</div>
            </div>
        `;
        
        container.classList.remove('loading');
        container.classList.add('empty');
    }

    upArrow.addEventListener('click', () => {
        currentCategoryIndex = currentCategoryIndex === 0 ? categories.length - 1 : currentCategoryIndex - 1;
        updateCategoryName(currentCategoryIndex);
        updateLineColors('up');
    });

    downArrow.addEventListener('click', () => {
        currentCategoryIndex = currentCategoryIndex === categories.length - 1 ? 0 : currentCategoryIndex + 1;
        updateCategoryName(currentCategoryIndex);
        updateLineColors('down');
    });



    // Добавляем поддержку свайпов для мобильных устройств
    const menuContainer = document.querySelector('.nav_menu');
    let touchStartX = 0;
    let touchStartY = 0;

    menuContainer.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    });

    menuContainer.addEventListener('touchend', function (e) {
        if (e.changedTouches.length === 1) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) <= Math.abs(dy)) {
                // Вертикальный свайп
                if (dy > 30) {
                    // Свайп вниз
                    downArrow.click();
                } else if (dy < -30) {
                    // Свайп вверх
                    upArrow.click();
                }
            }
        }
    });

    // Функция для определения текущего статуса из URL
    function getCurrentStatusFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('status') || 'all';
    }
    
    // Функция для установки правильной позиции навигации на основе URL
    function setNavigationPositionFromURL() {
        const currentStatus = getCurrentStatusFromURL();
        
        // Находим категорию "Touchpoint"
        const touchpointIndex = categories.findIndex(cat => cat.name === 'Touchpoint');
        if (touchpointIndex === -1) return;
        
        // Определяем индекс подкатегории на основе статуса
        let subCategoryIndex = 0; // По умолчанию "All"
        
        if (currentStatus === 'published') {
            subCategoryIndex = categories[touchpointIndex].subcategories.findIndex(sub => sub === 'Published');
        } else if (currentStatus === 'archived') {
            subCategoryIndex = categories[touchpointIndex].subcategories.findIndex(sub => sub === 'Archive');
        }
        
        // Если статус найден, устанавливаем позицию
        if (subCategoryIndex !== -1) {
            // Устанавливаем активную категорию
            currentCategoryIndex = touchpointIndex;
            
            // Обновляем UI
            updateCategoryName(currentCategoryIndex);
        }
    }
    
    // Инициализация
    updateCategoryName(currentCategoryIndex);
    
    // Устанавливаем позицию навигации на основе URL
    setNavigationPositionFromURL();
    
    // Обработчик для кнопок браузера "Назад/Вперед"
    window.addEventListener('popstate', function(event) {
        // Обновляем позицию навигации при изменении истории
        setNavigationPositionFromURL();
        
        // Загружаем контент для нового URL
        const currentStatus = getCurrentStatusFromURL();
        loadContentWithFilters(currentStatus, 'all');
    });

    // Listen for changes from task tracker
    window.addEventListener('taskTrackerCategoryChange', function(event) {
        const { category } = event.detail;
        const categoryIndex = categories.findIndex(cat => cat.name === category);
        
        if (categoryIndex !== -1) {
            currentCategoryIndex = categoryIndex;
            updateCategoryName(currentCategoryIndex);
        }
    });
});
