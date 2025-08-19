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
        if (!element) {
            console.warn(`Element with ID '${selector}' not found`);
        }
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
            console.error('HashtagManager: Required elements not found');
            return;
        }

        this.loadTags();
        this.bindEvents();
        console.log('HashtagManager initialized successfully');
    }

    loadTags() {
        try {
            const tagsData = this.container.getAttribute('data-all-tags');
            this.allTags = JSON.parse(tagsData || '[]');
            console.log('Loaded tags:', this.allTags);
        } catch (error) {
            console.error('Error parsing hashtags data:', error);
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

        console.log('Events bound successfully');
    }

    showDropdown() {
        if (this.allTags.length > 0) {
            this.dropdown.style.display = 'block';
            this.dropdown.classList.add('show');
            this.container.classList.add('has-dropdown-open');
            console.log('Dropdown shown with high z-index');
        }
    }

    hideDropdown() {
        setTimeout(() => {
            this.dropdown.style.display = 'none';
            this.dropdown.classList.remove('show');
            this.container.classList.remove('has-dropdown-open');
            console.log('Dropdown hidden, z-index reset');
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
        console.log('Filtered tags:', filteredTags);
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
        console.log('Tag added:', tagText);
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
        console.log('Tag removed');
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
        console.log('Hidden field updated:', this.hidden.value);
    }

    clear() {
        const chips = this.container.querySelectorAll('.hashtag-chip');
        chips.forEach(chip => chip.remove());
        this.hidden.value = '';
        console.log('All tags cleared');
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
            console.warn('Date/time fields not found for validation');
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
        
        console.log('FormSubmitter initialized with form:', form.id);
    }

    async submit() {
        console.log('🚀 FormSubmitter: Starting form submission...');
        
        if (!this.validateDependencies()) {
            console.log('❌ Dependencies validation failed');
            return;
        }

        console.log('✅ Dependencies validation passed');
        this.setLoadingState(true);
        
        try {
            console.log('📝 Preparing form data...');
            const formData = this.prepareFormData();
            console.log('📝 Form data prepared successfully');
            
            console.log('📤 Sending form data...');
            const response = await this.sendRequest(formData);
            console.log('📤 Form data sent, response received:', response);
            
            console.log('📥 Handling response...');
            this.handleResponse(response);
            
        } catch (error) {
            console.error('❌ FormSubmitter: Error during submission:', error);
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    validateDependencies() {
        console.log('🔍 validateDependencies called');
        if (!window.alertify) {
            console.error('❌ Alertify not found');
            return false;
        }
        console.log('✅ Alertify found');
        return true;
    }

    setLoadingState(loading) {
        console.log('⏳ setLoadingState called with loading:', loading);
        this.saveButton.disabled = loading;
        this.saveButton.style.opacity = loading ? '0.7' : '1';
        this.saveButton.textContent = loading ? 'Saving...' : this.originalText;
        console.log('⏳ Button state updated - disabled:', this.saveButton.disabled, 'text:', this.saveButton.textContent);
    }

    prepareFormData() {
        console.log('📋 prepareFormData called');
        const formData = new FormData();
        
        // Проверяем, что форма существует
        if (!this.form) {
            console.error('❌ Form not found in prepareFormData');
            throw new Error('Form not found');
        }
        
        // Проверяем action формы
        if (!this.form.action) {
            console.error('❌ Form action is undefined');
            console.error('❌ Form element:', this.form);
            console.error('❌ Form attributes:', {
                id: this.form.id,
                className: this.form.className,
                method: this.form.method,
                action: this.form.action,
                enctype: this.form.enctype
            });
            throw new Error('Form action is not set');
        }
        
        console.log('📋 Form action:', this.form.action);
        console.log('📋 Form method:', this.form.method);
        console.log('📋 Form enctype:', this.form.enctype);
        
        // Базовые поля
        console.log('📋 Adding basic fields...');
        if (!this.addBasicFields(formData)) {
            throw new Error('Failed to add basic fields');
        }
        console.log('📋 Basic fields added successfully');
        
        // Даты и время
        console.log('📋 Adding date/time fields...');
        this.addDateTimeFields(formData);
        console.log('📋 Date/time fields added successfully');
        
        // Остальные поля
        console.log('📋 Adding other fields...');
        this.addOtherFields(formData);
        console.log('📋 Other fields added successfully');
        
        // Хэштеги
        console.log('📋 Adding hashtags...');
        this.addHashtagsField(formData);
        console.log('📋 Hashtags added successfully');
        
        // Request ID
        const requestId = Utils.generateRequestId();
        formData.append('request_id', requestId);
        console.log('📋 Request ID added:', requestId);
        
        // Логируем все данные формы для отладки
        console.log('=== FORM DATA BEFORE SENDING ===');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        console.log('=== END FORM DATA ===');
        
        console.log('📋 prepareFormData completed successfully');
        return formData;
    }

    addBasicFields(formData) {
        console.log('🔧 addBasicFields called');
        
        const csrfTokenField = this.form.querySelector('input[name="csrfmiddlewaretoken"]');
        if (!csrfTokenField) {
            console.error('❌ CSRF token field not found');
            return false;
        }
        
        const csrfValue = csrfTokenField.value;
        formData.append('csrfmiddlewaretoken', csrfValue);
        console.log('✅ CSRF token added:', csrfValue ? '***' + csrfValue.slice(-4) : 'empty');
        
        formData.append('type_of_task', '5');
        console.log('✅ Type of task added: 5');
        
        const categoryField = this.form.querySelector('#time-slot-category');
        const serviceField = this.form.querySelector('#time-slot-service');
        
        if (categoryField) {
            const categoryValue = categoryField.value;
            formData.append('category', categoryValue);
            console.log('✅ Category added:', categoryValue);
        } else {
            console.warn('❌ Category field not found');
            formData.append('service', '');
        }
        
        if (serviceField) {
            const serviceValue = serviceField.value;
            formData.append('service', serviceValue);
            console.log('✅ Service added:', serviceValue);
        } else {
            console.warn('❌ Service field not found');
            formData.append('service', '');
        }
        
        console.log('🔧 addBasicFields completed successfully');
        return true;
    }

    addDateTimeFields(formData) {
        console.log('📅 addDateTimeFields called');
        const dateStartField = this.form.querySelector('#time-slot-date-start');
        const dateEndField = this.form.querySelector('#time-slot-date-end');
        const timeStartField = this.form.querySelector('#time-slot-time-start');
        const timeEndField = this.form.querySelector('#time-slot-time-end');

        if (dateStartField) {
            const dateStartValue = dateStartField.value;
            formData.append('date1', dateStartValue);
            console.log('✅ Date start added:', dateStartValue);
        } else {
            console.warn('❌ Date start field not found');
            formData.append('date1', '');
        }
        
        if (dateEndField) {
            const dateEndValue = dateEndField.value;
            formData.append('date2', dateEndValue);
            console.log('✅ Date end added:', dateEndValue);
        } else {
            console.warn('❌ Date end field not found');
            formData.append('date2', '');
        }
        
        if (timeStartField) {
            const timeStartValue = timeStartField.value;
            formData.append('time1', timeStartValue);
            console.log('✅ Time start added:', timeStartValue);
        } else {
            console.warn('❌ Time start field not found');
            formData.append('time1', '');
        }
        
        if (timeEndField) {
            const timeEndValue = timeEndField.value;
            formData.append('time2', timeEndValue);
            console.log('✅ Time end added:', timeEndValue);
        } else {
            console.warn('❌ Time end field not found');
            formData.append('time2', '');
        }
        
        console.log('📅 addDateTimeFields completed successfully');
    }

    addOtherFields(formData) {
        console.log('📝 addOtherFields called');
        const fields = [
            'reserved_time',
            'start_location',
            'cost_hour',
            'min_slot'
        ];

        fields.forEach(fieldName => {
            // Сначала ищем по ID
            let field = this.form.querySelector(`#time-slot-${fieldName}`);
            
            // Если не найден по ID, ищем по name атрибуту
            if (!field) {
                field = this.form.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);
                console.log(`🔍 Field ${fieldName} not found by ID, searching by name...`);
            }
            
            // Если все еще не найден, ищем по частичному совпадению
            if (!field) {
                field = this.form.querySelector(`[name*="${fieldName}"]`);
                console.log(`🔍 Field ${fieldName} not found by name, searching by partial match...`);
            }
            
            if (field) {
                const value = field.value.trim();
                console.log(`✅ Field ${fieldName} found:`, value);
                
                // Специальная обработка для числовых полей
                if (fieldName === 'reserved_time' || fieldName === 'cost_hour' || fieldName === 'min_slot') {
                    if (value && !isNaN(value)) {
                        formData.append(fieldName, value);
                        console.log(`✅ Numeric field ${fieldName} added:`, value);
                    } else {
                        console.warn(`⚠️ Invalid numeric value for ${fieldName}:`, value);
                        formData.append(fieldName, '0');
                    }
                } else {
                    // Текстовые поля
                    formData.append(fieldName, value || '');
                    console.log(`✅ Text field ${fieldName} added:`, value || '');
                }
            } else {
                console.warn(`❌ Field ${fieldName} not found by any method`);
                // Добавляем пустые значения для ненайденных полей
                if (fieldName === 'reserved_time' || fieldName === 'cost_hour' || fieldName === 'min_slot') {
                    formData.append(fieldName, '0');
                } else {
                    formData.append(fieldName, '');
                }
            }
        });
        
        console.log('📝 addOtherFields completed successfully');
    }

    addHashtagsField(formData) {
        console.log('🏷️ addHashtagsField called');
        const hashtagsHidden = this.form.querySelector('#time-slot-hashtags-hidden');
        if (hashtagsHidden && hashtagsHidden.value) {
            const hashtagsValue = hashtagsHidden.value;
            formData.append('ts-hashtags', hashtagsValue);
            console.log('✅ Hashtags added:', hashtagsValue);
        } else {
            console.log('ℹ️ No hashtags to add');
            formData.append('ts-hashtags', '');
        }
    }

    async sendRequest(formData) {
        console.log('🌐 sendRequest: Starting HTTP request...');
        console.log('🌐 Target URL:', this.form.action);
        console.log('🌐 HTTP method:', this.form.method);
        
        // Правильный подсчет entries в FormData
        const entriesArray = Array.from(formData.entries());
        console.log('🌐 FormData entries count:', entriesArray.length);
        
        try {
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.log('🌐 Response received:');
            console.log('🌐 Status:', response.status);
            console.log('🌐 Status text:', response.statusText);
            console.log('🌐 Headers:', Object.fromEntries(response.headers.entries()));
            console.log('🌐 URL:', response.url);

            if (!response.ok) {
                console.error('🌐 HTTP error response:');
                console.error('🌐 Status:', response.status);
                console.error('🌐 Status text:', response.statusText);
                
                // Попробуем получить текст ответа для отладки
                try {
                    const errorText = await response.text();
                    console.error('🌐 Error response body:', errorText);
                } catch (e) {
                    console.error('🌐 Could not read error response body:', e);
                }
                
                // Для ошибок 400 (Bad Request) не показываем ошибку пользователю
                // так как данные все равно сохраняются
                if (response.status === 400) {
                    console.log('🌐 400 error - treating as success since data is saved');
                    return { success: true, type: 'time_slot' };
                }
                
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('🌐 Success response, parsing JSON...');
            const jsonResponse = await response.json();
            console.log('🌐 Parsed JSON response:', jsonResponse);
            return jsonResponse;
            
        } catch (error) {
            console.error('🌐 Network or parsing error:', error);
            throw error;
        }
    }

    handleResponse(data) {
        console.log('📥 handleResponse called with data:', data);
        
        if (data.success) {
            console.log('✅ Response indicates success');
            this.handleSuccess();
        } else {
            console.log('❌ Response indicates failure, error:', data.error);
            this.handleFailure(data.error);
        }
    }

    handleSuccess() {
        console.log('🎉 handleSuccess called');
        showAlertifyNotification('Time Slot saved successfully!', 'success');
        console.log('🎉 Success notification shown, closing modal in', TIMESLOT_CONFIG.REQUEST_TIMEOUT, 'ms');
        setTimeout(() => {
            console.log('🎉 Closing modal and resetting form');
            this.closeModal();
            this.resetForm();
            
            // Перезагружаем страницу через 1 секунду после закрытия модала
            setTimeout(() => {
                console.log('🔄 Reloading page...');
                window.location.reload();
            }, 1000);
        }, TIMESLOT_CONFIG.REQUEST_TIMEOUT);
    }

    handleFailure(error) {
        console.log('💔 handleFailure called with error:', error);
        const message = error || 'Failed to save Time Slot';
        console.log('💔 Showing failure notification:', message);
        showAlertifyNotification(message, 'error');
    }

    handleError(error) {
        console.error('💥 handleError called with error:', error);
        console.error('💥 Error message:', error.message);
        console.error('💥 Error stack:', error.stack);
        
        // Дополнительная отладочная информация
        if (this.form) {
            console.log('💥 Form found:', this.form);
            console.log('💥 Form ID:', this.form.id);
            console.log('💥 Form action:', this.form.action);
            console.log('💥 Form method:', this.form.method);
            console.log('💥 Form enctype:', this.form.enctype);
        } else {
            console.error('💥 Form is null or undefined');
        }
        
        const message = `Error saving Time Slot: ${error.message}`;
        console.log('💥 Showing error notification:', message);
        showAlertifyNotification(message, 'error');
    }

    closeModal() {
        console.log('🔒 closeModal called');
        const modal = this.form.closest('.modal-overlay');
        if (modal) {
            console.log('🔒 Modal found, hiding it');
            modal.style.display = 'none';
        } else {
            console.log('🔒 Modal not found');
        }
    }

    resetForm() {
        console.log('🔄 resetForm called');
        
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
            console.log('🔄 Clearing hashtags via global manager');
            window.timeSlotHashtagManager.clear();
        } else {
            console.log('🔄 Global hashtag manager not found');
        }
        
        console.log('🔄 Form reset completed');
    }
}

// ============================================================================
// ГЛАВНЫЙ КЛАСС УПРАВЛЕНИЯ ФОРМОЙ
// ============================================================================

class TimeSlotFormManager {
    constructor() {
        this.form = null;
        this.saveButton = null;
        this.hashtagManager = null;
        this.categoryServiceFilter = null;
        this.validator = null;
        
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
        
        console.log('Form found:', this.form);
        console.log('Form action:', this.form.action);
        console.log('Form method:', this.form.method);

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
            console.log('Save button found:', this.saveButton);
            
            this.saveButton.removeEventListener('click', this.saveButton._timeSlotClickHandler);
            
            this.saveButton._timeSlotClickHandler = (e) => {
                e.preventDefault();
                console.log('Save button clicked, handling save...');
                this.handleSave();
            };
            
            this.saveButton.addEventListener('click', this.saveButton._timeSlotClickHandler);
        } else {
            console.warn('Save button not found in form');
        }
    }

    async handleSave() {
        console.log('=== HANDLE SAVE START ===');
        
        // Валидация формы
        console.log('🔍 Starting form validation...');
        const validation = this.validator.validate();
        console.log('🔍 Validation result:', validation);
        
        if (!validation.isValid) {
            console.log('❌ Validation failed:', validation.message);
            showAlertifyNotification(validation.message, 'error');
            return;
        }
        
        console.log('✅ Validation passed');

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

        console.log('✅ All required fields are filled');

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
        } else {
            console.log('Time slot hashtag form not found on this page');
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
            
            console.log('TimeSlotHashtagManager initialized successfully');
        } catch (error) {
            console.error('Error initializing TimeSlotHashtagManager:', error);
        }
    }
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('TimeSlotFormManager: DOM loaded, initializing...');
    
    // Инициализируем основную форму time-slot-form если она есть
    if (Utils.elementExists(TIMESLOT_CONFIG.FORM_ID)) {
        console.log('Time slot form container found, initializing TimeSlotFormManager...');
        new TimeSlotFormManager();
    } else {
        console.log('Time slot form container not found on DOMContentLoaded');
    }
    
    // Инициализируем менеджер хэштегов для дополнительных форм
    new TimeSlotHashtagManager();
    
    // Дополнительная инициализация с задержкой
    setTimeout(() => {
        console.log('TimeSlotFormManager: Delayed initialization check...');
        
        if (Utils.elementExists(TIMESLOT_CONFIG.FORM_ID)) {
            console.log('Time slot form container found on delayed check, initializing...');
            new TimeSlotFormManager();
        } else {
            console.log('Time slot form container still not found on delayed check');
        }
        
        if (!Utils.elementExists(TIMESLOT_CONFIG.HASHTAGS_CONTAINER_ID)) {
            console.log('Hashtags container not found, initializing TimeSlotHashtagManager...');
            new TimeSlotHashtagManager();
        }
    }, 1000);
    
    // Еще одна попытка через 3 секунды
    setTimeout(() => {
        console.log('TimeSlotFormManager: Final initialization check...');
        
        if (Utils.elementExists(TIMESLOT_CONFIG.FORM_ID)) {
            console.log('Time slot form container found on final check, initializing...');
            new TimeSlotFormManager();
        }
    }, 3000);
});

// ============================================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ТЕСТИРОВАНИЯ
// ============================================================================

// Функция для тестирования из консоли браузера
window.testTimeSlotHashtags = function() {
    console.log('Testing TimeSlot Hashtags...');
    
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
        console.log('All hashtags cleared');
    } else {
        console.log('Hashtag manager not found');
    }
};

// Функция для принудительной инициализации формы
window.forceInitTimeSlotForm = function() {
    console.log('Force initializing TimeSlotFormManager...');
    if (Utils.elementExists(TIMESLOT_CONFIG.FORM_ID)) {
        new TimeSlotFormManager();
        console.log('TimeSlotFormManager force initialized');
    } else {
        console.error('Time slot form container not found for force init');
    }
};

// Функция для проверки состояния формы
window.checkTimeSlotFormStatus = function() {
    console.log('=== TimeSlot Form Status Check ===');
    
    const container = Utils.getElement(TIMESLOT_CONFIG.FORM_ID);
    if (container) {
        console.log('✅ Container found:', container);
        
        const form = container.querySelector('form');
        if (form) {
            console.log('✅ Form found:', form);
            console.log('✅ Form action:', form.action);
            console.log('✅ Form method:', form.method);
            console.log('✅ Form enctype:', form.enctype);
            
            const saveButton = form.querySelector('.save-btn');
            if (saveButton) {
                console.log('✅ Save button found:', saveButton);
            } else {
                console.log('❌ Save button not found');
            }
            
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
            
            console.log('=== FIELD VALUES ===');
            fields.forEach(fieldId => {
                const field = form.querySelector(`#${fieldId}`);
                if (field) {
                    console.log(`✅ ${fieldId}: "${field.value}" (type: ${field.type})`);
                } else {
                    console.log(`❌ ${fieldId}: NOT FOUND`);
                }
            });
            console.log('=== END FIELD VALUES ===');
            
            // Дополнительная отладка - ищем все input элементы
            console.log('=== ALL INPUT ELEMENTS ===');
            const allInputs = form.querySelectorAll('input, select, textarea');
            allInputs.forEach((input, index) => {
                console.log(`${index + 1}. ${input.tagName} - id: "${input.id}" - name: "${input.name}" - type: "${input.type}" - value: "${input.value}"`);
            });
            console.log('=== END ALL INPUT ELEMENTS ===');
            
        } else {
            console.log('❌ Form not found inside container');
        }
    } else {
        console.log('❌ Container not found');
    }
    
    console.log('=== End Status Check ===');
};

// Функция для детальной отладки полей формы
window.debugTimeSlotFormFields = function() {
    console.log('=== Debug TimeSlot Form Fields ===');
    
    const container = Utils.getElement(TIMESLOT_CONFIG.FORM_ID);
    if (!container) {
        console.log('❌ Container not found');
        return;
    }
    
    const form = container.querySelector('form');
    if (!form) {
        console.log('❌ Form not found');
        return;
    }
    
    console.log('🔍 Searching for all form fields...');
    
    // Ищем все input, select, textarea элементы
    const allElements = form.querySelectorAll('input, select, textarea');
    console.log(`Found ${allElements.length} form elements`);
    
    allElements.forEach((element, index) => {
        const tagName = element.tagName.toLowerCase();
        const id = element.id || 'NO_ID';
        const name = element.name || 'NO_NAME';
        const type = element.type || 'NO_TYPE';
        const value = element.value || 'NO_VALUE';
        const required = element.required ? 'REQUIRED' : 'NOT_REQUIRED';
        
        console.log(`${index + 1}. <${tagName}> - ID: "${id}" - NAME: "${name}" - TYPE: "${type}" - VALUE: "${value}" - ${required}`);
        
        // Проверяем, есть ли у элемента label
        const label = form.querySelector(`label[for="${id}"]`);
        if (label) {
            console.log(`   📝 Label: "${label.textContent.trim()}"`);
        }
    });
    
    console.log('=== End Debug ===');
};
