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
        '6': 'test_type', // если потребуется
    };

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
        closeBtn: document.querySelector('.close-btn'),
        modalOverlay: document.querySelector('.modal-overlay'),
        openBtn: document.querySelector('.fixed_circle.sub.sub2'),
        
        // Форма
        form: document.querySelector('.project-form'),
        publishIn: document.getElementById('publish-in'),
        extendedFields: document.getElementById('form-extended-fields'),
        extendToggle: document.getElementById('form-extend-toggle'),
        extendBtn: document.querySelector('.extend-btn'),
        
        // Загрузка файлов
        dropZone: document.querySelector('.file-upload-area'),
        fileInput: document.querySelector('#photos'),
        
        // Исполнители
        performersInput: document.querySelector('#performers'),
        performersList: document.querySelector('.performers-list'),
        performersDropdown: document.getElementById('performers-dropdown'),
        
        // Клиент
        clientInput: document.getElementById('client'),
        
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
            performer: null,
            client: null
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
            console.log('Drop zone not found');
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
        console.log('Files dropped:', files.length);
        // Здесь добавить логику обработки файлов
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
            var msg = document.createElement('div');
            msg.className = 'save-success-message';
            
            if (data.success) {
                msg.textContent = isPublish ? 'Published successfully!' : 'Saved successfully!';
                msg.style.color = '#10b981';
                
                // Если это публикация, можно закрыть модальное окно
                if (isPublish && elements.modalOverlay) {
                    setTimeout(() => {
                        elements.modalOverlay.style.display = 'none';
                        // Очищаем форму
                        form.reset();
                        state.performerTags = [];
                        if (elements.performersList) {
                            elements.performersList.innerHTML = '';
                        }
                    }, 2000);
                }
            } else {
                msg.textContent = data.error || 'Error occurred!';
                msg.style.color = '#b91c1c';
            }
            
            button.parentNode.appendChild(msg);
            setTimeout(function() {
                msg.remove();
            }, 3000);
        })
        .catch(function(error) {
            spinner.remove();
            var msg = document.createElement('div');
            msg.className = 'save-success-message';
            msg.style.color = '#b91c1c';
            msg.textContent = 'Error: ' + error.message;
            button.parentNode.appendChild(msg);
            setTimeout(function() {
                msg.remove();
            }, 3000);
        });
    }

    // === МОДАЛЬНОЕ ОКНО ===
    
    /**
     * Инициализирует обработчики модального окна
     */
    function initModal() {
    
        
        // Закрытие модального окна
        if (elements.closeBtn && elements.modalOverlay) {
            console.log('Adding close button event');
            elements.closeBtn.addEventListener('click', () => {
                console.log('Close button clicked');
                elements.modalOverlay.style.display = 'none';
            });
        } else {
            console.log('Close button or modal overlay not found');
        }
        
        // Открытие модального окна
        if (elements.openBtn && elements.modalOverlay) {
            console.log('Adding open button event');
            elements.openBtn.addEventListener('click', function() {
                console.log('Open button clicked');
                elements.modalOverlay.style.display = 'flex';
                // Логируем, что лежит в window.initCategoryServiceSelects
                console.log('window.initCategoryServiceSelects:', window.initCategoryServiceSelects);
                if (typeof window.initCategoryServiceSelects === 'function') {
                    window.initCategoryServiceSelects();
                }
            });
        } else {
            console.log('Open button or modal overlay not found');
        }
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && elements.modalOverlay && elements.modalOverlay.style.display !== 'none') {
       
                elements.modalOverlay.style.display = 'none';
            }
        });
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

        
        // Спиннер для поля клиента
        if (elements.clientInput) {
            elements.clientInput.addEventListener('input', () => {
                handleSpinnerTimeout('client', elements.clientInput);
            });
        }
    }

    // === УПРАВЛЕНИЕ ПОЛЯМИ ФОРМЫ ===
    
    /**
     * Инициализирует управление расширенными полями
     */
    function initFieldsManagement() {
        if (!elements.publishIn) {
            console.log('Publish In element not found');
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

        // Инициализация при загрузке
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
     * Обновляет видимость полей в зависимости от типа публикации
     */
    function updateFieldsVisibility() {
        if (!elements.publishIn) return;
        
        // Получаем строковый тип публикации по value
        const publishType = TYPE_MAP[elements.publishIn.value] || elements.publishIn.value;

        
        // Сбрасываем состояние расширенных полей
        state.extendedVisible = false;
        
        switch (publishType) {
            case 'advertising':
                handleAdvertisingFields();
                break;
            case 'tender':
                handleTenderFields();
                break;
            case 'my':
                handleMyListFields();
                break;
            case 'orders':
                handleOrdersFields();
                break;
            default:
                handleDefaultFields();
        }
        
        // Обновляем offline поля
        updateOfflineFields();
    }

    /**
     * Настройка полей для рекламы
     */
    function handleAdvertisingFields() {

        const photoElements = getPhotoElements();
        
        // Скрываем расширенные поля и кнопку
        if (elements.extendedFields) elements.extendedFields.style.display = 'none';
        if (elements.extendToggle) elements.extendToggle.style.display = 'none';
        
        // Настройка фото: только загрузка
        if (photoElements.link) photoElements.link.style.display = 'none';
        if (photoElements.orText) photoElements.orText.style.display = 'none';
        if (photoElements.upload) photoElements.upload.style.display = '';
        
        // Показываем только нужные поля
        showField('hashtags');
        
        // Скрываем остальные
        hideFields(['client', 'documents', 'performers', 'status', 'project-included']);
        hideCheckboxes();
        hideField('comment');
        hideDateFields();
        
        showField('form-actions');
    }

    /**
     * Настройка полей для тендера
     */
    function handleTenderFields() {
   
        const photoElements = getPhotoElements();
        
        // Показываем расширенные поля, скрываем кнопку
        if (elements.extendedFields) elements.extendedFields.style.display = '';
        if (elements.extendToggle) elements.extendToggle.style.display = 'none';
        state.extendedVisible = true;
        
        // Настройка фото: только ссылка
        if (photoElements.link) photoElements.link.style.display = '';
        if (photoElements.orText) photoElements.orText.style.display = 'none';
        if (photoElements.upload) photoElements.upload.style.display = 'none';
        
        // Показываем нужные поля
        showFields(['hashtags', 'client', 'documents', 'performers', 'status', 'project-included']);
        showCheckboxes();
        hideField('comment');
        hideDateFields();
        showField('form-actions');
    }

    /**
     * Настройка полей для "Мой список"
     */
    function handleMyListFields() {

        const photoElements = getPhotoElements();
        
        // Скрываем расширенные поля и показываем кнопку
        if (elements.extendedFields) elements.extendedFields.style.display = 'none';
        if (elements.extendToggle) {
            elements.extendToggle.style.display = 'flex';
            elements.extendToggle.classList.remove('extended');
        }
        state.extendedVisible = false;
        
        // Показываем все элементы фото
        if (photoElements.link) photoElements.link.style.display = '';
        if (photoElements.orText) photoElements.orText.style.display = '';
        if (photoElements.upload) photoElements.upload.style.display = '';
        
        // Показываем все основные поля
        showAllFormGroups();
        showFields(['hashtags', 'client', 'documents', 'performers', 'status', 'project-included']);
        showCheckboxes();
        showField('comment');
        showDateFields();
        showField('form-actions');
    }

    /**
     * Настройка полей для заказов (time slot)
     */
    function handleOrdersFields() {

        
        // Показываем только time-slot-group
        if (elements.timeSlotGroup) {
            elements.timeSlotGroup.style.display = '';
        }
        
        // Скрываем все form-group, кроме Will published in
        document.querySelectorAll('.form-group').forEach(group => {
            if (group !== elements.publishIn?.parentNode && 
                !elements.timeSlotGroup?.contains(group)) {
                group.style.display = 'none';
            } else {
                group.style.display = '';
            }
        });
        
        // Скрываем расширенные поля
        if (elements.extendedFields) elements.extendedFields.style.display = 'none';
        if (elements.extendToggle) elements.extendToggle.style.display = 'none';
        state.extendedVisible = false;
        
        showField('form-actions');
    }

    /**
     * Настройка полей по умолчанию
     */
    function handleDefaultFields() {

        
        // Скрываем time-slot-group
        if (elements.timeSlotGroup) {
            elements.timeSlotGroup.style.display = 'none';
        }
        
        // Показываем все form-group
        showAllFormGroups();
    }

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЯМИ ===
    
    /**
     * Получает элементы фотографий
     */
    function getPhotoElements() {
        return {
            link: document.getElementById('photos-link'),
            upload: document.getElementById('photos-upload'),
            orText: document.getElementById('photos-link')?.nextElementSibling
        };
    }

    /**
     * Показывает поле по ID
     */
    function showField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            const group = fieldId === 'form-actions' ? field : field.parentNode;
            group.style.display = '';
        }
    }

    /**
     * Скрывает поле по ID
     */
    function hideField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            const group = fieldId === 'form-actions' ? field : field.parentNode;
            group.style.display = 'none';
        }
    }

    /**
     * Показывает несколько полей
     */
    function showFields(fieldIds) {
        fieldIds.forEach(showField);
    }

    /**
     * Скрывает несколько полей
     */
    function hideFields(fieldIds) {
        fieldIds.forEach(hideField);
    }

    /**
     * Показывает все form-group
     */
    function showAllFormGroups() {
        document.querySelectorAll('.form-group').forEach(group => {
            if (group.id !== 'time-slot-group') {
                group.style.display = '';
            }
        });
    }

    /**
     * Показывает чекбоксы
     */
    function showCheckboxes() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]#disclose-name');
        checkboxes.forEach(cb => {
            if (cb.parentNode) cb.parentNode.style.display = '';
        });
    }

    /**
     * Скрывает чекбоксы
     */
    function hideCheckboxes() {
        const privateCheckbox = document.getElementById('private');
        const checkboxes = document.querySelectorAll('input[type="checkbox"]#disclose-name');
        
        if (privateCheckbox && privateCheckbox.parentNode) {
            privateCheckbox.parentNode.style.display = 'none';
        }
        checkboxes.forEach(cb => {
            if (cb.parentNode) cb.parentNode.style.display = 'none';
        });
    }

    /**
     * Показывает поля дат
     */
    function showDateFields() {
        const dateStart = document.getElementById('date-start');
        const dateEnd = document.getElementById('date-end');
        if (dateStart && dateEnd) {
            const formRow = dateStart.parentNode?.parentNode;
            if (formRow) formRow.style.display = '';
        }
    }

    /**
     * Скрывает поля дат
     */
    function hideDateFields() {
        const dateStart = document.getElementById('date-start');
        if (dateStart) {
            const formRow = dateStart.parentNode?.parentNode;
            if (formRow) formRow.style.display = 'none';
        }
    }

    // === OFFLINE ПОЛЯ ===
    
    /**
     * Инициализирует управление offline полями
     */
    function initOfflineFields() {
        if (elements.offlineCheckbox && elements.postCodeGroup && elements.streetDetailsGroup) {
           
            elements.offlineCheckbox.addEventListener('change', updateOfflineFields);
            updateOfflineFields(); // Скрыть по умолчанию
        } else {
            console.log('Offline elements not found');
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
            console.log('Initializing form');
            elements.form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Form submitted');
                // Форма обрабатывается через кнопки Save/Publish
            });
        } else {
            console.log('Form element not found');
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

    // Запуск инициализации
    init();
});