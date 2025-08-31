/**
 * Time Slot Form Handler
 * Обработчик формы time-slot-form с хэштегами
 * 
 * @author OfferLand
 * @version 1.2
 */

// ============================================================================
// КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ============================================================================

const TIMESLOT_CONFIG = {
    // Основная форма time-slot-form
    FORM_ID: 'time-slot-form',
    CATEGORY_SELECT_ID: 'time-slot-category',
    SERVICE_SELECT_ID: 'time-slot-service',
    
    // Элементы хэштегов (общие для всех форм)
    HASHTAGS_CONTAINER_ID: 'time-slot-hashtags-container',
    HASHTAGS_INPUT_ID: 'time-slot-hashtags-input',
    HASHTAGS_DROPDOWN_ID: 'time-slot-hashtags-dropdown',
    HASHTAGS_HIDDEN_ID: 'time-slot-hashtags-hidden',
    
    // Настройки
    DROPDOWN_HIDE_DELAY: 150,
    REQUEST_TIMEOUT: 2000
};

// ============================================================================
// УТИЛИТЫ
// ============================================================================

const Utils = {
    /**
     * Проверяет, существует ли элемент в DOM
     */
    elementExists(selector) {
        return document.getElementById(selector) !== null;
    },

    /**
     * Получает элемент по ID с проверкой существования
     */
    getElement(selector) {
        const element = document.getElementById(selector);
        return element;
    },

    /**
     * Проверяет, является ли значение пустым
     */
    isEmpty(value) {
        return value === null || value === undefined || value === '';
    },

    /**
     * Генерирует уникальный ID для запроса
     */
    generateRequestId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

// ============================================================================
// КЛАСС УПРАВЛЕНИЯ ХЭШТЕГАМИ
// ============================================================================

class HashtagManager {
    constructor(containerId, inputId, dropdownId, hiddenId) {
        this.container = Utils.getElement(containerId);
        this.input = Utils.getElement(inputId);
        this.dropdown = Utils.getElement(dropdownId);
        this.hidden = Utils.getElement(hiddenId);
        this.allTags = [];
        
        this.init();
    }

    init() {
        if (!this.container || !this.input || !this.dropdown || !this.hidden) {
            return;
        }

        this.loadTags();
        this.bindEvents();
    }

    loadTags() {
        try {
            const tagsData = this.container.getAttribute('data-all-tags');
            this.allTags = JSON.parse(tagsData || '[]');
        } catch (error) {
            this.allTags = [];
        }
    }

    bindEvents() {
        // Показ/скрытие dropdown
        this.input.addEventListener('focus', () => this.showDropdown());
        this.input.addEventListener('input', () => this.handleInput());
        this.input.addEventListener('click', () => this.showDropdown());
        this.input.addEventListener('blur', () => this.hideDropdown());

        // Обработка клавиш
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Клик по dropdown
        this.dropdown.addEventListener('click', (e) => this.handleDropdownClick(e));
    }

    showDropdown() {
        if (this.allTags.length > 0) {
            this.dropdown.style.display = 'block';
            this.dropdown.classList.add('show');
            this.container.classList.add('has-dropdown-open');
        }
    }

    hideDropdown() {
        setTimeout(() => {
            this.dropdown.style.display = 'none';
            this.dropdown.classList.remove('show');
            this.container.classList.remove('has-dropdown-open');
        }, TIMESLOT_CONFIG.DROPDOWN_HIDE_DELAY);
    }

    handleInput() {
        const value = this.input.value.trim();
        if (value) {
            this.filterTags(value);
        } else {
            this.clearDropdown();
        }
    }

    handleKeydown(event) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                this.addCurrentInputAsTag();
                break;
            case 'Backspace':
                if (this.input.value === '') {
                    this.removeLastTag();
                }
                break;
        }
    }

    handleDropdownClick(event) {
        if (event.target.classList.contains('hashtag-dropdown-item')) {
            const tagText = event.target.textContent.trim();
            this.addTag(tagText);
            this.input.value = '';
            this.hideDropdown();
        }
    }

    filterTags(searchValue) {
        const filteredTags = this.allTags.filter(tag => 
            tag.tag.toLowerCase().includes(searchValue.toLowerCase())
        );

        this.renderDropdown(filteredTags, searchValue);
    }

    renderDropdown(tags, searchValue) {
        this.dropdown.innerHTML = '';

        if (tags.length > 0) {
            tags.forEach(tag => {
                const item = this.createDropdownItem(tag.tag);
                this.dropdown.appendChild(item);
            });
        } else {
            const newTagItem = this.createDropdownItem(`Create "${searchValue}"`, 'new-tag');
            this.dropdown.appendChild(newTagItem);
        }
    }

    createDropdownItem(text, className = '') {
        const item = document.createElement('div');
        item.className = `hashtag-dropdown-item ${className}`.trim();
        item.textContent = text;
        return item;
    }

    clearDropdown() {
        this.dropdown.innerHTML = '';
        this.dropdown.style.display = 'none';
        this.dropdown.classList.remove('show');
        this.container.classList.remove('has-dropdown-open');
    }

    addCurrentInputAsTag() {
        const value = this.input.value.trim();
        if (value) {
            this.addTag(value);
            this.input.value = '';
            this.hideDropdown();
        }
    }

    addTag(tagText) {
        if (!tagText.trim() || this.isTagExists(tagText)) {
            return;
        }

        const chip = this.createTagChip(tagText);
        this.container.insertBefore(chip, this.input);
        this.updateHiddenField();
    }

    createTagChip(tagText) {
        const chip = document.createElement('span');
        chip.className = 'hashtag-chip';
        chip.textContent = tagText.trim();

        const removeBtn = this.createRemoveButton(chip);
        chip.appendChild(removeBtn);

        return chip;
    }

    createRemoveButton(chip) {
        const removeBtn = document.createElement('span');
        removeBtn.className = 'hashtag-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => this.removeTag(chip));
        return removeBtn;
    }

    removeTag(chip) {
        chip.remove();
        this.updateHiddenField();
    }

    removeLastTag() {
        const chips = this.container.querySelectorAll('.hashtag-chip');
        if (chips.length > 0) {
            const lastChip = chips[chips.length - 1];
            this.removeTag(lastChip);
        }
    }

    isTagExists(tagText) {
        const existingChips = this.container.querySelectorAll('.hashtag-chip');
        return Array.from(existingChips).some(chip => 
            chip.textContent.trim().replace('×', '') === tagText.trim()
        );
    }

    updateHiddenField() {
        const chips = this.container.querySelectorAll('.hashtag-chip');
        const hashtagData = Array.from(chips).map(chip => ({
            name: chip.textContent.trim().replace('×', ''),
            type: 'new'
        }));

        this.hidden.value = JSON.stringify(hashtagData);
    }

    clear() {
        const chips = this.container.querySelectorAll('.hashtag-chip');
        chips.forEach(chip => chip.remove());
        this.hidden.value = '';
    }

    getTags() {
        return this.hidden.value ? JSON.parse(this.hidden.value) : [];
    }
}

// ============================================================================
// КЛАСС УПРАВЛЕНИЯ ФИЛЬТРАЦИЕЙ КАТЕГОРИЙ И СЕРВИСОВ
// ============================================================================

class CategoryServiceFilter {
    constructor(categorySelectId, serviceSelectId) {
        this.categorySelect = Utils.getElement(categorySelectId);
        this.serviceSelect = Utils.getElement(serviceSelectId);
        
        if (this.categorySelect && this.serviceSelect) {
            this.init();
        }
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.categorySelect.removeEventListener('change', this.categorySelect._changeHandler);
        
        this.categorySelect._changeHandler = (e) => {
            const selectedCategoryId = e.target.value;
            this.filterServices(selectedCategoryId);
        };
        
        this.categorySelect.addEventListener('change', this.categorySelect._changeHandler);
    }

    filterServices(categoryId) {
        const currentValue = this.serviceSelect.value;
        const serviceOptions = this.serviceSelect.querySelectorAll('option');

        if (categoryId === '') {
            this.showAllServices(serviceOptions);
        } else {
            this.filterServicesByCategory(serviceOptions, categoryId, currentValue);
        }
    }

    showAllServices(serviceOptions) {
        serviceOptions.forEach(option => {
            option.style.display = '';
        });
        this.serviceSelect.value = '';
    }

    filterServicesByCategory(serviceOptions, categoryId, currentValue) {
        serviceOptions.forEach(option => {
            if (option.value === '') {
                option.style.display = '';
            } else {
                const optionCategoryId = option.dataset.category;
                option.style.display = optionCategoryId === categoryId ? '' : 'none';
            }
        });

        this.resetServiceIfInvalid(currentValue, categoryId);
    }

    resetServiceIfInvalid(currentValue, categoryId) {
        if (currentValue && currentValue !== '') {
            const currentOption = this.serviceSelect.querySelector(`option[value="${currentValue}"]`);
            if (currentOption && currentOption.style.display === 'none') {
                this.serviceSelect.value = '';
            }
        }
    }
}

// ============================================================================
// КЛАСС ВАЛИДАЦИИ ФОРМЫ
// ============================================================================

class FormValidator {
    constructor(formId) {
        this.form = Utils.getElement(formId);
        this.requiredFields = [
            'time-slot-category',
            'time-slot-service',
            'time-slot-date-start',
            'time-slot-date-end',
            'time-slot-time-start',
            'time-slot-time-end',
            'time-slot-reserved-time',
            'time-slot-start-location',
            'time-slot-cost-hour',
            'time-slot-min-slot'
        ];
    }

    validate() {
        const missingFields = this.checkRequiredFields();
        if (missingFields.length > 0) {
            return {
                isValid: false,
                message: `Please fill in the following required field(s): ${missingFields.join(', ')}`
            };
        }

        const dateValidation = this.validateDates();
        if (!dateValidation.isValid) {
            return dateValidation;
        }

        return { isValid: true };
    }

    checkRequiredFields() {
        const missingFields = [];
        
        this.requiredFields.forEach(fieldId => {
            const field = this.form.querySelector(`#${fieldId}`);
            if (field && Utils.isEmpty(field.value.trim())) {
                const label = field.previousElementSibling?.textContent || fieldId;
                missingFields.push(label);
            }
        });
        
        return missingFields;
    }

    validateDates() {
        const dateStartField = this.form.querySelector('#time-slot-date-start');
        const dateEndField = this.form.querySelector('#time-slot-date-end');
        const timeStartField = this.form.querySelector('#time-slot-time-start');
        const timeEndField = this.form.querySelector('#time-slot-time-end');

        if (!dateStartField || !dateEndField || !timeStartField || !timeEndField) {
            return { isValid: true };
        }

        const dateStart = dateStartField.value;
        const dateEnd = dateEndField.value;
        const timeStart = timeStartField.value;
        const timeEnd = timeEndField.value;

        if (dateStart && dateEnd && timeStart && timeEnd) {
            const startDateTime = new Date(`${dateStart}T${timeStart}`);
            const endDateTime = new Date(`${dateEnd}T${timeEnd}`);

            if (endDateTime <= startDateTime) {
                return {
                    isValid: false,
                    message: 'End date and time must be after start date and time'
                };
            }
        }

        return { isValid: true };
    }
}

// ============================================================================
// КЛАСС ОТПРАВКИ ФОРМЫ
// ============================================================================

class FormSubmitter {
    constructor(form, saveButton) {
        if (!form) {
            throw new Error('Form is required for FormSubmitter');
        }
        if (!saveButton) {
            throw new Error('Save button is required for FormSubmitter');
        }
        
        this.form = form;
        this.saveButton = saveButton;
        this.originalText = saveButton.textContent;
    }

    async submit() {
        if (!this.validateDependencies()) {
            return;
        }

        this.setLoadingState(true);
        
        try {
            const formData = this.prepareFormData();
            const response = await this.sendRequest(formData);
            this.handleResponse(response);
            
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    validateDependencies() {
        if (!window.alertify) {
            return false;
        }
        return true;
    }

    setLoadingState(loading) {
        this.saveButton.disabled = loading;
        this.saveButton.style.opacity = loading ? '0.7' : '1';
        this.saveButton.textContent = loading ? 'Saving...' : this.originalText;
    }

    prepareFormData() {
        const formData = new FormData();
        
        // Проверяем, что форма существует
        if (!this.form) {
            throw new Error('Form not found');
        }
        
        // Проверяем action формы
        if (!this.form.action) {
            throw new Error('Form action is undefined');
        }
        
        // Базовые поля
        if (!this.addBasicFields(formData)) {
            throw new Error('Failed to add basic fields');
        }
        
        // Даты и время
        this.addDateTimeFields(formData);
        
        // Остальные поля
        this.addOtherFields(formData);
        
        // Хэштеги
        this.addHashtagsField(formData);
        
        // Request ID
        const requestId = Utils.generateRequestId();
        formData.append('request_id', requestId);
        
        return formData;
    }

    addBasicFields(formData) {
        const csrfTokenField = this.form.querySelector('input[name="csrfmiddlewaretoken"]');
        if (!csrfTokenField) {
            console.error('❌ CSRF token field not found');
            return false;
        }
        
        const csrfValue = csrfTokenField.value;
        formData.append('csrfmiddlewaretoken', csrfValue);
        
        formData.append('type_of_task', '5');
        
        const categoryField = this.form.querySelector('#time-slot-category');
        const serviceField = this.form.querySelector('#time-slot-service');
        
        if (categoryField) {
            const categoryValue = categoryField.value;
            formData.append('category', categoryValue);
        } else {
            formData.append('category', '');
        }
        
        if (serviceField) {
            const serviceValue = serviceField.value;
            formData.append('services', serviceValue);
        } else {
            formData.append('services', '');
        }
        
        return true;
    }

    addDateTimeFields(formData) {
        const dateStartField = this.form.querySelector('#time-slot-date-start');
        const dateEndField = this.form.querySelector('#time-slot-date-end');
        const timeStartField = this.form.querySelector('#time-slot-time-start');
        const timeEndField = this.form.querySelector('#time-slot-time-end');

        if (dateStartField) {
            const dateStartValue = dateStartField.value;
            formData.append('date_start', dateStartValue);
        } else {
            formData.append('date_start', '');
        }
        
        if (dateEndField) {
            const dateEndValue = dateEndField.value;
            formData.append('date_end', dateEndValue);
        } else {
            formData.append('date_end', '');
        }
        
        if (timeStartField) {
            const timeStartValue = timeStartField.value;
            formData.append('time_start', timeStartValue);
        } else {
            formData.append('time_start', '');
        }
        
        if (timeEndField) {
            const timeEndValue = timeEndField.value;
            formData.append('time_end', timeEndValue);
        } else {
            formData.append('time_end', '');
        }
    }

    addOtherFields(formData) {
        const fields = [
            'reserved_time_on_road',
            'start_location',
            'cost_of_1_hour_of_work',
            'minimum_time_slot'
        ];

        fields.forEach(fieldName => {
            // Сначала ищем по ID
            let field = this.form.querySelector(`#time-slot-${fieldName}`);
            
            // Если не найден по ID, ищем по name атрибуту
            if (!field) {
                field = this.form.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
            }
            
            // Если все еще не найден, ищем по частичному совпадению
            if (!field) {
                field = this.form.querySelector(`[name*="${fieldName}"]`);
            }
            
            if (field) {
                const value = field.value.trim();
                
                // Специальная обработка для числовых полей
                if (fieldName === 'reserved_time_on_road' || fieldName === 'cost_of_1_hour_of_work') {
                    if (value && !isNaN(value)) {
                        formData.append(fieldName, value);
                    } else {
                        formData.append(fieldName, '0');
                    }
                } else {
                    // Текстовые поля
                    formData.append(fieldName, value || '');
                }
            } else {
                console.warn(`❌ Field ${fieldName} not found by any method`);
                // Добавляем пустые значения для ненайденных полей
                if (fieldName === 'reserved_time_on_road' || fieldName === 'cost_of_1_hour_of_work') {
                    formData.append(fieldName, '0');
                } else {
                    formData.append(fieldName, '');
                }
            }
        });
    }

    addHashtagsField(formData) {
        const hashtagsHidden = this.form.querySelector('#time-slot-hashtags-hidden');
        if (hashtagsHidden && hashtagsHidden.value) {
            const hashtagsValue = hashtagsHidden.value;
            formData.append('hashtags', hashtagsValue);
        } else {
            formData.append('hashtags', '');
        }
    }

    async sendRequest(formData) {
        try {
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                // Для ошибок 400 (Bad Request) получаем детали ошибки
                if (response.status === 400) {
                    try {
                        const errorText = await response.text();
                        return { success: false, error: errorText };
                    } catch (e) {
                        return { success: false, error: 'Bad Request - validation error' };
                    }
                }
                
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const jsonResponse = await response.json();
            return jsonResponse;
            
        } catch (error) {
            throw error;
        }
    }

    handleResponse(data) {
        if (data.success) {
            this.handleSuccess();
        } else {
            this.handleFailure(data.error);
        }
    }

    handleSuccess() {
        showAlertifyNotification('Time Slot saved successfully!', 'success');
        setTimeout(() => {
            this.closeModal();
            this.resetForm();
            
            // Перезагружаем страницу через 1 секунду после закрытия модала
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }, TIMESLOT_CONFIG.REQUEST_TIMEOUT);
    }

    handleFailure(error) {
        const message = error || 'Failed to save Time Slot';
        showAlertifyNotification(message, 'error');
    }

    handleError(error) {
        const message = `Error saving Time Slot: ${error.message}`;
        showAlertifyNotification(message, 'error');
    }

    closeModal() {
        const modal = this.form.closest('.modal-overlay');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    resetForm() {
        // Полностью очищаем все поля формы
        const fields = [
            'time-slot-category',
            'time-slot-service',
            'time-slot-date-start',
            'time-slot-date-end',
            'time-slot-time-start',
            'time-slot-time-end',
            'time-slot-reserved-time',
            'time-slot-start-location',
            'time-slot-cost-hour',
            'time-slot-min-slot'
        ];
        
        fields.forEach(fieldId => {
            const field = this.form.querySelector(`#${fieldId}`);
            if (field) {
                if (field.tagName === 'SELECT') {
                    field.selectedIndex = 0; // Сбрасываем к первому варианту
                } else {
                    field.value = ''; // Очищаем значение
                }
            }
        });
        
        // Очищаем скрытое поле хэштегов
        const hashtagsHidden = this.form.querySelector('#time-slot-hashtags-hidden');
        if (hashtagsHidden) {
            hashtagsHidden.value = '';
        }
        
        // Очищаем хэштеги через глобальный менеджер
        if (window.timeSlotHashtagManager) {
            window.timeSlotHashtagManager.clear();
        }
    }
}

// ============================================================================
// ГЛАВНЫЙ КЛАСС УПРАВЛЕНИЯ ФОРМОЙ
// ============================================================================

class TimeSlotFormManager {
    constructor() {
        // Проверяем, не инициализирован ли уже менеджер для этой формы
        if (window.timeSlotFormManagerInstance) {
            console.warn('TimeSlotFormManager already initialized, skipping...');
            return;
        }
        
        this.form = null;
        this.saveButton = null;
        this.hashtagManager = null;
        this.categoryServiceFilter = null;
        this.validator = null;
        
        // Сохраняем экземпляр глобально
        window.timeSlotFormManagerInstance = this;
        
        this.init();
    }

    init() {
        // Ищем div с ID time-slot-form
        const formContainer = Utils.getElement(TIMESLOT_CONFIG.FORM_ID);
        if (!formContainer) {
            console.warn('Time slot form container not found');
            return;
        }
        
        // Ищем форму внутри контейнера
        this.form = formContainer.querySelector('form');
        if (!this.form) {
            console.warn('Time slot form element not found inside container');
            return;
        }

        this.initializeComponents();
        this.bindEvents();
    }

    initializeComponents() {
        // Инициализация менеджера хэштегов
        this.hashtagManager = new HashtagManager(
            TIMESLOT_CONFIG.HASHTAGS_CONTAINER_ID,
            TIMESLOT_CONFIG.HASHTAGS_INPUT_ID,
            TIMESLOT_CONFIG.HASHTAGS_DROPDOWN_ID,
            TIMESLOT_CONFIG.HASHTAGS_HIDDEN_ID
        );

        // Инициализация фильтра категорий и сервисов
        this.categoryServiceFilter = new CategoryServiceFilter(
            TIMESLOT_CONFIG.CATEGORY_SELECT_ID,
            TIMESLOT_CONFIG.SERVICE_SELECT_ID
        );

        // Инициализация валидатора
        this.validator = new FormValidator(TIMESLOT_CONFIG.FORM_ID);

        // Сохраняем ссылку на менеджер хэштегов для глобального доступа
        window.timeSlotHashtagManager = this.hashtagManager;
    }

    bindEvents() {
        this.saveButton = this.form.querySelector('.save-btn');
        if (this.saveButton) {
            // Удаляем существующий обработчик, если он есть
            if (this.saveButton._timeSlotClickHandler) {
                this.saveButton.removeEventListener('click', this.saveButton._timeSlotClickHandler);
            }
            
            this.saveButton._timeSlotClickHandler = (e) => {
                e.preventDefault();
                this.handleSave();
            };
            
            this.saveButton.addEventListener('click', this.saveButton._timeSlotClickHandler);
        }
    }

    async handleSave() {
        // Валидация формы
        const validation = this.validator.validate();
        
        if (!validation.isValid) {
            showAlertifyNotification(validation.message, 'error');
            return;
        }

        // Дополнительная проверка обязательных полей
        const requiredFields = [
            'time-slot-category',
            'time-slot-service',
            'time-slot-date-start',
            'time-slot-date-end',
            'time-slot-time-start',
            'time-slot-time-end'
        ];

        const missingFields = [];
        requiredFields.forEach(fieldId => {
            const field = this.form.querySelector(`#${fieldId}`);
            if (!field || !field.value.trim()) {
                const label = field?.previousElementSibling?.textContent || fieldId;
                missingFields.push(label);
            }
        });

        if (missingFields.length > 0) {
            const message = `Please fill in the following required field(s): ${missingFields.join(', ')}`;
            showAlertifyNotification(message, 'error');
            return;
        }

        // Отправка формы
        const submitter = new FormSubmitter(this.form, this.saveButton);
        await submitter.submit();
    }
}

// ============================================================================
// ГЛАВНЫЙ КЛАСС УПРАВЛЕНИЯ ХЭШТЕГАМИ
// ============================================================================

class TimeSlotHashtagManager {
    constructor() {
        this.hashtagManager = null;
        this.init();
    }

    init() {
        // Проверяем, есть ли форма с хэштегами на странице
        if (Utils.elementExists(TIMESLOT_CONFIG.HASHTAGS_CONTAINER_ID)) {
            this.initializeHashtags();
        }
    }

    initializeHashtags() {
        try {
            this.hashtagManager = new HashtagManager(
                TIMESLOT_CONFIG.HASHTAGS_CONTAINER_ID,
                TIMESLOT_CONFIG.HASHTAGS_INPUT_ID,
                TIMESLOT_CONFIG.HASHTAGS_DROPDOWN_ID,
                TIMESLOT_CONFIG.HASHTAGS_HIDDEN_ID
            );

            // Сохраняем ссылку для глобального доступа
            window.timeSlotHashtagManager = this.hashtagManager;
        } catch (error) {
            console.error('Error initializing TimeSlotHashtagManager:', error);
        }
    }
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

// Глобальная переменная для отслеживания инициализации
let timeSlotFormManagerInitialized = false;
let timeSlotHashtagManagerInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем основную форму time-slot-form если она есть
    if (Utils.elementExists(TIMESLOT_CONFIG.FORM_ID) && !timeSlotFormManagerInitialized) {
        new TimeSlotFormManager();
        timeSlotFormManagerInitialized = true;
    }
    
    // Инициализируем менеджер хэштегов для дополнительных форм
    if (!timeSlotHashtagManagerInitialized) {
        new TimeSlotHashtagManager();
        timeSlotHashtagManagerInitialized = true;
    }
    
    // Единая дополнительная проверка через 1 секунду (только если не инициализирован)
    setTimeout(() => {
        if (Utils.elementExists(TIMESLOT_CONFIG.FORM_ID) && !timeSlotFormManagerInitialized) {
            new TimeSlotFormManager();
            timeSlotFormManagerInitialized = true;
        }
        
        if (!Utils.elementExists(TIMESLOT_CONFIG.HASHTAGS_CONTAINER_ID) && !timeSlotHashtagManagerInitialized) {
            new TimeSlotHashtagManager();
            timeSlotHashtagManagerInitialized = true;
        }
    }, 1000);
});

// ============================================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ТЕСТИРОВАНИЯ
// ============================================================================

// Функция для тестирования из консоли браузера
window.testTimeSlotHashtags = function() {
    if (window.timeSlotHashtagManager) {
        console.log('Hashtag manager found:', window.timeSlotHashtagManager);
        console.log('Current tags:', window.timeSlotHashtagManager.getTags());
    } else {
        console.log('Hashtag manager not found');
    }
};

// Функция для очистки всех хэштегов
window.clearTimeSlotHashtags = function() {
    if (window.timeSlotHashtagManager) {
        window.timeSlotHashtagManager.clear();
    } else {
        console.log('Hashtag manager not found');
    }
};

// Функция для принудительной инициализации формы
window.forceInitTimeSlotForm = function() {
    // Сбрасываем состояние
    timeSlotFormManagerInitialized = false;
    delete window.timeSlotManagerInstance;
    
    if (Utils.elementExists(TIMESLOT_CONFIG.FORM_ID)) {
        new TimeSlotFormManager();
    } else {
        console.error('Time slot form container not found for force init');
    }
};

// Функция для проверки состояния формы
window.checkTimeSlotFormStatus = function() {
    const container = Utils.getElement(TIMESLOT_CONFIG.FORM_ID);
    if (container) {
        const form = container.querySelector('form');
        if (form) {
            const saveButton = form.querySelector('.save-btn');
            
            // Проверяем все поля формы
            const fields = [
                'time-slot-category',
                'time-slot-service',
                'time-slot-date-start',
                'time-slot-date-end',
                'time-slot-time-start',
                'time-slot-time-end',
                'time-slot-reserved-time',
                'time-slot-start-location',
                'time-slot-cost-hour',
                'time-slot-min-slot'
            ];
            
            console.log('=== TimeSlot Form Status ===');
            console.log(`Form: ${form.id} | Action: ${form.action} | Method: ${form.method}`);
            console.log(`Save button: ${saveButton ? 'Found' : 'Not found'}`);
            
            // Краткая сводка по полям
            const fieldStatus = fields.map(fieldId => {
                const field = form.querySelector(`#${fieldId}`);
                return field ? `${fieldId}: OK` : `${fieldId}: MISSING`;
            });
            console.log('Fields:', fieldStatus.join(' | '));
            
        } else {
            console.log('❌ Form not found inside container');
        }
    } else {
        console.log('❌ Container not found');
    }
};


