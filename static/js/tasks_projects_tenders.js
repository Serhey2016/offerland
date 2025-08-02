// Инициализация CKEditor для поля заметок
if (typeof window.notesEditors === 'undefined') {
    window.notesEditors = {}; // Объект для хранения редакторов для каждой задачи
}

console.log('tasks_projects_tenders.js loaded');

// Инициализация при загрузке страницы
if (!window.notesPopupInitialized) {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded - initializing notes popup');
        initializeNotesPopup();
        addGlobalEventHandlers();
        addNotificationStyles();
    });
    window.notesPopupInitialized = true;
}

function initializeNotesPopup() {
    // Проверяем, не инициализировали ли мы уже
    if (window.notesPopupHandlersInitialized) {
        console.log('Notes popup handlers already initialized');
        return;
    }
    
    console.log('Initializing notes popup handlers');
    
    // Проверяем, есть ли элементы на странице (может быть несколько task_feed на странице)
    const notesIcons = document.querySelectorAll('[id^="note_button_007_post_info_icon_notes_"]');
    const notesPopups = document.querySelectorAll('[id^="note_button_007_notesPopup_"]');
    const notesForms = document.querySelectorAll('[id^="note_button_007_notesForm_"]');
    
    console.log('Notes icons found:', notesIcons.length);
    console.log('Notes popups found:', notesPopups.length);
    console.log('Notes forms found:', notesForms.length);
    
    // Инициализируем CKEditor только когда попап открывается
    // Используем делегирование событий для динамически созданных элементов
    document.addEventListener('click', function(e) {
        console.log('Click event on:', e.target);
        // Проверяем, что клик произошел на элемент с id note_button_007_post_info_icon_notes_* или внутри него
        const notesIcon = e.target.closest('[id^="note_button_007_post_info_icon_notes_"]');
        if (notesIcon) {
            console.log('Opening notes popup for:', notesIcon.id);
            const taskId = notesIcon.id.replace('note_button_007_post_info_icon_notes_', '');
            openNotesPopup(taskId);
        }
    });
    
    // Обработка отправки формы - делегирование событий
    document.addEventListener('submit', function(e) {
        console.log('Submit event on:', e.target, 'ID:', e.target.id);
        if (e.target && e.target.id && e.target.id.startsWith('note_button_007_notesForm_')) {
            console.log('Notes form submitted for:', e.target.id);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const taskId = e.target.id.replace('note_button_007_notesForm_', '');
            saveNotes(taskId);
            return false;
        }
    }, true); // Используем capture phase
    
    // Обработка кнопки Save - делегирование событий
    document.addEventListener('click', function(e) {
        console.log('Click event on:', e.target, 'Classes:', e.target.classList);
        if (e.target && e.target.classList.contains('notes-save-btn')) {
            console.log('Save button clicked');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const popup = e.target.closest('[id^="note_button_007_notesPopup_"]');
            const taskId = popup.id.replace('note_button_007_notesPopup_', '');
            saveNotes(taskId);
            return false;
        }
    }, true); // Используем capture phase
    
    // Обработка кнопки Cancel - делегирование событий
    document.addEventListener('click', function(e) {
        console.log('Click event on:', e.target, 'Classes:', e.target.classList);
        if (e.target && e.target.classList.contains('notes-cancel-btn')) {
            console.log('Cancel button clicked');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const popup = e.target.closest('[id^="note_button_007_notesPopup_"]');
            const taskId = popup.id.replace('note_button_007_notesPopup_', '');
            closeNotesPopup(taskId);
            return false;
        }
    }, true); // Используем capture phase
    
    // Обработка кнопки закрытия (X) в заголовке - делегирование событий
    document.addEventListener('click', function(e) {
        console.log('Click event on:', e.target, 'Classes:', e.target.classList);
        if (e.target && e.target.classList.contains('notes-popup-close')) {
            console.log('Close button clicked');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const popup = e.target.closest('[id^="note_button_007_notesPopup_"]');
            const taskId = popup.id.replace('note_button_007_notesPopup_', '');
            closeNotesPopup(taskId);
            return false;
        }
    }, true); // Используем capture phase
    
    // Дополнительная защита для кнопок - обработка через mousedown
    document.addEventListener('mousedown', function(e) {
        if (e.target && (e.target.classList.contains('notes-cancel-btn') || e.target.classList.contains('notes-popup-close') || e.target.classList.contains('notes-save-btn'))) {
            console.log('Mouse down on button:', e.target.classList);
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            if (e.target.classList.contains('notes-cancel-btn') || e.target.classList.contains('notes-popup-close')) {
                const popup = e.target.closest('[id^="note_button_007_notesPopup_"]');
                const taskId = popup.id.replace('note_button_007_notesPopup_', '');
                closeNotesPopup(taskId);
                return false;
            } else if (e.target.classList.contains('notes-save-btn')) {
                const popup = e.target.closest('[id^="note_button_007_notesPopup_"]');
                const taskId = popup.id.replace('note_button_007_notesPopup_', '');
                saveNotes(taskId);
                return false;
            }
        }
    }, true);
    
    // Закрытие попапа по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const popups = document.querySelectorAll('[id^="note_button_007_notesPopup_"]');
            popups.forEach(popup => {
                if (popup.style.display === 'flex') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const taskId = popup.id.replace('note_button_007_notesPopup_', '');
                    closeNotesPopup(taskId);
                    return false;
                }
            });
        }
    });
    
    window.notesPopupHandlersInitialized = true;
}

function addGlobalEventHandlers() {
    // Проверяем, не инициализировали ли мы уже
    if (window.globalEventHandlersInitialized) {
        console.log('Global event handlers already initialized');
        return;
    }
    
    // Закрытие попапа при клике вне его - делегирование событий
    document.addEventListener('click', function(e) {
        const popups = document.querySelectorAll('[id^="note_button_007_notesPopup_"]');
        popups.forEach(popup => {
            if (e.target === popup) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                const taskId = popup.id.replace('note_button_007_notesPopup_', '');
                closeNotesPopup(taskId);
                return false;
            }
        });
    });
    
    // Дополнительная защита от SweetAlert2 - предотвращаем всплытие событий внутри попапа
    document.addEventListener('click', function(e) {
        const popupContent = e.target.closest('.notes-popup-content');
        if (popupContent) {
            e.stopPropagation();
        }
    });
    
    // Глобальный обработчик для изоляции попапа от SweetAlert2
    document.addEventListener('click', function(e) {
        const popups = document.querySelectorAll('[id^="note_button_007_notesPopup_"]');
        popups.forEach(popup => {
            if (popup.style.display === 'flex') {
                // Если клик произошел внутри попапа, останавливаем всплытие
                if (popup.contains(e.target)) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        });
    }, true); // Используем capture phase
    
    // Дополнительная защита от mousedown/mouseup событий
    document.addEventListener('mousedown', function(e) {
        const popups = document.querySelectorAll('[id^="note_button_007_notesPopup_"]');
        popups.forEach(popup => {
            if (popup.style.display === 'flex' && popup.contains(e.target)) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        });
    }, true);
    
    document.addEventListener('mouseup', function(e) {
        const popups = document.querySelectorAll('[id^="note_button_007_notesPopup_"]');
        popups.forEach(popup => {
            if (popup.style.display === 'flex' && popup.contains(e.target)) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        });
    }, true);
    
    window.globalEventHandlersInitialized = true;
}

function openNotesPopup(taskId) {
    console.log('openNotesPopup called for task:', taskId);
    // Находим попап для конкретной задачи
    const popup = document.getElementById(`note_button_007_notesPopup_${taskId}`);
    if (!popup) {
        console.error(`Notes popup not found for task ${taskId}!`);
        return;
    }
    
    console.log('Opening popup:', popup);
    popup.style.display = 'flex';
    
    // Инициализируем CKEditor для конкретной задачи
    const textareaId = `note_button_007_task_notes_${taskId}`;
    const textarea = document.querySelector(`#${textareaId}`);
    
    if (!textarea) {
        console.error(`Textarea not found for task ${taskId}`);
        return;
    }
    
               // Если редактор для этой задачи уже существует, уничтожаем его
           if (window.notesEditors[taskId]) {
               window.notesEditors[taskId].destroy();
               delete window.notesEditors[taskId];
           }
    
    // Создаем новый редактор для этой задачи
    ClassicEditor
        .create(textarea, {
            toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'],
            placeholder: 'Enter your notes here...',
            height: '300px'
        })
        .then(editor => {
            // Сохраняем редактор для этой задачи
            window.notesEditors[taskId] = editor;
            
            // Устанавливаем содержимое из поля note при инициализации
            const currentNotes = textarea.value;
            if (currentNotes) {
                editor.setData(currentNotes);
            }
        })
        .catch(error => {
            console.error('Error creating CKEditor:', error);
        });
}

function closeNotesPopup(taskId) {
    console.log('closeNotesPopup called for task:', taskId);
    try {
        const popup = document.getElementById(`note_button_007_notesPopup_${taskId}`);
        if (popup) {
            console.log('Closing popup for task:', taskId);
            
            // Show cancel notification
            showNotification('Changes to notes were not saved', 'warning');
            
            // Сначала уничтожаем CKEditor для конкретной задачи
            if (window.notesEditors[taskId]) {
                try {
                    // Сохраняем содержимое в textarea перед уничтожением
                    const data = window.notesEditors[taskId].getData();
                    const textarea = document.querySelector(`#note_button_007_task_notes_${taskId}`);
                    if (textarea) {
                        textarea.value = data;
                    }
                    
                    // Уничтожаем редактор
                    window.notesEditors[taskId].destroy();
                    delete window.notesEditors[taskId];
                    console.log(`CKEditor destroyed for task ${taskId}`);
                } catch (error) {
                    console.error('Error destroying editor:', error);
                    delete window.notesEditors[taskId];
                }
            }
            
            // Затем скрываем попап
            popup.style.display = 'none';
            
            // Удаляем фокус с любых элементов внутри попапа
            const activeElement = document.activeElement;
            if (activeElement && popup.contains(activeElement)) {
                activeElement.blur();
            }
            
            // Принудительно очищаем фокус
            setTimeout(() => {
                document.body.focus();
            }, 10);
        }
        
    } catch (error) {
        console.error('Error closing popup:', error);
    }
}

function saveNotes(taskId) {
    console.log('saveNotes called for task:', taskId);
    try {
        // Получаем данные из CKEditor для конкретной задачи
        let notesData = '';
        if (window.notesEditors[taskId]) {
            notesData = window.notesEditors[taskId].getData();
        } else {
            // Если редактор не найден, берем данные из textarea
            const textarea = document.querySelector(`#note_button_007_task_notes_${taskId}`);
            if (textarea) {
                notesData = textarea.value;
            }
        }
            
        // Создаем FormData для отправки
        const formData = new FormData();
        formData.append('notes', notesData);
        formData.append('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);
        
        // Находим форму для конкретной задачи
        const form = document.getElementById(`note_button_007_notesForm_${taskId}`);
        if (!form) {
            console.error(`Notes form not found for task ${taskId}!`);
            return;
        }
        
        // Отправляем AJAX запрос
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success notification
                showNotification('Notes saved successfully!', 'success');
                
                // Закрываем попап
                const popup = document.getElementById(`note_button_007_notesPopup_${taskId}`);
                if (popup) {
                    popup.style.display = 'none';
                }
                
                // Уничтожаем редактор для этой задачи
                if (window.notesEditors[taskId]) {
                    window.notesEditors[taskId].destroy();
                    delete window.notesEditors[taskId];
                }
            } else {
                // Показываем только ошибки
                showNotification(data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error saving notes', 'error');
        });
    } catch (error) {
        console.error('Error in saveNotes:', error);
        showNotification('Error saving notes', 'error');
    }
}

function showNotification(message, type) {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
        ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function addNotificationStyles() {
    // Проверяем, не добавили ли мы уже стили
    if (window.notificationStylesAdded) {
        console.log('Notification styles already added');
        return;
    }
    
    // CSS для анимации уведомлений
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    window.notificationStylesAdded = true;
}
