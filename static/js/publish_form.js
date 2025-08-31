// Publish Form JavaScript - Popup Form Handler

class PublishFormManager {
    constructor() {
        this.currentPopup = null;
        this.isSubmitting = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Обработчик для открытия формы при клике на "Publish" в dropdown menu
        document.addEventListener('click', (e) => {
            const publishButton = e.target.closest('[data-action="publish"]');
            if (publishButton) {
                e.preventDefault();
                e.stopPropagation();
                
                // Определяем тип (advertising или task)
                const isTask = publishButton.closest('.social_feed2') !== null;
                const itemType = isTask ? 'task' : 'advertising';
                const itemId = publishButton.dataset.id;
                
                console.log(`Publish button clicked, ${itemType} ID:`, itemId);
                
                // Добавляем защиту от множественных кликов
                if (publishButton.dataset.processing === 'true') {
                    console.log('Button is already processing, ignoring click');
                    return;
                }
                
                publishButton.dataset.processing = 'true';
                
                this.openPublishForm(itemId, itemType);
                
                // Снимаем блокировку через небольшую задержку
                setTimeout(() => {
                    publishButton.dataset.processing = 'false';
                }, 1000);
            }
        });

        // Обработчик для закрытия формы при клике на overlay
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('publish_form_overlay') && this.currentPopup) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Overlay clicked, closing popup');
                this.closeCurrentPopup();
            }
        });

        // Обработчик для закрытия формы при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentPopup) {
                e.preventDefault();
                console.log('Escape pressed, closing popup');
                this.closeCurrentPopup();
            }
        });
    }

    setupFormValidation() {
        // Валидация формы при отправке
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('publish_form')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });

        // Валидация в реальном времени
        document.addEventListener('input', (e) => {
            if (e.target.closest('.publish_form')) {
                this.validateField(e.target);
            }
        });

        // Валидация при потере фокуса
        document.addEventListener('blur', (e) => {
            if (e.target.closest('.publish_form')) {
                this.validateField(e.target);
            }
        }, true);
    }

    openPublishForm(itemId, itemType = 'advertising') {
        console.log(`Opening publish form for ${itemType} ID:`, itemId);
        console.log(`Looking for popup with ID: publish_form_popup_${itemId}`);
        
        // Проверяем, не открыта ли уже форма для этого ID
        if (this.currentPopup && this.currentPopup.id === `publish_form_popup_${itemId}`) {
            console.log(`Form is already open for this ${itemType} ID`);
            return;
        }
        
        // Закрываем предыдущий popup если есть
        if (this.currentPopup) {
            this.closeCurrentPopup();
        }

        // Ищем popup по ID
        let popup = document.getElementById(`publish_form_popup_${itemId}`);
        console.log('Found popup:', popup);
        if (!popup) {
            console.error(`Publish form popup not found for ${itemType} ID: ${itemId}`);
            // Давайте посмотрим, какие popup есть на странице
            const allPopups = document.querySelectorAll('.publish_form_popup');
            console.log('All available popups:', Array.from(allPopups).map(p => p.id));
            return;
        }

        console.log('Found popup:', popup);
        this.currentPopup = popup;
        
        // Убираем все обработчики событий, которые могут закрывать форму
        this.removeConflictingEventListeners(popup);
        
        // Показываем popup
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Устанавливаем стили напрямую
        popup.style.display = 'block';
        popup.style.opacity = '1';
        popup.style.visibility = 'visible';

        // Фокусируемся на первом поле
        const firstInput = popup.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }

        // Настраиваем обработчики для этого popup
        this.setupPopupEventListeners(itemId);

        // Добавляем защиту от автоматического закрытия
        this.addAutoCloseProtection(popup);

        console.log('Popup opened successfully');
    }

    closeCurrentPopup() {
        if (!this.currentPopup) return;

        console.log('Closing current popup, stack trace:', new Error().stack);
        const popup = this.currentPopup;
        
        // Анимация исчезновения
        popup.style.opacity = '0';
        popup.style.visibility = 'hidden';

        setTimeout(() => {
            popup.classList.remove('show');
            popup.style.display = 'none';
            document.body.style.overflow = '';
            this.currentPopup = null;
            console.log('Popup closed successfully');
        }, 300);
    }

    removeConflictingEventListeners(popup) {
        console.log('Removing conflicting event listeners for popup:', popup.id);
        
        // Убираем все обработчики событий, которые могут закрывать форму
        const closeButtons = popup.querySelectorAll('.publish_form_close, .publish_form_cancel');
        console.log('Found close buttons:', closeButtons.length);
        closeButtons.forEach((btn, index) => {
            console.log(`Processing close button ${index}:`, btn.id || btn.className);
            // Убираем все существующие обработчики
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Добавляем новый обработчик
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                this.closeCurrentPopup();
            });
        });

        // Убираем обработчики на overlay
        const overlay = popup.querySelector('.publish_form_overlay');
        if (overlay) {
            console.log('Found overlay, replacing event listeners');
            const newOverlay = overlay.cloneNode(true);
            overlay.parentNode.replaceChild(newOverlay, overlay);
            
            newOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Overlay clicked');
                this.closeCurrentPopup();
            });
        } else {
            console.log('No overlay found');
        }
    }

    setupPopupEventListeners(itemId) {
        // Используем текущий открытый popup
        if (!this.currentPopup) return;
        const popup = this.currentPopup;

        console.log('Setting up popup event listeners for:', itemId);
        console.log('Current popup ID:', popup.id);
        console.log('Current popup element:', popup);

        // Кнопки уже настроены в removeConflictingEventListeners
        // Здесь только добавляем специфичные обработчики если нужно

        // Обработчик для тегов (автодополнение) - ищем по любому ID
        const tagsInput = popup.querySelector('.publish_form input[name="tags"]');
        if (tagsInput) {
            this.setupTagsAutocomplete(tagsInput);
        }

        console.log('Popup event listeners set up successfully');
    }

    addAutoCloseProtection(popup) {
        // Защита от автоматического закрытия
        const protectionInterval = setInterval(() => {
            if (popup.classList.contains('show')) {
                // Принудительно показываем форму
                popup.style.display = 'block';
                popup.style.opacity = '1';
                popup.style.visibility = 'visible';
                popup.classList.add('show');
            } else {
                // Если форма была скрыта, останавливаем защиту
                clearInterval(protectionInterval);
            }
        }, 100);

        // Останавливаем защиту через 10 секунд
        setTimeout(() => {
            clearInterval(protectionInterval);
        }, 10000);
    }

    setupTagsAutocomplete(tagsInput) {
        // Простое автодополнение для тегов
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const currentValue = tagsInput.value.trim();
                if (currentValue && !currentValue.endsWith(',')) {
                    tagsInput.value = currentValue + ', ';
                }
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        const fieldType = field.type;
        const fieldName = field.name;

        // Убираем предыдущие ошибки
        this.removeFieldError(field);

        // Проверяем обязательные поля
        if (isRequired && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        // Специфичные проверки
        if (value) {
            switch (fieldName) {
                case 'title':
                    if (value.length < 3) {
                        this.showFieldError(field, 'Title must be at least 3 characters long');
                        return false;
                    }
                    break;
                case 'description':
                    if (value.length < 10) {
                        this.showFieldError(field, 'Description must be at least 10 characters long');
                        return false;
                    }
                    break;
                case 'budget':
                    if (parseFloat(value) < 0) {
                        this.showFieldError(field, 'Budget cannot be negative');
                        return false;
                    }
                    break;
                case 'deadline':
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                        this.showFieldError(field, 'Deadline cannot be in the past');
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    showFieldError(field, message) {
        // Создаем элемент ошибки
        const errorElement = document.createElement('div');
        errorElement.className = 'field_error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 12px;
            margin-top: 4px;
            animation: fadeIn 0.2s ease;
        `;

        // Добавляем стиль для поля с ошибкой
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';

        // Вставляем сообщение об ошибке после поля
        field.parentNode.appendChild(errorElement);
    }

    removeFieldError(field) {
        // Убираем стили ошибки
        field.style.borderColor = '';
        field.style.boxShadow = '';

        // Убираем сообщение об ошибке
        const errorElement = field.parentNode.querySelector('.field_error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async handleFormSubmit(form) {
        if (this.isSubmitting) return;

        // Валидируем форму
        if (!this.validateForm(form)) {
            return;
        }

        this.isSubmitting = true;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Показываем состояние загрузки
        form.classList.add('loading');
        submitBtn.innerHTML = 'Publishing...';

        try {
            // Собираем данные формы
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Отправляем данные на сервер
            const response = await this.submitFormData(data);

            if (response.success) {
                this.showSuccessMessage('Advertising published successfully!');
                this.closeCurrentPopup();
                
                // Обновляем страницу или обновляем данные
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                this.showErrorMessage(response.message || 'Failed to publish advertising');
            }
        } catch (error) {
            console.error('Error publishing advertising:', error);
            this.showErrorMessage('An error occurred while publishing. Please try again.');
        } finally {
            this.isSubmitting = false;
            form.classList.remove('loading');
            submitBtn.innerHTML = originalText;
        }
    }

    async submitFormData(data) {
        // Здесь будет AJAX запрос к серверу
        // Пока что симулируем успешный ответ
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Advertising published successfully'
                });
            }, 2000);
        });

        // Реальный код будет выглядеть так:
        /*
        const response = await fetch('/api/publish-advertising/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(data)
        });

        return await response.json();
        */
    }

    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    }

    showSuccessMessage(message) {
        // Показываем сообщение об успехе
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        // Показываем сообщение об ошибке
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification_${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        // Стили в зависимости от типа
        if (type === 'success') {
            notification.style.background = '#10b981';
        } else if (type === 'error') {
            notification.style.background = '#ef4444';
        } else {
            notification.style.background = '#3b82f6';
        }

        document.body.appendChild(notification);

        // Автоматически убираем через 5 секунд
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing PublishFormManager');
    
    // Проверяем, что PublishFormManager еще не инициализирован
    if (window.publishFormManager) {
        console.log('PublishFormManager already initialized, skipping...');
        return;
    }
    
    // Проверяем, что формы существуют в DOM
    const popups = document.querySelectorAll('.publish_form_popup');
    console.log('Found publish form popups:', popups.length);
    popups.forEach((popup, index) => {
        console.log(`Popup ${index}:`, popup.id, popup);
    });
    
    window.publishFormManager = new PublishFormManager();
    console.log('PublishFormManager initialized');
});

// CSS анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);
