// Publish Form JavaScript - Popup Form Handler

class PublishFormManager {
    constructor() {
        this.currentPopup = null;
        this.isSubmitting = false;
        this.lastClickKey = null;
        this.lastOpenedPopupId = null;
        this.init();
    }
    
    getParentElements(element) {
        const parents = [];
        let current = element.parentElement;
        let level = 0;
        
        while (current && level < 10) {
            parents.push({
                level: level,
                tagName: current.tagName,
                className: current.className,
                id: current.id,
                classes: Array.from(current.classList)
            });
            current = current.parentElement;
            level++;
        }
        
        return parents;
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupCategoryServiceFiltering();
    }

    setupEventListeners() {
        // Обработчик для открытия формы при клике на "Publish" в dropdown menu
        document.addEventListener('click', (e) => {
            const publishButton = e.target.closest('[data-action="publish"]');
            if (publishButton) {
                e.preventDefault();
                e.stopPropagation();
                
                // Определяем тип по контексту
                let itemType = 'advertising'; // по умолчанию
                let itemId = publishButton.dataset.id;
                
                // Определяем тип по контексту - более точная логика
                const parentElement = publishButton.closest('.social_feed, .social_feed2, .social_feed_time_slot, .social_feed_job_search');
                
                if (parentElement) {
                    // Проверяем data-атрибуты для более точного определения типа
                    const postType = parentElement.dataset.postType;
                    const postId = parentElement.dataset.postId;
                    
                    if (postType) {
                        // Используем тип из data-атрибута
                        itemType = postType;
                    } else {
                        // Fallback на определение по CSS классам
                        if (parentElement.classList.contains('social_feed2')) {
                            itemType = 'task';
                        } else if (parentElement.classList.contains('social_feed_time_slot')) {
                            itemType = 'time_slot';
                        } else if (parentElement.classList.contains('social_feed_job_search')) {
                            itemType = 'job_search';
                        } else if (parentElement.classList.contains('social_feed')) {
                            itemType = 'advertising';
                        }
                    }
                    
                    // Используем ID из data-атрибута или из кнопки
                    if (postId) {
                        itemId = postId;
                    }
                }
                
                // Добавляем защиту от множественных кликов
                if (publishButton.dataset.processing === 'true') {
                    return;
                }
                
                // Дополнительная проверка: убеждаемся, что это не дублированный клик
                const clickKey = `${itemType}_${itemId}_${Date.now()}`;
                if (this.lastClickKey === clickKey) {
                    return;
                }
                
                this.lastClickKey = clickKey;
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
                this.closeCurrentPopup();
            }
        });

        // Обработчик для закрытия формы при нажатии Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentPopup) {
                e.preventDefault();
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

    setupCategoryServiceFiltering() {
        // Находим все селекты категорий в publish формах
        const categorySelects = document.querySelectorAll('.publish_form select[name="category"]');
        
        categorySelects.forEach((categorySelect, index) => {
            // Убираем старые обработчики
            categorySelect.removeEventListener('change', categorySelect._changeHandler);
            
            // Создаем новый обработчик
            categorySelect._changeHandler = function(e) {
                const selectedCategoryId = e.target.value;
                
                // Находим соответствующий селект сервисов
                const formGroup = categorySelect.closest('.form_group');
                const serviceSelect = formGroup.nextElementSibling.querySelector('select[name="service"]');
                
                if (serviceSelect) {
                    this.filterServicesByCategory(serviceSelect, selectedCategoryId);
                }
            }.bind(this);
            
            // Добавляем обработчик
            categorySelect.addEventListener('change', categorySelect._changeHandler);
        });
    }

    addHashtag(container, tagId, tagName) {
        console.log('🔍 addHashtag called with:', { container, tagId, tagName });
        
        // Проверяем лимит хэштегов (максимум 10)
        const currentHashtags = container.querySelectorAll('.publish_form_hashtag_chip');
        console.log('📊 Current hashtags count:', currentHashtags.length);
        
        if (currentHashtags.length >= 10) {
            console.log('⚠️ Maximum hashtags reached');
            // Показываем уведомление о достижении лимита
            this.showNotification('Maximum 10 hashtags allowed', 'warning');
            return;
        }
        
        // ИСПРАВЛЕНИЕ: ищем только среди добавленных хэштегов, а не во всем контейнере
        const existingHashtag = container.querySelector(`.publish_form_hashtag_chip[data-tag-id="${tagId}"]`);
        if (existingHashtag) {
            console.log('❌ Hashtag already exists:', existingHashtag);
            return; // Хэштег уже добавлен, ничего не делаем
        }
        
        console.log('✅ Creating new hashtag chip...');
        
        // Создаем элемент хэштега
        const hashtagChip = document.createElement('div');
        hashtagChip.className = 'publish_form_hashtag_chip';
        hashtagChip.dataset.tagId = tagId;
        hashtagChip.dataset.tagName = tagName;
        
        hashtagChip.innerHTML = `
            #${tagName}
            <button type="button" class="remove_chip" aria-label="Remove hashtag">×</button>
        `;
        
        console.log('🔧 Created hashtag chip:', hashtagChip);
        
        // Добавляем обработчик удаления
        const removeBtn = hashtagChip.querySelector('.remove_chip');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🗑️ Remove button clicked for hashtag:', tagName);
            this.removeHashtag(container, hashtagChip);
        });
        
        // Вставляем хэштег перед input полем
        const input = container.querySelector('.publish_form_hashtags_input');
        console.log('📍 Inserting before input:', input);
        
        try {
            container.insertBefore(hashtagChip, input);
            console.log('✅ Hashtag chip inserted successfully');
        } catch (error) {
            console.error('❌ Error inserting hashtag chip:', error);
            return;
        }
        
        // Обновляем скрытое поле
        this.updateHiddenHashtagsField(container);
        
        // Добавляем анимацию появления
        hashtagChip.classList.add('added');
        
        // Проверяем, нужно ли показать предупреждение о лимите
        if (currentHashtags.length + 1 >= 10) {
            container.classList.add('limit-reached');
        }
        
        // Обновляем счетчик хэштегов
        this.updateHashtagCounter(container);
        
        console.log('🎉 Hashtag addition completed successfully');
        console.log('📊 Final hashtag count:', container.querySelectorAll('.publish_form_hashtag_chip').length);
    }
    
    removeHashtag(container, hashtagChip) {
        // Анимация удаления
        hashtagChip.classList.add('removing');
        
        setTimeout(() => {
            if (hashtagChip.parentNode) {
                hashtagChip.parentNode.removeChild(hashtagChip);
            }
            
            // Обновляем скрытое поле
            this.updateHiddenHashtagsField(container);
            
            // Убираем предупреждение о лимите если хэштегов меньше 10
            const currentHashtags = container.querySelectorAll('.publish_form_hashtag_chip');
            if (currentHashtags.length < 10) {
                container.classList.remove('limit-reached');
            }
            
            // Обновляем счетчик хэштегов
            this.updateHashtagCounter(container);
        }, 200);
    }
    
    updateHashtagCounter(container) {
        const currentHashtags = container.querySelectorAll('.publish_form_hashtag_chip');
        const count = currentHashtags.length;
        
        // Убираем старый счетчик если есть
        let counter = container.querySelector('.publish_form_hashtag_counter');
        if (counter) {
            counter.remove();
        }
        
        // Добавляем новый счетчик если есть хэштеги
        if (count > 0) {
            counter = document.createElement('div');
            counter.className = 'publish_form_hashtag_counter';
            counter.textContent = count;
            container.appendChild(counter);
        }
    }
    
    showSimpleDropdown(inputElement) {
        // Находим dropdown для конкретного input
        const container = inputElement.closest('.publish_form_hashtag_container');
        
        if (!container) {
            return;
        }
        
        // Ищем dropdown - сначала внутри контейнера, потом как соседний элемент
        let dropdown = container.querySelector('.publish_form_hashtags_dropdown');
        
        if (!dropdown) {
            // Если не найден внутри, ищем как соседний элемент
            dropdown = container.nextElementSibling;
        }
        
        if (!dropdown || !dropdown.classList.contains('publish_form_hashtags_dropdown')) {
            return;
        }
        
        // Перемещаем dropdown внутрь контейнера хэштегов для правильного позиционирования
        if (dropdown.parentNode !== container) {
            container.appendChild(dropdown);
        }
        
        // Показываем dropdown с правильным позиционированием
        dropdown.style.setProperty('display', 'block', 'important');
        dropdown.style.setProperty('visibility', 'visible', 'important');
        dropdown.style.setProperty('opacity', '1', 'important');
        dropdown.style.setProperty('z-index', '500', 'important');
        dropdown.style.setProperty('position', 'absolute', 'important');
        dropdown.style.setProperty('top', '100%', 'important');
        dropdown.style.setProperty('left', '0', 'important');
        dropdown.style.setProperty('right', '0', 'important');
        dropdown.style.setProperty('width', '100%', 'important');
        
        dropdown.classList.add('show');
        
        // Получаем все доступные хэштеги из data-атрибута
        const allTagsData = container.getAttribute('data-all-tags');
        let allTags = [];
        
        try {
            if (allTagsData) {
                allTags = JSON.parse(allTagsData);
            }
        } catch (e) {
            console.error('Error parsing hashtags data:', e);
        }
        
        // Получаем уже выбранные хэштеги
        const selectedHashtags = this.getSelectedHashtags(container);
        
        // Фильтруем доступные хэштеги (исключаем уже выбранные)
        const availableTags = allTags.filter(tag => 
            !selectedHashtags.includes(tag.tag.toLowerCase())
        );
        
        // Заполняем dropdown реальными хэштегами
        if (availableTags.length > 0) {
            dropdown.innerHTML = availableTags.map(tag => 
                `<div class="publish_form_hashtags_dropdown_item" data-tag-id="${tag.id}" data-tag-name="${tag.tag}">#${tag.tag}</div>`
            ).join('');
        } else {
            dropdown.innerHTML = '<div class="publish_form_hashtags_dropdown_item no-results">No more hashtags available</div>';
        }
        
        // Добавляем обработчики для закрытия dropdown и выбора хэштегов
        this.setupDropdownCloseHandlers(dropdown, inputElement, container);
        const updatedDropdown = this.setupHashtagSelectionHandlers(dropdown, inputElement, container);
        
        // Показываем подсказку о лимите если хэштегов уже 10
        const currentHashtags = container.querySelectorAll('.publish_form_hashtag_chip');
        if (currentHashtags.length >= 10) {
            if (updatedDropdown) {
                updatedDropdown.innerHTML = '<div class="publish_form_hashtags_dropdown_item no-results">Maximum hashtags reached (10/10)</div>';
            } else {
                dropdown.innerHTML = '<div class="publish_form_hashtags_dropdown_item no-results">Maximum hashtags reached (10/10)</div>';
            }
        }
    }
    
    setupDropdownCloseHandlers(dropdown, inputElement, container) {
        // Закрываем dropdown при клике вне его
        const closeDropdown = () => {
            dropdown.style.setProperty('display', 'none', 'important');
            dropdown.style.setProperty('visibility', 'hidden', 'important');
            dropdown.style.setProperty('opacity', '0', 'important');
            dropdown.classList.remove('show');
        };
        
        // Закрываем при клике на элемент dropdown
        dropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('publish_form_hashtags_dropdown_item')) {
                closeDropdown();
            }
        });
        
        // Закрываем при потере фокуса input
        inputElement.addEventListener('blur', () => {
            setTimeout(closeDropdown, 150);
        });
        
        // Закрываем при нажатии Escape
        inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeDropdown();
            }
        });
    }
    
    setupHashtagSelectionHandlers(dropdown, inputElement, container) {
        // Убираем старые обработчики чтобы избежать дублирования
        const newDropdown = dropdown.cloneNode(true);
        dropdown.parentNode.replaceChild(newDropdown, dropdown);
        
        // Обработчик выбора хэштега
        newDropdown.addEventListener('click', (e) => {
            const dropdownItem = e.target.closest('.publish_form_hashtags_dropdown_item');
            if (!dropdownItem || dropdownItem.classList.contains('no-results')) {
                return;
            }
            
            const tagId = dropdownItem.dataset.tagId;
            const tagName = dropdownItem.dataset.tagName;
            
            if (tagId && tagName) {
                // ИСПРАВЛЕНИЕ: ищем только среди добавленных хэштегов
                const existingHashtag = container.querySelector(`.publish_form_hashtag_chip[data-tag-id="${tagId}"]`);
                if (existingHashtag) {
                    console.log('Hashtag already exists:', tagName);
                    return; // Хэштег уже добавлен
                }
                
                console.log('Adding hashtag:', tagName);
                this.addHashtag(container, tagId, tagName);
                inputElement.value = '';
                inputElement.focus();
                
                // Закрываем dropdown
                this.hideDropdown(newDropdown);
            }
        });
        
        return newDropdown;
    }
    
    getSelectedHashtags(container) {
        const hashtagChips = container.querySelectorAll('.publish_form_hashtag_chip');
        return Array.from(hashtagChips).map(chip => 
            chip.dataset.tagName.toLowerCase()
        );
    }
    
    updateHiddenHashtagsField(container) {
        const selectedHashtags = this.getSelectedHashtags(container);
        const hiddenField = container.closest('.publish_form').querySelector('input[name="hashtags"]');
        
        if (hiddenField) {
            hiddenField.value = selectedHashtags.join(',');
        }
    }
    
    hideDropdown(dropdown) {
        if (!dropdown || !dropdown.parentNode) {
            return;
        }
        
        // Скрываем dropdown
        dropdown.style.setProperty('display', 'none', 'important');
        dropdown.style.setProperty('visibility', 'hidden', 'important');
        dropdown.style.setProperty('opacity', '0', 'important');
        dropdown.classList.remove('show');
    }

    filterServicesByCategory(serviceSelect, selectedCategoryId) {
        // Получаем все опции сервисов
        const serviceOptions = serviceSelect.querySelectorAll('option');
        
        let visibleCount = 0;
        
        serviceOptions.forEach((option, index) => {
            if (index === 0) {
                // Первая опция - placeholder, всегда видима
                option.style.display = '';
                option.disabled = false;
                visibleCount++;
                return;
            }
            
            const optionCategoryId = option.getAttribute('data-category');
            
            if (selectedCategoryId && optionCategoryId === selectedCategoryId) {
                // Показываем сервисы выбранной категории
                option.style.display = '';
                option.disabled = false;
                visibleCount++;
            } else if (!selectedCategoryId) {
                // Если категория не выбрана, показываем все сервисы
                option.style.display = '';
                option.disabled = false;
                visibleCount++;
            } else {
                // Скрываем сервисы других категорий
                option.style.display = 'none';
                option.disabled = true;
            }
        });
        
        // Сбрасываем выбор сервиса при смене категории
        serviceSelect.value = '';
        
        // Обновляем состояние селекта сервисов
        if (visibleCount > 1) {
            serviceSelect.disabled = false;
            serviceSelect.style.opacity = '1';
        } else {
            serviceSelect.disabled = true;
            serviceSelect.style.opacity = '0.5';
        }
    }

    openPublishForm(itemId, itemType) {
        // Формируем ID для поиска popup
        const popupId = `publish_form_popup_${itemType}_${itemId}`;
        
        // Закрываем все другие popup'ы перед открытием нового
        this.closeOtherPopupsOfSameType(itemType);
        
        // Ищем popup по ID
        const popup = document.getElementById(popupId);
        if (!popup) {
            return;
        }
        
        // Удаляем конфликтующие event listener'ы
        this.removeConflictingEventListeners(popup, itemId, itemType);
        
        // Показываем popup
        popup.style.display = 'block';
        popup.style.opacity = '1';
        popup.style.visibility = 'visible';
        popup.classList.add('show');
        
        // Фокусируемся на первом input поле
        const firstInput = popup.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
        
        // Настраиваем event listener'ы для popup'а
        this.setupPopupEventListeners(popup, itemId, itemType);
        
        // Добавляем защиту от автоматического закрытия
        this.addAutoCloseProtection(popup);
        
        // Сохраняем ссылку на текущий popup
        this.currentPopup = popup;
    }

    closeCurrentPopup() {
        if (!this.currentPopup) {
            return;
        }

        const popup = this.currentPopup;
        
        // Анимация исчезновения
        popup.style.opacity = '0';
        popup.style.visibility = 'hidden';

        setTimeout(() => {
            popup.classList.remove('show');
            popup.style.display = 'none';
            document.body.style.overflow = '';
            this.currentPopup = null;
            this.lastOpenedPopupId = null; // Очищаем ID последнего открытого popup
        }, 300);
    }
    
    closeOtherPopupsOfSameType(itemType) {
        // Находим все popup'ы
        const allPopups = document.querySelectorAll('.publish_form_popup');
        
        allPopups.forEach((popup, index) => {
            // Проверяем, содержит ли popup указанный тип
            const containsType = popup.id.includes(`publish_form_popup_${itemType}_`);
            
            // Если это popup того же типа и он открыт, закрываем его
            if (containsType && popup.classList.contains('show')) {
                // Закрываем popup
                popup.style.display = 'none';
                popup.style.opacity = '0';
                popup.style.visibility = 'hidden';
                popup.classList.remove('show');
            }
        });
    }

    removeConflictingEventListeners(popup, itemId, itemType) {
        // Убираем все обработчики событий, которые могут закрывать форму
        const closeButtons = popup.querySelectorAll('.publish_form_close, .publish_form_cancel');
        
        closeButtons.forEach((btn, index) => {
            // Убираем все существующие обработчики
            const newBtn = btn.cloneNode(true);
            
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Добавляем новый обработчик
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCurrentPopup();
            });
        });

        // Убираем обработчики на overlay
        const overlay = popup.querySelector('.publish_form_overlay');
        if (overlay) {
            const newOverlay = overlay.cloneNode(true);
            overlay.parentNode.replaceChild(newOverlay, overlay);
            
            newOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCurrentPopup();
            });
        }
    }

    setupPopupEventListeners(popup, itemId, itemType) {
        // Используем переданный popup параметр
        if (!popup) {
            return;
        }

        // Кнопки уже настроены в removeConflictingEventListeners
        // Здесь только добавляем специфичные обработчики если нужно

        // Простая функция для отображения dropdown при клике на input
        const hashtagInput = popup.querySelector('.publish_form_hashtags_input');
        
        if (hashtagInput) {
            hashtagInput.addEventListener('click', (e) => {
                this.showSimpleDropdown(e.target);
            });
            
            hashtagInput.addEventListener('focus', (e) => {
                this.showSimpleDropdown(e.target);
            });
            
            // Добавляем поиск по хэштегам
            hashtagInput.addEventListener('input', (e) => {
                this.filterHashtagsDropdown(e.target);
            });
            
            // Добавляем обработчик для добавления нового хэштега по Enter
            hashtagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleEnterKey(e.target);
                }
            });
        }
    }
    
    filterHashtagsDropdown(inputElement) {
        const container = inputElement.closest('.publish_form_hashtag_container');
        const dropdown = container.querySelector('.publish_form_hashtags_dropdown');
        
        if (!dropdown || !dropdown.classList.contains('show')) {
            return;
        }
        
        const searchTerm = inputElement.value.toLowerCase().trim();
        
        // Получаем все доступные хэштеги
        const allTagsData = container.getAttribute('data-all-tags');
        let allTags = [];
        
        try {
            if (allTagsData) {
                allTags = JSON.parse(allTagsData);
            }
        } catch (e) {
            return;
        }
        
        // Получаем уже выбранные хэштеги
        const selectedHashtags = this.getSelectedHashtags(container);
        
        // Фильтруем по поисковому запросу и исключаем уже выбранные
        let filteredTags = allTags.filter(tag => 
            !selectedHashtags.includes(tag.tag.toLowerCase()) &&
            tag.tag.toLowerCase().includes(searchTerm)
        );
        
        // Если поиск пустой, показываем все доступные
        if (!searchTerm) {
            filteredTags = allTags.filter(tag => 
                !selectedHashtags.includes(tag.tag.toLowerCase())
            );
        }
        
        // Обновляем содержимое dropdown
        if (filteredTags.length > 0) {
            dropdown.innerHTML = filteredTags.map(tag => 
                `<div class="publish_form_hashtags_dropdown_item" data-tag-id="${tag.id}" data-tag-name="${tag.tag}">#${tag.tag}</div>`
            ).join('');
        } else if (searchTerm) {
            dropdown.innerHTML = '<div class="publish_form_hashtags_dropdown_item no-results">No hashtags found</div>';
        } else {
            dropdown.innerHTML = '<div class="publish_form_hashtags_dropdown_item no-results">No more hashtags available</div>';
        }
        
        // Переустанавливаем обработчики для новых элементов
        const updatedDropdown = this.setupHashtagSelectionHandlers(dropdown, inputElement, container);
        
        // Если dropdown был обновлен, обновляем ссылку
        if (updatedDropdown && updatedDropdown !== dropdown) {
            // Заменяем старый dropdown новым в контейнере
            container.replaceChild(updatedDropdown, dropdown);
        }
    }
    
    handleEnterKey(inputElement) {
        const container = inputElement.closest('.publish_form_hashtag_container');
        const searchTerm = inputElement.value.trim();
        
        if (!searchTerm) {
            return;
        }
        
        // Проверяем, есть ли такой хэштег в доступных
        const allTagsData = container.getAttribute('data-all-tags');
        let allTags = [];
        
        try {
            if (allTagsData) {
                allTags = JSON.parse(allTagsData);
            }
        } catch (e) {
            return;
        }
        
        // Ищем точное совпадение
        const exactMatch = allTags.find(tag => 
            tag.tag.toLowerCase() === searchTerm.toLowerCase()
        );
        
        if (exactMatch) {
            // Добавляем существующий хэштег
            this.addHashtag(container, exactMatch.id, exactMatch.tag);
            inputElement.value = '';
        } else {
            // Можно добавить логику для создания нового хэштега
            // Пока что просто очищаем поле
            inputElement.value = '';
        }
        
        // Закрываем dropdown
        const dropdown = container.querySelector('.publish_form_hashtags_dropdown');
        if (dropdown) {
            this.hideDropdown(dropdown);
        }
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

    validateField(field) {
        // Проверяем, что field существует и имеет свойство value
        if (!field || typeof field.value === 'undefined') {
            return false;
        }
        
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

            // Получаем хэштеги из скрытого поля
            const hashtagsInput = form.querySelector('input[name="hashtags"]');
            if (hashtagsInput) {
                data.hashtags = hashtagsInput.value;
            }

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
    // Проверяем, что PublishFormManager еще не инициализирован
    if (window.publishFormManager) {
        return;
    }
    
    window.publishFormManager = new PublishFormManager();
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