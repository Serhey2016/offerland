/**
 * Time Slot Feed Handler
 * Обработчик для отображения постов TimeSlot в ленте
 * 
 * @author OfferLand
 * @version 2.0 - Объединенная версия
 */

// Защита от повторной загрузки
if (window.TIMESLOT_FEED_CONFIG) {
    // TimeSlot Feed already loaded, skipping...
} else {
    // Loading TimeSlot Feed...

// ============================================================================
// КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ============================================================================

const TIMESLOT_FEED_CONFIG = {
    // Элементы ленты
    FEED_CONTAINER_CLASS: 'social_feed_time_slot',
    FAVORITES_ICON_CHECKED_ID: 'sftsts1_favorites_icon_id',
    FAVORITES_ICON_UNCHECKED_ID: 'sftsts1_favorites_icon_id1',
    BOOK_NOW_BUTTON_CLASS: 'social_feed_time_slot_book_now_button',
    
    // Иконки избранного (простая система)
    FAVORITES_ICON_CLASS: 'sftsts1_favorites_icon',
    
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
// КЛАСС УПРАВЛЕНИЯ ИЗБРАННЫМ (НОВАЯ СИСТЕМА С CSS КЛАССАМИ)
// ============================================================================

// Global instance tracking
let globalTimeSlotSimpleFavoritesManagerInstance = null;

class TimeSlotSimpleFavoritesManager {
    constructor() {
        // Prevent multiple instances
        if (globalTimeSlotSimpleFavoritesManagerInstance) {
            return globalTimeSlotSimpleFavoritesManagerInstance;
        }
        
        this.init();
        
        // Store global instance
        globalTimeSlotSimpleFavoritesManagerInstance = this;
    }

    init() {
        this.initializeHeartIcons();
    }

    initializeHeartIcons() {
        const heartIcons = document.querySelectorAll(`.${TIMESLOT_FEED_CONFIG.FAVORITES_ICON_CLASS}`);
        
        heartIcons.forEach(icon => {
            // Set initial state (unchecked by default)
            icon.dataset.favorite = 'false';
            
            // Add click event
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleHeartIcon(icon);
            });
        });
    }

    toggleHeartIcon(icon) {
        const isFavorite = icon.dataset.favorite === 'true';
        
        if (isFavorite) {
            // Remove from favorites
            icon.classList.remove('favorite-checked');
            icon.classList.add('favorite-unchecked');
            icon.dataset.favorite = 'false';
            console.log('Removed from favorites');
        } else {
            // Add to favorites
            icon.classList.remove('favorite-unchecked');
            icon.classList.add('favorite-checked');
            icon.dataset.favorite = 'true';
            console.log('Added to favorites');
        }
        
        // Here you can add AJAX request to save state in database
    }
}

// ============================================================================
// КЛАСС УПРАВЛЕНИЯ ИЗБРАННЫМ (ПРОДВИНУТАЯ СИСТЕМА)
// ============================================================================

// Global instance tracking
let globalTimeSlotFavoritesManagerInstance = null;

class TimeSlotFavoritesManager {
    constructor() {
        // Prevent multiple instances
        if (globalTimeSlotFavoritesManagerInstance) {
            return globalTimeSlotFavoritesManagerInstance;
        }
        
        this.favorites = new Set();
        this.init();
        
        // Store global instance
        globalTimeSlotFavoritesManagerInstance = this;
    }

    init() {
        this.loadFavorites();
        this.updateExistingPostsUI();
    }

    loadFavorites() {
        try {
            const stored = localStorage.getItem('timeslot_favorites');
            if (stored) {
                const favoritesArray = JSON.parse(stored);
                this.favorites = new Set(favoritesArray);
            }
        } catch (error) {
            this.favorites = new Set();
        }
    }

    saveFavorites() {
        try {
            const favoritesArray = Array.from(this.favorites);
            localStorage.setItem('timeslot_favorites', JSON.stringify(favoritesArray));
        } catch (error) {
            // Handle storage error silently
        }
    }

    bindEvents() {
        // Обработчики для иконок избранного
        document.addEventListener('click', (e) => {
            // Validate event target
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            if (e.target.closest(`#${TIMESLOT_FEED_CONFIG.FAVORITES_ICON_CHECKED_ID}`)) {
                this.handleFavoriteClick(e);
            } else if (e.target.closest(`#${TIMESLOT_FEED_CONFIG.FAVORITES_ICON_UNCHECKED_ID}`)) {
                this.handleFavoriteClick(e);
            }
        });

        // Обработчики для кнопок "Book now"
        document.addEventListener('click', (e) => {
            // Validate event target
            if (!e.target || typeof e.target.classList !== 'object') {
                return;
            }
            
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
            this.removeFavorite(timeSlotId);
        } else {
            this.addFavorite(timeSlotId);
        }
        
        // Добавляем анимацию при клике
        this.animateFavoriteClick(container);
    }

    addFavorite(timeSlotId) {
        this.favorites.add(timeSlotId);
        this.saveFavorites();
    }

    removeFavorite(timeSlotId) {
        this.favorites.delete(timeSlotId);
        this.saveFavorites();
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
        this.updateExistingPostsUI();
    }

    updateExistingPostsUI() {
        const posts = TimeSlotFeedUtils.getElementsByClass(TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS);
        
        posts.forEach(post => {
            const timeSlotId = this.getTimeSlotId(post);
            if (timeSlotId && this.isFavorite(timeSlotId)) {
                this.updateFavoriteUI(post, true);
            }
        });
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

// Global instance tracking
let globalTimeSlotActionsManagerInstance = null;

class TimeSlotActionsManager {
    constructor() {
        // Prevent multiple instances
        if (globalTimeSlotActionsManagerInstance) {
            return globalTimeSlotActionsManagerInstance;
        }
        
        this.init();
        
        // Store global instance
        globalTimeSlotActionsManagerInstance = this;
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Обработчики для кнопок действий
        document.addEventListener('click', (e) => {
            // Validate event target
            if (!e.target || typeof e.target.classList !== 'object') {
                return;
            }
            
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

        return data;
    }

    showBookingModal(timeSlotData) {
        // Показываем модальное окно для бронирования
        
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
            // Fallback для случаев, когда alertify недоступен
            // Можно заменить на собственную модальную реализацию
        }
    }
}

// ============================================================================
// КЛАСС АНИМАЦИЙ И ВИЗУАЛЬНЫХ ЭФФЕКТОВ
// ============================================================================

// Global instance tracking
let globalTimeSlotFeedAnimationsInstance = null;

class TimeSlotFeedAnimations {
    constructor() {
        // Prevent multiple instances
        if (globalTimeSlotFeedAnimationsInstance) {
            return globalTimeSlotFeedAnimationsInstance;
        }
        
        this.instanceId = Date.now() + Math.random();
        this.eventsBound = false;
        
        // Store global instance
        globalTimeSlotFeedAnimationsInstance = this;
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        if (this.eventsBound) {
            return;
        }
        
        // Анимации при наведении на посты
        document.addEventListener('mouseenter', (e) => {
            // Validate event target
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            if (e.target.closest(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`)) {
                this.handlePostHover(e);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            // Validate event target
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            if (e.target.closest(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`)) {
                this.handlePostLeave(e);
            }
        }, true);
        
        this.eventsBound = true;
    }

    handlePostHover(event) {
        // Additional validation in handler methods
        if (!event.target || typeof event.target.closest !== 'function') {
            return;
        }
        
        const container = event.target.closest(`.${TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS}`);
        if (container) {
            TimeSlotFeedUtils.addClass(container, 'hover');
        }
    }

    handlePostLeave(event) {
        // Additional validation in handler methods
        if (!event.target || typeof event.target.closest !== 'function') {
            return;
        }
        
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
        // Prevent multiple instances
        if (globalTimeSlotFeedManager) {
            return globalTimeSlotFeedManager;
        }
        
        this.favoritesManager = null;
        this.simpleFavoritesManager = null;
        this.actionsManager = null;
        this.animations = null;
        
        this.init();
    }

    init() {
        // Инициализируем компоненты (use existing instances if available)
        this.favoritesManager = globalTimeSlotFavoritesManagerInstance || new TimeSlotFavoritesManager();
        // Отключаем старый менеджер сердечек
        // this.simpleFavoritesManager = globalTimeSlotSimpleFavoritesManagerInstance || new TimeSlotSimpleFavoritesManager();
        this.actionsManager = globalTimeSlotActionsManagerInstance || new TimeSlotActionsManager();
        this.animations = globalTimeSlotFeedAnimationsInstance || new TimeSlotFeedAnimations();
        
        // Обновляем UI для существующих постов
        this.updateExistingPosts();
    }

    updateExistingPosts() {
        const posts = TimeSlotFeedUtils.getElementsByClass(TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS);
        
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
    }

    // Метод для добавления новых постов (если они добавляются динамически)
    addPost(postElement) {
        if (postElement && postElement.classList.contains(TIMESLOT_FEED_CONFIG.FEED_CONTAINER_CLASS)) {
            this.initializePost(postElement, Date.now());
        }
    }

    // Метод для обновления всех постов
    refreshPosts() {
        this.updateExistingPosts();
    }
    

}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

// Глобальная переменная для отслеживания инициализации
let timeSlotFeedManagerInitialized = false;
let globalTimeSlotFeedManager = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!timeSlotFeedManagerInitialized && !globalTimeSlotFeedManager) {
        // Создаем основной менеджер
        globalTimeSlotFeedManager = new TimeSlotFeedManager();
        timeSlotFeedManagerInitialized = true;
    }
    
    // Инициализация сердечек
    setTimeout(() => {
        const heartIcons = document.querySelectorAll('.sftsts1_favorites_icon');
        console.log('🖤 Initializing heart icons, found:', heartIcons.length);
        
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
                console.log('💖 Heart clicked! Current state:', isFavorite);
                
                if (isFavorite) {
                    // Убираем из избранного
                    newIcon.classList.remove('favorite-checked');
                    newIcon.classList.add('favorite-unchecked');
                    newIcon.dataset.favorite = 'false';
                    console.log('💔 Removed from favorites');
                } else {
                    // Добавляем в избранное
                    newIcon.classList.remove('favorite-unchecked');
                    newIcon.classList.add('favorite-checked');
                    newIcon.dataset.favorite = 'true';
                    console.log('❤️ Added to favorites');
                }
            });
            
            console.log('💖 Heart icon initialized:', newIcon.id);
        });
    }, 100);
});

// ============================================================================
// ЭКСПОРТ КЛАССОВ
// ============================================================================

// Экспортируем классы для использования в других модулях
window.TimeSlotFeedManager = TimeSlotFeedManager;
window.TimeSlotFavoritesManager = TimeSlotFavoritesManager;
window.TimeSlotSimpleFavoritesManager = TimeSlotSimpleFavoritesManager;
window.TimeSlotActionsManager = TimeSlotActionsManager;
window.TimeSlotFeedAnimations = TimeSlotFeedAnimations;

// Закрывающая скобка для защиты от повторной загрузки
}
