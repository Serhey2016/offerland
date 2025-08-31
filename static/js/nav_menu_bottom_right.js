const categories = [
    {
        name: 'My list',
        subcategories: ['All', 'Favorites', 'Orders', 'Subscriptions', 'Published', 'Archive' ]
    },
    {
        name: 'Business Support',
        subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
    },
    {
        name: 'Personal Support',
        subcategories: ['All', 'Projects', 'Tasks', 'Time slots']
    } 
];

let currentCategoryIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Навигационные стрелки
    const upArrow = document.querySelector('.nav-arrow-up');
    const downArrow = document.querySelector('.nav-arrow-down');
    const leftArrow = document.querySelector('.nav-arrow-left');
    const rightArrow = document.querySelector('.nav-arrow-right');

    // DOM-элементы для названия категории и подкатегории
    const categoryNameElement = document.querySelector('.nav_menu_category_name');
    const subCategoryNameElement = document.querySelector('.nav_menu_sub_category_name_1');
    const subCategoryDotsContainer = document.querySelector('.nav_menu_sub_category_name_2');

    // Точки для категорий (вертикальные)
    const dots = Array.from(document.querySelector('.nav_menu_cat_change').children);
    let activeIndex = dots.findIndex(dot => dot.classList.contains('active'));
    if (activeIndex === -1) activeIndex = 0;

    // Точки для подкатегорий (горизонтальные)
    let subCategoryDots = Array.from(subCategoryDotsContainer.children);
    let activeSubCategoryIndex = subCategoryDots.findIndex(dot => dot.classList.contains('active'));
    if (activeSubCategoryIndex === -1) activeSubCategoryIndex = 0;
    let currentSubCategoryIndex = 0;

    // Функция для обновления точек категорий
    function updateCategoryDots() {
        const requiredDots = categories.length;
        dots.forEach((dot, index) => {
            if (index < requiredDots) {
                dot.style.display = 'block';
            } else {
                dot.style.display = 'none';
            }
            dot.classList.remove('active');
        });
        if (requiredDots > 0) {
            dots[0].classList.add('active');
            activeIndex = 0;
        }
    }

    function setActiveDot(newIndex) {
        dots[activeIndex].classList.remove('active');
        dots[newIndex].classList.add('active');
        activeIndex = newIndex;
    }

    function setActiveSubCategoryDot(newIndex) {
        subCategoryDots[activeSubCategoryIndex].classList.remove('active');
        subCategoryDots[newIndex].classList.add('active');
        activeSubCategoryIndex = newIndex;
        currentSubCategoryIndex = newIndex;
    }

    function updateSubCategoryDots(categoryIndex) {
        const requiredDots = categories[categoryIndex].subcategories.length;
        subCategoryDots.forEach((dot, index) => {
            if (index < requiredDots) {
                dot.style.display = 'block';
            } else {
                dot.style.display = 'none';
            }
            dot.classList.remove('active');
        });
        if (requiredDots > 0) {
            subCategoryDots[0].classList.add('active');
            activeSubCategoryIndex = 0;
            currentSubCategoryIndex = 0;
        }
    }

    function updateCategoryName(index) {
        categoryNameElement.textContent = categories[index].name;
        currentSubCategoryIndex = 0;
        activeSubCategoryIndex = 0;
        updateSubCategoryName(index, currentSubCategoryIndex);
        updateSubCategoryDots(index);
    }

    function updateSubCategoryName(categoryIndex, subIndex) {
        subCategoryNameElement.textContent = categories[categoryIndex].subcategories[subIndex];
    }

    // Функция для обновления страницы с фильтрами
    function updatePageWithFilters(categoryIndex, subCategoryIndex) {
        const category = categories[categoryIndex];
        const subCategory = category.subcategories[subCategoryIndex];
        
        // Определяем параметры фильтра на основе категории и подкатегории
        let statusFilter = 'all';
        let categoryFilter = 'all';
        
        if (category.name === 'My list') {
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
        const newIndex = activeIndex === 0 ? categories.length - 1 : activeIndex - 1;
        setActiveDot(newIndex);
        currentCategoryIndex = newIndex;
        updateCategoryName(currentCategoryIndex);
    });

    downArrow.addEventListener('click', () => {
        const newIndex = activeIndex === categories.length - 1 ? 0 : activeIndex + 1;
        setActiveDot(newIndex);
        currentCategoryIndex = newIndex;
        updateCategoryName(currentCategoryIndex);
    });

    leftArrow.addEventListener('click', () => {
        const subcategories = categories[currentCategoryIndex].subcategories;
        currentSubCategoryIndex = currentSubCategoryIndex === 0 ?
            subcategories.length - 1 : currentSubCategoryIndex - 1;
        setActiveSubCategoryDot(currentSubCategoryIndex);
        updateSubCategoryName(currentCategoryIndex, currentSubCategoryIndex);
        
        // Применяем фильтры при изменении подкатегории
        updatePageWithFilters(currentCategoryIndex, currentSubCategoryIndex);
    });

    rightArrow.addEventListener('click', () => {
        const subcategories = categories[currentCategoryIndex].subcategories;
        currentSubCategoryIndex = currentSubCategoryIndex === subcategories.length - 1 ?
            0 : currentSubCategoryIndex + 1;
        setActiveSubCategoryDot(currentSubCategoryIndex);
        updateSubCategoryName(currentCategoryIndex, currentSubCategoryIndex);
        
        // Применяем фильтры при изменении подкатегории
        updatePageWithFilters(currentCategoryIndex, currentSubCategoryIndex);
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

            if (Math.abs(dx) > Math.abs(dy)) {
                // Горизонтальный свайп
                if (dx > 30) {
                    // Свайп вправо
                    rightArrow.click();
                } else if (dx < -30) {
                    // Свайп влево
                    leftArrow.click();
                }
            } else {
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
        
        // Находим категорию "My list"
        const myListIndex = categories.findIndex(cat => cat.name === 'My list');
        if (myListIndex === -1) return;
        
        // Определяем индекс подкатегории на основе статуса
        let subCategoryIndex = 0; // По умолчанию "All"
        
        if (currentStatus === 'published') {
            subCategoryIndex = categories[myListIndex].subcategories.findIndex(sub => sub === 'Published');
        } else if (currentStatus === 'archived') {
            subCategoryIndex = categories[myListIndex].subcategories.findIndex(sub => sub === 'Archive');
        }
        
        // Если статус найден, устанавливаем позицию
        if (subCategoryIndex !== -1) {
            // Устанавливаем активную категорию
            currentCategoryIndex = myListIndex;
            activeIndex = myListIndex;
            
            // Устанавливаем активную подкатегорию
            currentSubCategoryIndex = subCategoryIndex;
            activeSubCategoryIndex = subCategoryIndex;
            
            // Обновляем UI
            setActiveDot(activeIndex);
            updateCategoryName(currentCategoryIndex);
            setActiveSubCategoryDot(activeSubCategoryIndex);
            updateSubCategoryName(currentCategoryIndex, activeSubCategoryIndex);
        }
    }
    
    // Инициализация
    updateCategoryDots();
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
});
