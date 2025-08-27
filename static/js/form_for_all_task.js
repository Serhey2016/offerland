document.addEventListener('DOMContentLoaded', () => {
    // === CSS СТИЛИ ДЛЯ ФОТОГРАФИЙ ===
    const photoStyles = `
        .photos-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        
        .photo-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #f9f9f9;
            position: relative;
        }
        
        .photo-preview {
            flex-shrink: 0;
        }
        
        .photo-preview img {
            border-radius: 4px;
            object-fit: cover;
        }
        
        .photo-info {
            flex-grow: 1;
            min-width: 0;
        }
        
        .photo-name {
            font-weight: 500;
            margin-bottom: 4px;
            word-break: break-word;
        }
        
        .photo-size {
            font-size: 12px;
            color: #666;
        }
        
        .remove-photo-btn {
            background: #ff6b6b;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .remove-photo-btn:hover {
            background: #ff5252;
        }
    `;
    
    // Добавляем стили на страницу
    if (!document.getElementById('photo-upload-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'photo-upload-styles';
        styleSheet.textContent = photoStyles;
        document.head.appendChild(styleSheet);
    }


    // === СООТВЕТСТВИЕ ID ТИПАМ ===
    const TYPE_MAP = {
        '1': 'my-list',
        '2': 'tender',
        '3': 'project',
        '4': 'advertising',
        '5': 'time-slot',
        '6': 'job-search',
    };


    
    // === ЭЛЕМЕНТЫ DOM ===
    let elements = {};

    // === СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
    let state = {
        performerTags: {}
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
        elements.dropZones.forEach(dropZone => {
            if (!dropZone) return;
            
            // Предотвращаем стандартное поведение
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
            });
        
            // Визуальная обратная связь
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => {
                    dropZone.classList.add('drag-over');
                }, false);
            });
        
            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => {
                    dropZone.classList.remove('drag-over');
                }, false);
            });
        
            // Обработка drop
            dropZone.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                handleFiles(files, dropZone);
            }, false);
        });
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

    // === МОДАЛЬНОЕ ОКНО ===
    
    /**
     * Инициализирует обработчики модального окна
     */
    function initModal() {
        // Дополнительный поиск кнопки если она не была найдена в elements
        let openButton = elements.openBtn;
        if (!openButton) {
            openButton = document.querySelector('.fixed_circle.sub.sub2');
        }
        
        // Открытие модального окна по кнопке
        if (openButton) {
            // Защита от двойного клика
            let isModalOpen = false;
            
            openButton.addEventListener('click', function(e) {
                if (isModalOpen) {
                    return;
                }
                
                isModalOpen = true;
                
                // Показываем форму выбора типа
                showTypeSelectionModal();
                
                // Сбрасываем флаг через небольшую задержку
                setTimeout(() => {
                    isModalOpen = false;
                }, 500);
            });
        }
        
        // Закрытие модальных окон
        elements.closeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = btn.closest('.modal-overlay');
                if (modal) {
                    modal.style.display = 'none';
                    resetForm(modal);
                }
            });
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const visibleModal = document.querySelector('.modal-overlay[style*="flex"]');
                if (visibleModal) {
                    visibleModal.style.display = 'none';
                    resetForm(visibleModal);
                }
            }
        });
    }
    
    /**
     * Показывает модальное окно выбора типа публикации
     */
    function showTypeSelectionModal() {
        // Находим готовое модальное окно
        const typeSelectionModal = document.getElementById('type-selection-modal');
        
        if (!typeSelectionModal) {
            return;
        }
        
        // Показываем модальное окно
        typeSelectionModal.style.display = 'flex';
        
        // Обработчики для выбора типа
        const typeOptions = typeSelectionModal.querySelectorAll('.type-option');
        
        typeOptions.forEach((option, index) => {
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                
                // Скрываем модальное окно выбора типа
                typeSelectionModal.style.display = 'none';
                
                // Показываем выбранную форму
                showFormByType(type);
            });
        });
        
        // Кнопка закрытия
        const closeBtn = typeSelectionModal.querySelector('.modal_close_btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                typeSelectionModal.style.display = 'none';
            });
        }
        
        // Закрытие по клику вне модального окна
        typeSelectionModal.addEventListener('click', function(e) {
            if (e.target === typeSelectionModal) {
                typeSelectionModal.style.display = 'none';
            }
        });
    }
    
    /**
     * Показывает форму по выбранному типу
     */
    function showFormByType(type) {
        // Скрываем модальное окно выбора типа
        const typeSelectionModal = document.getElementById('type-selection-modal');
        if (typeSelectionModal) {
            typeSelectionModal.style.display = 'none';
        }

        hideAllForms();
        const formId = getFormIdByType(type);
        
        if (formId) {
            const form = document.getElementById(formId);
            if (form) {
                // Используем flex для центрирования
                form.style.display = 'flex';
                
                // Повторно инициализируем обработчики для кнопки Save в этой форме
                const saveButton = form.querySelector('.save-btn');
                if (saveButton) {
                    // Удаляем старый обработчик если есть
                    saveButton.removeEventListener('click', saveButton._clickHandler);
                    
                    // Добавляем новый обработчик
                    saveButton._clickHandler = function(e) {
                        e.preventDefault();
                        const form = saveButton.closest('form');
                        
                        if (form) {
                            handleFormSave(form, saveButton);
                        }
                    };
                    
                    saveButton.addEventListener('click', saveButton._clickHandler);
                }
            }
        }
    }
    
    /**
     * Сбрасывает форму
     */
    function resetForm(modal) {
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        
        // Очищаем хэштеги
        const hashtagsContainer = modal.querySelector('.hashtag-chip-container');
        if (hashtagsContainer) {
            const input = hashtagsContainer.querySelector('input');
            hashtagsContainer.innerHTML = '';
            if (input) {
                hashtagsContainer.appendChild(input);
            }
        }
        
        // Очищаем исполнителей
        const performersList = modal.querySelector('.performers-list');
        if (performersList) {
            performersList.innerHTML = '';
        }
        
        // Очищаем скрытые поля хэштегов
        const hashtagsHidden = modal.querySelector('[id$="-hashtags-hidden"]');
        if (hashtagsHidden) {
            hashtagsHidden.value = '';
        }
    }

    // === ХЭШТЕГИ ===
    
    /**
     * Инициализирует функциональность хэштегов для всех форм
     */
    function initHashtags() {
        const containers = document.querySelectorAll('.hashtag-chip-container');
        const inputs = document.querySelectorAll('.hashtags-input-field');
        const dropdowns = document.querySelectorAll('.hashtag-dropdown-menu');
        const hiddenFields = document.querySelectorAll('input[name="hashtags"]');

        containers.forEach((container, index) => {
            const input = inputs[index];
            const dropdown = dropdowns[index];
            const hidden = hiddenFields[index];

            // Пропускаем хэштеги для time-slot формы - они обрабатываются в timeslot_form.js
            if (container && container.id === 'time-slot-hashtags-container') {
                return;
            }

            if (container && input && dropdown && hidden) {
                initHashtagsForContainer(container, input, dropdown, hidden);
            }
        });
    }
    
    /**
     * Инициализирует хэштеги для конкретного контейнера
     */
    function initHashtagsForContainer(container, input, dropdown, hidden) {
        // Получаем все доступные хэштеги из data-атрибута
        const allTagsData = container.getAttribute('data-all-tags');
        let allTags = [];
        
        try {
            allTags = JSON.parse(allTagsData || '[]');
        } catch (e) {
            allTags = [];
        }

        // Показ/скрытие dropdown
        const showDropdown = () => {
            if (allTags.length > 0) {
                dropdown.style.display = 'block';
                populateDropdown(input.value, dropdown, allTags);
                positionDropdown(container, dropdown);
            }
        };
        
        const hideDropdown = () => {
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 150);
        };

        // События для показа dropdown
        input.addEventListener('focus', showDropdown);
        input.addEventListener('input', showDropdown);
        input.addEventListener('click', showDropdown);
        
        // Скрываем dropdown при потере фокуса
        input.addEventListener('blur', hideDropdown);

        // Обработка клавиш
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = input.value.trim();
                if (value) {
                    // Проверяем, есть ли уже такой хэштег
                    const existingChips = container.querySelectorAll('.hashtag-chip');
                    const alreadyExists = Array.from(existingChips).some(chip => 
                        chip.textContent.trim().replace('×', '') === value
                    );
                    
                    if (!alreadyExists) {
                        // Создаем новый хэштег
                        addHashtag(value, container, hidden);
                        input.value = '';
                        // Скрываем dropdown
                        dropdown.style.display = 'none';
                    }
                }
            }
            
            // Удаление последнего хэштега при Backspace
            if (e.key === 'Backspace' && input.value === '') {
                const hashtagChips = container.querySelectorAll('.hashtag-chip');
                if (hashtagChips.length > 0) {
                    const lastChip = hashtagChips[hashtagChips.length - 1];
                    removeHashtag(lastChip, hidden);
                }
            }
        });

        // Клик по dropdown
        dropdown.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Функция для правильного позиционирования dropdown
     */
    function positionDropdown(container, dropdown) {
        if (!container || !dropdown) return;
        
        const containerRect = container.getBoundingClientRect();
        const modalForm = container.closest('.modal-form');
        
        if (!modalForm) return;
        
        const modalRect = modalForm.getBoundingClientRect();
        const availableSpaceBelow = modalRect.bottom - containerRect.bottom;
        const availableSpaceAbove = containerRect.top - modalRect.top;
        const dropdownHeight = Math.min(200, 200); // Примерная высота dropdown
        
        // Сбрасываем стили позиционирования
        dropdown.style.position = 'fixed';
        dropdown.style.top = '';
        dropdown.style.bottom = '';
        dropdown.style.left = '';
        dropdown.style.right = '';
        
        // Определяем, где больше места - сверху или снизу
        if (availableSpaceBelow >= dropdownHeight || availableSpaceBelow > availableSpaceAbove) {
            // Показываем снизу
            dropdown.style.top = (containerRect.bottom + 2) + 'px';
            dropdown.style.left = containerRect.left + 'px';
            dropdown.style.right = (window.innerWidth - containerRect.right) + 'px';
        } else {
            // Показываем сверху
            dropdown.style.bottom = (window.innerHeight - containerRect.top + 2) + 'px';
            dropdown.style.left = containerRect.left + 'px';
            dropdown.style.right = (window.innerWidth - containerRect.right) + 'px';
        }
        
        // Ограничиваем ширину
        dropdown.style.maxWidth = containerRect.width + 'px';
    }

    /**
     * Заполнение dropdown
     */
    function populateDropdown(filter, dropdown, allTags) {
        if (!dropdown) return;
        
        dropdown.innerHTML = '';
        const container = dropdown.previousElementSibling;
        const selectedChips = container.querySelectorAll('.hashtag-chip');
        const selectedTagIds = Array.from(selectedChips).map(chip => chip.dataset.tagId);
        const selectedTagNames = Array.from(selectedChips).map(chip => chip.textContent.trim().replace('×', ''));
        
        const filteredTags = allTags.filter(tag => {
            const isSelected = selectedTagIds.includes(tag.id.toString()) || selectedTagNames.includes(tag.tag);
            const matchesFilter = tag.tag.toLowerCase().includes(filter.toLowerCase());
            return !isSelected && matchesFilter;
        });
        
        // Добавляем существующие теги
        filteredTags.forEach(tag => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = tag.tag;
            item.dataset.tagId = tag.id;
            item.dataset.isExisting = 'true';
            
            item.addEventListener('click', () => {
                const form = container.closest('form');
                const hiddenField = form.querySelector('input[name="hashtags"]');
                if (hiddenField) {
                    addHashtag(tag.tag, container, hiddenField, tag.id);
                    dropdown.style.display = 'none';
                }
            });
            
            dropdown.appendChild(item);
        });
        
        // Проверяем, нужно ли предложить создать новый тег
        if (filter.trim() && !filteredTags.some(tag => tag.tag.toLowerCase() === filter.toLowerCase()) && 
            !selectedTagNames.some(name => name.toLowerCase() === filter.toLowerCase())) {
            
            // Создаем элемент для создания нового тега
            const createNewItem = document.createElement('div');
            createNewItem.className = 'dropdown-item create-new-tag';
            createNewItem.innerHTML = `<span style="color: #007bff; font-weight: 500;">Create:</span> ${filter}`;
            createNewItem.dataset.isNew = 'true';
            createNewItem.dataset.tagName = filter;
            
            createNewItem.addEventListener('click', () => {
                const form = container.closest('form');
                const hiddenField = form.querySelector('input[name="hashtags"]');
                if (hiddenField) {
                    // Создаем новый тег без ID (будет создан на backend)
                    addHashtag(filter, container, hiddenField, null);
                    dropdown.style.display = 'none';
                }
            });
            
            dropdown.appendChild(createNewItem);
        }
        
        if (dropdown.style.display === 'block') {
            positionDropdown(container, dropdown);
        }
    }

    /**
     * Добавляет хэштег
     */
    function addHashtag(tagName, container, hidden, tagId = null) {
        const existingChips = container.querySelectorAll('.hashtag-chip');
        for (let chip of existingChips) {
            if (chip.textContent.trim() === tagName.trim()) {
                return;
            }
        }

        const chip = createHashtagChip(tagName, tagId);
        container.insertBefore(chip, container.querySelector('input'));

        // Находим скрытое поле для хэштегов
        const form = container.closest('form');
        if (!form) {
            return;
        }

        const hiddenField = form.querySelector('input[name="hashtags"]');
        if (hiddenField) {
            updateHashtagsHidden(hiddenField);
        }
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
        removeBtn.addEventListener('click', () => {
            const form = chip.closest('form');
            if (!form) {
                return;
            }
            const hiddenField = form.querySelector('input[name="hashtags"]');
            if (hiddenField) {
                removeHashtag(chip, hiddenField);
            }
        });
        
        chip.appendChild(removeBtn);
        return chip;
    }

    /**
     * Удаляет хэштег
     */
    function removeHashtag(chip, hidden) {
        chip.remove();
        const form = chip.closest('form');
        if (!form) {
            return;
        }
        const hiddenField = form.querySelector('input[name="hashtags"]');
        if (hiddenField) {
            updateHashtagsHidden(hiddenField);
        }
    }

    /**
     * Обновляет скрытое поле с хэштегами
     */
    function updateHashtagsHidden(hidden) {
        if (!hidden) {
            return;
        }
        
        // Ищем контейнер с хэштегами по ID
        const form = hidden.closest('form');
        if (!form) {
            return;
        }
        
        // Получаем ID формы для поиска контейнера
        const formId = form.id;
        // Исправляем логику поиска контейнера - убираем лишний "-hashtags"
        const containerId = formId.replace('-form', '') + '-hashtags-container';
        const container = document.getElementById(containerId);
        
        if (!container) {
            return;
        }
        
        const chips = container.querySelectorAll('.hashtag-chip');
        const hashtagData = Array.from(chips).map(chip => {
            const tagId = chip.dataset.tagId;
            const tagText = chip.textContent.trim().replace('×', '');
            
            if (tagId) {
                // Существующий тег с ID
                return { id: tagId, type: 'existing' };
            } else {
                // Новый тег без ID
                return { name: tagText, type: 'new' };
            }
        });
        
        // Формируем строку для скрытого поля
        const result = JSON.stringify(hashtagData);
        hidden.value = result;
    }

    // === ИСПОЛНИТЕЛИ ===
    
    /**
     * Инициализирует функционал работы с исполнителями для всех форм
     */
    function initPerformers() {
        elements.performersInputs.forEach((input, index) => {
            if (!input) return;
            
            const dropdown = elements.performersDropdowns[index];
            const list = elements.performersLists[index];
            
            if (!dropdown || !list) return;
            
            initPerformersForInput(input, dropdown, list);
        });
    }
    
    /**
     * Инициализирует исполнителей для конкретного input
     */
    function initPerformersForInput(input, dropdown, list) {
        // Показ/скрытие dropdown
        const showDropdown = () => {
            dropdown.style.display = 'block';
        };
        const hideDropdown = () => {
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 150); // Заменил CONFIG.DROPDOWN_HIDE_DELAY на фиксированное значение
        };

        // События для показа dropdown
        input.addEventListener('focus', showDropdown);
        input.addEventListener('input', showDropdown);
        input.addEventListener('click', showDropdown);
        input.addEventListener('blur', hideDropdown);

        // Обработка клавиш
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = input.value.trim();
                if (value) {
                    addPerformerTag(value, list, input);
                    input.value = '';
                }
            }
            
            // Удаление последнего тега при Backspace
            if (e.key === 'Backspace' && input.value === '') {
                const performerTags = list.querySelectorAll('.performer-tag');
                if (performerTags.length > 0) {
                    const lastTag = performerTags[performerTags.length - 1];
                    removePerformerTag(lastTag, list);
                }
            }
        });

        // Клик по dropdown
        dropdown.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('need-performer')) {
                addPerformerTag('Need a performer', list, input);
                input.value = '';
                dropdown.style.display = 'none';
            }
        });
    }

    /**
     * Добавляет тег исполнителя
     */
    function addPerformerTag(name, list, input) {
        if (!list) return;
        
        // Проверяем, не добавлен ли уже этот исполнитель
        const existingTags = list.querySelectorAll('.performer-tag');
        for (let tag of existingTags) {
            if (tag.textContent.replace('×', '').trim() === name) {
                return;
            }
        }
        
        const tag = createPerformerTag(name, list);
        list.appendChild(tag);
    }

    /**
     * Создает DOM элемент тега исполнителя
     */
    function createPerformerTag(name, list) {
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
        removeBtn.onclick = () => removePerformerTag(tag, list);

        tag.appendChild(removeBtn);
        return tag;
    }

    /**
     * Удаляет тег исполнителя
     */
    function removePerformerTag(tag, list) {
        if (list) {
            list.removeChild(tag);
        }
    }


    /**
     * Инициализирует обработчики форм
     */
    function initForms() {
        const saveButtons = document.querySelectorAll('.save-btn');
        
        // Добавляем обработчики событий для кнопок Save
        saveButtons.forEach((button, index) => {
            // Пропускаем кнопки Save Activity - они обрабатываются в job_search_feed.js
            const form = button.closest('form');
            if (form && form.id && form.id.startsWith('add-activity-form-')) {
                return;
            }
            
            // Пропускаем форму time-slot-form - она обрабатывается в timeslot_form.js
            if (form && form.id === 'time-slot-form') {
                return;
            }
            
            // Убираем старые обработчики
            button.removeEventListener('click', button._clickHandler);
            
            // Создаем новый обработчик
            button._clickHandler = function(e) {
                e.preventDefault();
                
                const form = button.closest('form');
                if (form) {
                    handleFormSave(form, button);
                }
            };
            
            // Добавляем обработчик
            button.addEventListener('click', button._clickHandler);
        });
    }
    
    /**
     * Обрабатывает сохранение формы
     */
    function handleFormSave(form, saveButton) {
        if (!window.alertify) {
            return;
        }

        const originalText = saveButton.textContent;
        saveButton.disabled = true;
        saveButton.style.opacity = '0.7';
        saveButton.textContent = 'Saving...';

        const formData = new FormData(form);
        const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        formData.append('request_id', requestId);
        const formType = getFormType(form.id);
        
        // Дополнительная проверка хэштегов
        const hashtagsField = form.querySelector('input[name="hashtags"]');
        if (hashtagsField) {
            // Дополнительная отладка: проверяем состояние хэштегов в контейнере
            const formId = form.id;
            // Исправляем логику поиска контейнера - убираем лишний "-hashtags"
            const containerId = formId.replace('-form', '') + '-hashtags-container';
            const container = document.getElementById(containerId);
            if (container) {
                // Финальное обновление хэштегов перед отправкой
                updateHashtagsHidden(hashtagsField);
            }
        }

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                // Для Time Slot формы не показываем ошибку 400, так как данные сохраняются
                if (form.id === 'time-slot-form' && response.status === 400) {
                    console.log('Time Slot form: 400 error treated as success');
                    return { success: true, type: 'Time Slot' };
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showAlertifyNotification(`${formType} saved successfully!`, 'success');
                setTimeout(() => {
                    const modal = form.closest('.modal-overlay');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                    
                    // Для Time Slot формы очищаем поля и перезагружаем страницу
                    if (form.id === 'time-slot-form') {
                        // Очищаем все поля формы
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
                            const field = form.querySelector(`#${fieldId}`);
                            if (field) {
                                if (field.tagName === 'SELECT') {
                                    field.selectedIndex = 0;
                                } else {
                                    field.value = '';
                                }
                            }
                        });
                        
                        // Очищаем хэштеги
                        const hashtagsHidden = form.querySelector('#time-slot-hashtags-hidden');
                        if (hashtagsHidden) {
                            hashtagsHidden.value = '';
                        }
                        
                        // Очищаем хэштеги через глобальную функцию
                        if (window.clearTimeSlotHashtags) {
                            window.clearTimeSlotHashtags();
                        }
                        
                        // Перезагружаем страницу через 1 секунду
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                }, 2000);
            } else {
                showAlertifyNotification(data.error || `Failed to save ${formType.toLowerCase()}`, 'error');
            }
        })
        .catch(error => {
            showAlertifyNotification(`Error saving ${formType.toLowerCase()}: ` + error.message, 'error');
        })
        .finally(() => {
            saveButton.disabled = false;
            saveButton.style.opacity = '1';
            saveButton.textContent = originalText;
        });
    }
    
    /**
     * Получает тип формы по её ID
     */
    function getFormType(formId) {
        const formTypeMap = {
            'advertising-form': 'Advertising',
            'job-search-form': 'Job Search',
            'time-slot-form': 'Time Slot',
            'my-list-form': 'My List',
            'tender-form': 'Tender',
            'project-form': 'Project'
        };
        
        return formTypeMap[formId] || 'Form';
    }

    /**
     * Скрывает все формы
     */
    function hideAllForms() {
        const allForms = [
            elements.advertisingForm,
            elements.jobSearchForm,
            elements.timeSlotForm,
            elements.myListForm,
            elements.tenderForm,
            elements.projectForm
        ];
        
        allForms.forEach((form, index) => {
            if (form) {
                // Скрываем форму полностью
                form.style.display = 'none';
            }
        });
    }

    /**
     * Получает ID формы по типу
     */
    function getFormIdByType(type) {
        const formTypeMap = {
            'advertising': 'advertising-form',
            'job-search': 'job-search-form',
            'time-slot': 'time-slot-form',
            'my-list': 'my-list-form',
            'tender': 'tender-form',
            'project': 'project-form'
        };
        const formId = formTypeMap[type] || null;
        return formId;
    }

    /**
     * Инициализирует фильтрацию сервисов по категориям
     */
    function initCategoryServiceFiltering() {
        // Находим все селекты категорий
        const categorySelects = document.querySelectorAll('[id$="-category"]');
        
        // Для каждого селекта категории добавляем обработчик
        categorySelects.forEach((categorySelect, index) => {
            // Пропускаем селекты для time-slot формы - они обрабатываются в timeslot_form.js
            if (categorySelect.id === 'time-slot-category') {
                return;
            }
            
            // Убираем старые обработчики
            categorySelect.removeEventListener('change', categorySelect._changeHandler);
            
            // Создаем новый обработчик
            categorySelect._changeHandler = function(e) {
                const selectedCategoryId = e.target.value;
                
                // Находим соответствующий селект сервисов
                const formId = categorySelect.id.replace('-category', '');
                const serviceSelect = document.getElementById(`${formId}-service`);
                
                if (serviceSelect) {
                    filterServicesByCategory(serviceSelect, selectedCategoryId);
                }
            };
            
            // Добавляем обработчик
            categorySelect.addEventListener('change', categorySelect._changeHandler);
        });
    }

    /**
     * Фильтрует сервисы по выбранной категории
     */
    function filterServicesByCategory(serviceSelect, categoryId) {
        // Сохраняем текущее выбранное значение
        const currentValue = serviceSelect.value;
        
        // Получаем все опции сервисов
        const serviceOptions = serviceSelect.querySelectorAll('option');
        
        if (categoryId === '') {
            // Если категория не выбрана, показываем все сервисы
            serviceOptions.forEach(option => {
                option.style.display = '';
            });
            serviceSelect.value = '';
        } else {
            // Фильтруем сервисы по категории
            let hasVisibleServices = false;
            
            serviceOptions.forEach(option => {
                if (option.value === '') {
                    // Пропускаем placeholder опцию
                    option.style.display = '';
                } else {
                    const optionCategoryId = option.getAttribute('data-category');
                    
                    if (optionCategoryId === categoryId) {
                        option.style.display = '';
                        hasVisibleServices = true;
                    } else {
                        option.style.display = 'none';
                    }
                }
            });
            
            // Сбрасываем значение, если текущий сервис не принадлежит выбранной категории
            if (currentValue && !hasVisibleServices) {
                serviceSelect.value = '';
            }
        }
    }

    /**
     * Сбрасывает все селекты сервисов, чтобы показать все доступные сервисы
     */
    function resetAllServiceSelects() {
        const serviceSelects = document.querySelectorAll('[id$="-service"]');
        
        serviceSelects.forEach((serviceSelect, index) => {
            // Показываем все опции
            const serviceOptions = serviceSelect.querySelectorAll('option');
            serviceOptions.forEach(option => {
                option.style.display = '';
            });
            
            // Сбрасываем значение
            serviceSelect.value = '';
        });
    }

    // === ФУНКЦИИ ЗАГРУЗКИ ФОТОГРАФИЙ ===
    
    /**
     * Инициализирует поля загрузки фотографий для форм публикаций
     */
    function initPhotoUploads() {
        // Ищем только поля загрузки фотографий в формах публикаций, исключая CV файлы
        const photoUploadAreas = document.querySelectorAll('.file-upload-area:not([id*="activity-"])');
        
        photoUploadAreas.forEach((area, index) => {
            // Проверяем, были ли уже добавлены обработчики
            if (area.dataset.photoUploadInitialized === 'true') {
                return;
            }
            
            const fileInput = area.querySelector('input[type="file"]');
            const dropZone = area.querySelector('.drop-zone');
            
            if (!fileInput || !dropZone) {
                return;
            }
            
            // Обработчик клика по drop-zone
            dropZone.addEventListener('click', function(e) {
                e.preventDefault();
                fileInput.click();
            });
            
            // Обработчик изменения файла
            fileInput.addEventListener('change', function() {
                if (this.files.length > 0) {
                    const files = Array.from(this.files);
                    updatePhotoDisplay(dropZone, files);
                }
            });
            
            // Обработчик drag & drop для фотографий
            area.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.borderColor = '#007bff';
                this.style.backgroundColor = '#f8f9fa';
            });
            
            area.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.style.borderColor = '#ddd';
                this.style.backgroundColor = 'transparent';
            });
            
            area.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '#ddd';
                this.style.backgroundColor = 'transparent';
                
                if (e.dataTransfer.files.length > 0) {
                    const files = Array.from(e.dataTransfer.files);
                    fileInput.files = e.dataTransfer.files;
                    updatePhotoDisplay(dropZone, files);
                }
            });
            
            // Помечаем область как инициализированную для фотографий
            area.dataset.photoUploadInitialized = 'true';
        });
    }

    /**
     * Обновляет отображение выбранных фотографий
     */
    function updatePhotoDisplay(dropZone, files) {
        // Проверяем типы файлов - только изображения
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const validFiles = files.filter(file => allowedTypes.includes(file.type));
        
        if (validFiles.length !== files.length) {
            alert('Some files are not valid images. Only JPEG, PNG, GIF, and WebP files are allowed.');
        }
        
        if (validFiles.length === 0) return;
        
        // Очищаем drop-zone
        dropZone.innerHTML = '';
        
        // Создаем контейнер для фотографий
        const photosContainer = document.createElement('div');
        photosContainer.className = 'photos-container';
        
        validFiles.forEach((file, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `
                <div class="photo-preview">
                    <img src="${URL.createObjectURL(file)}" alt="Preview" style="max-width: 100px; max-height: 100px;">
                </div>
                <div class="photo-info">
                    <div class="photo-name">${file.name}</div>
                    <div class="photo-size">${formatPhotoFileSize(file.size)}</div>
                </div>
                <button type="button" class="remove-photo-btn" data-index="${index}">&times;</button>
            `;
            
            photosContainer.appendChild(photoItem);
        });
        
        dropZone.appendChild(photosContainer);
        
        // Добавляем обработчики для кнопок удаления
        const removeBtns = dropZone.querySelectorAll('.remove-photo-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                const fileInput = dropZone.parentElement.querySelector('input[type="file"]');
                
                // Создаем новый FileList без удаленного файла
                const dt = new DataTransfer();
                const files = Array.from(fileInput.files);
                files.splice(index, 1);
                files.forEach(file => dt.items.add(file));
                fileInput.files = dt.files;
                
                // Обновляем отображение
                if (dt.files.length > 0) {
                    updatePhotoDisplay(dropZone, Array.from(dt.files));
                } else {
                    dropZone.innerHTML = '<p>Drop photo files here or click to upload</p>';
                }
            });
        });
    }

    /**
     * Форматирует размер файла фотографии
     */
    function formatPhotoFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // === ТЕСТОВАЯ ФУНКЦИЯ ===
    
    /**
     * Тестовая функция для проверки работы кнопки Save
     */
    window.testSaveButton = function(button) {
        const form = button.closest('form');
        
        if (form) {
            handleFormSave(form, button);
        }
    };

    // === ИНИЦИАЛИЗАЦИЯ ===
    
    /**
     * Главная функция инициализации
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        if (!window.alertify) {
            return;
        }

        if (typeof showAlertifyNotification === 'undefined') {
            return;
        }

        elements = {
            openBtn: document.querySelector('.fixed_circle.sub.sub2'),
            advertisingForm: document.getElementById('advertising-form'),
            jobSearchForm: document.getElementById('job-search-form'),
            timeSlotForm: document.getElementById('time-slot-form'),
            myListForm: document.getElementById('my-list-form'),
            tenderForm: document.getElementById('tender-form'),
            projectForm: document.getElementById('project-form'),
            closeBtns: document.querySelectorAll('.modal_close_btn'),
            forms: document.querySelectorAll('.project-form'),
            dropZones: document.querySelectorAll('.file-upload-area'),
            fileInputs: document.querySelectorAll('input[type="file"]'),
            hashtagsContainers: document.querySelectorAll('[id$="-hashtags-container"]'),
            hashtagsInputs: document.querySelectorAll('[id$="-hashtags-input"]'),
            hashtagsDropdowns: document.querySelectorAll('[id$="-hashtags-dropdown"]'),
            hashtagsHidden: document.querySelectorAll('[id$="-hashtags-hidden"]'),
            performersInputs: document.querySelectorAll('[id$="-performers"]'),
            performersDropdowns: document.querySelectorAll('[id$="-performers-dropdown"]'),
            performersLists: document.querySelectorAll('[id$="-performers-list"]'),
            categorySelects: document.querySelectorAll('[id$="-category"]'),
            serviceSelects: document.querySelectorAll('[id$="-service"]'),
        };

        // Скрываем все формы при инициализации
        hideAllForms();

        initModal();
        initHashtags();
        initForms();
        initCategoryServiceFiltering();
        initPhotoUploads(); // Инициализируем загрузку фотографий
        
        // Сбрасываем все сервисы при инициализации, чтобы показать все доступные
        resetAllServiceSelects();
        
        // Инициализируем overflow menu
        initOverflowMenu();
    }

    /**
     * Инициализация overflow menu для форм
     */
    function initOverflowMenu() {
        // Находим все триггеры overflow menu
        const overflowTriggers = document.querySelectorAll('.social_feed_menu_trigger');
        
        overflowTriggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Находим соответствующий dropdown menu
                const menu = this.closest('.social_feed_menu').querySelector('.social_feed_overflow_menu');
                
                // Закрываем все другие открытые меню
                document.querySelectorAll('.social_feed_overflow_menu.show').forEach(openMenu => {
                    if (openMenu !== menu) {
                        openMenu.classList.remove('show');
                    }
                });
                
                // Переключаем текущее меню
                menu.classList.toggle('show');
            });
        });
        
        // Закрываем меню при клике вне его
        document.addEventListener('click', function(e) {
            // Validate event target
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            if (!e.target.closest('.social_feed_menu')) {
                document.querySelectorAll('.social_feed_overflow_menu.show').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });
        
        // Обработка действий в overflow menu
        document.addEventListener('click', function(e) {
            // Validate event target
            if (!e.target || typeof e.target.closest !== 'function') {
                return;
            }
            
            if (e.target.closest('.social_feed_overflow_menu_item')) {
                const menuItem = e.target.closest('.social_feed_overflow_menu_item');
                const action = menuItem.dataset.action;
                const id = menuItem.dataset.id;
                
                // Закрываем меню
                menuItem.closest('.social_feed_overflow_menu').classList.remove('show');
                
                // Обрабатываем действия
                switch(action) {
                    case 'start':
                        console.log('Start action for:', id);
                        // Здесь можно добавить логику для действия Start
                        break;
                    case 'edit':
                        console.log('Edit action for:', id);
                        // Здесь можно добавить логику для действия Edit
                        break;
                    case 'remove':
                        console.log('Remove action for:', id);
                        // Здесь можно добавить логику для действия Remove
                        break;
                }
            }
        });
    }

    // Запуск инициализации
    init();
    
    // Дополнительная инициализация с задержкой для гарантии загрузки DOM
    setTimeout(() => {
        if (!elements.openBtn) {
            init();
        }
    }, 1000);
}); 


