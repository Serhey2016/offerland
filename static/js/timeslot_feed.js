/**
 * Time Slot Feed Handler
 * Обработчик для отображения постов TimeSlot в ленте
 * 
 * @author OfferLand
 * @version 1.0
 */

// ============================================================================
// КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ============================================================================

const TIMESLOT_FEED_CONFIG = {
    // Элементы ленты
    FEED_CONTAINER_CLASS: 'social_feed_time_slot',
    FAVORITES_ICON_CHECKED_ID: 'sftsts1_favorites_icon_id',
    FAVORITES_ICON_UNCHECKED_ID: 'sftsts1_favorites_icon_id1',
    BOOK_NOW_BUTTON_CLASS: 'social_feed_time_slot_book_now_button',
    
    // Настройки
    ANIMATION_DURATION: 300,
    FAVORITE_ANIMATION_DELAY: 150
};

// ============================================================================
// УТИЛИТЫ
// ============================================================================

const TimeSlotFeedUtils = {
    /**
     * Проверяет, существует ли элемент в DOM
     */
    elementExists(selector) {
        return document.querySelector(selector) !== null;
    },

    /**
     * Получает элемент по селектору с проверкой существования
     */
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element with selector '${selector}' not found`);
        }
        return element;
    },

    /**
     * Получает все элементы по классу
     */
    getElementsByClass(className) {
        return document.querySelectorAll(`.${className}`);
    },

    /**
     * Добавляет класс к элементу
     */
    addClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        }
    },

    /**
     * Удаляет класс у элемента
     */
    removeClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    },

    /**
     * Проверяет, содержит ли элемент класс
     */
    hasClass(element, className) {
        return element && element.classList && element.classList.contains(className);
    },

    /**
     * Переключает класс у элемента
     */
    toggleClass(element, className) {
        if (element && element.classList) {
            element.classList.toggle(className);
        }
    }
};

// ============================================================================
// КЛАСС УПРАВЛЕНИЯ ИЗБРАННЫМ
// ============================================================================

class TimeSlotFavoritesManager {
    constructor() {
        this.favorites = new Set();
        this.init();
    }

    init() {
        this.loadFavorites();
        this.bindEvents();
        this.initializeFavoritesUI();
        console.log('TimeSlotFavoritesManager initialized');
    }

    loadFavorites() {
        try {
            const savedFavorites = localStorage.getItem('timeslot_favorites');
            if (savedFavorites) {
                this.favorites = new Set(JSON.parse(savedFavorites));
                console.log('Loaded favorites:', Array.from(this.favorites));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('timeslot_favorites', JSON.stringify(Array.from(this.favorites)));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    bindEvents() {
        // Обработчики для иконок избранного
        document.addEventListener('click', (e) => {
            if (e.target.closest(`#${TIMESLOT_FEED_CONFIG.FAVORITES_ICON_CHECKED_ID}`)) {
                this.handleFavoriteClick(e);
            } else if (e.target.closest(`#${TIMESLOT_FEED_CONFIG.FAVORITES_ICON_UNCHECKED_ID}`)) {
                this.handleFavoriteClick(e);
            }
        });

        // Обработчики для кнопок "Book now"
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains(TIMESLOT_FEED_CONFIG.BOOK_NOW_BUTTON_CLASS)) {
                this.handleBookNowClick(e);
            }
        });
    }

    handleFavoriteClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const timeSlotContainer = event.target.closest(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`);
        if (!timeSlotContainer) return;

        const timeSlotId = this.getTimeSlotId(timeSlotContainer);
        if (!timeSlotId) return;

        this.toggleFavorite(timeSlotId, timeSlotContainer);
    }

    getTimeSlotId(container) {
        // Пытаемся получить ID из data-атрибута или других источников
        return container.dataset.timeslotId || 
               container.querySelector('[data-timeslot-id]')?.dataset.timeslotId ||
               this.generateTimeSlotId(container);
    }

    generateTimeSlotId(container) {
        // Генерируем уникальный ID на основе содержимого
        const content = container.textContent || '';
        const hash = this.hashCode(content);
        return `timeslot_${hash}`;
    }

    hashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    toggleFavorite(timeSlotId, container) {
        if (this.favorites.has(timeSlotId)) {
            this.removeFavorite(timeSlotId, container);
        } else {
            this.addFavorite(timeSlotId, container);
        }
        
        // Добавляем анимацию при клике
        this.animateFavoriteClick(container);
    }

    addFavorite(timeSlotId, container) {
        this.favorites.add(timeSlotId);
        this.saveFavorites();
        this.updateFavoriteUI(container, true);
        console.log('Added to favorites:', timeSlotId);
    }

    removeFavorite(timeSlotId, container) {
        this.favorites.delete(timeSlotId);
        this.saveFavorites();
        this.updateFavoriteUI(container, false);
        console.log('Removed from favorites:', timeSlotId);
    }

    updateFavoriteUI(container, isFavorite) {
        const checkedIcon = container.querySelector(`#${TIMESLOT_FEED_CONFIG.FAVORITES_ICON_CHECKED_ID}`);
        const uncheckedIcon = container.querySelector(`#${TIMESLOT_FEED_CONFIG.FAVORITES_ICON_UNCHECKED_ID}`);

        if (checkedIcon && uncheckedIcon) {
            if (isFavorite) {
                // Показываем красное сердечко
                checkedIcon.style.display = 'inline-block';
                uncheckedIcon.style.display = 'none';
                TimeSlotFeedUtils.addClass(checkedIcon, 'active');
                TimeSlotFeedUtils.removeClass(uncheckedIcon, 'active');
            } else {
                // Показываем пустое сердечко
                checkedIcon.style.display = 'none';
                uncheckedIcon.style.display = 'inline-block';
                TimeSlotFeedUtils.removeClass(checkedIcon, 'active');
                TimeSlotFeedUtils.addClass(uncheckedIcon, 'active');
            }
        }
    }

    isFavorite(timeSlotId) {
        return this.favorites.has(timeSlotId);
    }

    getFavorites() {
        return Array.from(this.favorites);
    }

    clearFavorites() {
        this.favorites.clear();
        this.saveFavorites();
        console.log('All favorites cleared');
    }

    initializeFavoritesUI() {
        // Инициализируем UI для всех постов TimeSlot
        const timeSlotPosts = document.querySelectorAll(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`);
        
        timeSlotPosts.forEach(post => {
            const timeSlotId = this.getTimeSlotId(post);
            if (timeSlotId) {
                this.updateFavoriteUI(post, this.isFavorite(timeSlotId));
            }
        });
        
        console.log('Favorites UI initialized for', timeSlotPosts.length, 'posts');
    }

    animateFavoriteClick(container) {
        // Добавляем класс для анимации
        const activeIcon = container.querySelector('.active');
        if (activeIcon) {
            TimeSlotFeedUtils.addClass(activeIcon, 'favorite-clicked');
            
            // Убираем класс анимации через некоторое время
            setTimeout(() => {
                TimeSlotFeedUtils.removeClass(activeIcon, 'favorite-clicked');
            }, 300);
        }
    }
}

// ============================================================================
// КЛАСС УПРАВЛЕНИЯ КНОПКАМИ ДЕЙСТВИЙ
// ============================================================================

class TimeSlotActionsManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        console.log('TimeSlotActionsManager initialized');
    }

    bindEvents() {
        // Обработчики для кнопок действий
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains(TIMESLOT_FEED_CONFIG.BOOK_NOW_BUTTON_CLASS)) {
                this.handleBookNowClick(e);
            }
        });
    }

    handleBookNowClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const timeSlotContainer = event.target.closest(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`);
        if (!timeSlotContainer) return;

        const timeSlotData = this.extractTimeSlotData(timeSlotContainer);
        this.showBookingModal(timeSlotData);
    }

    extractTimeSlotData(container) {
        // Извлекаем данные о TimeSlot из DOM
        const data = {
            companyName: container.querySelector('.sftsts1_company_name span:last-child')?.textContent?.trim() || 'Unknown Company',
            userName: container.querySelector('.sftsts1_use_name')?.textContent?.trim() || 'Unknown User',
            costPerHour: container.querySelector('.sftsts1_hour_price span')?.textContent?.trim() || '0',
            minSlot: container.querySelector('.sftsts1_hour_price:last-child span')?.textContent?.trim() || '0',
            dateStart: container.querySelector('.sftsts2_aviability_start_date')?.textContent?.trim() || '',
            dateEnd: container.querySelector('.sftsts2_aviability_end_date')?.textContent?.trim() || '',
            timeStart: container.querySelector('.sftsts2_time_slot_time_start_time')?.textContent?.trim() || '',
            timeEnd: container.querySelector('.sftsts2_time_slot_time_end_time')?.textContent?.trim() || '',
            reservedRoadTime: container.querySelector('.sftsts2_reserved_road_time_time')?.textContent?.trim() || '',
            startLocation: container.querySelector('.sftsts2_reserved_start_location_location')?.textContent?.trim() || ''
        };

        console.log('Extracted TimeSlot data:', data);
        return data;
    }

    showBookingModal(timeSlotData) {
        // Показываем модальное окно для бронирования
        console.log('Showing booking modal for:', timeSlotData);
        
        // Здесь можно добавить логику показа модального окна
        // Например, вызвать функцию showAlertifyNotification или создать модал
        
        if (window.alertify) {
            window.alertify.alert('Booking TimeSlot', 
                `Would you like to book this time slot?\n\n` +
                `Company: ${timeSlotData.companyName}\n` +
                `User: ${timeSlotData.userName}\n` +
                `Cost per hour: £${timeSlotData.costPerHour}\n` +
                `Available: ${timeSlotData.dateStart} - ${timeSlotData.dateEnd}\n` +
                `Time: ${timeSlotData.timeStart} - ${timeSlotData.timeEnd}\n` +
                `Location: ${timeSlotData.startLocation}`
            );
        } else {
            alert('Booking functionality not available');
        }
    }
}

// ============================================================================
// КЛАСС АНИМАЦИЙ И ВИЗУАЛЬНЫХ ЭФФЕКТОВ
// ============================================================================

class TimeSlotFeedAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        console.log('TimeSlotFeedAnimations initialized');
    }

    bindEvents() {
        // Анимации при наведении на посты
        document.addEventListener('mouseenter', (e) => {
            if (e.target.closest(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`)) {
                this.handlePostHover(e);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.closest(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`)) {
                this.handlePostLeave(e);
            }
        }, true);
    }

    handlePostHover(event) {
        const container = event.target.closest(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`);
        if (container) {
            TimeSlotFeedUtils.addClass(container, 'hover');
        }
    }

    handlePostLeave(event) {
        const container = event.target.closest(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`);
        if (container) {
            TimeSlotFeedUtils.removeClass(container, 'hover');
        }
    }

    animateFavoriteIcon(icon, isFavorite) {
        if (!icon) return;

        // Добавляем класс для анимации
        TimeSlotFeedUtils.addClass(icon, 'animating');
        
        setTimeout(() => {
            TimeSlotFeedUtils.removeClass(icon, 'animating');
        }, TIMESLOT_FEED_CONFIG.FAVORITE_ANIMATION_DELAY);
    }

    animateBookNowButton(button) {
        if (!button) return;

        // Добавляем эффект нажатия
        TimeSlotFeedUtils.addClass(button, 'clicked');
        
        setTimeout(() => {
            TimeSlotFeedUtils.removeClass(button, 'clicked');
        }, TIMESLOT_FEED_CONFIG.ANIMATION_DURATION);
    }
}

// ============================================================================
// ГЛАВНЫЙ КЛАСС УПРАВЛЕНИЯ ЛЕНТОЙ TIMESLOT
// ============================================================================

class TimeSlotFeedManager {
    constructor() {
        this.favoritesManager = null;
        this.actionsManager = null;
        this.animations = null;
        
        this.init();
    }

    init() {
        console.log('TimeSlotFeedManager: Initializing...');
        
        // Инициализируем компоненты
        this.favoritesManager = new TimeSlotFavoritesManager();
        this.actionsManager = new TimeSlotActionsManager();
        this.animations = new TimeSlotFeedAnimations();
        
        // Обновляем UI для существующих постов
        this.updateExistingPosts();
        
        console.log('TimeSlotFeedManager: Initialization completed');
    }

    updateExistingPosts() {
        const posts = TimeSlotFeedUtils.getElementsByClass(TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS);
        console.log(`Found ${posts.length} TimeSlot posts`);
        
        posts.forEach((post, index) => {
            this.initializePost(post, index);
        });
    }

    initializePost(post, index) {
        // Добавляем data-атрибут для идентификации
        if (!post.dataset.timeslotId) {
            post.dataset.timeslotId = `timeslot_${index}_${Date.now()}`;
        }

        // Инициализируем состояние избранного
        const timeSlotId = post.dataset.timeslotId;
        if (this.favoritesManager.isFavorite(timeSlotId)) {
            this.favoritesManager.updateFavoriteUI(post, true);
        }

        console.log(`Initialized post ${index}:`, timeSlotId);
    }

    // Метод для добавления новых постов (если они добавляются динамически)
    addPost(postElement) {
        if (postElement && postElement.classList.contains(TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS)) {
            this.initializePost(postElement, Date.now());
            console.log('New post added and initialized');
        }
    }

    // Метод для обновления всех постов
    refreshPosts() {
        this.updateExistingPosts();
        console.log('Posts refreshed');
    }
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

// Глобальная переменная для отслеживания инициализации
let timeSlotFeedManagerInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log('TimeSlotFeedManager: DOM loaded, initializing...');
    
    if (!timeSlotFeedManagerInitialized) {
        new TimeSlotFeedManager();
        timeSlotFeedManagerInitialized = true;
    }
});

// ============================================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ТЕСТИРОВАНИЯ
// ============================================================================

// Функция для проверки состояния ленты
window.checkTimeSlotFeedStatus = function() {
    console.log('=== TimeSlot Feed Status Check ===');
    
    const posts = TimeSlotFeedUtils.getElementsByClass(TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS);
    console.log(`Found ${posts.length} TimeSlot posts`);
    
    posts.forEach((post, index) => {
        const timeSlotId = post.dataset.timeslotId || 'NO_ID';
        console.log(`Post ${index + 1}: ID=${timeSlotId}`);
        
        // Проверяем элементы внутри поста
        const companyName = post.querySelector('.sftsts1_company_name span:last-child')?.textContent?.trim();
        const userName = post.querySelector('.sftsts1_use_name')?.textContent?.trim();
        const bookButton = post.querySelector(`.${TIMESLOT_FEED_CONFIG.BOOK_NOW_BUTTON_CLASS}`);
        
        console.log(`  - Company: ${companyName || 'NOT_FOUND'}`);
        console.log(`  - User: ${userName || 'NOT_FOUND'}`);
        console.log(`  - Book button: ${bookButton ? 'FOUND' : 'NOT_FOUND'}`);
    });
    
    console.log('=== End Status Check ===');
};

// Функция для тестирования избранного
window.testTimeSlotFavorites = function() {
    console.log('=== Testing TimeSlot Favorites ===');
    
    if (window.timeSlotFeedManager && window.timeSlotFeedManager.favoritesManager) {
        const favorites = window.timeSlotFeedManager.favoritesManager.getFavorites();
        console.log('Current favorites:', favorites);
        
        // Показываем все посты и их состояние
        const posts = document.querySelectorAll('.social_feed_time_slot');
        posts.forEach((post, index) => {
            const timeSlotId = post.dataset.timeslotId || `post_${index}`;
            const isFavorite = window.timeSlotFeedManager.favoritesManager.isFavorite(timeSlotId);
            console.log(`Post ${index + 1} (${timeSlotId}): ${isFavorite ? '❤️ FAVORITE' : '🤍 NOT FAVORITE'}`);
        });
    } else {
        console.log('Favorites manager not found');
    }
};

// Функция для очистки всех избранных
window.clearTimeSlotFavorites = function() {
    if (window.timeSlotFeedManager && window.timeSlotFeedManager.favoritesManager) {
        window.timeSlotFeedManager.favoritesManager.clearFavorites();
        console.log('All favorites cleared');
    } else {
        console.log('Favorites manager not found');
    }
};

// Функция для принудительной инициализации
window.forceInitTimeSlotFeed = function() {
    console.log('Force initializing TimeSlotFeedManager...');
    
    timeSlotFeedManagerInitialized = false;
    
    if (window.timeSlotFeedManager) {
        delete window.timeSlotFeedManager;
    }
    
    new TimeSlotFeedManager();
    console.log('TimeSlotFeedManager force initialized');
};

// Экспортируем классы для использования в других модулях
window.TimeSlotFeedManager = TimeSlotFeedManager;
window.TimeSlotFavoritesManager = TimeSlotFavoritesManager;
window.TimeSlotActionsManager = TimeSlotActionsManager;
window.TimeSlotFeedAnimations = TimeSlotFeedAnimations;
