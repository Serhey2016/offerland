// My Task Feed JavaScript - Dropdown Menu Handler
document.addEventListener('DOMContentLoaded', function() {
    // Функция для скрытия всех открытых dropdown меню
    function hideAllMyTaskOverflowMenus() {
        const allMenus = document.querySelectorAll('[id^="my_task_overflow_menu_"]');
        allMenus.forEach(menu => {
            if (menu) {
                menu.classList.remove('show');
            }
        });
    }
    
    // Функция для закрытия всех открытых меню
    function closeAllMyTaskOverflowMenus() {
        const openMenus = document.querySelectorAll('[id^="my_task_overflow_menu_"][class*="show"]');
        openMenus.forEach(menu => {
            if (menu) {
                menu.classList.remove('show');
                // Убираем класс с родительского поста
                const taskElement = menu.closest('.social_feed2');
                if (taskElement) {
                    taskElement.classList.remove('has-open-dropdown');
                }
            }
        });
    }
    
    // Обработчик клика на иконку overflow menu
    document.addEventListener('click', function(e) {
        const trigger = e.target.closest('[id^="overflow_menu_trigger_"]');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            
            // Получаем ID задачи из ID элемента (новый формат: type_id)
            const fullId = trigger.id.replace('overflow_menu_trigger_', '');
            
            // Находим соответствующий dropdown menu
            const overflowMenu = document.getElementById(`my_task_overflow_menu_${fullId}`);
            
            if (overflowMenu) {
                // Закрываем все другие открытые меню
                closeAllMyTaskOverflowMenus();
                
                // Переключаем текущее меню
                if (overflowMenu.classList.contains('show')) {
                    overflowMenu.classList.remove('show');
                    // Убираем класс с родительского поста
                    const taskElement = trigger.closest('.social_feed2');
                    if (taskElement) {
                        taskElement.classList.remove('has-open-dropdown');
                    }
                } else {
                    overflowMenu.classList.add('show');
                    // Добавляем класс к родительскому посту
                    const taskElement = trigger.closest('.social_feed2');
                    if (taskElement) {
                        taskElement.classList.add('has-open-dropdown');
                    }
                }
            } else {
                // Попробуем найти по другому способу
                const taskElement = trigger.closest('.social_feed2');
                if (taskElement) {
                    // Silent error handling
                }
            }
        }
    });
    
    // Обработчик клика на пункты меню
    document.addEventListener('click', function(e) {
        const menuItem = e.target.closest('[id^="menu_item_"]');
        if (menuItem) {
            e.preventDefault();
            e.stopPropagation();
            
            // Получаем ID задачи и действие из ID элемента (новый формат: type_id)
            const itemId = menuItem.id;
            const fullId = itemId.replace(/^menu_item_(start|edit|publish|remove)_/, '');
            const action = itemId.match(/^menu_item_(start|edit|publish|remove)_/)[1];
            
            // Закрываем меню
            const overflowMenu = document.getElementById(`my_task_overflow_menu_${fullId}`);
            if (overflowMenu) {
                overflowMenu.classList.remove('show');
            }
            
            // Обрабатываем действия
            switch(action) {
                case 'start':
                    handleMyTaskStart(fullId);
                    break;
                case 'edit':
                    handleMyTaskEdit(fullId);
                    break;
                case 'publish':
                    handleMyTaskPublish(fullId);
                    break;
                case 'remove':
                    handleMyTaskRemove(fullId);
                    break;
            }
        }
    });
    
    // Обработчик клика вне меню для его закрытия
    document.addEventListener('click', function(e) {
        if (!e.target.closest('[id^="my_task_social_feed_menu_"]')) {
            closeAllMyTaskOverflowMenus();
        }
    });
    
    // Обработчик клавиши Escape для закрытия меню
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllMyTaskOverflowMenus();
        }
    });
    
    // Функция для обработки действия Start
    function handleMyTaskStart(taskId) {
        // Start action for task ID
        
        // Получаем CSRF токен
        const csrftoken = getCookie('csrftoken');
        
        if (!csrftoken) {
            alert('CSRF token not found. Please refresh the page and try again.');
            return;
        }
        
        // Отправляем AJAX запрос для установки даты начала
        // Извлекаем только ID задачи из полного ID (type_id)
        const actualTaskId = taskId.split('_').pop();
        fetch(`/services_and_projects/start_task/${actualTaskId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем отображение даты на странице
                const startDateElement = document.querySelector(`#my_task_overflow_menu_${taskId}`).closest('.social_feed2').querySelector('.post_start_date');
                if (startDateElement) {
                    startDateElement.textContent = data.start_date;
                }
                
                // Показываем уведомление об успехе
                if (typeof window.alertify !== 'undefined') {
                    window.alertify.success('Task started successfully!');
                } else {
                    alert('Task started successfully!');
                }
            } else if (data.warning) {
                // Показываем предупреждение
                if (typeof window.alertify !== 'undefined') {
                    window.alertify.warning(data.message);
                } else {
                    alert(data.message);
                }
            } else {
                // Показываем ошибку
                if (typeof window.alertify !== 'undefined') {
                    window.alertify.error('Error starting task: ' + data.error);
                } else {
                    alert('Error starting task: ' + data.error);
                }
            }
        })
        .catch(error => {
            // Network error occurred while starting task
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Network error occurred while starting task');
            } else {
                alert('Network error occurred while starting task');
            }
        });
    }
    
    // Функция для обработки действия Edit
    function handleMyTaskEdit(taskId) {
        // Edit action for task ID
        
        // Извлекаем только ID задачи из полного ID (type_id)
        const actualTaskId = taskId.split('_').pop();
        
        // Определяем тип задачи по данным в DOM
        // Looking for task element with ID
        const taskElement = document.querySelector(`.social_feed2[data-id="${actualTaskId}"]`);
        if (!taskElement) {
            // Task element not found for ID
            return;
        }
        
        // Found task element
        
        // Получаем тип задачи из DOM или по умолчанию используем 'my-list'
        const taskTypeElement = taskElement.querySelector('.post_info_dates_type_of_task');
        let formType = 'my-list'; // По умолчанию
        
        if (taskTypeElement) {
            const taskTypeText = taskTypeElement.textContent.trim();
                    // Found task type element
            
            // Convert to lowercase for comparison
            const taskTypeLower = taskTypeText.toLowerCase();
            // Task type text (lowercase)
            
            // More flexible matching
            if (taskTypeLower.includes('tender')) {
                formType = 'tender';
            } else if (taskTypeLower.includes('project')) {
                formType = 'project';
            } else if (taskTypeLower.includes('job') || taskTypeLower.includes('search')) {
                formType = 'job-search';
            } else if (taskTypeLower.includes('advertising') || taskTypeLower.includes('advert')) {
                formType = 'advertising';
            } else {
                // Default to my-list for regular tasks
                formType = 'my-list';
            }
            
            // Determined form type
        } else {
            // Task type element not found, using default form type
        }
        
        // Opening edit form for type
        
        // Открываем соответствующую форму редактирования
        openEditForm(formType, actualTaskId);
    }
    
    // Функция для обработки действия Publish
    function handleMyTaskPublish(taskId) {
        // Publish action for task ID
        
        // Извлекаем только ID задачи из полного ID (type_id)
        const actualTaskId = taskId.split('_').pop();
        
        // Открываем форму публикации для task
        const publishForm = document.getElementById(`publish_form_popup_task_${actualTaskId}`);
        if (publishForm) {
            publishForm.classList.add('show');
            setupTaskPublishFormEventHandlers(actualTaskId);
        } else {
            console.error('Publish form not found for task ID:', actualTaskId);
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Publish form not found. Please refresh the page and try again.');
            } else {
                alert('Publish form not found. Please refresh the page and try again.');
            }
        }
    }
    
    // Функция для обработки действия Remove
    function handleMyTaskRemove(taskId) {
        // Remove action for task ID
        
        // Показываем подтверждение удаления
        if (confirm('Are you sure you want to delete this task?')) {
            // Здесь можно добавить логику для удаления
            // Например, отправить AJAX запрос на сервер
            
            // Пример AJAX запроса:
            /*
            fetch(`/api/remove/${taskId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Удаляем элемент из DOM
                    const element = document.querySelector(`[data-id="${taskId}"]`).closest('.social_feed2');
                    if (element) {
                        element.remove();
                    }
                } else {
                    alert('Error deleting: ' + data.message);
                }
            })
            .catch(error => {
                // An error occurred while deleting
                alert('An error occurred while deleting');
            });
            */
            
            // Временное решение - показать сообщение
            if (typeof window.alertify !== 'undefined') {
                window.alertify.warning('Remove functionality will be implemented soon!');
            } else {
                alert('Remove functionality will be implemented soon!');
            }
        }
    }
    
    // Вспомогательная функция для получения CSRF токена
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
    
    // Настройка обработчиков событий для формы публикации task
    function setupTaskPublishFormEventHandlers(taskId) {
        // Обработчик для кнопки закрытия
        const closeButton = document.getElementById(`publish_form_close_task_${taskId}`);
        if (closeButton) {
            closeButton.onclick = function(e) {
                e.preventDefault();
                closeTaskPublishForm(taskId);
            };
        }
        

    }
    
    // Функция закрытия формы публикации task
    function closeTaskPublishForm(taskId) {
        const publishForm = document.getElementById(`publish_form_popup_task_${taskId}`);
        if (publishForm) {
            publishForm.classList.remove('show');
        }
    }
    
    // Скрываем все меню при загрузке страницы
    hideAllMyTaskOverflowMenus();
    
    // Дополнительная проверка - убеждаемся, что меню скрыто при загрузке страницы
    window.addEventListener('load', function() {
        hideAllMyTaskOverflowMenus();
    });
    
    // ===== NOTES POPUP FUNCTIONALITY =====
    
    // Функция для открытия notes popup
    function openMyTaskNotesPopup(taskId) {
        const popup = document.getElementById(`my_task_notes_popup_${taskId}`);
        if (popup) {
            popup.classList.add('show');
            // Фокусируемся на textarea
            const textarea = document.getElementById(`my_task_notes_textarea_${taskId}`);
            if (textarea) {
                setTimeout(() => textarea.focus(), 100);
            }
        }
    }
    
    // Функция для закрытия notes popup
    function closeMyTaskNotesPopup(taskId) {
        const popup = document.getElementById(`my_task_notes_popup_${taskId}`);
        if (popup) {
            popup.classList.remove('show');
        }
    }
    
    // Функция для закрытия всех notes popup
    function closeAllMyTaskNotesPopups() {
        const allPopups = document.querySelectorAll('[id^="my_task_notes_popup_"]');
        allPopups.forEach(popup => {
            popup.classList.remove('show');
        });
    }
    
    // Обработчик клика на иконку notes
    document.addEventListener('click', function(e) {
        const notesIcon = e.target.closest('[id^="my_task_notes_icon_"]');
        if (notesIcon) {
            e.preventDefault();
            e.stopPropagation();
            
            // Получаем ID задачи из ID элемента
            const taskId = notesIcon.id.replace('my_task_notes_icon_', '');
            openMyTaskNotesPopup(taskId);
        }
    });
    
    // Обработчик клика на кнопку закрытия
    document.addEventListener('click', function(e) {
        const closeBtn = e.target.closest('[id^="my_task_notes_close_"]');
        if (closeBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            // Получаем ID задачи из ID элемента
            const taskId = closeBtn.id.replace('my_task_notes_close_', '');
            closeMyTaskNotesPopup(taskId);
        }
    });
    
    // Обработчик клика на кнопку Cancel
    document.addEventListener('click', function(e) {
        const cancelBtn = e.target.closest('[id^="my_task_notes_cancel_"]');
        if (cancelBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            // Получаем ID задачи из ID элемента
            const taskId = cancelBtn.id.replace('my_task_notes_cancel_', '');
            closeMyTaskNotesPopup(taskId);
        }
    });
    
    // Обработчик клика на кнопку Save
    document.addEventListener('click', function(e) {
        const saveBtn = e.target.closest('[id^="my_task_notes_save_"]');
        if (saveBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            // Получаем ID задачи из ID элемента
            const taskId = saveBtn.id.replace('my_task_notes_save_', '');
            saveMyTaskNotes(taskId);
        }
    });
    
    // Обработчик клика вне popup для его закрытия
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('my_task_notes_popup_overlay')) {
            const popup = e.target;
            const taskId = popup.id.replace('my_task_notes_popup_', '');
            closeMyTaskNotesPopup(taskId);
        }
    });
    
    // Обработчик клавиши Escape для закрытия popup
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllMyTaskNotesPopups();
        }
    });
    
    // Функция для сохранения notes
    function saveMyTaskNotes(taskId) {
        const form = document.getElementById(`my_task_notes_form_${taskId}`);
        const textarea = document.getElementById(`my_task_notes_textarea_${taskId}`);
        
        if (!form || !textarea) {
            return;
        }
        
        const notes = textarea.value.trim();
        
        // Получаем CSRF токен
        const csrftoken = getCookie('csrftoken');
        
        if (!csrftoken) {
            alert('CSRF token not found. Please refresh the page and try again.');
            return;
        }
        
        // Создаем FormData для отправки
        const formData = new FormData();
        formData.append('notes', notes);
        
        // Отправляем AJAX запрос
        fetch(form.action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
            },
            body: formData
        })
        .then(response => {
            if (response.ok) {
                // Показываем уведомление об успехе
                if (typeof window.alertify !== 'undefined') {
                    window.alertify.success('Notes saved successfully!');
                } else {
                    alert('Notes saved successfully!');
                }
                
                // Закрываем popup
                closeMyTaskNotesPopup(taskId);
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            // Error saving notes
            
            // Показываем ошибку
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Error saving notes. Please try again.');
            } else {
                alert('Error saving notes. Please try again.');
            }
        });
    }
    
    // Скрываем все notes popup при загрузке страницы
    closeAllMyTaskNotesPopups();
    
    // ===== EDIT FORM FUNCTIONALITY =====
    
    // Функция для открытия формы редактирования
    function openEditForm(formType, itemId) {
        // Opening edit form
        
        // Определяем ID формы на основе типа
        let formId;
        let formTitle;
        
        switch(formType) {
            case 'my-list':
                formId = 'my-list-form';
                formTitle = 'Edit Task';
                break;
            case 'tender':
                formId = 'tender-form';
                formTitle = 'Edit Tender';
                break;
            case 'project':
                formId = 'project-form';
                formTitle = 'Edit Project';
                break;
            case 'advertising':
                formId = 'advertising-form';
                formTitle = 'Edit Advertising';
                break;
            case 'job-search':
                formId = 'job-search-form';
                formTitle = 'Edit Job Search';
                break;
                    default:
            // Unknown form type
            return;
        }
        
        // Form ID and title
        
        // Находим форму
        const form = document.getElementById(formId);
        if (!form) {
            // Form not found
            return;
        }
        
        // Form found
        
        // Загружаем данные для редактирования
        loadEditData(formType, itemId, form);
        
        // Показываем форму
        form.style.display = 'flex';
        
        // Добавляем класс для анимации
        setTimeout(() => {
            form.classList.add('show');
        }, 10);
        
        // Обновляем заголовок формы
        const titleElement = form.querySelector('h2, .modal-header-actions h2');
        if (titleElement) {
            titleElement.textContent = formTitle;
            // Updated form title
        } else {
            // Title element not found in form
        }
        
        // Добавляем скрытое поле для ID редактируемого элемента
        let hiddenIdField = form.querySelector('input[name="edit_item_id"]');
        if (!hiddenIdField) {
            hiddenIdField = document.createElement('input');
            hiddenIdField.type = 'hidden';
            hiddenIdField.name = 'edit_item_id';
            form.querySelector('form').appendChild(hiddenIdField);
        }
        hiddenIdField.value = itemId;
        
        // Изменяем действие формы на update
        const formElement = form.querySelector('form');
        if (formElement) {
            formElement.action = formElement.action.replace('submit_form', 'update_form');
        }
    }
    
    // Функция для загрузки данных для редактирования
    function loadEditData(formType, itemId, form) {
        // Loading edit data
        
        // Получаем CSRF токен
        const csrftoken = getCookie('csrftoken');
        // CSRF token check
        
        if (!csrftoken) {
            alert('CSRF token not found. Please refresh the page and try again.');
            return;
        }
        
        const url = `/services_and_projects/get_edit_data/${formType}/${itemId}/`;
        // Making request
        
        // Отправляем AJAX запрос для получения данных
        fetch(url, {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
                    // Response received
            return response.json();
        })
        .then(data => {
            // Response data received
            if (data.success) {
                // Заполняем форму данными
                populateEditForm(formType, form, data.data);
            } else {
                // Error loading edit data
                if (typeof window.alertify !== 'undefined') {
                    window.alertify.error('Error loading data for editing: ' + data.error);
                } else {
                    alert('Error loading data for editing: ' + data.error);
                }
            }
        })
        .catch(error => {
            // Network error occurred while loading data
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Network error occurred while loading data');
            } else {
                alert('Network error occurred while loading data');
            }
        });
    }
    
    // Функция для заполнения формы данными
    function populateEditForm(formType, form, data) {
        // Populating form with data
        
        // Заполняем основные поля
        const titleField = form.querySelector(`#${formType}-title`);
        if (titleField && data.title) {
            titleField.value = data.title;
        }
        
        const descriptionField = form.querySelector(`#${formType}-description`);
        if (descriptionField && data.description) {
            descriptionField.value = data.description;
        }
        
        // Заполняем категорию
        const categoryField = form.querySelector(`#${formType}-category`);
        if (categoryField && data.category) {
            categoryField.value = data.category;
        }
        
        // Заполняем сервис
        const serviceField = form.querySelector(`#${formType}-service`);
        if (serviceField && data.service) {
            serviceField.value = data.service;
        }
        
        // Заполняем статус
        const statusField = form.querySelector(`#${formType}-status`);
        if (statusField && data.status) {
            statusField.value = data.status;
        }
        
        // Заполняем документы
        const documentsField = form.querySelector(`#${formType}-documents`);
        if (documentsField && data.documents) {
            documentsField.value = data.documents;
        }
        
        // Заполняем хештеги
        if (data.hashtags && data.hashtags.length > 0) {
            const hashtagsContainer = form.querySelector(`#${formType}-hashtags-container`);
            const hashtagsHidden = form.querySelector(`#${formType}-hashtags-hidden`);
            
            if (hashtagsContainer && hashtagsHidden) {
                // Очищаем существующие хештеги
                hashtagsContainer.innerHTML = '';
                
                // Добавляем input для новых хештегов
                const hashtagsInput = document.createElement('input');
                hashtagsInput.type = 'text';
                hashtagsInput.id = `${formType}-hashtags-input`;
                hashtagsInput.placeholder = 'Start typing tag...';
                hashtagsInput.autocomplete = 'off';
                hashtagsInput.className = 'hashtags-input-field';
                hashtagsContainer.appendChild(hashtagsInput);
                
                // Добавляем существующие хештеги как чипы
                data.hashtags.forEach(tag => {
                    const tagChip = document.createElement('span');
                    tagChip.className = 'hashtag-chip';
                    tagChip.textContent = tag.tag;
                    tagChip.dataset.tag = tag.tag;
                    
                    const removeBtn = document.createElement('span');
                    removeBtn.className = 'hashtag-remove';
                    removeBtn.innerHTML = '&times;';
                    removeBtn.onclick = function() {
                        tagChip.remove();
                        updateHashtagsHidden(hashtagsContainer, hashtagsHidden);
                    };
                    
                    tagChip.appendChild(removeBtn);
                    hashtagsContainer.appendChild(tagChip);
                });
                
                // Обновляем скрытое поле
                updateHashtagsHidden(hashtagsContainer, hashtagsHidden);
            }
        }
        
        // Заполняем исполнителей
        if (data.performers && data.performers.length > 0) {
            const performersList = form.querySelector(`#${formType}-performers-list`);
            if (performersList) {
                performersList.innerHTML = '';
                data.performers.forEach(performer => {
                    const performerItem = document.createElement('div');
                    performerItem.className = 'performer-item';
                    performerItem.textContent = performer.get_full_name || performer.username;
                    performerItem.dataset.performerId = performer.id;
                    
                    const removeBtn = document.createElement('span');
                    removeBtn.className = 'performer-remove';
                    removeBtn.innerHTML = '&times;';
                    removeBtn.onclick = function() {
                        performerItem.remove();
                    };
                    
                    performerItem.appendChild(removeBtn);
                    performersList.appendChild(performerItem);
                });
            }
        }
        
        // Заполняем включенный проект
        const projectIncludedField = form.querySelector(`#${formType}-project-included`);
        if (projectIncludedField && data.project_included) {
            projectIncludedField.value = data.project_included;
        }
        
        // Заполняем фото (для форм с фото)
        if (data.photos && data.photos.length > 0) {
            const photosField = form.querySelector(`#${formType}-photos`);
            if (photosField && photosField.type === 'text') {
                // Для текстового поля (ссылка на фото)
                photosField.value = data.photos[0] || '';
            }
            // Для файловых полей можно добавить предварительный просмотр
        }
    }
    
    // Вспомогательная функция для обновления скрытого поля хештегов
    function updateHashtagsHidden(container, hiddenField) {
        const tags = Array.from(container.querySelectorAll('.hashtag-chip')).map(chip => chip.dataset.tag);
        hiddenField.value = JSON.stringify(tags);
    }
    
    // Обработчик закрытия форм редактирования
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal_close_btn')) {
            const form = e.target.closest('.modal-overlay');
            if (form) {
                form.style.display = 'none';
                form.classList.remove('show');
            }
        }
    });
    
    // Обработчик клика вне формы для её закрытия
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
            e.target.classList.remove('show');
        }
    });
    
    // Обработчик клавиши Escape для закрытия форм
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openForms = document.querySelectorAll('.modal-overlay[style*="display: flex"]');
            openForms.forEach(form => {
                form.style.display = 'none';
                form.classList.remove('show');
            });
        }
    });
    
            // My Task Feed JavaScript loaded successfully
});
