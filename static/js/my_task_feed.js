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
            }
        });
    }
    
    // Обработчик клика на иконку overflow menu
    document.addEventListener('click', function(e) {
        const trigger = e.target.closest('[id^="overflow_menu_trigger_"]');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            
            // Получаем ID задачи из ID элемента
            const taskId = trigger.id.replace('overflow_menu_trigger_', '');
            
            // Находим соответствующий dropdown menu
            const overflowMenu = document.getElementById(`my_task_overflow_menu_${taskId}`);
            
            if (overflowMenu) {
                // Закрываем все другие открытые меню
                closeAllMyTaskOverflowMenus();
                
                // Переключаем текущее меню
                if (overflowMenu.classList.contains('show')) {
                    overflowMenu.classList.remove('show');
                } else {
                    overflowMenu.classList.add('show');
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
            
            // Получаем ID задачи и действие из ID элемента
            const itemId = menuItem.id;
            const taskId = itemId.replace(/^menu_item_(start|edit|remove)_/, '');
            const action = itemId.match(/^menu_item_(start|edit|remove)_/)[1];
            
            // Закрываем меню
            const overflowMenu = document.getElementById(`my_task_overflow_menu_${taskId}`);
            if (overflowMenu) {
                overflowMenu.classList.remove('show');
            }
            
            // Обрабатываем действия
            switch(action) {
                case 'start':
                    handleMyTaskStart(taskId);
                    break;
                case 'edit':
                    handleMyTaskEdit(taskId);
                    break;
                case 'remove':
                    handleMyTaskRemove(taskId);
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
        console.log('Start action for task ID:', taskId);
        
        // Получаем CSRF токен
        const csrftoken = getCookie('csrftoken');
        
        if (!csrftoken) {
            alert('CSRF token not found. Please refresh the page and try again.');
            return;
        }
        
        // Отправляем AJAX запрос для установки даты начала
        fetch(`/services_and_projects/start_job_search/${taskId}/`, {
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
                const startDateElement = document.getElementById(`post_start_date_${taskId}`);
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
            console.error('Error:', error);
            
            // Показываем ошибку
            if (typeof window.alertify !== 'undefined') {
                window.alertify.error('Network error occurred while starting task');
            } else {
                alert('Network error occurred while starting task');
            }
        });
    }
    
    // Функция для обработки действия Edit
    function handleMyTaskEdit(taskId) {
        console.log('Edit action for task ID:', taskId);
        
        // Здесь можно добавить логику для редактирования
        // Например, открыть модальное окно или перенаправить на страницу редактирования
        
        // Пример: открыть модальное окно
        // showEditModal(taskId);
        
        // Или перенаправить на страницу редактирования
        // window.location.href = `/edit/${taskId}/`;
        
        // Временное решение - показать сообщение
        if (typeof window.alertify !== 'undefined') {
            window.alertify.info('Edit functionality will be implemented soon!');
        } else {
            alert('Edit functionality will be implemented soon!');
        }
    }
    
    // Функция для обработки действия Remove
    function handleMyTaskRemove(taskId) {
        console.log('Remove action for task ID:', taskId);
        
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
                console.error('Error:', error);
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
            console.error('Error saving notes:', error);
            
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
    
    console.log('My Task Feed JavaScript loaded successfully!');
});
