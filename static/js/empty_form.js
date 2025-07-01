document.addEventListener('DOMContentLoaded', () => {
    // === КОНФИГУРАЦИЯ ===
    const CONFIG = {
        SPINNER_DELAY: 1000,
        DROPDOWN_HIDE_DELAY: 150
    };

    // === ЭЛЕМЕНТЫ DOM ===
    const elements = {
        // Модальное окно
        closeBtn: document.querySelector('.close-btn'),
        modalOverlay: document.querySelector('.modal-overlay'),
        
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

    /**
     * Предотвращает поведение по умолчанию для событий
     */
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Управляет спиннером для input полей
     */
    function manageInputSpinner(input, show = true) {
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

    // === МОДАЛЬНОЕ ОКНО ===
    
    /**
     * Инициализирует обработчики модального окна
     */
    function initModal() {
        if (elements.closeBtn && elements.modalOverlay) {
            elements.closeBtn.addEventListener('click', () => {
                elements.modalOverlay.style.display = 'none';
            });
        }
    }

    // === DRAG & DROP ===
    
    /**
     * Инициализирует drag & drop для файлов
     */
    function initDragDrop() {
        if (!elements.dropZone) return;

        // Добавляем обработчики для всех событий drag & drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            elements.dropZone.addEventListener(eventName, preventDefaults, false);
        });

        // Обработка drop события
        elements.dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            handleFiles(files);
        }, false);
    }

    /**
     * Обрабатывает загруженные файлы
     */
    function handleFiles(files) {
        console.log('Files uploaded:', files);
        // Здесь можно добавить логику обработки файлов
    }

    // === ИСПОЛНИТЕЛИ ===
    
    /**
     * Инициализирует функционал работы с исполнителями
     */
    function initPerformers() {
        if (!elements.performersInput || !elements.performersDropdown) return;

        // Показ/скрытие dropdown
        const showDropdown = () => elements.performersDropdown.style.display = 'block';
        const hideDropdown = () => {
            setTimeout(() => elements.performersDropdown.style.display = 'none', CONFIG.DROPDOWN_HIDE_DELAY);
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
        elements.performersList.appendChild(tag);
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
        Array.from(elements.performersList.children).forEach(child => {
            if (child.textContent.replace('×', '').trim() === name) {
                elements.performersList.removeChild(child);
            }
        });
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
        if (!elements.publishIn) return;

        // Слушатель изменения типа публикации
        elements.publishIn.addEventListener('change', updateFieldsVisibility);

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
        const publishType = elements.publishIn.value;
        
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
        elements.extendedFields.style.display = 'none';
        elements.extendToggle.style.display = 'none';
        
        // Настройка фото: только загрузка
        photoElements.link.style.display = 'none';
        if (photoElements.orText) photoElements.orText.style.display = 'none';
        photoElements.upload.style.display = '';
        
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
        elements.extendedFields.style.display = '';
        elements.extendToggle.style.display = 'none';
        state.extendedVisible = true;
        
        // Настройка фото: только ссылка
        photoElements.link.style.display = '';
        if (photoElements.orText) photoElements.orText.style.display = 'none';
        photoElements.upload.style.display = 'none';
        
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
        
        // ИСПРАВЛЕНИЕ: Скрываем расширенные поля и показываем кнопку
        elements.extendedFields.style.display = 'none';
        elements.extendToggle.style.display = 'flex';
        elements.extendToggle.classList.remove('extended');
        state.extendedVisible = false;
        
        // Показываем все элементы фото
        photoElements.link.style.display = '';
        if (photoElements.orText) photoElements.orText.style.display = '';
        photoElements.upload.style.display = '';
        
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
            if (group !== elements.publishIn.parentNode && 
                !elements.timeSlotGroup?.contains(group)) {
                group.style.display = 'none';
            } else {
                group.style.display = '';
            }
        });
        
        // Скрываем расширенные поля
        elements.extendedFields.style.display = 'none';
        elements.extendToggle.style.display = 'none';
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
        checkboxes.forEach(cb => cb.parentNode.style.display = '');
    }

    /**
     * Скрывает чекбоксы
     */
    function hideCheckboxes() {
        const privateCheckbox = document.getElementById('private');
        const checkboxes = document.querySelectorAll('input[type="checkbox"]#disclose-name');
        
        if (privateCheckbox) privateCheckbox.parentNode.style.display = 'none';
        checkboxes.forEach(cb => cb.parentNode.style.display = 'none');
    }

    /**
     * Показывает поля дат
     */
    function showDateFields() {
        const dateStart = document.getElementById('date-start');
        const dateEnd = document.getElementById('date-end');
        if (dateStart && dateEnd) {
            const formRow = dateStart.parentNode.parentNode;
            formRow.style.display = '';
        }
    }

    /**
     * Скрывает поля дат
     */
    function hideDateFields() {
        const dateStart = document.getElementById('date-start');
        if (dateStart) {
            const formRow = dateStart.parentNode.parentNode;
            formRow.style.display = 'none';
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
                console.log('Form submitted');
                // Здесь можно добавить логику отправки формы
            });
        }
    }

    // === Управление отображением блока time_slot_group ===
    function updateTimeSlotGroupVisibility() {
        if (!elements.timeSlotGroup) return;
        const value = elements.publishIn.value;
        if (value === 'orders') {
            elements.timeSlotGroup.style.display = '';
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
        
        console.log('Form initialized successfully');
    }

    // Запуск инициализации
    init();

    // Кнопка для открытия формы
    const openBtn = document.querySelector('.fixed_circle.sub.sub2');
    // Модальное окно
    const modal = document.querySelector('.modal-overlay');
    // Кнопка закрытия
    const closeBtn = document.querySelector('.modal-overlay .close-btn');

    if (openBtn && modal) {
        openBtn.addEventListener('click', function() {
            modal.style.display = 'flex'; // или 'block', если у вас не flex
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Добавляю обработку клавиши Escape для закрытия модального окна
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display !== 'none') {
            modal.style.display = 'none';
        }
    });

    // Инициализация отображения блока time_slot_group при загрузке и изменении select
    if (elements.publishIn) {
        elements.publishIn.addEventListener('change', updateTimeSlotGroupVisibility);
        updateTimeSlotGroupVisibility(); // при загрузке
    }
});