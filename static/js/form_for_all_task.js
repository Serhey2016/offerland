document.addEventListener('DOMContentLoaded', () => {
    // === КОНФИГУРАЦИЯ ===
    // Убрано - больше не используется

    // === СООТВЕТСТВИЕ ID ТИПАМ ===
    const TYPE_MAP = {
        '1': 'my-list',
        '2': 'tender',
        '3': 'project',
        '4': 'advertising',
        '5': 'time-slot',
        '6': 'job-search',
    };

    // === КОНСТАНТЫ ДЛЯ ID ПОЛЕЙ ===
    // Убрано - больше не используется

    // === КОНФИГ ДЛЯ РАЗНЫХ ТИПОВ ПУБЛИКАЦИЙ ===
    // Убрано - больше не используется

    // === УНИВЕРСАЛЬНЫЕ ФУНКЦИИ ДЛЯ ВИДИМОСТИ ===
    // Убрано - больше не используется

    // === УНИВЕРСАЛЬНЫЙ ОБРАБОТЧИК ДЛЯ ТИПОВ ===
    // Убрано - больше не используется

    // === УТИЛИТЫ ===
    
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

    /**
     * Обработка файлов
     */
    function handleFiles(files, dropZone) {
        // Здесь можно добавить логику обработки файлов
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
        console.log('=== INIT MODAL START ===');
        console.log('Elements.openBtn:', elements.openBtn);
        
        // Дополнительный поиск кнопки если она не была найдена в elements
        let openButton = elements.openBtn;
        if (!openButton) {
            console.log('Button not found in elements, searching manually...');
            openButton = document.querySelector('.fixed_circle.sub.sub2');
            console.log('Manually found button:', openButton);
        }
        
        // Открытие модального окна по кнопке
        if (openButton) {
            console.log('Open button found, adding click listener');
            console.log('Button element:', openButton);
            console.log('Button classes:', openButton.className);
            
            // Защита от двойного клика
            let isModalOpen = false;
            
            openButton.addEventListener('click', function(e) {
                console.log('=== OPEN BUTTON CLICKED ===');
                console.log('Event:', e);
                console.log('Target:', e.target);
                console.log('Current target:', e.currentTarget);
                
                if (isModalOpen) {
                    console.log('Modal already open, ignoring click');
                    return;
                }
                
                isModalOpen = true;
                console.log('Setting modal open flag');
                
                // Показываем форму выбора типа
                showTypeSelectionModal();
                
                // Сбрасываем флаг через небольшую задержку
                setTimeout(() => {
                    isModalOpen = false;
                    console.log('Modal open flag reset');
                }, 500);
            });
            console.log('Click listener added to open button');
        } else {
            console.error('Open button not found!');
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
        console.log('=== SHOW TYPE SELECTION MODAL START ===');
        
        // Находим готовое модальное окно
        const typeSelectionModal = document.getElementById('type-selection-modal');
        console.log('Searching for modal with ID: type-selection-modal');
        console.log('Modal found:', typeSelectionModal);
        
        if (!typeSelectionModal) {
            console.error('Type selection modal not found!');
            console.log('All elements with ID containing "type":', document.querySelectorAll('[id*="type"]'));
            console.log('All modal-overlay elements:', document.querySelectorAll('.modal-overlay'));
            return;
        }
        
        console.log('Type selection modal found, showing it');
        
        // Показываем модальное окно
        typeSelectionModal.style.display = 'flex';
        console.log('Modal display set to flex');
        
        // Обработчики для выбора типа
        const typeOptions = typeSelectionModal.querySelectorAll('.type-option');
        console.log('Type options found:', typeOptions.length);
        
        typeOptions.forEach((option, index) => {
            console.log(`Setting up option ${index}:`, option.dataset.type);
            option.addEventListener('click', function() {
                const type = this.dataset.type;
                console.log('Type option clicked:', type);
                
                // Скрываем модальное окно выбора типа
                typeSelectionModal.style.display = 'none';
                
                // Показываем выбранную форму
                showFormByType(type);
            });
        });
        
        // Кнопка закрытия
        const closeBtn = typeSelectionModal.querySelector('.modal_close_btn');
        if (closeBtn) {
            console.log('Close button found, adding click handler');
            closeBtn.addEventListener('click', function() {
                console.log('Close button clicked');
                typeSelectionModal.style.display = 'none';
            });
        } else {
            console.error('Close button not found in modal');
        }
        
        // Закрытие по клику вне модального окна
        typeSelectionModal.addEventListener('click', function(e) {
            if (e.target === typeSelectionModal) {
                console.log('Clicked outside modal, closing');
                typeSelectionModal.style.display = 'none';
            }
        });
        
        console.log('=== SHOW TYPE SELECTION MODAL COMPLETED ===');
    }
    
    /**
     * Показывает форму по выбранному типу
     */
    function showFormByType(type) {
        console.log('=== SHOW FORM BY TYPE START ===');
        console.log('Type:', type);
        
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
                console.log('Showing form:', formId);
                // Используем flex для центрирования
                form.style.display = 'flex';
                
                // Повторно инициализируем обработчики для кнопки Save в этой форме
                const saveButton = form.querySelector('.save-btn');
                if (saveButton) {
                    console.log('Re-initializing save button for form:', formId);
                    // Удаляем старый обработчик если есть
                    saveButton.removeEventListener('click', saveButton._clickHandler);
                    
                    // Добавляем новый обработчик
                    saveButton._clickHandler = function(e) {
                        console.log('=== SAVE BUTTON CLICKED ===');
                        console.log('Save button clicked!', saveButton);
                        console.log('Event:', e);
                        console.log('Button text:', saveButton.textContent);
                        console.log('Button class:', saveButton.className);
                        
                        e.preventDefault();
                        const form = saveButton.closest('form');
                        console.log('Form found:', form);
                        console.log('Form ID:', form ? form.id : 'NO FORM');
                        console.log('Form action:', form ? form.action : 'NO ACTION');
                        
                        if (form) {
                            console.log('Calling handleFormSave with form:', form.id);
                            handleFormSave(form, saveButton);
                        } else {
                            console.error('No form found for button:', saveButton);
                        }
                    };
                    
                    saveButton.addEventListener('click', saveButton._clickHandler);
                    console.log('Save button handler re-initialized for form:', formId);
                }
            } else {
                console.error('Form not found:', formId);
            }
        } else {
            console.error('Form ID not found for type:', type);
        }
        
        console.log('=== SHOW FORM BY TYPE COMPLETED ===');
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
        console.log('=== INIT HASHTAGS START ===');
        
        const containers = document.querySelectorAll('.hashtag-chip-container');
        const inputs = document.querySelectorAll('.hashtags-input-field');
        const dropdowns = document.querySelectorAll('.hashtag-dropdown-menu');
        const hiddenFields = document.querySelectorAll('input[name="hashtags"]');

        console.log('Found elements:', {
            containers: containers.length,
            inputs: inputs.length,
            dropdowns: dropdowns.length,
            hiddenFields: hiddenFields.length
        });

        containers.forEach((container, index) => {
            const input = inputs[index];
            const dropdown = dropdowns[index];
            const hidden = hiddenFields[index];

            console.log(`Initializing hashtags for container ${index}:`, {
                containerId: container.id,
                inputId: input ? input.id : 'NO INPUT',
                dropdownId: dropdown ? dropdown.id : 'NO DROPDOWN',
                hiddenId: hidden ? hidden.id : 'NO HIDDEN'
            });

            if (container && input && dropdown && hidden) {
                initHashtagsForContainer(container, input, dropdown, hidden);
            } else {
                console.error(`Missing elements for container ${index}:`, {
                    container: !!container,
                    input: !!input,
                    dropdown: !!dropdown,
                    hidden: !!hidden
                });
            }
        });
        
        console.log('=== INIT HASHTAGS COMPLETED ===');
    }
    
    /**
     * Инициализирует хэштеги для конкретного контейнера
     */
    function initHashtagsForContainer(container, input, dropdown, hidden) {
        console.log(`Initializing hashtags for container: ${container.id}`);
        
        // Получаем все доступные хэштеги из data-атрибута
        const allTagsData = container.getAttribute('data-all-tags');
        let allTags = [];
        
        try {
            allTags = JSON.parse(allTagsData || '[]');
            console.log(`Parsed ${allTags.length} hashtags for container ${container.id}`);
        } catch (e) {
            console.error('Error parsing hashtags data:', e);
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
                    } else {
                        console.log('Hashtag already exists:', value);
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
                } else {
                    console.error('No hashtags hidden field found in form:', form.id);
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
                } else {
                    console.error('No hashtags hidden field found in form:', form.id);
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
        console.log('Adding hashtag:', tagName, 'with ID:', tagId);
        
        const existingChips = container.querySelectorAll('.hashtag-chip');
        for (let chip of existingChips) {
            if (chip.textContent.trim() === tagName.trim()) {
                console.log('Hashtag already exists, skipping:', tagName);
                return;
            }
        }

        const chip = createHashtagChip(tagName, tagId);
        container.insertBefore(chip, container.querySelector('input'));

        // Находим скрытое поле для хэштегов
        const form = container.closest('form');
        if (!form) {
            console.error('No form found for container:', container);
            return;
        }

        const hiddenField = form.querySelector('input[name="hashtags"]');
        if (hiddenField) {
            console.log('Found hashtags hidden field, updating...');
            updateHashtagsHidden(hiddenField);
        } else {
            console.error('No hashtags hidden field found in form:', form.id);
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
                console.error('No form found for chip:', chip);
                return;
            }
            const hiddenField = form.querySelector('input[name="hashtags"]');
            if (hiddenField) {
                console.log('Found hashtags hidden field for removal, calling removeHashtag...');
                removeHashtag(chip, hiddenField);
            } else {
                console.error('No hashtags hidden field found in form:', form.id);
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
            console.error('No form found for chip:', chip);
            return;
        }
        const hiddenField = form.querySelector('input[name="hashtags"]');
        if (hiddenField) {
            console.log('Found hashtags hidden field after removal, updating...');
            updateHashtagsHidden(hiddenField);
        } else {
            console.error('No hashtags hidden field found in form:', form.id);
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
            console.error('No form found for hidden field:', hidden);
            return;
        }
        
        // Получаем ID формы для поиска контейнера
        const formId = form.id;
        // Исправляем логику поиска контейнера - убираем лишний "-hashtags"
        const containerId = formId.replace('-form', '') + '-hashtags-container';
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error('No hashtag container found for form:', formId, 'searched for:', containerId);
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
        
        console.log('Updated hashtags hidden field:', hidden.id, 'with value:', result);
        console.log('Hashtag data:', hashtagData);
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


    



    




    // === ФОРМА ===
    
    /**
     * Инициализирует обработчики форм
     */
    function initForms() {
        console.log('=== INIT FORMS START ===');
        const saveButtons = document.querySelectorAll('.save-btn');
        console.log('Save buttons found:', saveButtons.length);
        
        // Добавляем обработчики событий для кнопок Save
        saveButtons.forEach((button, index) => {
            console.log(`Initializing save button ${index}:`, button);
            
            // Убираем старые обработчики
            button.removeEventListener('click', button._clickHandler);
            
            // Создаем новый обработчик
            button._clickHandler = function(e) {
                e.preventDefault();
                console.log('=== SAVE BUTTON CLICKED ===');
                console.log('Save button clicked!', button);
                console.log('Button text:', button.textContent);
                console.log('Button class:', button.className);
                
                const form = button.closest('form');
                if (form) {
                    console.log('Form found:', form.id);
                    handleFormSave(form, button);
                } else {
                    console.error('No form found for button:', button);
                }
            };
            
            // Добавляем обработчик
            button.addEventListener('click', button._clickHandler);
            console.log(`Save button ${index} handler initialized`);
        });
        
        console.log('=== INIT FORMS COMPLETED ===');
    }
    
    /**
     * Обрабатывает сохранение формы
     */
    function handleFormSave(form, saveButton) {
        console.log('=== HANDLE FORM SAVE START ===');
        console.log('Form:', form.id);
        console.log('Save button:', saveButton);
        console.log('Form action:', form.action);
        console.log('Form method:', form.method);
        
        if (!window.alertify) {
            console.error('Alertify library not loaded');
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
        
        console.log('=== FORM DATA ANALYSIS ===');
        console.log('Form data entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }
        
        // Дополнительная проверка хэштегов
        const hashtagsField = form.querySelector('input[name="hashtags"]');
        if (hashtagsField) {
            console.log('=== HASHTAGS ANALYSIS ===');
            console.log('Hashtags hidden field found:', hashtagsField.id, 'Value:', hashtagsField.value);
            
            // Дополнительная отладка: проверяем состояние хэштегов в контейнере
            const formId = form.id;
            // Исправляем логику поиска контейнера - убираем лишний "-hashtags"
            const containerId = formId.replace('-form', '') + '-hashtags-container';
            const container = document.getElementById(containerId);
            if (container) {
                const chips = container.querySelectorAll('.hashtag-chip');
                console.log(`Found ${chips.length} hashtag chips in container ${containerId}:`);
                chips.forEach((chip, index) => {
                    const tagId = chip.dataset.tagId;
                    const tagText = chip.textContent.trim().replace('×', '');
                    console.log(`  Chip ${index}: text="${tagText}", tagId="${tagId}"`);
                });
                
                // Финальное обновление хэштегов перед отправкой
                console.log('Final hashtag update before form submission');
                updateHashtagsHidden(hashtagsField);
                console.log('Final hashtags value:', hashtagsField.value);
            } else {
                console.error('No hashtag container found for form:', formId, 'searched for:', containerId);
            }
        } else {
            console.error('No hashtags hidden field found in form:', form.id);
        }

        console.log('=== FINAL FORM SUBMISSION DATA ===');
        console.log('Sending request to:', form.action);
        console.log('Form type:', formType);
        
        // Финальная проверка всех данных перед отправкой
        const finalFormData = new FormData(form);
        console.log('Final form data before submission:');
        for (let [key, value] of finalFormData.entries()) {
            console.log(`  ${key}: "${value}"`);
        }

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            console.log('Response received:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.success) {
                showAlertifyNotification(`${formType} saved successfully!`, 'success');
                setTimeout(() => {
                    const modal = form.closest('.modal-overlay');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                }, 2000);
            } else {
                showAlertifyNotification(data.error || `Failed to save ${formType.toLowerCase()}`, 'error');
            }
        })
        .catch(error => {
            console.error('Error in fetch:', error);
            showAlertifyNotification(`Error saving ${formType.toLowerCase()}: ` + error.message, 'error');
        })
        .finally(() => {
            saveButton.disabled = false;
            saveButton.style.opacity = '1';
            saveButton.textContent = originalText;
            console.log('=== HANDLE FORM SAVE COMPLETED ===');
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
        console.log('Getting form ID for type:', type, 'Result:', formId);
        return formId;
    }

    /**
     * Инициализирует фильтрацию сервисов по категориям
     */
    function initCategoryServiceFiltering() {
        console.log('=== INIT CATEGORY SERVICE FILTERING START ===');
        
        // Находим все селекты категорий
        const categorySelects = document.querySelectorAll('[id$="-category"]');
        console.log('Category selects found:', categorySelects.length);
        
        // Для каждого селекта категории добавляем обработчик
        categorySelects.forEach((categorySelect, index) => {
            console.log(`Initializing category select ${index}:`, categorySelect.id);
            
            // Убираем старые обработчики
            categorySelect.removeEventListener('change', categorySelect._changeHandler);
            
            // Создаем новый обработчик
            categorySelect._changeHandler = function(e) {
                const selectedCategoryId = e.target.value;
                console.log(`Category changed in ${categorySelect.id}:`, selectedCategoryId);
                
                // Находим соответствующий селект сервисов
                const formId = categorySelect.id.replace('-category', '');
                const serviceSelect = document.getElementById(`${formId}-service`);
                
                if (serviceSelect) {
                    filterServicesByCategory(serviceSelect, selectedCategoryId);
                } else {
                    console.error(`Service select not found for form: ${formId}`);
                }
            };
            
            // Добавляем обработчик
            categorySelect.addEventListener('change', categorySelect._changeHandler);
            console.log(`Category select ${index} handler initialized`);
        });
        
        console.log('=== INIT CATEGORY SERVICE FILTERING COMPLETED ===');
    }

    /**
     * Фильтрует сервисы по выбранной категории
     */
    function filterServicesByCategory(serviceSelect, categoryId) {
        console.log('=== FILTER SERVICES BY CATEGORY START ===');
        console.log('Service select:', serviceSelect.id);
        console.log('Category ID:', categoryId);
        
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
            console.log('All services shown (no category selected)');
        } else {
            // Фильтруем сервисы по категории
            let hasVisibleServices = false;
            
            serviceOptions.forEach(option => {
                if (option.value === '') {
                    // Пропускаем placeholder опцию
                    option.style.display = '';
                } else {
                    const optionCategoryId = option.getAttribute('data-category');
                    console.log(`Service option: ${option.textContent}, Category: ${optionCategoryId}`);
                    
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
                console.log('Service value reset (current service not in selected category)');
            }
            
            console.log(`Services filtered for category ${categoryId}, visible services: ${hasVisibleServices}`);
        }
        
        console.log('=== FILTER SERVICES BY CATEGORY COMPLETED ===');
    }

    /**
     * Сбрасывает все селекты сервисов, чтобы показать все доступные сервисы
     */
    function resetAllServiceSelects() {
        console.log('=== RESET ALL SERVICE SELECTS START ===');
        
        const serviceSelects = document.querySelectorAll('[id$="-service"]');
        console.log('Service selects to reset:', serviceSelects.length);
        
        serviceSelects.forEach((serviceSelect, index) => {
            console.log(`Resetting service select ${index}:`, serviceSelect.id);
            
            // Показываем все опции
            const serviceOptions = serviceSelect.querySelectorAll('option');
            serviceOptions.forEach(option => {
                option.style.display = '';
            });
            
            // Сбрасываем значение
            serviceSelect.value = '';
            
            console.log(`Service select ${index} reset completed`);
        });
        
        console.log('=== RESET ALL SERVICE SELECTS COMPLETED ===');
    }

    // === ТЕСТОВАЯ ФУНКЦИЯ ===
    
    /**
     * Тестовая функция для проверки работы кнопки Save
     */
    window.testSaveButton = function(button) {
        console.log('=== TEST SAVE BUTTON START ===');
        console.log('Button:', button);
        console.log('Button text:', button.textContent);
        console.log('Button class:', button.className);
        
        const form = button.closest('form');
        console.log('Form found:', form);
        console.log('Form ID:', form ? form.id : 'NO FORM');
        console.log('Form action:', form ? form.action : 'NO ACTION');
        
        if (form) {
            console.log('Form data:');
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            console.log('Calling handleFormSave...');
            handleFormSave(form, button);
        } else {
            console.error('No form found for button:', button);
        }
        
        console.log('=== TEST SAVE BUTTON COMPLETED ===');
    };

    // === ИНИЦИАЛИЗАЦИЯ ===
    
    /**
     * Главная функция инициализации
     */
    function init() {
        console.log('=== INIT FUNCTION START ===');
        console.log('Document ready state:', document.readyState);
        
        if (document.readyState === 'loading') {
            console.log('Document still loading, adding DOMContentLoaded listener');
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('Document ready, checking dependencies...');

        if (!window.alertify) {
            console.error('Alertify library not loaded');
            return;
        }

        if (typeof showAlertifyNotification === 'undefined') {
            console.error('Alertify integration not loaded');
            return;
        }

        console.log('All dependencies loaded, initializing elements...');

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

        // Отладочная информация
        console.log('=== INIT DEBUG INFO ===');
        console.log('Open button found:', elements.openBtn);
        console.log('Open button selector:', '.fixed_circle.sub.sub2');
        console.log('All elements with class fixed_circle:', document.querySelectorAll('.fixed_circle'));
        console.log('All elements with class sub:', document.querySelectorAll('.sub'));
        console.log('All elements with class sub2:', document.querySelectorAll('.sub2'));
        console.log('All elements with class fixed_circle sub sub2:', document.querySelectorAll('.fixed_circle.sub.sub2'));
        console.log('=== END DEBUG INFO ===');

        // Скрываем все формы при инициализации
        hideAllForms();

        initModal();
        initHashtags();
        initForms();
        initCategoryServiceFiltering();
        
        // Сбрасываем все сервисы при инициализации, чтобы показать все доступные
        resetAllServiceSelects();
    }

    // Запуск инициализации
    init();
    
    // Дополнительная инициализация с задержкой для гарантии загрузки DOM
    setTimeout(() => {
        console.log('=== DELAYED INIT START ===');
        if (!elements.openBtn) {
            console.log('Re-initializing after delay...');
            init();
        }
        console.log('=== DELAYED INIT COMPLETED ===');
    }, 1000);
}); 