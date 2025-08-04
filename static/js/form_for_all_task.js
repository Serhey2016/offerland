document.addEventListener('DOMContentLoaded', () => {
    // === КОНФИГУРАЦИЯ ===
    const CONFIG = {
        SPINNER_DELAY: 1000,
        DROPDOWN_HIDE_DELAY: 150
    };

    // === СООТВЕТСТВИЕ ID ТИПАМ ===
    const TYPE_MAP = {
        '1': 'my',
        '2': 'tender',
        '3': 'project',
        '4': 'advertising',
        '5': 'orders',
        '6': 'job-search',
    };

    // === КОНСТАНТЫ ДЛЯ ID ПОЛЕЙ ===
    const FIELD_IDS = {
        formGroupTypeOfTask: 'form-group-type_of_task',  
        formGroupCategory: 'form-group-category',
        formGroupService: 'form-group-service',
        formGroupTitle: 'form-group-title',
        formGroupDescription: 'form-group-description',
        photosLink: 'photos-link',
        formGroupHashtagsInput: 'form-group-hashtags-input',
        hashtagsHidden: 'hashtags-hidden',
        formGroupDocuments: 'form-group-documents',
        formGroupPerformers: 'form-group-performers',
        formGroupDateTime: 'form-group-date-time',
        formGroupDiscloseName1: 'form-group-disclose-name-1',
        formGroupHidden: 'form-group-hidden',
        formGroupPostCode: 'form-group-post-code',
        formGroupOffline: 'form-group-offline',
        formGroupStreetDetails: 'form-group-street_details',
        formGroupPrivate: 'form-group-private',
        formGroupProjectIncluded: 'form-group-project-included',
        formGroupStatus: 'form-group-status',
        formExtendToggle: 'form-extend-toggle',
        formGroupMinSlot: 'form-group-min-slot',
        formGroupCostHour: 'form-group-cost-hour',
        formGroupStartLocation: 'form-group-start-location',
        formGroupReservedTime: 'form-group-reserved-time',
        buttonFormActions: 'button-form-actions',

        status: 'status',
        projectIncluded: 'project-included',
        comment: 'comment',
        formGroupPhotosLink1: 'form-group-photos-link1',
        formGroupPhotosLink2: 'form-group-photos-link2',
        formGroupPhotosLink3: 'form-group-photos-link3',
    };

    // === КОНФИГ ДЛЯ РАЗНЫХ ТИПОВ ПУБЛИКАЦИЙ ===
    const FORM_CONFIG = {
        // Пустой селект - показываем только селект типа
        empty: {
            show: [FIELD_IDS.formGroupTypeOfTask],  
            hide: Object.values(FIELD_IDS).filter(id => id !== FIELD_IDS.formGroupTypeOfTask),  // 
            hideCheckboxes: true,
            hideDateFields: true,
            showExtended: false,
            showExtendToggle: false,
        },

        // My - все поля кроме фото и кнопок
        my: {
            show: [
                FIELD_IDS.formGroupTypeOfTask,  
                FIELD_IDS.formGroupCategory,
                FIELD_IDS.formGroupService,
                FIELD_IDS.formGroupTitle,
                FIELD_IDS.formGroupDescription,
                FIELD_IDS.formGroupHashtagsInput,
                FIELD_IDS.formGroupDocuments,
                FIELD_IDS.formGroupPerformers,
                FIELD_IDS.formGroupDateTime,
                FIELD_IDS.formGroupDiscloseName1,
                FIELD_IDS.formGroupHidden,
                FIELD_IDS.formGroupPostCode,
                FIELD_IDS.formGroupOffline,
                FIELD_IDS.formGroupStreetDetails,
                FIELD_IDS.formGroupPrivate,
                FIELD_IDS.buttonFormActions,
            ],
            hide: [
                FIELD_IDS.photosLink,
                FIELD_IDS.formActions,
                FIELD_IDS.extendedFields,
            ],
            hideCheckboxes: false,
            hideDateFields: false,
            showExtended: false,
            showExtendToggle: true,
        },

        // Tender - только основные поля
        tender: {
            show: [
                FIELD_IDS.formGroupTypeOfTask,  // ← ДОБАВИТЬ
                FIELD_IDS.formGroupCategory,
                FIELD_IDS.formGroupService,
                FIELD_IDS.formGroupHashtagsInput,
                FIELD_IDS.formGroupDocuments,
                FIELD_IDS.formGroupPerformers,
                FIELD_IDS.formGroupStatus,
                FIELD_IDS.formGroupProjectIncluded,
            ],
            hide: [
                FIELD_IDS.photosLink,
                FIELD_IDS.formActions,
                FIELD_IDS.extendedFields,
                FIELD_IDS.formGroupPhotosLinkOr,
                FIELD_IDS.formGroupPhotosLinkDropFile,
            ],
            hideCheckboxes: false,
            hideDateFields: true,
            showExtended: true,
            showExtendToggle: false,
        },

        // Project - похож на tender
        project: {
            show: [
                FIELD_IDS.formGroupTypeOfTask,  // ← ДОБАВИТЬ
                FIELD_IDS.formGroupCategory,
                FIELD_IDS.formGroupService,
                FIELD_IDS.formGroupHashtagsInput,
                FIELD_IDS.formGroupDocuments,
                FIELD_IDS.formGroupPerformers,
                FIELD_IDS.formGroupStatus,
                FIELD_IDS.formGroupProjectIncluded,
            ],
            hide: [
                FIELD_IDS.photosLink,
                FIELD_IDS.formActions,
                FIELD_IDS.extendedFields,
            ],
            hideCheckboxes: false,
            hideDateFields: true,
            showExtended: true,
            showExtendToggle: false,
        },

        // Advertising - все поля включая фото
        advertising: {
            show: [
                FIELD_IDS.formGroupTypeOfTask,  // ← ДОБАВИТЬ
                FIELD_IDS.formGroupCategory,
                FIELD_IDS.formGroupService,
                FIELD_IDS.formGroupTitle,
                FIELD_IDS.formGroupDescription,
                FIELD_IDS.formGroupHashtagsInput,
                FIELD_IDS.formGroupDocuments,
                FIELD_IDS.formGroupPerformers,
                FIELD_IDS.formGroupDateTime,
                FIELD_IDS.formGroupDiscloseName1,
                FIELD_IDS.formGroupHidden,
                FIELD_IDS.formGroupPostCode,
                FIELD_IDS.formGroupOffline,
                FIELD_IDS.formGroupStreetDetails,
                FIELD_IDS.formGroupPrivate,
                FIELD_IDS.formActions,
                FIELD_IDS.buttonFormActions,
            ],
            hide: [
                FIELD_IDS.hashtagsHidden,
                FIELD_IDS.formGroupPhotosLinkOr,
            ],
            hideCheckboxes: false,
            hideDateFields: false,
            showExtended: false,
            showExtendToggle: false,
        },

        // Orders - только time slot
        orders: {
            show: [
                FIELD_IDS.formGroupTypeOfTask,  // ← ДОБАВИТЬ
                FIELD_IDS.formGroupMinSlot,
                FIELD_IDS.formGroupCostHour,
                FIELD_IDS.formGroupStartLocation,
                FIELD_IDS.formGroupReservedTime,
            ],
            hide: Object.values(FIELD_IDS).filter(id => 
                id !== FIELD_IDS.formGroupTypeOfTask && 
                id !== FIELD_IDS.formGroupMinSlot &&
                id !== FIELD_IDS.formGroupCostHour &&
                id !== FIELD_IDS.formGroupStartLocation &&
                id !== FIELD_IDS.formGroupReservedTime
            ),
            hideCheckboxes: true,
            hideDateFields: true,
            showExtended: false,
            showExtendToggle: false,
        },

        // Job search - похож на my но без расширенных полей
        'job-search': {
            show: [
                FIELD_IDS.formGroupTypeOfTask,  
                FIELD_IDS.formGroupCategory,
                FIELD_IDS.formGroupService,
                FIELD_IDS.formGroupTitle,
                FIELD_IDS.formGroupDescription,
                FIELD_IDS.formGroupHashtagsInput,
                FIELD_IDS.formGroupDocuments,
                FIELD_IDS.formGroupPerformers,
                FIELD_IDS.formActions,
                FIELD_IDS.buttonFormActions,
            ],
            hide: [
                FIELD_IDS.photosLink,
                FIELD_IDS.extendedFields,
            ],
            hideCheckboxes: false,
            hideDateFields: false,
            showExtended: false,
            showExtendToggle: false,
        },
    };

    // === УНИВЕРСАЛЬНЫЕ ФУНКЦИИ ДЛЯ ВИДИМОСТИ ===
    function setFieldsVisibility(fieldIds, visible) {
        fieldIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = visible ? '' : 'none';
        });
    }
    
    function hideAllCheckboxes() {
        document.querySelectorAll('.form-group.checkbox').forEach(group => {
            group.style.display = 'none';
        });
    }
    
    function showAllCheckboxes() {
        document.querySelectorAll('.form-group.checkbox').forEach(group => {
            group.style.display = '';
        });
    }
    
    function hideDateFields() {
        const dateStart = document.getElementById('date-start');
        if (dateStart) {
            const formRow = dateStart.parentNode?.parentNode;
            if (formRow) formRow.style.display = 'none';
        }
    }
    
    function showDateFields() {
        const dateStart = document.getElementById('date-start');
        const dateEnd = document.getElementById('date-end');
        if (dateStart && dateEnd) {
            const formRow = dateStart.parentNode?.parentNode;
            if (formRow) formRow.style.display = '';
        }
    }

    // === УНИВЕРСАЛЬНЫЙ ОБРАБОТЧИК ДЛЯ ТИПОВ ===
    function handleTypeFields(type) {
        const config = FORM_CONFIG[type] || FORM_CONFIG.empty;
        setFieldsVisibility(config.show, true);
        setFieldsVisibility(config.hide, false);
        if (config.hideCheckboxes) hideAllCheckboxes(); else showAllCheckboxes();
        if (config.hideDateFields) hideDateFields(); else showDateFields();
        if (elements.extendedFields) elements.extendedFields.style.display = config.showExtended ? '' : 'none';
        if (elements.extendToggle) elements.extendToggle.style.display = config.showExtendToggle ? 'flex' : 'none';
    }

    // === УТИЛИТЫ ===
    
    /**
     * Находит checkbox "offline" среди всех checkboxes с id="disclose-name"
     */
    function findOfflineCheckbox() {
        return Array.from(document.querySelectorAll('input[type="checkbox"]#disclose-name'))
            .find(cb => {
                const label = cb.parentNode.querySelector('label[for="disclose-name"]');
                return label && label.textContent.trim().toLowerCase() === 'offline';
            });
    }

    // === ЭЛЕМЕНТЫ DOM ===
    const elements = {
        // Модальное окно
        closeBtn: document.querySelector('.modal_close_btn'),
        modalOverlay: document.querySelector('.modal-overlay'),
        openBtn: document.querySelector('.fixed_circle.sub.sub2'),
        
        // Форма
        form: document.querySelector('.project-form'),
        publishIn: document.getElementById('publish-in'),

        extendToggle: document.getElementById('form-extend-toggle'),
        extendBtn: document.querySelector('.extend-btn'),
        
        // Загрузка файлов
        dropZone: document.querySelector('.file-upload-area'),
        fileInput: document.querySelector('#photos'),
        photosInput: document.querySelector('#photos'),
        photosLink: document.querySelector('#photos-link'),
        
        // Исполнители
        performersInput: document.querySelector('#performers'),
        performersList: document.querySelector('.performers-list'),
        performersDropdown: document.getElementById('performers-dropdown'),
        
        // Хэштеги
        hashtagsContainer: document.querySelector('#hashtags-container'),
        hashtagsHidden: document.querySelector('#hashtags-hidden'),
        hashtagsInput: document.querySelector('#hashtags-input'),
        hashtagsDropdown: document.querySelector('#hashtags-dropdown'),
        
        // Offline поля
        offlineCheckbox: findOfflineCheckbox(),
        postCodeGroup: document.getElementById('post-code')?.parentNode,
        streetDetailsGroup: document.getElementById('street_details')?.parentNode,
        
        // Time slot
        timeSlotGroup: document.getElementById('time-slot-group')
    };

    // === СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
    let state = {
        performerTags: [],
        extendedVisible: false,
        spinnerTimeouts: {
            performer: null
        }
    };

    /**
     * Предотвращает поведение по умолчанию для событий
     */
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // === DRAG & DROP ===
    
    /**
     * Инициализирует drag & drop для файлов
     */
    function initDragDrop() {
        if (!elements.dropZone) {
            return;
        }
        
        // Предотвращаем стандартное поведение
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            elements.dropZone.addEventListener(eventName, preventDefaults, false);
        });
    
        // Визуальная обратная связь
        ['dragenter', 'dragover'].forEach(eventName => {
            elements.dropZone.addEventListener(eventName, () => {
                elements.dropZone.classList.add('drag-over');
            }, false);
        });
    
        ['dragleave', 'drop'].forEach(eventName => {
            elements.dropZone.addEventListener(eventName, () => {
                elements.dropZone.classList.remove('drag-over');
            }, false);
        });
    
        // Обработка drop
        elements.dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            handleFiles(files);
        }, false);
    }

    /**
     * Обработка файлов (заглушка)
     */
    function handleFiles(files) {
        // Здесь добавить логику обработки файлов
        console.log('Files dropped:', files);
    }

    /**
     * Управляет спиннером для input полей
     */
    function manageInputSpinner(input, show = true) {
        if (!input) return;
        
        const parent = input.parentNode;
        const existingSpinner = parent.querySelector('.input-spinner');
        
        // Удаляем существующий спиннер
        if (existingSpinner) {
            parent.removeChild(existingSpinner);
        }
        
        // Добавляем новый спиннер если нужно
        if (show) {
            const spinner = document.createElement('span');
            spinner.className = 'input-spinner';
            parent.style.position = 'relative';
            parent.appendChild(spinner);
        }
    }

    /**
     * Управляет timeout для спиннеров
     */
    function handleSpinnerTimeout(inputType, input) {
        if (!input) return;
        
        // Очищаем предыдущий timeout
        if (state.spinnerTimeouts[inputType]) {
            clearTimeout(state.spinnerTimeouts[inputType]);
        }
        
        // Показываем спиннер
        manageInputSpinner(input, true);
        
        // Устанавливаем новый timeout для скрытия
        state.spinnerTimeouts[inputType] = setTimeout(() => {
            manageInputSpinner(input, false);
        }, CONFIG.SPINNER_DELAY);
    }

    // --- CSRF helper for Django ---
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

    // --- Save button spinner and success message (AJAX) ---
    var saveBtn = document.querySelector('.btn-secondary');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleFormSubmission(saveBtn, false); // false = save mode
        });
    }

    // --- Publish button handler ---
    var publishBtn = document.querySelector('.btn-primary');
    if (publishBtn) {
        publishBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleFormSubmission(publishBtn, true); // true = publish mode
        });
    }

    /**
     * Обрабатывает отправку формы
     */
    function handleFormSubmission(button, isPublish = false) {
        // Защита от повторной отправки
        if (button.disabled) {
            return;
        }
        
        // Отключаем кнопку
        button.disabled = true;
        
        // Удаляем все старые сообщения
        document.querySelectorAll('.save-success-message').forEach(function(msg) { msg.remove(); });
        // Удаляем старый спиннер
        let oldSpinner = document.querySelector('.save-spinner');
        if (oldSpinner) oldSpinner.remove();
        
        // Добавляем спиннер
        var spinner = document.createElement('span');
        spinner.className = 'save-spinner';
        button.parentNode.insertBefore(spinner, button.nextSibling);
        
        // Собираем данные формы
        var form = button.closest('form');
        var formData = new FormData(form);
        
        // Добавляем информацию о режиме (save/publish)
        formData.append('is_publish', isPublish);
        
        // Добавляем уникальный идентификатор запроса для защиты от двойной отправки
        var requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        formData.append('request_id', requestId);
        
        // Добавляем данные исполнителей
        if (state.performerTags.length > 0) {
            formData.append('performers', JSON.stringify(state.performerTags));
        }
        
        // Отправляем AJAX-запрос
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken')
            },
            credentials: 'same-origin'
        })
        .then(function(response) {
            spinner.remove();
            // Включаем кнопку обратно
            button.disabled = false;
            
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(function(text) {
                    throw new Error(text || 'Save error');
                });
            }
        })
        .then(function(data) {
            document.querySelectorAll('.save-success-message').forEach(function(msg) { msg.remove(); });
            
            if (data.success) {
                // Используем SweetAlert2 для успешного сохранения
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: isPublish ? 'Published!' : 'Saved!',
                        text: isPublish ? 'Data published successfully. Form will close automatically.' : 'Data saved successfully. Form will close automatically.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    // Fallback для обычного сообщения
                    var msg = document.createElement('div');
                    msg.className = 'save-success-message';
                    msg.textContent = isPublish ? 'Published successfully!' : 'Saved successfully!';
                    msg.style.color = '#10b981';
                    button.parentNode.appendChild(msg);
                    setTimeout(function() {
                        msg.remove();
                    }, 3000);
                }
                
                // Закрываем модальное окно после успешного сохранения
                if (elements.modalOverlay) {
                    setTimeout(() => {
                        // Закрываем модальное окно
                        elements.modalOverlay.style.display = 'none';
                        
                        // Полная очистка формы
                        resetFormCompletely();
                    }, 2000);
                }
            } else {
                // Используем SweetAlert2 для ошибки
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: data.error || 'Failed to save data.'
                    });
                } else {
                    // Fallback для обычного сообщения
                    var msg = document.createElement('div');
                    msg.className = 'save-success-message';
                    msg.textContent = data.error || 'Error occurred!';
                    msg.style.color = '#b91c1c';
                    button.parentNode.appendChild(msg);
                    setTimeout(function() {
                        msg.remove();
                    }, 3000);
                }
            }
        })
        .catch(function(error) {
            spinner.remove();
            // Включаем кнопку обратно
            button.disabled = false;
            
            // Используем SweetAlert2 для ошибки
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'There was an error submitting the form: ' + error.message
                });
            } else {
                // Fallback для обычного сообщения
                var msg = document.createElement('div');
                msg.className = 'save-success-message';
                msg.style.color = '#b91c1c';
                msg.textContent = 'Error: ' + error.message;
                button.parentNode.appendChild(msg);
                setTimeout(function() {
                    msg.remove();
                }, 3000);
            }
        });
    }

    // === МОДАЛЬНОЕ ОКНО ===
    
    /**
     * Инициализирует обработчики модального окна
     */
    function initModal() {
        // Закрытие модального окна
        if (elements.closeBtn && elements.modalOverlay) {
            elements.closeBtn.addEventListener('click', () => {
                elements.modalOverlay.style.display = 'none';
                // Очищаем форму при закрытии
                resetFormCompletely();
            });
        }
        
        // Открытие модального окна
        if (elements.openBtn && elements.modalOverlay) {
            elements.openBtn.addEventListener('click', function() {
                elements.modalOverlay.style.display = 'flex';
                if (typeof window.initCategoryServiceSelects === 'function') {
                    window.initCategoryServiceSelects();
                }
                // Явно обновляем видимость полей
                if (typeof updateFieldsVisibility === 'function') {
                    updateFieldsVisibility();
                }
            });
        }
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && elements.modalOverlay && elements.modalOverlay.style.display !== 'none') {
                elements.modalOverlay.style.display = 'none';
                // Очищаем форму при закрытии
                resetFormCompletely();
            }
        });
    }

    // === ХЭШТЕГИ ===
    
    /**
     * Инициализирует функциональность хэштегов
     */
    function initHashtags() {
        if (!elements.hashtagsInput || !elements.hashtagsDropdown || !elements.hashtagsContainer) {
            console.log('Hashtags elements not found:', {
                input: !!elements.hashtagsInput,
                dropdown: !!elements.hashtagsDropdown,
                container: !!elements.hashtagsContainer
            });
            return;
        }

        // Получаем все доступные хэштеги из data-атрибута
        const allTagsData = elements.hashtagsContainer.getAttribute('data-all-tags');
        let allTags = [];
        
        try {
            allTags = JSON.parse(allTagsData || '[]');
            console.log('Parsed hashtags:', allTags);
        } catch (e) {
            console.error('Error parsing hashtags data:', e);
            allTags = [];
        }

        // Показ/скрытие dropdown
        const showDropdown = () => {
            console.log('Showing dropdown, tags count:', allTags.length);
            if (allTags.length > 0) {
                elements.hashtagsDropdown.style.display = 'block';
                console.log('Dropdown display set to block');
                populateDropdown(elements.hashtagsInput.value);
            }
        };
        
        const hideDropdown = () => {
            setTimeout(() => {
                elements.hashtagsDropdown.style.display = 'none';
            }, CONFIG.DROPDOWN_HIDE_DELAY);
        };

        // Заполнение dropdown
        function populateDropdown(filter = '') {
            if (!elements.hashtagsDropdown) return;
            
            console.log('Populating dropdown with filter:', filter);
            elements.hashtagsDropdown.innerHTML = '';
            
            const filteredTags = allTags.filter(tag => 
                tag.tag.toLowerCase().includes(filter.toLowerCase())
            );
            
            console.log('Filtered tags:', filteredTags);
            
            filteredTags.forEach(tag => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.textContent = tag.tag;
                item.dataset.tagId = tag.id;
                
                item.addEventListener('click', () => {
                    console.log('Tag clicked:', tag.tag);
                    addHashtag(tag.tag, tag.id);
                    elements.hashtagsInput.value = '';
                    elements.hashtagsDropdown.style.display = 'none';
                });
                
                elements.hashtagsDropdown.appendChild(item);
            });
        }

        // События для показа dropdown
        elements.hashtagsInput.addEventListener('focus', (e) => {
            console.log('Hashtags input focused');
            showDropdown();
        });
        elements.hashtagsInput.addEventListener('input', (e) => {
            console.log('Hashtags input changed:', e.target.value);
            showDropdown();
            populateDropdown(e.target.value);
        });
        elements.hashtagsInput.addEventListener('click', (e) => {
            console.log('Hashtags input clicked');
            showDropdown();
        });
        elements.hashtagsInput.addEventListener('blur', (e) => {
            console.log('Hashtags input blurred');
            hideDropdown();
        });

        // Обработка клавиш
        elements.hashtagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = elements.hashtagsInput.value.trim();
                if (value) {
                    addHashtag(value);
                    elements.hashtagsInput.value = '';
                }
            }
            
            // Удаление последнего хэштега при Backspace
            if (e.key === 'Backspace' && elements.hashtagsInput.value === '') {
                const hashtagChips = elements.hashtagsContainer.querySelectorAll('.hashtag-chip');
                if (hashtagChips.length > 0) {
                    const lastChip = hashtagChips[hashtagChips.length - 1];
                    removeHashtag(lastChip);
                }
            }
        });

        // Клик по dropdown
        elements.hashtagsDropdown.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Добавляет хэштег
     */
    function addHashtag(tagName, tagId = null) {
        // Проверяем, не добавлен ли уже этот хэштег
        const existingChips = elements.hashtagsContainer.querySelectorAll('.hashtag-chip');
        for (let chip of existingChips) {
            if (chip.textContent.trim() === tagName.trim()) {
                return;
            }
        }
        
        const chip = createHashtagChip(tagName, tagId);
        elements.hashtagsContainer.insertBefore(chip, elements.hashtagsInput);
        updateHashtagsHidden();
    }

    /**
     * Создает DOM элемент хэштега
     */
    function createHashtagChip(tagName, tagId = null) {
        const chip = document.createElement('div');
        chip.className = 'hashtag-chip';
        chip.textContent = tagName;
        if (tagId) {
            chip.dataset.tagId = tagId;
        }

        // Кнопка удаления
        const removeBtn = document.createElement('span');
        removeBtn.className = 'hashtag-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => removeHashtag(chip));
        
        chip.appendChild(removeBtn);
        return chip;
    }

    /**
     * Удаляет хэштег
     */
    function removeHashtag(chip) {
        chip.remove();
        updateHashtagsHidden();
    }

    /**
     * Обновляет скрытое поле с хэштегами
     */
    function updateHashtagsHidden() {
        const chips = elements.hashtagsContainer.querySelectorAll('.hashtag-chip');
        const tagIds = Array.from(chips).map(chip => chip.dataset.tagId || chip.textContent.trim());
        elements.hashtagsHidden.value = tagIds.join(',');
    }

    // === ИСПОЛНИТЕЛИ ===
    
    /**
     * Инициализирует функционал работы с исполнителями
     */
    function initPerformers() {
        if (!elements.performersInput || !elements.performersDropdown) {
            return;
        }

        // Показ/скрытие dropdown
        const showDropdown = () => {
            elements.performersDropdown.style.display = 'block';
        };
        const hideDropdown = () => {
            setTimeout(() => {
                elements.performersDropdown.style.display = 'none';
            }, CONFIG.DROPDOWN_HIDE_DELAY);
        };

        // События для показа dropdown
        elements.performersInput.addEventListener('focus', showDropdown);
        elements.performersInput.addEventListener('input', showDropdown);
        elements.performersInput.addEventListener('click', showDropdown);
        elements.performersInput.addEventListener('blur', hideDropdown);

        // Обработка клавиш
        elements.performersInput.addEventListener('keydown', handlePerformerKeydown);

        // Клик по dropdown
        elements.performersDropdown.addEventListener('mousedown', handleDropdownClick);

        // Спиннер при вводе
        elements.performersInput.addEventListener('input', () => {
            handleSpinnerTimeout('performer', elements.performersInput);
        });
    }

    /**
     * Обрабатывает нажатие клавиш в поле исполнителей
     */
    function handlePerformerKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = elements.performersInput.value.trim();
            if (value) {
                addPerformerTag(value);
                elements.performersInput.value = '';
            }
        }
        
        // Удаление последнего тега при Backspace
        if (e.key === 'Backspace' && elements.performersInput.value === '') {
            if (state.performerTags.length > 0) {
                const lastTag = state.performerTags[state.performerTags.length - 1];
                removePerformerTag(lastTag);
            }
        }
    }

    /**
     * Обрабатывает клик по dropdown
     */
    function handleDropdownClick(e) {
        if (e.target.classList.contains('need-performer')) {
            addPerformerTag('Need a performer');
            elements.performersInput.value = '';
            elements.performersDropdown.style.display = 'none';
        }
    }

    /**
     * Добавляет тег исполнителя
     */
    function addPerformerTag(name) {
        if (state.performerTags.includes(name)) return;
        
        state.performerTags.push(name);
        
        const tag = createPerformerTag(name);
        if (elements.performersList) {
            elements.performersList.appendChild(tag);
        }
    }

    /**
     * Создает DOM элемент тега исполнителя
     */
    function createPerformerTag(name) {
        const tag = document.createElement('div');
        tag.className = 'performer-tag' + (name === 'Need a performer' ? ' need-performer' : '');
        tag.textContent = name;

        // Стили для специального тега
        if (name === 'Need a performer') {
            Object.assign(tag.style, {
                background: '#f0f0f0',
                color: '#222',
                borderRadius: '15px',
                fontStyle: 'normal',
                padding: '5px 12px'
            });
        }

        // Кнопка удаления
        const removeBtn = document.createElement('span');
        removeBtn.className = 'remove-tag';
        removeBtn.textContent = '×';
        removeBtn.style.cursor = 'pointer';
        removeBtn.onclick = () => removePerformerTag(name);

        tag.appendChild(removeBtn);
        return tag;
    }

    /**
     * Удаляет тег исполнителя
     */
    function removePerformerTag(name) {
        // Удаляем из состояния
        state.performerTags = state.performerTags.filter(tag => tag !== name);
        
        // Удаляем из DOM
        if (elements.performersList) {
            Array.from(elements.performersList.children).forEach(child => {
                if (child.textContent.replace('×', '').trim() === name) {
                    elements.performersList.removeChild(child);
                }
            });
        }
    }

    // === СПИННЕРЫ ===
    
    /**
     * Инициализирует спиннеры для полей ввода
     */
    function initSpinners() {
        // Спиннер для поля исполнителей
        if (elements.performersInput) {
            elements.performersInput.addEventListener('input', () => {
                handleSpinnerTimeout('performer', elements.performersInput);
            });
        }
    }

    // === УПРАВЛЕНИЕ ПОЛЯМИ ФОРМЫ ===
    
    /**
     * Инициализирует управление расширенными полями
     */
    function initFieldsManagement() {
        if (!elements.publishIn) {
            return;
        }

        // Слушатель изменения типа публикации
        elements.publishIn.addEventListener('change', () => {
            updateFieldsVisibility();
        });

        // Кнопка расширения
        if (elements.extendBtn) {
            elements.extendBtn.addEventListener('click', toggleExtendedFields);
        }

        // Инициализация при загрузке - скрываем все поля кроме типа задачи
        updateFieldsVisibility();
    }

    /**
     * Переключает видимость расширенных полей
     */
    function toggleExtendedFields() {
        if (!elements.extendedFields || !elements.extendToggle) return;
        
        state.extendedVisible = !state.extendedVisible;
        
        if (state.extendedVisible) {
            elements.extendedFields.style.display = '';
            elements.extendToggle.classList.add('extended');
        } else {
            elements.extendedFields.style.display = 'none';
            elements.extendToggle.classList.remove('extended');
        }
    }

    /**
     * Обновляет видимость полей в зависимости от типа
     */
    function updateFieldsVisibility() {
        if (!elements.publishIn) return;
        
        const selectedValue = elements.publishIn.value;
        
        // Если тип не выбран или пустой
        if (!selectedValue || selectedValue === '') {
            // Скрываем все поля кроме form-group-type_of_task
            Object.values(FIELD_IDS).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            
            // ПОКАЗЫВАЕМ ТОЛЬКО БЛОК ТИПА ЗАДАЧИ
            const typeOfTaskEl = document.getElementById(FIELD_IDS.formGroupTypeOfTask);
            if (typeOfTaskEl) typeOfTaskEl.style.display = '';
            if (elements.timeSlotGroup) {
                elements.timeSlotGroup.style.display = 'none';
            }
            if (elements.extendedFields) {
                elements.extendedFields.style.display = 'none';
            }
            if (elements.formActions) {
                elements.formActions.style.display = 'none';
            }
            
            return;
        }
        
        // Определяем тип с учетом регистра
        let publishType = TYPE_MAP[selectedValue];
        if (!publishType) {
            publishType = selectedValue.toLowerCase();
        }
        
        handleTypeFields(publishType);
        updateOfflineFields();
    }

    // === OFFLINE ПОЛЯ ===
    
    /**
     * Инициализирует управление offline полями
     */
    function initOfflineFields() {
        if (elements.offlineCheckbox && elements.postCodeGroup && elements.streetDetailsGroup) {
            elements.offlineCheckbox.addEventListener('change', updateOfflineFields);
            updateOfflineFields(); // Скрыть по умолчанию
        }
    }

    /**
     * Обновляет видимость offline полей
     */
    function updateOfflineFields() {
        if (!elements.offlineCheckbox || !elements.postCodeGroup || !elements.streetDetailsGroup) return;
        
        const display = elements.offlineCheckbox.checked ? '' : 'none';
        elements.postCodeGroup.style.display = display;
        elements.streetDetailsGroup.style.display = display;
    }

    // === ФОРМА ===
    
    /**
     * Инициализирует обработчики формы
     */
    function initForm() {
        if (elements.form) {
            elements.form.addEventListener('submit', (e) => {
                e.preventDefault();
                // Форма обрабатывается через кнопки Save/Publish
            });
            
            // Добавляем обработчик для кнопки Save
            const saveButton = elements.form.querySelector('button[type="button"].btn.btn-secondary');
            if (saveButton) {
                saveButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleFormSubmission(saveButton, false); // false = save, not publish
                });
            }
        }
    }

    /**
     * Управляет отображением блока time_slot_group
     */
    function updateTimeSlotGroupVisibility() {
        if (!elements.timeSlotGroup || !elements.publishIn) return;
        
        const publishType = TYPE_MAP[elements.publishIn.value] || elements.publishIn.value;
        
        if (publishType === 'orders') {
            elements.timeSlotGroup.style.display = 'block';
        } else {
            elements.timeSlotGroup.style.display = 'none';
        }
    }

    // === ИНИЦИАЛИЗАЦИЯ ===
    
    /**
     * Главная функция инициализации
     */
    function init() {
        initModal();
        initDragDrop();
        initHashtags();
        initPerformers();
        initSpinners();
        initFieldsManagement();
        initOfflineFields();
        initForm();
        
        // Инициализация отображения блока time_slot_group при загрузке и изменении select
        if (elements.publishIn) {
            elements.publishIn.addEventListener('change', updateTimeSlotGroupVisibility);
            updateTimeSlotGroupVisibility(); // при загрузке
        }
    }

    /**
     * Полная очистка формы
     */
    function resetFormCompletely() {
        // Сброс основной формы
        if (elements.form) {
            elements.form.reset();
        }
        
        // Очистка исполнителей
        state.performerTags = [];
        if (elements.performersList) {
            elements.performersList.innerHTML = '';
        }
        
        // Очистка хэштегов
        if (elements.hashtagsContainer) {
            elements.hashtagsContainer.innerHTML = '<input type="text" id="hashtags-input" placeholder="Start typing tag..." autocomplete="off" style="border: none; outline: none; flex: 1; min-width: 120px; background: transparent;">';
            // Переинициализируем хэштеги после очистки
            initHashtags();
        }
        
        // Очистка скрытого поля хэштегов
        if (elements.hashtagsHidden) {
            elements.hashtagsHidden.value = '';
        }
        
        // Очистка файлов
        if (elements.photosInput) {
            elements.photosInput.value = '';
        }
        
        // Очистка поля ссылки на фото
        if (elements.photosLink) {
            elements.photosLink.value = '';
        }
        
        // Сброс всех select элементов
        const selects = elements.form.querySelectorAll('select');
        selects.forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Сброс всех checkbox элементов
        const checkboxes = elements.form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Скрытие расширенных полей
        if (elements.extendedFields) {
            elements.extendedFields.style.display = 'none';
        }
        
        // Скрытие блока time slot
        if (elements.timeSlotGroup) {
            elements.timeSlotGroup.style.display = 'none';
        }
        
        // Скрытие всех полей формы кроме типа задачи
        Object.values(FIELD_IDS).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        
        // Скрытие кнопок действий
        if (elements.formActions) {
            elements.formActions.style.display = 'none';
        }
        

        
        // Сброс отображения полей
        if (typeof updateFieldsVisibility === 'function') {
            updateFieldsVisibility();
        }
    }

    // Запуск инициализации
    init();
});

// === ФИЛЬТРАЦИЯ КАТЕГОРИЙ И СЕРВИСОВ ===
let serviceOptionsBackup = null;

function filterServicesByCategory(catId) {
    const serviceSelect = document.getElementById('service');
    if (!serviceSelect) {
        return;
    }
    // Восстанавливаем все опции из бэкапа
    serviceSelect.innerHTML = '';
    let count = 0;
    serviceOptionsBackup.forEach(opt => {
        const dataCat = opt.getAttribute('data-category');
        if (!dataCat || String(dataCat) === String(catId)) {
            serviceSelect.appendChild(opt.cloneNode(true));
            count++;
        }
    });
}

function initCategoryServiceFiltering() {
    const categorySelect = document.getElementById('category');
    const serviceSelect = document.getElementById('service');
    if (!categorySelect || !serviceSelect) {
        return;
    }
    // Делаем бэкап всех опций (включая дефолтную) — только если еще не делали!
    if (!serviceOptionsBackup || serviceOptionsBackup.length <= 1) {
        serviceOptionsBackup = Array.from(serviceSelect.options);
    }
    // Не меняем выбранную категорию, если она пустая (оставляем -- Select category --)
    let initialCat = categorySelect.value;
    filterServicesByCategory(initialCat); // если пусто — фильтруем по пустому
    categorySelect.onchange = function() {
        filterServicesByCategory(this.value);
    };
}

// Глобальная функция для инициализации фильтрации категорий и сервисов
window.initCategoryServiceSelects = function() {
    initCategoryServiceFiltering();
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.modal-overlay') && document.querySelector('.modal-overlay').style.display !== 'none') {
        initCategoryServiceFiltering();
    }
    const modal = document.querySelector('.modal-overlay');
    if (!modal) return;
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style') {
                if (modal.style.display !== 'none') {
                    initCategoryServiceFiltering();
                }
            }
        });
    });
    observer.observe(modal, { attributes: true });
}); 